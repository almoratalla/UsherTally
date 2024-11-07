import React, { useState, useRef } from "react";
import Seat from "./seat";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CheckIcon, ChevronsUpDown } from "lucide-react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import useCounters from "../../hooks/useCounters";
import { cn } from "@/lib/utils";
import { Section } from "../../lib/definitions";
import SectionSwitcher from "./section-switcher";
import useSectionStore from "../../stores/section-store";

interface SeatSectionProps {
    totalSeats?: number;
    rowsCount?: number;
    columnsCount?: number;
}

interface SelectedSeat {
    id: string;
    seats: number[];
}

export const SeatSection: React.FC<SeatSectionProps> = ({
    totalSeats,
    rowsCount,
    columnsCount,
}) => {
    const { selectedSection } = useSectionStore();
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
    const [selectionBox, setSelectionBox] = useState<{
        xStart: number;
        yStart: number;
        width: number;
        height: number;
    } | null>(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const { isSelectionMode } = useSectionStore();
    // const [isToggleMode, setIsToggleMode] = useState(false);

    // const toggleSelection = () => setIsToggleMode((prev) => !prev);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (isSelectionMode && containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            setSelectionBox({
                xStart: e.clientX - containerRect.left,
                yStart: e.clientY - containerRect.top,
                width: 0,
                height: 0,
            });
            setIsSelecting(true);
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isSelecting && containerRef.current && selectionBox) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const newWidth =
                e.clientX - containerRect.left - selectionBox.xStart;
            const newHeight =
                e.clientY - containerRect.top - selectionBox.yStart;

            setSelectionBox((prev) => ({
                ...prev!,
                width: newWidth,
                height: newHeight,
            }));
        }
    };

    const handleMouseUp = () => {
        if (isSelecting) {
            setIsSelecting(false);
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const boxRect = {
                    left: rect.left + (selectionBox?.xStart || 0),
                    top: rect.top + (selectionBox?.yStart || 0),
                    right:
                        rect.left +
                        (selectionBox?.xStart || 0) +
                        (selectionBox?.width || 0),
                    bottom:
                        rect.top +
                        (selectionBox?.yStart || 0) +
                        (selectionBox?.height || 0),
                };

                const seats =
                    containerRef.current.querySelectorAll("[data-index]");

                seats.forEach((seat: Element) => {
                    const seatRect = seat.getBoundingClientRect();
                    const seatIndex = parseInt(
                        seat.getAttribute("data-index") || "-1"
                    );

                    if (
                        seatRect.left >= boxRect.left &&
                        seatRect.right <= boxRect.right &&
                        seatRect.top >= boxRect.top &&
                        seatRect.bottom <= boxRect.bottom
                    ) {
                        const sectionId = selectedSection?.id || ""; // Get section id
                        const existingSelection = selectedSeats.find(
                            (seat) => seat.id === sectionId
                        );

                        if (existingSelection) {
                            // Add the seat number to the existing list of seats
                            setSelectedSeats((prev) =>
                                prev.map((seat) =>
                                    seat.id === sectionId
                                        ? {
                                              id: sectionId,
                                              seats: [...seat.seats, seatIndex],
                                          }
                                        : seat
                                )
                            );
                        } else {
                            setSelectedSeats((prev) => [
                                ...prev,
                                { id: `${sectionId}`, seats: [seatIndex] },
                            ]);
                        }
                    }
                });
            }
            setSelectionBox(null);
        }
    };

    const handleSeatClick = (index: number) => {
        if (!isSelectionMode) return;
        const sectionId = selectedSection?.id || "";
        const existingSelection = selectedSeats.find(
            (seat) => seat.id === sectionId
        );

        if (existingSelection) {
            // Toggle the seat selection
            const seatIndex = existingSelection.seats.indexOf(index);
            const updatedSeats = [...existingSelection.seats];
            if (seatIndex > -1) {
                updatedSeats.splice(seatIndex, 1); // Deselect the seat
            } else {
                updatedSeats.push(index); // Select the seat
            }
            setSelectedSeats((prev) =>
                prev.map((seat) =>
                    seat.id === sectionId
                        ? { id: sectionId, seats: updatedSeats }
                        : seat
                )
            );
        } else {
            setSelectedSeats((prev) => [
                ...prev,
                { id: `${sectionId}`, seats: [index] }, // Add seat selection
            ]);
        }
    };

    const { activeProjectSections } = useCounters();

    const [selectAllSections, setSelectAllSections] = useState(false);

    const toggleSelectAllInSection = () => {
        if (!selectedSection) return;

        const sectionId = selectedSection.id;
        const allSeatsInSection = [...Array(selectedSection.capacity)].map(
            (_, index) => index
        );

        const existingSelection = selectedSeats.find(
            (seat) => seat.id === `${sectionId}`
        );

        if (existingSelection) {
            // Unselect all if currently selected
            setSelectedSeats((prev) =>
                prev.filter((seat) => seat.id !== `${sectionId}`)
            );
        } else {
            // Select all seats in the section
            setSelectedSeats((prev) => [
                ...prev,
                { id: `${sectionId}`, seats: allSeatsInSection },
            ]);
        }
    };

    const toggleSelectAllInAllSections = () => {
        if (selectAllSections) {
            // Unselect all seats in all sections
            setSelectedSeats([]);
        } else {
            // Select all seats in all sections
            setSelectedSeats(
                activeProjectSections.map((section) => ({
                    id: `${section.id}`,
                    seats: [...Array(section.capacity)].map(
                        (_, index) => index
                    ),
                }))
            );
        }
        setSelectAllSections(!selectAllSections);
    };

    return (
        <div className="relative mx-auto w-fit">
            {/* <button
                className="mb-2 p-2 bg-blue-600 text-white rounded"
                onClick={toggleSelection}
            >
                {isSelectionMode
                    ? "Multi Selection Mode Enabled"
                    : "Single Selection Mode Enabled"}
            </button>
            <button
                onClick={toggleSelectAllInSection}
                className="mb-2 p-2 bg-green-600 text-white rounded"
            >
                {selectedSeats.some(
                    (seat) => seat.id === `${selectedSection?.id}`
                )
                    ? "Unselect All"
                    : "Select All"}{" "}
                in Section
            </button>

            <button
                onClick={toggleSelectAllInAllSections}
                className="mb-2 p-2 bg-red-600 text-white rounded"
            >
                {selectAllSections ? "Unselect All" : "Select All"} in All
                Sections
            </button> */}

            <div
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className="grid gap-2 p-20"
                style={{
                    gridTemplateColumns: `repeat(${columnsCount || Math.ceil(Math.sqrt(selectedSection?.capacity || 0))}, min-content)`,
                    userSelect: "none",
                    justifyContent: "center",
                    justifyItems: "center",
                    alignContent: "center",
                    alignItems: "center",
                }}
            >
                {isSelecting && selectionBox && (
                    <div
                        className="absolute bg-blue-500 bg-opacity-30 border border-blue-600"
                        style={{
                            left: `${selectionBox.xStart}px`,
                            top: `${selectionBox.yStart}px`,
                            width: `${selectionBox.width}px`,
                            height: `${selectionBox.height}px`,
                            pointerEvents: "none",
                        }}
                    />
                )}
                {[...Array(selectedSection?.capacity || 0)].map((_, index) => (
                    <Seat
                        key={index}
                        index={index}
                        isSelected={selectedSeats.some(
                            (seat) =>
                                seat.id === `${selectedSection?.id}` &&
                                seat.seats.includes(index)
                        )}
                        onClick={() => handleSeatClick(index)}
                        onMouseDown={() => {}}
                        onMouseOver={() => {}}
                    />
                ))}
            </div>
        </div>
    );
};

export default SeatSection;
