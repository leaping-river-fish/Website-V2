import type { IncomingMessage, ServerResponse } from "http";

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

export default async function handler(
    _req: IncomingMessage,
    res: ServerResponse
) {
    const sendJSON = (status: number, data: object) => {
        res.statusCode = status;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(data));
    };

    try {
        const username = "leaping-river-fish";

        const response = await fetch(`https://api.github.com/users/${username}/repos`);
        const repos: GitRepo[] = await response.json();

        if (!Array.isArray(repos)) {
            return sendJSON(500, { error: "Unexpected GitHub API response" });
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
        
        sendJSON(200, projects);
    } catch (error) {
        console.error(error);
        sendJSON(500, { error: "Failed to fetch GitHub projects" });
    }
}