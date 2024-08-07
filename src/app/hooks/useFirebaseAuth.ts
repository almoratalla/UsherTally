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
    return useContext(FirebaseAuthContext);
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
    await createUserWithEmailAndPassword(auth, email, password);
}

