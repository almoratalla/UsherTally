"use client";

import { auth } from "@/utils/firebase";
import { User, onAuthStateChanged } from "firebase/auth";
import { createContext, ReactNode, useEffect, useState } from "react";

// Create a context for authentication
export const FirebaseAuthContext = createContext<{ user: any } | null>(null);

// Provide authentication context to components
export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });

        return () => unsubscribe();
    }, []);

    return (
        <FirebaseAuthContext.Provider value={{ user: user }}>
            {children}
        </FirebaseAuthContext.Provider>
    );
}
