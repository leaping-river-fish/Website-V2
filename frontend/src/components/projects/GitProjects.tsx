
import { useGitProjects } from "./useGitProjects";
import "./projectCard.css"

export default function GitProjects() {
    const { projects, loading } = useGitProjects();

    if (loading && projects.length === 0)
        return <div className="text-center py-10 text-white">Loading GitHub Projects...</div>;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {projects.map((project) => (
                <a
                    key={project.id}
                    href={project.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-card bg-white dark:bg-[#2C2C2C] p-4 rounded-xl shadow flex flex-col cursor-pointer transform transition-transform hover:scale-105 hover:shadow-[0_0_15px_rgba(255,255,255,0.3),0_0_30px_rgba(255,255,255,0.15)] overflow-hidden h-60"
                >
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                        {project.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm grow">
                        {project.description || "No description provided"}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-4">
                        {project.topics && project.topics.length > 0 ? (
                            project.topics.map((tag, idx) => (
                                <span key={idx} className="tag text-xs font-medium px-2 py-1 rounded-full bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200">{tag}</span>
                            ))
                        ) : (
                            <span className="tag text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                                No tags
                            </span>
                        )}
                    </div>
                </a>
            ))}
        </div>
    );
}


