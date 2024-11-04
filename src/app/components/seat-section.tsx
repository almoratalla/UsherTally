import React, { FC, useEffect, useState } from "react";
import Seat from "./seat";

interface SeatSectionProps {
    totalSeats: number;
    rowsCount?: number;
    columnsCount?: number;
}

export const SeatSection: FC<SeatSectionProps> = ({
    totalSeats,
    rowsCount,
    columnsCount,
}) => {
    const calculatedRowsCount = rowsCount ?? Math.ceil(Math.sqrt(totalSeats));
    const calculatedColumnsCount =
        columnsCount ?? Math.ceil(totalSeats / calculatedRowsCount);

    const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [toggleMode, setToggleMode] = useState(false); // New state for toggle mode

    const updateSeatSelection = (index: number) => {
        setSelectedSeats((prev) =>
            prev.includes(index)
                ? prev.filter((seat) => seat !== index)
                : [...prev, index]
        );
    };

    const handleSeatHover = (index: number) => {
        if (isDragging && toggleMode) {
            updateSeatSelection(index);
        }
    };

    const handleMouseDown = () => {
        if (toggleMode) {
            setIsDragging(true);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        const savedSeats = JSON.parse(
            localStorage.getItem("selectedSeats") || "[]"
        );
        if (savedSeats) setSelectedSeats(savedSeats);

        // Attach and detach event listeners for mouse up
        window.addEventListener("mouseup", handleMouseUp);
        return () => {
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, []);

    useEffect(() => {
        localStorage.setItem("selectedSeats", JSON.stringify(selectedSeats));
    }, [selectedSeats]);

    return (
        <div>
            <button
                onClick={() => setToggleMode((prev) => !prev)}
                className="mb-4 p-2 bg-blue-500 text-white rounded"
            >
                Toggle Drag Mode: {toggleMode ? "Enabled" : "Disabled"}
            </button>
            <div
                className={`grid gap-2 w-fit mx-auto p-10 ${
                    toggleMode ? "cursor-crosshair" : ""
                }`}
                style={{
                    gridTemplateColumns: `repeat(${calculatedColumnsCount}, min-content)`,
                    gridAutoRows: "26px",
                    gridAutoColumns: "32px",
                }}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
            >
                {[...Array(totalSeats)].map((_, index) => (
                    <Seat
                        key={`seat-${index}`}
                        index={index}
                        isSelected={selectedSeats.includes(index)}
                        onClick={() => updateSeatSelection(index)}
                        onMouseOver={() => handleSeatHover(index)}
                    />
                ))}
            </div>
        </div>
    );
};

export default SeatSection;
