import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
} from "firebase/auth";
import { useContext } from "react";
import { FirebaseAuthContext } from "../contexts/firebaseAuthContext";
import { auth } from "@/utils/firebase";

// Custom hook to use the auth context
export function useFirebaseAuth() {
    const context = useContext(FirebaseAuthContext);
    if (!context) {
        throw new Error("useAuth must be used within a FirebaseAuthProvider");
    }
    return context;
}

// Sign in with email and password
export async function signIn(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
}

// Sign out
export async function signOut() {
    await firebaseSignOut(auth);
}

// Sign up new user
export async function signUp(email: string, password: string) {
    return await createUserWithEmailAndPassword(auth, email, password);
}
