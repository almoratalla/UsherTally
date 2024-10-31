/* eslint-disable react/no-unescaped-entities */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Head from "next/head";
import Image from "next/image";
import Pusher from "pusher-js";
import { useEffect, useState } from "react";
import { FirebaseAuthProvider } from "../contexts/firebaseAuthContext";
import Header from "../components/Header";
import HeroSection from "../components/sections/HeroSection";
import FeaturesSection from "../components/sections/FeaturesSection";
import HowItWorksSection from "../components/sections/HowItWorksSection";

const isLoggedIn = true;
const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
});

// Interface for a counter section
interface Section {
    id: number;
    count: number;
    name: string;
}

export default function Home() {
    return (
        <div className="min-h-screen bg-gray-100">
            <Head>
                <title>UsherTally - Real-time People Counter</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            {/* Header */}
            <Header />

            {/* Hero Section */}
            <HeroSection />

            {/* Features Section */}
            <div id="features" className="invisible"></div>
            <FeaturesSection />

            {/* How It Works Section */}
            <HowItWorksSection />

            {/* Call to Action Section */}
            <section className="py-20 bg-blue-600 text-white text-center">
                <h2 className="text-3xl font-bold">
                    Get Started with Tally Today!
                </h2>
                <p className="mt-4">
                    Join now and streamline your event management with real-time
                    people counting.
                </p>
                <div className="mt-6">
                    <a
                        href="/counters"
                        className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-200"
                    >
                        Start Your Free Trial
                    </a>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div>&copy; 2024 Tallya. All rights reserved.</div>
                    <div className="space-x-4">
                        <a href="#" className="text-gray-400 hover:text-white">
                            Privacy Policy
                        </a>
                        <a href="#" className="text-gray-400 hover:text-white">
                            Terms of Service
                        </a>
                        <a href="#" className="text-gray-400 hover:text-white">
                            Contact
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
