import { useEffect, useState } from "react";
import ModelView from "./ModelView";

const ProjectModal = ({ project, onClose }: { project: any; onClose: () => void }) => {
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    useEffect(() => {
        setActiveImageIndex(0);
    }, [project?.id, project?.name]);

    if (!project) return null;

    const description = project.longDescription || project.description;
    const showcaseimages: string[] = project.showcaseimages ?? [];
    const hasImages = showcaseimages.length > 0;
    const hasGithub = Boolean(project.html_url);
    const tags: string[] = project.tags ?? project.topics ?? [];

    return (
        <div
            className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-[#1E1E1E] rounded-xl max-w-5xl w-full max-h-[90vh] flex flex-col relative shadow-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="
                        absolute top-4 right-4 z-10
                        text-gray-800 dark:text-gray-200
                        font-bold text-lg
                        cursor-pointer
                        transition-all duration-200
                        hover:text-red-400
                        hover:scale-110
                        hover:drop-shadow-[0_0_6px_rgba(255,80,80,0.7)]
                    "
                    onClick={onClose}
                    aria-label="Close"
                >
                    ✕
                </button>

                <div className="overflow-y-auto p-6 pb-4 flex-1 min-h-0">
                    <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white pr-8">
                        {project.name}
                    </h2>

                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {tags.map((tag: string, idx: number) => (
                                <span
                                    key={idx}
                                    className="text-xs font-medium px-2 py-1 rounded-full bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {description && (
                        <p className="mb-4 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {description}
                        </p>
                    )}

                    {project.modelPath && (
                        <div className="w-full h-96 mb-4">
                            <ModelView modelPath={project.modelPath} />
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                3D model — interact and zoom
                            </p>
                        </div>
                    )}

                    {hasImages && (
                        <div className="mb-4">
                            <div className="w-full rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center overflow-hidden mb-3">
                                <img
                                    key={`${showcaseimages[activeImageIndex]}-${activeImageIndex}`}
                                    src={showcaseimages[activeImageIndex]}
                                    alt={`${project.name} media ${activeImageIndex + 1}`}
                                    className="w-full max-h-112 object-contain"
                                />
                            </div>

                            {showcaseimages.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto pb-1">
                                    {showcaseimages.map((img: string, idx: number) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setActiveImageIndex(idx)}
                                            className={`
                                                shrink-0 w-20 h-14 rounded overflow-hidden border-2 transition-colors
                                                ${
                                                    idx === activeImageIndex
                                                        ? "border-blue-500"
                                                        : "border-transparent opacity-70 hover:opacity-100"
                                                }
                                            `}
                                            aria-label={`Show image ${idx + 1}`}
                                        >
                                            <img
                                                src={img}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {project.files && project.files.length > 0 && (
                        <div className="mb-2">
                            <p className="font-semibold mb-2 text-gray-900 dark:text-white">
                                Viewable / downloadable files:
                            </p>
                            {project.files.map((file: any, idx: number) => (
                                <a
                                    key={idx}
                                    href={file.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block text-blue-600 dark:text-blue-400 hover:underline mb-1"
                                >
                                    {file.name}
                                </a>
                            ))}
                        </div>
                    )}
                </div>

                {hasGithub && (
                    <div className="shrink-0 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end">
                        <a
                            href={project.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold hover:opacity-90 transition-opacity"
                        >
                            View on GitHub
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectModal;
