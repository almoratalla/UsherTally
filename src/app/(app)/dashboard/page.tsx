"use client";

import Header from "@/app/components/Header";
import withAuth from "@/app/components/withAuth";
import { debounce } from "@/utils/debounce";
import { db } from "@/utils/firebase";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
/* eslint-disable react/no-unescaped-entities */
import Head from "next/head";
import Image from "next/image";
import Pusher from "pusher-js";
import { useEffect, useState } from "react";

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

// export const metadata: Metadata = {
//     title: "UsherTally - Real-time People Counter",
//     icons: "/favicon.ico",
// };

const Dashboard = () => {
    // State to keep track of the count
    const [count, setCount] = useState<number>(0);
    // State to keep track of multiple sections
    const [sections, setSections] = useState<Section[]>([]);
    const [isEditing, setIsEditing] = useState<{ [key: number]: boolean }>({});
    const [pendingUpdates, setPendingUpdates] = useState<Map<number, number>>(
        new Map()
    );
    const [updateTimeout, setUpdateTimeout] = useState<NodeJS.Timeout | null>(
        null
    );

    useEffect(() => {
        const fetchSections = async () => {
            const sectionsRef = collection(db, "sections");
            const snapshot = await getDocs(sectionsRef);
            const sectionsData: Section[] = snapshot.docs
                .map((doc) => ({
                    id: doc.data().id,
                    count: doc.data().count,
                    name: doc.data().name,
                }))
                .sort((a, b) => a.id - b.id);

            setSections(sectionsData);
        };

        fetchSections();

        // Listen for real-time updates
        const unsubscribe = onSnapshot(
            collection(db, "sections"),
            (snapshot) => {
                const updatedSections: Section[] = snapshot.docs
                    .map((doc) => ({
                        id: doc.data().id,
                        count: doc.data().count,
                        name: doc.data().name,
                    }))
                    .sort((a, b) => a.id - b.id);
                setSections(updatedSections);
            }
        );

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        // Initialize Pusher

        // Subscribe to the channel and event
        const channel = pusher.subscribe("counter-channel");
        // channel.bind("count-updated", (data: { id: number; count: number }) => {
        //     // setCount(data.count);
        //     setSections((prevSections) =>
        //         prevSections.map((section) =>
        //             section.id === data.id
        //                 ? { ...section, count: data.count }
        //                 : section
        //         )
        //     );
        // });

        // Bind the event for count updates
        channel.bind("count-updated", (data: { id: number; count: number }) => {
            setSections((prevSections) =>
                prevSections.map((section) => {
                    return section.id === data.id
                        ? { ...section, count: data.count }
                        : section;
                })
            );
        });

        // Bind the event for section addition
        channel.bind("section-added", (data: { id: number; name: string }) => {
            // setSections((prevSections) => [
            //     ...prevSections,
            //     { id: data.id, count: 0 },
            // ]);
            setSections((prevSections) => {
                const sectionMap = new Map(prevSections.map((s) => [s.id, s]));

                // Add or update the section
                sectionMap.set(data.id, {
                    id: data.id,
                    count: 0,
                    name: data.name,
                });
                console.log(data);

                // Return the sections as an array while retaining order
                return Array.from(sectionMap.values());
            });
        });

        // Bind the event for renaming a section
        channel.bind(
            "section-renamed",
            (data: { id: number; name: string }) => {
                setSections((prevSections) =>
                    prevSections.map((section) =>
                        section.id === data.id
                            ? { ...section, name: data.name }
                            : section
                    )
                );
            }
        );

        // Cleanup on component unmount
        return () => {
            channel.unbind_all();
            channel.unsubscribe();
        };
    }, []);

    // Debounce function to handle batch updates
    const debounceUpdate = debounce(async (updates: Map<number, number>) => {
        const updatesArray = Array.from(pendingUpdates.entries());
        console.log(updates);
        if (updatesArray.length > 0) {
            await fetch("/api/pusher", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: updatesArray[0][0],
                    count: updatesArray[0][1],
                }),
            });
            // Clear pending updates after processing
            setPendingUpdates(new Map());
        }
    }, 1500);

    // Debounce function to handle batch updates
    // const processPendingUpdates = debounce(async () => {
    //     const updates = Array.from(pendingUpdates.entries());
    //     console.log(updates);
    //     if (updates.length > 0) {
    //         await fetch("/api/pusher", {
    //             method: "POST",
    //             headers: {
    //                 "Content-Type": "application/json",
    //             },
    //             body: JSON.stringify({
    //                 id: updates[0][0],
    //                 count: updates[0][1],
    //             }),
    //         });
    //         // Clear pending updates after processing
    //         setPendingUpdates(new Map());
    //     }
    // }, 1500);

    // Function to handle count updates
    const handleCountUpdate = (id: number, newCount: number) => {
        setSections((prevSections) =>
            prevSections.map((section) =>
                section.id === id ? { ...section, count: newCount } : section
            )
        );

        // Queue the update and debounce it
        setPendingUpdates((prev) => {
            const newPending = new Map(prev);
            newPending.set(id, newCount);
            // processPendingUpdates(); // Process pending updates after debounce delay
            if (updateTimeout) {
                clearTimeout(updateTimeout);
            }

            const timeout = setTimeout(() => {
                debounceUpdate(newPending);
            }, 1500);

            setUpdateTimeout(timeout);
            clearTimeout(timeout);
            newPending;

            return newPending;
        });
    };

    // Debounced function for adding a section
    const debouncedAddSection = debounce(
        async (newId: number, name: string) => {
            await fetch("/api/add-section", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id: newId, name }),
            });
        },
        500
    );

    // Debounced function for updating count
    // const debouncedUpdateCount = debounce(async (id: number, count: number) => {
    //     await fetch("/api/pusher", {
    //         method: "POST",
    //         headers: {
    //             "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify({ id, count }),
    //     });
    // }, 500);

    // Debounced function for renaming a section
    const debouncedRenameSection = debounce(
        async (id: number, name: string) => {
            await fetch("/api/rename-section", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id, name }),
            });
        },
        500
    );

    // // Function to add a new section
    // const addSection = () => {
    //     const newSection = {
    //         id: sections.length > 0 ? sections[sections.length - 1].id + 1 : 1,
    //         count: 0,
    //     };
    //     setSections([...sections, newSection]);
    // };
    // Function to add a new section
    const addSection = async () => {
        const newId =
            sections.length > 0 ? sections[sections.length - 1].id + 1 : 1;

        // // Add new section locally
        // setSections([...sections, { id: newId, count: 0 }]);

        // Add new section locally
        setSections((prevSections) => {
            const sectionMap = new Map(prevSections.map((s) => [s.id, s]));

            // Add the new section with a default name
            sectionMap.set(newId, {
                id: newId,
                count: 0,
                name: `Section ${newId}`,
            });
            return Array.from(sectionMap.values());
        });

        // Notify other clients about the new section
        debouncedAddSection(newId, `Section ${newId}`);
        // await fetch("/api/add-section", {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify({ id: newId, name: `Section ${newId}` }),
        // });
    };

    // const updateCount = async (newCount: number) => {
    //     setCount(newCount);
    //     await fetch("/api/pusher", {
    //         method: "POST",
    //         headers: {
    //             "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify({ count: newCount }),
    //     });
    // };

    // Function to update count for a specific section
    // const updateCount = async (id: number, newCount: number) => {
    //     setSections((prevSections) =>
    //         prevSections.map((section) => {
    //             console.log(
    //                 section.id === id,
    //                 { ...section, count: newCount },
    //                 section
    //             );
    //             return section.id === id
    //                 ? { ...section, count: newCount }
    //                 : section;
    //         })
    //     );

    //     debouncedUpdateCount(id, newCount);
    //     // await fetch("/api/pusher", {
    //     //     method: "POST",
    //     //     headers: {
    //     //         "Content-Type": "application/json",
    //     //     },
    //     //     body: JSON.stringify({ id, count: newCount }),
    //     // });
    // };

    // // Function to handle incrementing the count
    // const increment = () => {
    //     setCount((prevCount) => prevCount + 1);
    // };

    // // Function to handle decrementing the count
    // const decrement = () => {
    //     setCount((prevCount) => (prevCount > 0 ? prevCount - 1 : 0));
    // };

    // const increment = () => {
    //     updateCount(count + 1);
    // };

    // const decrement = () => {
    //     if (count > 0) {
    //         updateCount(count - 1);
    //     }
    // };
    // Function to rename a section
    const renameSection = async (id: number, newName: string) => {
        setSections((prevSections) =>
            prevSections.map((section) =>
                section.id === id ? { ...section, name: newName } : section
            )
        );

        // Notify other clients about the section name change
        debouncedRenameSection(id, newName);
        // await fetch("/api/rename-section", {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify({ id, name: newName }),
        // });
    };

    // Function to toggle editing mode for a section
    const toggleEditing = (id: number) => {
        setIsEditing((prevEditing) => ({
            ...prevEditing,
            [id]: !prevEditing[id],
        }));
    };

    // Function to start editing a section name
    // const startEditing = (id: number) => {
    //     setIsEditing((prevEditing) => ({
    //         ...prevEditing,
    //         [id]: true,
    //     }));
    // };

    // // Function to stop editing a section name
    // const stopEditing = (id: number) => {
    //     setIsEditing((prevEditing) => ({
    //         ...prevEditing,
    //         [id]: false,
    //     }));
    // };

    // Function to handle section name change
    const handleNameChange = (id: number, newName: string) => {
        renameSection(id, newName);
        // stopEditing(id);
        toggleEditing(id); // Stop editing after renaming
    };

    // Function to increment the count of a specific section
    const increment = (id: number) => {
        const section = sections.find((section) => section.id === id);
        if (section) {
            handleCountUpdate(id, section.count + 1);
            // updateCount(id, section.count + 1);
        }
    };

    // Function to decrement the count of a specific section
    const decrement = (id: number) => {
        const section = sections.find((section) => section.id === id);
        if (section && section.count > 0) {
            handleCountUpdate(id, section.count - 1);
            // updateCount(id, section.count - 1);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <Header />
            {/* <header className="bg-white shadow">
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
            </header> */}

            {/* Hero Section */}
            {isLoggedIn ? (
                <div className="flex flex-col items-center py-40 min-h-screen bg-gray-100">
                    <h1 className="text-4xl font-bold mb-4">
                        UsherTally Dashboard
                    </h1>

                    {/* Button to add a new section */}
                    <button
                        onClick={addSection}
                        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                    >
                        Add Section
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sections.map((section, sectionIndex) => {
                            return (
                                <div
                                    key={
                                        section.id +
                                        sectionIndex +
                                        Math.random()
                                    }
                                    className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center"
                                >
                                    {isEditing[section.id] ? (
                                        <input
                                            type="text"
                                            defaultValue={section.name}
                                            onBlur={(e) =>
                                                handleNameChange(
                                                    section.id,
                                                    e.target.value
                                                )
                                            }
                                            // onKeyPress={(e) => {
                                            //     if (e.key === "Enter") {
                                            //         handleNameChange(
                                            //             section.id,
                                            //             e.currentTarget.value
                                            //         );
                                            //     }
                                            // }}
                                            autoFocus
                                            className="text-2xl font-semibold mb-4 text-center border-b-2 border-gray-300 focus:outline-none"
                                        />
                                    ) : (
                                        <h2 className="text-2xl font-semibold mb-4">
                                            {section.name}: {section.count}
                                        </h2>
                                    )}
                                    <div className="flex space-x-4">
                                        <button
                                            onClick={() =>
                                                increment(section.id)
                                            }
                                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                                        >
                                            Add
                                        </button>
                                        <button
                                            onClick={() =>
                                                decrement(section.id)
                                            }
                                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                                        >
                                            Subtract
                                        </button>
                                        <button
                                            onClick={() =>
                                                toggleEditing(section.id)
                                            }
                                            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                                        >
                                            {isEditing[section.id]
                                                ? "Save"
                                                : "Edit"}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <>
                    <section className="bg-blue-600 text-white py-20">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                            <h1 className="text-5xl font-bold">
                                Real-time People Counting Made Easy
                            </h1>
                            <p className="mt-4 text-lg">
                                Monitor and manage your event's attendance
                                effortlessly with UsherTally.
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
                            <h2 className="text-3xl font-bold text-center">
                                Features
                            </h2>
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
                                        Stay informed with live updates on
                                        attendee counts.
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
                                        Ensure data security with robust
                                        authentication features.
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
                                    <h3 className="text-lg font-semibold">
                                        Sign Up
                                    </h3>
                                    <p className="mt-2 text-gray-600">
                                        Create an account in just a few easy
                                        steps.
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
                                        Define and manage seating sections
                                        effortlessly.
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
                                        Begin monitoring attendance in
                                        real-time.
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
                                        "UsherTally has completely transformed
                                        the way we manage our events. The
                                        real-time updates are a game-changer!"
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
                                            <h4 className="font-semibold">
                                                John Doe
                                            </h4>
                                            <p className="text-gray-600 text-sm">
                                                Event Manager
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="text-gray-600">
                                        "The section management feature is
                                        incredibly intuitive and makes our job
                                        so much easier."
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
                                        "Secure authentication gives us peace of
                                        mind knowing our data is safe."
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
                            Join now and streamline your event management with
                            real-time people counting.
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
                </>
            )}

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
};

export default Dashboard;
