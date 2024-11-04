"use client";

import CounterSection from "@/app/components/counters/counter-section";
import EmptySection from "@/app/components/EmptySection";
import Loader from "@/app/components/Loader";
import useCounters from "@/app/hooks/useCounters";
import { useProjects } from "@/app/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Edit3, Eye, Plus, RotateCcw } from "lucide-react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import FloatingLabelInput from "../FloatingLabelInput";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { CounterHeader } from "../counters/counter-header";
interface FormValues {
    newSectionTitle: string;
    newSectionCapacity: number | undefined;
}

const formSchema = z.object({
    newSectionTitle: z.string().optional(),
    newSectionCapacity: z
        .number()
        .max(1000, "Capacity cannot exceed 1000")
        .optional(),
});
const CountersPanel = () => {
    const {
        activeProjectSections: sections,
        addSections,
        isSectionsLoading,
        updateSection,
        renameSection,
        deleteSections,
        resetCounts,
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
    const [newSectionCapacity, setNewSectionCapacity] = useState<
        number | undefined
    >(undefined);
    const { activeProject } = useProjects();
    const [isEditMode, setIsEditMode] = useState(false);
    const {
        register,
        handleSubmit: handleNewFormSubmit,
        reset,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        // defaultValues: {
        //     newSectionCapacity: 1000,
        // },
    });
    const onSubmit = (data: FormValues) => {
        addSections({
            newSectionName: data.newSectionTitle,
            capacity: data.newSectionCapacity,
        });
        reset(); // Reset form fields after submission
    };
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 2xl:px-0">
            <main className="flex flex-col py-12 min-h-screen bg-gray-100 gap-8">
                <CounterHeader
                    isEditMode={isEditMode}
                    setIsEditMode={setIsEditMode}
                    activeProject={activeProject}
                    sections={sections}
                    resetCounts={resetCounts}
                    handleNewFormSubmit={handleNewFormSubmit}
                    onSubmit={onSubmit}
                    register={register}
                    errors={errors}
                />
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
                                    capacity={section.capacity}
                                    handleAddCapacity={(
                                        capacityProp?: number
                                    ) => {
                                        const sectionArray = sections.find(
                                            (sectionArrayEl) =>
                                                sectionArrayEl.id === section.id
                                        );
                                        if (sectionArray && capacityProp) {
                                            const updatedSection = {
                                                ...sectionArray,
                                                capacity: capacityProp,
                                            };
                                            updateSection([updatedSection]);
                                        }
                                    }}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <EmptySection
                        newSectionTitle={newSectionTitle}
                        setNewSectionTitle={setNewSectionTitle}
                        onAddSection={() => {
                            addSections({
                                newSectionName: newSectionTitle,
                                capacity: newSectionCapacity ?? undefined,
                            });
                            setNewSectionTitle("");
                        }}
                    />
                )}
            </main>
        </div>
    );
};

export default CountersPanel;
