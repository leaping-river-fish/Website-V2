// fix tags?, unlock project animation(gamify), cache the loaded projects so they are not constantly reloading
import AllProjects from "../components/projects/AllProjects";
import { NavbarSpacer } from "../components/reusable_misc/navbarspacer";

const Projects = () => {
    return (
        <div className="bg-[#1A1410] min-h-screen px-4 py-6">
            <NavbarSpacer />

            <AllProjects />
        </div>
    );
}

export default Projects