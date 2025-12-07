
import ProjectCard from "./ProjectCard";

const hardcodedProjects = [
    {
        id: "h1",
        name: "EcoSystem App Design",
        description: "An app designed using Figma with the goal of gamifying sustainable living spaces. SHAD Design Entrepreneurship project",
        image: "/images/project_imgs/ecosystem_logo.png",
        tags: ["figma", "canva", "design", "group", "prototyping"],
        showcaseimages: [
            "/images/project_imgs/ecosystem_app.png",
            "/images/project_imgs/ecosystem_flowchart.png"
        ],
        files: [
            { name: "Business Plan", url: "/images/project_imgs/ecosystem_business_plan.pdf" },
            { name: "Pitch Slides", url: "/images/project_imgs/ecosystem_pitch.pdf" }
        ],
    },
    {
        id: "h2",
        name: "Solar-powered Car Design",
        description: "Car designed and assembled in SolidWorks",
        image: "/images/project_imgs/solidworks_car.png",
        tags: ["solidworks", "design"],
        showcaseimages: [],
        files: [],
        modelPath: "/3d_models/car.glb",
    },
    {
        id: "h3",
        name: "Nintendo Switch Recreation",
        description: "Solidworks recreation test with an image reference",
        image: "/images/project_imgs/nintendo.png",
        tags: ["solidworks", "design"],
        showcaseimages: [],
        files: [],
        modelPath: "/3d_models/nintendo.glb",
    },
    {
        id: "h4",
        name: "Puzzle Project",
        description: "Trillium Flower Popper",
        image: "/images/project_imgs/puzzle.png",
        tags: ["solidworks", "design", "group"],
        showcaseimages: [],
        files: [],
        modelPath: "/3d_models/puzzle.glb",
    }
];

export default function LocalProjects({ onSelectProject }: { onSelectProject: (project: any) => void }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {hardcodedProjects.map((project) => (
                <ProjectCard key={project.id} project={project} onClick={() => onSelectProject(project)} />
            ))}
        </div>
    );
}