
export default function ProjectCard({
    project,
    onClick,
}: {
    project: any;
    onClick: () => void;
}) {
    return (
        <div
            onClick={onClick}
            className="project-card bg-white dark:bg-[#2C2C2C] p-4 rounded-xl shadow flex flex-col cursor-pointer transform transition-transform hover:scale-105 hover:shadow-[0_0_15px_rgba(255,255,255,0.3),0_0_30px_rgba(255,255,255,0.15)] overflow-visible"
        >
            {project.image && (
                <div className="w-full h-40 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden mb-4">
                    <img
                        src={project.image}
                        alt={project.name}
                        className="max-w-full max-h-full object-contain"
                    />
                </div>
            )}

            <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{project.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm grow">{project.description}</p>
            </div>

            {project.tags && project.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                    {project.tags.map((tag: string, idx: number) => (
                        <span
                            key={idx}
                            className="tag text-xs font-medium px-2 py-1 rounded-full bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}