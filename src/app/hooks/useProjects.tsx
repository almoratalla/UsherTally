import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { collection, getDocs, addDoc, query, doc } from "firebase/firestore";
import { auth, db } from "@/utils/firebase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchRolesAndPerms,
  iFirestoreRolesAndPerms,
} from "./useRolesAndPermissions";
import { useActiveUser } from "./useActiveUser";
import { useAuthState } from "react-firebase-hooks/auth";

// Define your project type
export interface Project {
  projectId: string;
  owner: string;
  projectName: string;
  type: "private" | "public";
  members: { uid: string; name: string; email: string; role: string }[];
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
    queryFn: () => {
      return fetchProjects();
    },
  });
  const { data: rolesAndPerms = [], isLoading: isRolesLoading } = useQuery<
    iFirestoreRolesAndPerms[]
  >({
    queryKey: ["rolesAndPerms"],
    queryFn: fetchRolesAndPerms,
  });
  const projectsContext = useContext(ProjectsContext);

  const { activeUser, checkAuth, setActiveUser, setActivePreferences } =
    useActiveUser();
  const [authStateUser] = useAuthState(auth);

  const checkAuthUser = useCallback(async () => {
    const { user, preferences } = await checkAuth(authStateUser?.uid ?? "");
    setActiveUser(user);
    setActivePreferences(preferences);
  }, [authStateUser?.uid, checkAuth, setActivePreferences, setActiveUser]);

  useEffect(() => {
    if (!activeUser) {
      checkAuthUser();
    }
  }, [checkAuthUser, activeUser]);

  const groupedProjects = useMemo(() => {
    const userPermissions = rolesAndPerms.find(
      (perm) => perm.uid === activeUser?.uuid,
    );

    return projects.reduce<
      { type: "public" | "private"; projects: Project[] }[]
    >((acc, project) => {
      const hasAccess =
        project.type === "public" ||
        userPermissions?.projectMapping.some(
          (mapping) => mapping.projectId === project.projectId,
        ) ||
        project.owner === activeUser?.email;
      if (!hasAccess) return acc;

      const found = acc.find((item) => item.type === project.type);
      if (found) {
        found.projects.push(project);
      } else {
        acc.push({ type: project.type, projects: [project] });
      }
      return acc;
    }, []);
  }, [activeUser?.email, activeUser?.uuid, projects, rolesAndPerms]);

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
    const ref = doc(collection(db, "projects"));

    await addDoc(ref.parent, { ...newProject, projectId: ref.id });
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
