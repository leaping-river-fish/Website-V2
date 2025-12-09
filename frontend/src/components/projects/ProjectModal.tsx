// make darkening of background light, fix images 

import ModelView from "./ModelView";

const ProjectModal = ({ project, onClose }: { project: any, onClose: () => void }) => {
    if (!project) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-[#1E1E1E] rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 relative shadow-lg"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Project Name */}
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                    {project.name}
                </h2>

                {/* Project Description */}
                <p className="mb-4 text-gray-700 dark:text-gray-300">{project.description}</p>

                {/* 3D Model */}
                {project.modelPath && (
                    <div className="w-full h-96 mb-4">
                        <ModelView modelPath={project.modelPath} />
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            3D model — interact and zoom
                        </p>
                    </div>
                )}
                
                {/* Showcase Images */}
                {project.showcaseimages && project.showcaseimages.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        {project.showcaseimages.map((img: string, idx: number) => (
                            <img
                                key={idx}
                                src={img}
                                alt={`Screenshot ${idx + 1}`}
                                className="w-full max-h-72 object-contain rounded"
                            />
                        ))}
                    </div>
                )}

                {/* Downloadable Files */}
                {project.files && project.files.length > 0 && (
                    <div className="mb-4">
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

                {/* Close Button */}
                <button
                    className="
                        absolute top-4 right-4 
                        text-gray-800 dark:text-gray-200 
                        font-bold text-lg 
                        cursor-pointer
                        transition-all duration-200 
                        hover:text-red-400
                        hover:scale-110
                        hover:drop-shadow-[0_0_6px_rgba(255,80,80,0.7)]
                    "
                    onClick={onClose}
                >
                    ✕
                </button>
            </div>
        </div>
    );
};

export default ProjectModal;