// src/pages/_app.tsx

import { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { FirebaseAuthProvider } from "@/app/contexts/firebaseAuthContext";

// Create a query client
const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <QueryClientProvider client={queryClient}>
            <FirebaseAuthProvider>
                <Component {...pageProps} />
            </FirebaseAuthProvider>
            <ReactQueryDevtools initialIsOpen={true} />
        </QueryClientProvider>
    );
}

export default MyApp;
