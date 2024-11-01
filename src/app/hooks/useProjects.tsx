import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { collection, getDocs, addDoc, query } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Define your project type
interface Project {
  owner: string;
  projectName: string;
  type: "private" | "public";
  members: string[];
}

const fetchProjects = async (): Promise<Project[]> => {
  const projectsSnapshot = await getDocs(collection(db, "projects"));
  return projectsSnapshot.docs.map((doc) => ({
    ...doc.data(),
  })) as Project[];
};

interface iProjectsContext {
  activeProject: Project | null;
  setActiveProject: (state: Project) => void;
}

const ProjectsContext = createContext<iProjectsContext | null>({
  activeProject: null,
  setActiveProject: () => {},
});

export const ProjectsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  return (
    <ProjectsContext.Provider value={{ activeProject, setActiveProject }}>
      {children}
    </ProjectsContext.Provider>
  );
};

export const useProjects = () => {
  const queryClient = useQueryClient();
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });
  const projectsContext = useContext(ProjectsContext);

  const groupedProjects = useMemo(() => {
    return projects.reduce<
      { type: "public" | "private"; projects: Project[] }[]
    >((acc, project) => {
      const found = acc.find((item) => item.type === project.type);
      if (found) {
        found.projects.push(project);
      } else {
        acc.push({ type: project.type, projects: [project] });
      }
      return acc;
    }, []);
  }, [projects]);

  useEffect(() => {
    if (!projectsContext?.activeProject && groupedProjects.length > 0) {
      const publicProjectGroup = groupedProjects.find(
        (group) => group.type === "public",
      );
      if (publicProjectGroup && publicProjectGroup.projects.length > 0) {
        projectsContext?.setActiveProject(publicProjectGroup.projects[0]);
      }
    }
  }, [groupedProjects, projectsContext]);

  // Create project mutation
  const createProject = async (newProject: Project) => {
    await addDoc(collection(db, "projects"), newProject);
    queryClient.invalidateQueries({ queryKey: ["projects"] }); // Invalidate projects to refresh data
  };

  return {
    projectsByType: groupedProjects,
    activeProject: projectsContext?.activeProject || null,
    setActiveProject: projectsContext?.setActiveProject || (() => {}),
    isLoading,
    createProject,
  };
};
