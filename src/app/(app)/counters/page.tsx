"use client";

import CounterSection from "@/app/components/counters/counter-section";
import EmptySection from "@/app/components/EmptySection";
import Header from "@/app/components/Header";
import Loader from "@/app/components/Loader";
import useCounters from "@/app/hooks/useCounters";
import { useProjects } from "@/app/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useState } from "react";

const isLoggedIn = true;

const Counters = () => {
    const {
        activeProjectSections: sections,
        addSections,
        isSectionsLoading,
        updateSection,
        deleteSections,
    } = useCounters();

    const increment = (id: number) => {
        const section = sections.find((section) => section.id === id);
        if (section) {
            const updatedSection = { ...section, count: section.count + 1 };
            updateSection([updatedSection]);
        }
    };

    const decrement = (id: number) => {
        const section = sections.find((section) => section.id === id);
        if (section) {
            const updatedSection = { ...section, count: section.count - 1 };
            updateSection([updatedSection]);
        }
    };

    const [newSectionTitle, setNewSectionTitle] = useState("");
    const { activeProject } = useProjects();

    return (
        <div className="min-h-screen bg-gray-100">
            <Header />
            {isLoggedIn ? (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 2xl:px-0">
                    <main className="flex flex-col py-12 min-h-screen bg-gray-100 gap-8">
                        <section className="flex flex-col items-start gap-2">
                            <h1 className="text-4xl font-bold ">
                                Counter Dashboard
                            </h1>
                            {activeProject && (
                                <h2 className="text-xl font-semibold mb-4 text-gray-500">
                                    Active Project: {activeProject.projectName}
                                </h2>
                            )}

                            {sections.length > 0 && (
                                <div className="flex flex-col sm:flex-row gap-4 w-full">
                                    <Input
                                        type="text"
                                        placeholder="New section title"
                                        value={newSectionTitle}
                                        onChange={(e) =>
                                            setNewSectionTitle(e.target.value)
                                        }
                                        className="max-w-full md:max-w-xs"
                                    />
                                    <Button
                                        className="bg-brand-primary"
                                        onClick={() => {
                                            addSections(newSectionTitle);
                                            setNewSectionTitle("");
                                        }}
                                    >
                                        <Plus className="mr-2 h-4 w-4" /> Add
                                        Section
                                    </Button>
                                </div>
                            )}
                        </section>

                        {isSectionsLoading ? (
                            <div className="flex justify-center items-center min-h-[300px]">
                                <Loader />
                                <p className="ml-4 text-lg font-medium">
                                    Loading sections...
                                </p>
                            </div>
                        ) : sections.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                            deleteSection={() =>
                                                deleteSections(section.id)
                                            }
                                        />
                                    );
                                })}
                            </div>
                        ) : (
                            <EmptySection
                                newSectionTitle={newSectionTitle}
                                setNewSectionTitle={setNewSectionTitle}
                                onAddSection={() => {
                                    addSections(newSectionTitle);
                                    setNewSectionTitle("");
                                }}
                            />
                        )}
                    </main>
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
