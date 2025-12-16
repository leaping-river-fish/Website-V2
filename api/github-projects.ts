type GitProject = {
    id: number;
    name: string;
    description: string;
    html_url: string;
    topics: string[];
};

export default async function handler(_req: any, res: any) {
    try {
        const username = "leaping-river-fish";

        const response = await fetch(`https://api.github.com/users/${username}/repos`);
        const repos = await response.json();

        if (!Array.isArray(repos)) {
            return res.status(500).json({ error: "Unexpected GitHub API response" });
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
                    const topicsData = await topicRes.json();
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
        
        res.status(200).json(projects);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch GitHub projects" })
    }
}