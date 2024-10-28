"use client";

import CounterSection from "@/app/components/counters/counter-section";
import useCounters from "@/app/hooks/useCounters";
import { db } from "@/utils/firebase";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import Pusher from "pusher-js";
import { useEffect, useMemo, useState } from "react";

const isLoggedIn = true;

const Counters = () => {
    const { sections, addSection, updateSection } = useCounters();

    const increment = (id: number) => {
        const section = sections.find((section) => section.id === id);
        if (section) {
            updateSection({ ...section, count: section.count + 1 });
        }
    };

    const decrement = (id: number) => {
        const section = sections.find((section) => section.id === id);
        if (section) {
            updateSection({ ...section, count: section.count - 1 });
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div className="text-2xl font-bold text-gray-900">
                        UsherTally
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
            {isLoggedIn ? (
                <div className="flex flex-col items-center py-40 min-h-screen bg-gray-100">
                    <h1 className="text-4xl font-bold mb-4">
                        UsherTally Dashboard
                    </h1>
                    <button
                        onClick={() => addSection()}
                        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                    >
                        Add Section
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sections.map((section, sectionIndex) => {
                            return (
                                <CounterSection
                                    {...section}
                                    key={
                                        section.id +
                                        sectionIndex +
                                        Math.random()
                                    }
                                    increment={increment}
                                    decrement={decrement}
                                />
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center py-40 min-h-screen bg-gray-100">
                    <h1 className="text-4xl font-bold mb-4">
                        UsherTally Login
                    </h1>
                </div>
            )}
        </div>
    );
};

export default Counters;
