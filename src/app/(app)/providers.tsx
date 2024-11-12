"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FirebaseAuthProvider } from "../contexts/firebaseAuthContext";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PropsWithChildren } from "react";

// Create a query client
const queryClient = new QueryClient();

function Providers({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <FirebaseAuthProvider>{children}</FirebaseAuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default Providers;
