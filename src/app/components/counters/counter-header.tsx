import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Edit3, Eye, RotateCcw, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import FloatingLabelInput from "../FloatingLabelInput";
import { usePathname } from "next/navigation";

interface SectionManagerProps {
    isEditMode: boolean;
    setIsEditMode: (value: boolean) => void;
    activeProject: { projectName: string } | null;
    sections: any[];
    resetCounts: () => void;
    handleNewFormSubmit: any;
    onSubmit: (data: any) => void;
    register: any;
    errors: any;
}

export function CounterHeader({
    isEditMode,
    setIsEditMode,
    activeProject,
    sections,
    resetCounts,
    handleNewFormSubmit,
    onSubmit,
    register,
    errors,
}: SectionManagerProps) {
    const pathname = usePathname();
    return (
        <section className="flex flex-col items-start gap-4 w-full">
            {pathname === "/counters" && (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
                    <h1 className="text-3xl sm:text-4xl font-bold">
                        Counter Dashboard
                    </h1>

                    <div className="flex items-center space-x-2">
                        <Switch
                            checked={isEditMode}
                            onCheckedChange={setIsEditMode}
                            id="edit-mode"
                        />
                        <Label
                            htmlFor="edit-mode"
                            className="text-sm sm:text-base"
                        >
                            {isEditMode ? (
                                <span className="flex items-center">
                                    <Edit3 className="w-4 h-4 mr-1" /> Edit Mode
                                </span>
                            ) : (
                                <span className="flex items-center">
                                    <Eye className="w-4 h-4 mr-1" /> View Mode
                                </span>
                            )}
                        </Label>
                    </div>
                </div>
            )}

            {activeProject && (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-500">
                        Active Project: {activeProject.projectName}
                    </h2>
                    <div className="flex flex-col sm:flex-row gap-4">
                        {pathname !== "/counters" && (
                            <div className="flex items-center space-x-2">
                                <Switch
                                    checked={isEditMode}
                                    onCheckedChange={setIsEditMode}
                                    id="edit-mode"
                                />
                                <Label
                                    htmlFor="edit-mode"
                                    className="text-sm sm:text-base"
                                >
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
                        )}
                        {sections.length > 0 && (
                            <div className="w-full sm:w-auto">
                                <Button
                                    variant="outline"
                                    onClick={resetCounts}
                                    className="w-full sm:w-auto"
                                >
                                    <RotateCcw className="mr-2 h-4 w-4" /> Reset
                                    All Counts
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {sections.length > 0 && (
                <div className="flex flex-col gap-4 w-full">
                    <form
                        onSubmit={handleNewFormSubmit(onSubmit)}
                        className="flex flex-col gap-4 w-full"
                    >
                        <div className="flex flex-col sm:flex-row gap-4 w-full">
                            <FloatingLabelInput
                                label="Title"
                                type="text"
                                placeholder="New section title"
                                {...register("newSectionTitle", {
                                    required: "Title is required",
                                })}
                                className={cn(
                                    "w-full",
                                    errors.newSectionTitle
                                        ? "border-red-500 border-2"
                                        : ""
                                )}
                            />

                            <FloatingLabelInput
                                label="Capacity"
                                type="number"
                                placeholder="New section capacity"
                                {...register("newSectionCapacity", {
                                    valueAsNumber: true,
                                    max: {
                                        value: 1000,
                                        message: "Capacity cannot exceed 1000",
                                    },
                                })}
                                className={cn(
                                    "w-full",
                                    errors.newSectionCapacity
                                        ? "border-red-500 border-2"
                                        : ""
                                )}
                            />
                            <Button
                                type="submit"
                                className="bg-brand-primary w-full sm:w-auto sm:min-h-[56px]"
                            >
                                <Plus className="mr-2 h-4 w-4" /> Add Section
                            </Button>
                        </div>
                    </form>

                    {errors.newSectionTitle && (
                        <span className="text-red-500 text-sm">
                            {errors.newSectionTitle.message}
                        </span>
                    )}
                    {errors.newSectionCapacity && (
                        <span className="text-red-500 text-sm">
                            {errors.newSectionCapacity.message
                                ? "Set a capacity between 1 and 1000"
                                : ""}
                        </span>
                    )}
                </div>
            )}
        </section>
    );
}
