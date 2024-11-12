"use client";
import React, { useEffect, useState } from "react";
import SectionSwitcher from "./section-switcher";
import SeatSelectorSwitch from "./seat-selector-switch";
import SeatSelectionActions from "./seat-selection-actions";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Save, Trash2 } from "lucide-react";
import { useRouteChangePrompt } from "@/app/hooks/useRouteChangePrompt";
import useSectionStore from "@/app/stores/section-store";
import useCounters from "@/app/hooks/useCounters";
import { Section } from "@/app/lib/definitions";
import { convertSelectedSeatsToLayout } from "@/utils/functions";

const PlannerFilters = () => {
    const [showDialog, setShowDialog] = useState(false);
    const [unsavedChanges, setUnsavedChanges] = useState(false);
    const { selectedSeats } = useSectionStore();
    const { sections, updateSection } = useCounters();

    const handleSave = () => {
        setShowDialog(true);
    };
    const confirmSaveChanges = () => {
        setUnsavedChanges(false);
        setShowDialog(false);

        const changes: Section[] = sections
            .map((section) => {
                const selected = selectedSeats.find(
                    (seat) => seat.id === `${section.id}`
                );
                const selectedSeatsCount = selected ? selected.seats.length : 0;

                if (section.count !== selectedSeatsCount) {
                    return {
                        ...section,
                        count: selectedSeatsCount,
                        layout: selected
                            ? convertSelectedSeatsToLayout(
                                  selected?.seats,
                                  section.layout ?? []
                              )
                            : section.layout,
                    };
                }

                return null; // No change for this section
            })
            .filter((change) => change !== null);
        updateSection(changes);
    };

    useEffect(() => {
        const hasUnsavedChanges = sections.some((section) => {
            // Find the matching selectedSeats entry by ID
            const selected = selectedSeats.find(
                (seat) => seat.id === `${section.id}`
            );

            // Get the count of selected seats, defaulting to 0 if not found
            const selectedSeatsCount = selected ? selected.seats.length : 0;

            // Check if the count in the section is different from the number of selected seats
            return section.count !== selectedSeatsCount;
        });

        setUnsavedChanges(
            selectedSeats.length === 0 ? false : hasUnsavedChanges
        );
    }, [sections, selectedSeats]);

    useRouteChangePrompt(unsavedChanges);
    return (
        <section className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold">
                        Active section:
                    </span>
                    <SectionSwitcher />
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold">
                        Selection actions:
                    </span>
                    <SeatSelectionActions />
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                {unsavedChanges && (
                    <div className="flex flex-col md:flex-row gap-4">
                        <Dialog open={showDialog} onOpenChange={setShowDialog}>
                            <div className="flex items-center space-x-2">
                                <Button
                                    size="sm"
                                    onClick={handleSave}
                                    className="bg-green-700 hover:bg-green-800"
                                >
                                    <Save className="w-4 h-4 " /> Save Changes
                                </Button>
                            </div>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Confirm Save</DialogTitle>
                                </DialogHeader>
                                <p>
                                    Are you sure you want to save the changes?
                                </p>
                                <DialogFooter>
                                    <Button
                                        onClick={() => setShowDialog(false)}
                                        variant="outline"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            confirmSaveChanges();
                                        }}
                                        className="bg-green-500 hover:bg-green-600"
                                    >
                                        Confirm Save
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}

                <div>
                    <span className="text-sm font-semibold">Toggle mode:</span>
                    <SeatSelectorSwitch />
                </div>
            </div>
        </section>
    );
};

export default PlannerFilters;
