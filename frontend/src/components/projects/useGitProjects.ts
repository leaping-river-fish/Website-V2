import { useQuery } from "@tanstack/react-query";

export interface GitProject {
    id: number;
    name: string;
    description: string;
    html_url: string;
    topics: string[];
}

async function fetchGitProjects(): Promise<GitProject[]> {
    const API_BASE = import.meta.env.VITE_API_BASE_URL;

    const res = await fetch(`${API_BASE}/github-projects`);
    if (!res.ok) {
        throw new Error("Failed to fetch GitHub projects");
    }

    return res.json();
}

export function useGitProjects() {
    const {
        data = [],
        isLoading,
    } = useQuery({
        queryKey: ["github-projects"],
        queryFn: fetchGitProjects,
        staleTime: 1000 * 60 * 10,
        gcTime: 1000 * 60 * 30,
    });

    return {
        projects: data,
        loading: isLoading,
    };
}
