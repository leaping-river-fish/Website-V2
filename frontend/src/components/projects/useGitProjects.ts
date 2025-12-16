import { useEffect, useState } from "react";

export interface GitProject {
    id: number;
    name: string;
    description: string;
    html_url: string;
    topics: string[];
}

export function useGitProjects() {
    const [projects, setProjects] = useState<GitProject[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const API_BASE = import.meta.env.VITE_API_BASE_URL;

                const res = await fetch(`${API_BASE}/github-projects`);
                const data: GitProject[] = await res.json();
                setProjects(data);
            } catch (err) {
                console.error("Error fetching GitHub projects:", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    return { projects, loading };
}
