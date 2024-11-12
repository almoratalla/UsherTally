import React, { useState, useRef, useEffect } from "react";
import Seat from "./seat";
import useSectionStore from "../../stores/section-store";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import useCounters from "@/app/hooks/useCounters";
import {
    flattenLayoutWithNulls,
    getSelectedSeatIndices,
} from "@/utils/functions";

interface SeatSectionProps {
    totalSeats?: number;
    rowsCount?: number;
    columnsCount?: number;
}

export const SeatSection: React.FC<SeatSectionProps> = ({ columnsCount }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectionBox, setSelectionBox] = useState<{
        xStart: number;
        yStart: number;
        width: number;
        height: number;
    } | null>(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const {
        selectedSection,
        isSelectionMode,
        selectedSeats,
        setSelectedSeats,
        updateSelectedSeats,
    } = useSectionStore();
    const { activeProjectSections } = useCounters();

    useEffect(() => {
        setSelectedSeats(
            activeProjectSections.map((section) => ({
                id: `${section.id}`,
                seats: getSelectedSeatIndices(
                    section.layout
                        ? JSON.parse(section.layout as unknown as string)
                        : []
                ),
            }))
        );
    }, [activeProjectSections, setSelectedSeats]);

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
                        const sectionId = `${selectedSection?.id}` || ""; // Get section id
                        const existingSelection = selectedSeats.find(
                            (seat) => `${seat.id}` === `${sectionId}`
                        );

                        if (existingSelection) {
                            updateSelectedSeats(sectionId, (prevSeats) =>
                                [...prevSeats, seatIndex]
                                    .filter((seat) =>
                                        prevSeats.includes(seatIndex)
                                            ? seat !== seatIndex
                                            : true
                                    )
                                    .filter(
                                        (value, index, array) =>
                                            array.indexOf(value) === index
                                    )
                            );
                        } else {
                            setSelectedSeats([
                                ...selectedSeats,
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
        const sectionId = `${selectedSection?.id}` || "";
        const existingSelection = selectedSeats.find(
            (seat) => `${seat.id}` === `${sectionId}`
        );

        if (existingSelection) {
            const seatIndex = existingSelection.seats.indexOf(index);
            const updatedSeats = [...existingSelection.seats];
            if (seatIndex > -1) {
                updatedSeats.splice(seatIndex, 1); // Deselect the seat
            } else {
                updatedSeats.push(index); // Select the seat
            }
            updateSelectedSeats(sectionId, () => updatedSeats);
        } else {
            setSelectedSeats([
                ...selectedSeats,
                { id: `${sectionId}`, seats: [index] },
            ]);
        }
    };

    if (!selectedSection)
        return (
            <div className="relative mx-auto w-fit">
                <Alert className="w-fit flex flex-col justify-center items-center py-8">
                    <AlertTitle>Select a section first</AlertTitle>
                    <AlertDescription className="text-center">
                        Try opening the active section dropdown...
                    </AlertDescription>
                </Alert>
            </div>
        );

    return (
        <div className="relative mx-auto w-full overflow-x-auto">
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
                {selectedSection?.layout &&
                JSON.parse(selectedSection.layout as unknown as string).length >
                    0
                    ? flattenLayoutWithNulls(
                          JSON.parse(
                              (selectedSection.layout as unknown as string) ??
                                  []
                          )
                      ).map((seat, seatIndex, array) => {
                          const seatNumber = array
                              .slice(0, seatIndex + 1)
                              .filter((el) => el !== null).length;
                          return (
                              <Seat
                                  key={seatIndex}
                                  title={seat !== null ? `${seatNumber}` : ""}
                                  index={seatIndex}
                                  isSelected={selectedSeats.some(
                                      (seat) =>
                                          seat.id ===
                                              `${selectedSection?.id}` &&
                                          seat.seats.includes(seatIndex)
                                  )}
                                  onClick={() => handleSeatClick(seatIndex)}
                                  onMouseDown={() => {}}
                                  onMouseOver={() => {}}
                                  isSeatNull={seat === null}
                              />
                          );
                      })
                    : [...Array(selectedSection?.capacity || 0)].map(
                          (_, index) => (
                              <Seat
                                  key={index}
                                  title={`${index + 1}`}
                                  index={index}
                                  isSelected={selectedSeats.some(
                                      (seat) =>
                                          seat.id ===
                                              `${selectedSection?.id}` &&
                                          seat.seats.includes(index)
                                  )}
                                  onClick={() => handleSeatClick(index)}
                                  onMouseDown={() => {}}
                                  onMouseOver={() => {}}
                              />
                          )
                      )}
            </div>
        </div>
    );
};

export default SeatSection;
