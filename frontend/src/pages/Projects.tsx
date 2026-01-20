// fix tags?, unlock project animation(gamify), greater detail on projects page
import AllProjects from "../components/projects/AllProjects";
import { NavbarSpacer } from "../components/reusable_misc/NavbarSpacer";
import { usePageTracking } from "../components/quests/usePageTracking";

const Projects = () => {
    usePageTracking("projects");
  
    return (
        <div className="bg-[#1A1410] min-h-screen px-4 py-6">
            <NavbarSpacer />

            <AllProjects />
        </div>
    );
}

export default Projects