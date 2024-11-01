import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "@/app/globals.css";
import Providers from "../providers";
import ProtectedLayout from "../components/ProtectedLayout";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Tally",
    description: "A tally app for ushers",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={montserrat.className}>
                <Providers>
                    <ProtectedLayout>{children}</ProtectedLayout>
                </Providers>
            </body>
        </html>
    );
}
