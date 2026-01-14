import { v2 as cloudinary } from 'cloudinary';
import type { IncomingMessage, ServerResponse } from "http";

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// ============= TYPE DEFINITIONS =============

type GitProject = {
    id: number;
    name: string;
    description: string;
    html_url: string;
    topics: string[];
};

interface GitRepo {
    id: number;
    name: string;
    description: string | null;
    html_url: string;
}

interface GitTopicsResponse {
    names: string[];
}

interface CloudinaryResource {
    secure_url: string;
    public_id: string;
}

interface ImageResponse {
    src: string;
    alt: string;
    category: string;
}

interface RequestQuery {
    action?: string;
    category?: string;
}

// ============= HELPER FUNCTION =============

function sendJSON(res: ServerResponse, status: number, data: object) {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data));
}

// ============= HANDLER FUNCTIONS =============

async function handleGithubProjects(res: ServerResponse) {
    try {
        const username = "leaping-river-fish";

        const response = await fetch(`https://api.github.com/users/${username}/repos`);
        const repos: GitRepo[] = await response.json();

        if (!Array.isArray(repos)) {
            return sendJSON(res, 500, { error: "Unexpected GitHub API response" });
        }

        const projects: GitProject[] = await Promise.all(
            repos
                .filter((repo: any) => repo.name)
                .map(async (repo: any) => {
                    const topicRes = await fetch(`https://api.github.com/repos/${username}/${repo.name}/topics`, {
                        headers: {
                            Accept: "application/vnd.github.mercy-preview+json",
                        },
                    });
                    const topicsData: GitTopicsResponse = await topicRes.json();
                    const topics: string[] = topicsData.names || [];

                    return {
                        id: repo.id,
                        name: repo.name,
                        description: repo.description || "",
                        html_url: repo.html_url,
                        topics,
                    } satisfies GitProject;
                })
        );
        
        sendJSON(res, 200, projects);
    } catch (error) {
        console.error(error);
        sendJSON(res, 500, { error: "Failed to fetch GitHub projects" });
    }
}

async function handleGetImages(res: ServerResponse, category: string | undefined) {
    if (!category) {
        return sendJSON(res, 400, { error: "Category is required" });
    }

    try {
        const result = await cloudinary.search
            .expression(`tags=${category}`)
            .sort_by('created_at', 'desc')
            .max_results(40)
            .execute();

        const images: ImageResponse[] = result.resources.map((img: CloudinaryResource) => ({
            src: img.secure_url,
            alt: img.public_id,
            category
        }));

        sendJSON(res, 200, images);
    } catch (error) {
        console.error('Error fetching images:', error);
        sendJSON(res, 500, { error: "Error fetching images" });
    }
}

// ============= MAIN HANDLER =============

export default async function handler(
    req: IncomingMessage & { query?: RequestQuery },
    res: ServerResponse
) {
    if (req.method !== 'GET') {
        return sendJSON(res, 405, { error: "Method not allowed" });
    }

    const action = req.query?.action;

    if (action === "github") {
        return handleGithubProjects(res);
    }

    if (action === "images") {
        return handleGetImages(res, req.query?.category);
    }

    return sendJSON(res, 400, { error: "Invalid action. Use ?action=github or ?action=images&category=..." });
}

export const config = {
    runtime: "nodejs",
};
