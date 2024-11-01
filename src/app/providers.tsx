"use client";

// src/pages/_app.tsx

import { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FirebaseAuthProvider } from "./contexts/firebaseAuthContext";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PropsWithChildren } from "react";
import { ProjectsProvider } from "./hooks/useProjects";

// Create a query client
const queryClient = new QueryClient();

function Providers({ children }: PropsWithChildren) {
    return (
        <QueryClientProvider client={queryClient}>
            <FirebaseAuthProvider>
                <ProjectsProvider>{children}</ProjectsProvider>
            </FirebaseAuthProvider>
            <ReactQueryDevtools initialIsOpen={true} />
        </QueryClientProvider>
    );
}

export default Providers;
