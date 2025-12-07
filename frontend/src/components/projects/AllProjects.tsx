import { useState } from "react";
import GitProjects from "./GitProjects";
import LocalProjects from "./LocalProjects";
import ProjectModal from "./ProjectModal";

const AllProjects = () => {
  const [selectedProject, setSelectedProject] = useState<any>(null);

  return (
    <div className="space-y-12">
      {/* GitHub Projects Section */}
      <section>
        <h2 className="text-white text-2xl mb-4">GitHub Projects</h2>
        <GitProjects />
      </section>

      {/* Local Projects Section */}
      <section>
        <h2 className="text-white text-2xl mb-4">Other Projects</h2>
        <LocalProjects onSelectProject={setSelectedProject} />
      </section>

      {/* Modal for Local Projects */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  );
};

export default AllProjects;