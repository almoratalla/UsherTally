import { db } from "@/utils/firebase";
import { collection, getDocs } from "firebase/firestore";

export interface iFirestoreRolesAndPerms {
  email: string;
  uid: string;
  projectMapping: {
    projectId: string;
    roles: ("Admin" | "Moderator" | "Member")[];
    permissions: Record<string, boolean>;
  }[];
}

export const fetchRolesAndPerms = async (): Promise<
  iFirestoreRolesAndPerms[]
> => {
  const rolesAndPermsSnapshot = await getDocs(collection(db, "rolesAndPerms"));
  return rolesAndPermsSnapshot.docs.map((doc) => ({
    ...doc.data(),
  })) as iFirestoreRolesAndPerms[];
};

export const useRolesAndPermissions = () => {};
