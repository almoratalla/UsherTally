import { createContext, useContext, useState } from "react";
import { iActiveUser } from "../lib/definitions";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/utils/firebase";

interface iActiveUserContext {
    activeUser: iActiveUser | null;
    setActiveUser: (state: iActiveUser) => void;
}

const ActiveUserContext = createContext<iActiveUserContext | null>({
    activeUser: null,
    setActiveUser: () => {},
});

export const ActiveUserProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [activeUser, setActiveUser] = useState<iActiveUser | null>(null);

    return (
        <ActiveUserContext.Provider value={{ activeUser, setActiveUser }}>
            {children}
        </ActiveUserContext.Provider>
    );
};

export const useActiveUser = () => {
    const activeUserContext = useContext(ActiveUserContext);
    const checkAuth = async (uuid: string) => {
        const sectionsRef = collection(db, "users");
        const snapshot = await getDocs(sectionsRef);
        const recordedUser = snapshot.docs
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
            return user as iActiveUser;
        }
        return recordedUser as iActiveUser;
    };
    return {
        activeUser: activeUserContext?.activeUser,
        setActiveUser: activeUserContext?.setActiveUser || (() => {}),
        checkAuth,
    };
};
