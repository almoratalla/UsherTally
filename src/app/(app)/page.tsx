/* eslint-disable react/no-unescaped-entities */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Head from "next/head";
import Image from "next/image";
import Pusher from "pusher-js";
import { useEffect, useState } from "react";
import { FirebaseAuthProvider } from "../contexts/firebaseAuthContext";

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
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div className="text-2xl font-bold text-gray-900">
                        Tally
                    </div>
                    <nav className="space-x-4">
                        <a
                            href="#"
                            className="text-gray-600 hover:text-gray-900"
                        >
                            Home
                        </a>
                        <a
                            href="#"
                            className="text-gray-600 hover:text-gray-900"
                        >
                            Features
                        </a>
                        <a
                            href="#"
                            className="text-gray-600 hover:text-gray-900"
                        >
                            Pricing
                        </a>
                        <a
                            href="#"
                            className="text-gray-600 hover:text-gray-900"
                        >
                            About
                        </a>
                        <a
                            href="#"
                            className="text-gray-600 hover:text-gray-900"
                        >
                            Contact
                        </a>
                    </nav>
                    <div>
                        <a
                            href="/login"
                            className="text-gray-600 hover:text-gray-900"
                        >
                            Login
                        </a>
                        <a
                            href="/signup"
                            className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Sign Up
                        </a>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="bg-blue-600 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl font-bold">
                        Real-time People Counting Made Easy
                    </h1>
                    <p className="mt-4 text-lg">
                        Monitor and manage your event's attendance effortlessly
                        with UsherTally.
                    </p>
                    <div className="mt-6">
                        <a
                            href="/signup"
                            className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-200"
                        >
                            Get Started
                        </a>
                        <a
                            href="#features"
                            className="ml-4 px-8 py-3 bg-transparent border border-white text-white rounded-lg font-semibold hover:bg-blue-700"
                        >
                            Learn More
                        </a>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center">Features</h2>
                    <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-500 text-white mx-auto mb-4">
                                {/* Icon */}
                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 4v16m8-8H4"
                                    ></path>
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold">
                                Real-time Updates
                            </h3>
                            <p className="mt-2 text-gray-600">
                                Stay informed with live updates on attendee
                                counts.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-500 text-white mx-auto mb-4">
                                {/* Icon */}
                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 4v16m8-8H4"
                                    ></path>
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold">
                                Easy Section Management
                            </h3>
                            <p className="mt-2 text-gray-600">
                                Effortlessly manage and organize seating
                                sections.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-500 text-white mx-auto mb-4">
                                {/* Icon */}
                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 4v16m8-8H4"
                                    ></path>
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold">
                                Secure Authentication
                            </h3>
                            <p className="mt-2 text-gray-600">
                                Ensure data security with robust authentication
                                features.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center">
                        How It Works
                    </h2>
                    <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="text-center">
                            <Image
                                src="/images/signup.svg"
                                alt="Sign Up"
                                className="mx-auto mb-4 h-24 w-24"
                                width={400}
                                height={400}
                            />
                            <h3 className="text-lg font-semibold">Sign Up</h3>
                            <p className="mt-2 text-gray-600">
                                Create an account in just a few easy steps.
                            </p>
                        </div>
                        <div className="text-center">
                            <Image
                                src="/images/setup.svg"
                                alt="Set Up"
                                className="mx-auto mb-4 h-24 w-24"
                                width={400}
                                height={400}
                            />
                            <h3 className="text-lg font-semibold">
                                Set Up Sections
                            </h3>
                            <p className="mt-2 text-gray-600">
                                Define and manage seating sections effortlessly.
                            </p>
                        </div>
                        <div className="text-center">
                            <Image
                                src="/images/start-counting.svg"
                                alt="Start Counting"
                                className="mx-auto mb-4 h-24 w-24"
                                width={400}
                                height={400}
                            />
                            <h3 className="text-lg font-semibold">
                                Start Counting
                            </h3>
                            <p className="mt-2 text-gray-600">
                                Begin monitoring attendance in real-time.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20 bg-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center">
                        Testimonials
                    </h2>
                    <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="text-center">
                            <p className="text-gray-600">
                                "UsherTally has completely transformed the way
                                we manage our events. The real-time updates are
                                a game-changer!"
                            </p>
                            <div className="mt-4 flex justify-center">
                                <Image
                                    src="/images/user1.jpg"
                                    alt="User 1"
                                    className="h-12 w-12 rounded-full"
                                    width={400}
                                    height={400}
                                />
                                <div className="ml-4 text-left">
                                    <h4 className="font-semibold">John Doe</h4>
                                    <p className="text-gray-600 text-sm">
                                        Event Manager
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-600">
                                "The section management feature is incredibly
                                intuitive and makes our job so much easier."
                            </p>
                            <div className="mt-4 flex justify-center">
                                <Image
                                    src="/images/user2.jpg"
                                    alt="User 2"
                                    className="h-12 w-12 rounded-full"
                                    width={400}
                                    height={400}
                                />
                                <div className="ml-4 text-left">
                                    <h4 className="font-semibold">
                                        Jane Smith
                                    </h4>
                                    <p className="text-gray-600 text-sm">
                                        Operations Coordinator
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-600">
                                "Secure authentication gives us peace of mind
                                knowing our data is safe."
                            </p>
                            <div className="mt-4 flex justify-center">
                                <Image
                                    src="/images/user3.jpg"
                                    alt="User 3"
                                    className="h-12 w-12 rounded-full"
                                    width={400}
                                    height={400}
                                />
                                <div className="ml-4 text-left">
                                    <h4 className="font-semibold">
                                        Emily Johnson
                                    </h4>
                                    <p className="text-gray-600 text-sm">
                                        Tech Lead
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="py-20 bg-blue-600 text-white text-center">
                <h2 className="text-3xl font-bold">
                    Get Started with UsherTally Today!
                </h2>
                <p className="mt-4">
                    Join now and streamline your event management with real-time
                    people counting.
                </p>
                <div className="mt-6">
                    <a
                        href="/signup"
                        className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-200"
                    >
                        Start Your Free Trial
                    </a>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div>&copy; 2024 UsherTally. All rights reserved.</div>
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
