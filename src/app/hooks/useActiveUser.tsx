import { createContext, useContext, useState } from "react";
import {
  FirestorePreferences,
  FirestoreUser,
  iActiveUser,
} from "../lib/definitions";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { useMutation, useQuery } from "@tanstack/react-query";

interface iActiveUserContext {
  activeUser: Partial<iActiveUser> | null;
  setActiveUser: (state: Partial<iActiveUser>) => void;
  activePreferences: Partial<FirestorePreferences> | null | undefined;
  setActivePreferences: (
    state: Partial<FirestorePreferences> | null | undefined,
  ) => void;
}

const ActiveUserContext = createContext<iActiveUserContext | null>({
  activeUser: null,
  setActiveUser: () => {},
  activePreferences: null,
  setActivePreferences: () => {},
});

export const ActiveUserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [activeUser, setActiveUser] = useState<Partial<iActiveUser> | null>(
    null,
  );
  const [activePreferences, setActivePreferences] = useState<
    Partial<FirestorePreferences> | null | undefined
  >(null);

  return (
    <ActiveUserContext.Provider
      value={{
        activeUser,
        setActiveUser,
        activePreferences,
        setActivePreferences,
      }}
    >
      {children}
    </ActiveUserContext.Provider>
  );
};

export const useActiveUser = () => {
  const activeUserContext = useContext(ActiveUserContext);
  const checkAuth = async (
    uuid: string,
  ): Promise<{
    user: Partial<iActiveUser>;
    preferences?: Partial<FirestorePreferences>;
  }> => {
    const usersRef = collection(db, "users");
    const preferencesRef = collection(db, "preferences");
    const usersSnapshot = await getDocs(usersRef);
    const preferencesSnapshot = await getDocs(preferencesRef);
    const recordedUser = usersSnapshot.docs
      .map((doc) => doc.data())
      .find((d) => d.uuid === uuid);
    const recordedPreferences = preferencesSnapshot.docs
      .map((doc) => doc.data())
      .find((d) => d.uuid === uuid);
    if (!recordedUser) {
      const response = await fetch("/api/check-auth", {
        method: "GET",
        headers: {
          "x-tally-id": uuid,
        },
      });
      const user = await response.json();
      return {
        user: user as iActiveUser,
        preferences: recordedPreferences as FirestorePreferences,
      };
    }
    return {
      user: {
        ...recordedUser,
      } as iActiveUser,
      preferences: recordedPreferences as FirestorePreferences,
    };
  };

  const {
    mutateAsync: mutateUpdateSettings,
    isPending: mutateUpdateSettingsPending,
  } = useMutation({
    mutationKey: ["update-settings"],
    mutationFn: async (updateSettingsData: {
      uuid: string;
      data?: Partial<iActiveUser>;
      preferences?: Partial<FirestorePreferences>;
    }) => {
      try {
        await fetch("/api/update-settings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: updateSettingsData?.uuid,
            payload: updateSettingsData.data,
            preferences: updateSettingsData.preferences,
          }),
        });
        return { result: "success", changed: true };
      } catch (error) {
        return { result: "fail", changed: false };
      }
    },
  });

  const { data: allUsers } = useQuery<FirestoreUser[]>({
    queryKey: ["allUsers"],
    queryFn: async () => {
      const usersRef = collection(db, "users");
      const usersSnapshot = await getDocs(usersRef);
      return usersSnapshot.docs.map((doc) => doc.data()) as FirestoreUser[];
    },
  });

  return {
    getAllUsers: allUsers,
    activeUser: activeUserContext?.activeUser,
    setActiveUser: activeUserContext?.setActiveUser || (() => {}),
    activePreferences: activeUserContext?.activePreferences,
    setActivePreferences: activeUserContext?.setActivePreferences || (() => {}),
    checkAuth,
    updateSettings: mutateUpdateSettings,
    updateSettingsPending: mutateUpdateSettingsPending,
  };
};
