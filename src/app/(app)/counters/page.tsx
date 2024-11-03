"use client";

import CounterSection from "@/app/components/counters/counter-section";
import EmptySection from "@/app/components/EmptySection";
import Header from "@/app/components/Header";
import Loader from "@/app/components/Loader";
import useCounters from "@/app/hooks/useCounters";
import { useProjects } from "@/app/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Edit3, Eye, Plus } from "lucide-react";
import { useCallback, useState } from "react";

const isLoggedIn = true;

const Counters = () => {
    const {
        activeProjectSections: sections,
        addSections,
        isSectionsLoading,
        updateSection,
        renameSection,
        deleteSections,
    } = useCounters();

    const increment = useCallback(
        (id: number) => {
            const section = sections.find((section) => section.id === id);
            if (section) {
                const updatedSection = { ...section, count: section.count + 1 };
                updateSection([updatedSection]);
            }
        },
        [sections, updateSection]
    );

    const decrement = useCallback(
        (id: number) => {
            const section = sections.find((section) => section.id === id);
            if (section) {
                const updatedSection = { ...section, count: section.count - 1 };
                updateSection([updatedSection]);
            }
        },
        [sections, updateSection]
    );

    

    const [newSectionTitle, setNewSectionTitle] = useState("");
    const { activeProject } = useProjects();
    const [isEditMode, setIsEditMode] = useState(false);

    return (
        <div className="min-h-screen bg-gray-100">
            <Header />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 2xl:px-0">
                <main className="flex flex-col py-12 min-h-screen bg-gray-100 gap-8">
                    <section className="flex flex-col items-start gap-2">
                        <div className="flex justify-between items-center w-full">
                            <h1 className="text-4xl font-bold ">
                                Counter Dashboard
                            </h1>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    checked={isEditMode}
                                    onCheckedChange={setIsEditMode}
                                    id="edit-mode"
                                />
                                <Label htmlFor="edit-mode">
                                    {isEditMode ? (
                                        <span className="flex items-center">
                                            <Edit3 className="w-4 h-4 mr-1" />{" "}
                                            Edit Mode
                                        </span>
                                    ) : (
                                        <span className="flex items-center">
                                            <Eye className="w-4 h-4 mr-1" />{" "}
                                            View Mode
                                        </span>
                                    )}
                                </Label>
                            </div>
                        </div>

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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-6">
                            {sections.map((section, sectionIndex) => {
                                // return <></>;
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
                                        renameSection={renameSection}
                                        isEditMode={isEditMode}
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
        </div>
    );
};

export default Counters;
