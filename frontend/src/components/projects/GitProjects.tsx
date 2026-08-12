import { useNavigate } from "react-router-dom";
import ProjectCard from "./ProjectCard";
import { useGitProjects, type GitProject } from "./useGitProjects";
import { getGitProjectDetails } from "../../data/projects/gitProjectDetails";
import "./projectCard.css";

export default function GitProjects({
    onSelectProject,
}: {
    onSelectProject: (project: any) => void;
}) {
    const navigate = useNavigate();
    const { projects, loading } = useGitProjects();

    if (loading && projects.length === 0)
        return <div className="text-center py-10 text-white">Loading GitHub Projects...</div>;

    const handleSelect = (project: GitProject) => {
        const details = getGitProjectDetails(project.name);
        onSelectProject({
            id: project.id,
            name: project.name,
            description: project.description || "No description provided",
            html_url: project.html_url,
            tags: project.topics ?? [],
            longDescription: details.longDescription,
            image: details.image,
            showcaseimages: details.showcaseimages ?? [],
        });
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {projects.map((project) => {
                const details = getGitProjectDetails(project.name);
                return (
                    <ProjectCard
                        key={project.id}
                        project={{
                            name: project.name,
                            description: project.description || "No description provided",
                            image: details.image,
                            tags: project.topics ?? [],
                        }}
                        onClick={() => handleSelect(project)}
                    />
                );
            })}
            <button
                type="button"
                onClick={() => navigate("/start")}
                aria-label="Wake Lumie"
                className="project-card bg-white dark:bg-[#2C2C2C] p-4 rounded-xl shadow flex flex-col items-center justify-center cursor-pointer transform transition-transform hover:scale-105 hover:shadow-[0_0_15px_rgba(255,255,255,0.3),0_0_30px_rgba(255,255,255,0.15)] overflow-visible"
            >
                <div className="w-full h-40 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden">
                    <img
                        src="/images/dragons/lumie/Lumie_Sleep.png"
                        alt="Lumie sleeping"
                        className="max-w-full max-h-full object-contain"
                    />
                </div>
            </button>
        </div>
    );
}
