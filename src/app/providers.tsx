"use client";

// src/pages/_app.tsx

import { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FirebaseAuthProvider } from "./contexts/firebaseAuthContext";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PropsWithChildren } from "react";
import { ProjectsProvider } from "./hooks/useProjects";
import { ActiveUserProvider } from "./hooks/useActiveUser";
import { ThemeProvider } from "./components/theme-provider";

// Create a query client
const queryClient = new QueryClient();

function Providers({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <FirebaseAuthProvider>
        <ProjectsProvider>
          <ActiveUserProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </ActiveUserProvider>
        </ProjectsProvider>
      </FirebaseAuthProvider>
      <ReactQueryDevtools initialIsOpen={true} />
    </QueryClientProvider>
  );
}

export default Providers;
