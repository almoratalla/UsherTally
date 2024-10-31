"use client";

import CounterSection from "@/app/components/counters/counter-section";
import Header from "@/app/components/Header";
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
            <Header />
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
            <main className="w-full max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">
                        Section 1
                    </h2>
                    <p className="text-gray-600 text-sm mb-4">ID: 1</p>

                    <div className="flex aitems-center justify-center w-full h-24 bg-gray-50 rounded-lg mb-4">
                        <p className="text-3xl font-bold text-gray-800">42</p>
                    </div>

                    <div className="flex spaace-x-2">
                        <button className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-400">
                            Increment
                        </button>
                        <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-400">
                            Decrement
                        </button>
                    </div>

                    <button className="mt-a4 text-blue-600 hover:underline">
                        Rename
                    </button>
                </div>
            </main>
            a
        </div>
    );
};

export default Counters;
