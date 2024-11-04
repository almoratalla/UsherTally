import React, { useState, useRef } from "react";
import Seat from "./seat";

interface SeatSectionProps {
    totalSeats: number;
    rowsCount?: number;
    columnsCount?: number;
}

export const SeatSection: React.FC<SeatSectionProps> = ({
    totalSeats,
    rowsCount,
    columnsCount,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
    const [selectionBox, setSelectionBox] = useState<{
        xStart: number;
        yStart: number;
        width: number;
        height: number;
    } | null>(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const [isToggleMode, setIsToggleMode] = useState(false);

    const toggleSelection = () => setIsToggleMode((prev) => !prev);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (isToggleMode && containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            setSelectionBox({
                xStart: e.clientX - containerRect.left,
                yStart: e.clientY - containerRect.top + 50,
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
                e.clientY - containerRect.top - selectionBox.yStart + 50;

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
                        seatRect.top >= boxRect.top - 50 &&
                        seatRect.bottom <= boxRect.bottom - 50
                    ) {
                        setSelectedSeats((prev) =>
                            prev.includes(seatIndex)
                                ? prev.filter((seat) => seat !== seatIndex)
                                : [...prev, seatIndex]
                        );
                    }
                });
            }
            setSelectionBox(null);
        }
    };

    const handleSeatClick = (index: number) => {
        if (!isToggleMode) {
            setSelectedSeats((prev) =>
                prev.includes(index)
                    ? prev.filter((seat) => seat !== index)
                    : [...prev, index]
            );
        }
    };

    return (
        <div className="relative mx-auto w-fit">
            <button
                className="mb-2 p-2 bg-blue-600 text-white rounded"
                onClick={toggleSelection}
            >
                {isToggleMode
                    ? "Multi Selection Mode Enabled"
                    : "Single Selection Mode Enabled"}
            </button>
            <div
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className="grid gap-2 p-20"
                style={{
                    gridTemplateColumns: `repeat(${columnsCount || Math.ceil(Math.sqrt(totalSeats))}, min-content)`,
                    userSelect: "none",
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
                {[...Array(totalSeats)].map((_, index) => (
                    <Seat
                        key={index}
                        index={index}
                        isSelected={selectedSeats.includes(index)}
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
