import { cn } from "@/lib/utils";
import { PropsWithChildren } from "react";

interface SeatProps {
    index: number;
    isSelected: boolean;
    onClick: () => void;
    onMouseDown?: () => void;
    onMouseOver?: () => void;
    isSeatNull?: boolean;
    title?: string;
    isSelectionMode?: boolean;
}

export const Seat: React.FC<PropsWithChildren & SeatProps> = ({
    index,
    title,
    isSelected,
    onClick,
    onMouseDown,
    onMouseOver,
    isSeatNull,
    isSelectionMode,
}) => (
    <div
        key={`seat-${index}`}
        onClick={() => {
            if (isSeatNull) return;
            onClick();
        }}
        onMouseDown={() => {
            if (isSeatNull) return;
            onMouseDown;
        }}
        onMouseOver={() => {
            if (isSeatNull) return;
            onMouseOver;
        }}
        data-index={index}
        className={cn(
            isSeatNull
                ? "bg-transparent h-6 w-8 cursor-default user-select-none"
                : "bg-gray-700 h-6 w-8 m-1 rounded-t-lg cursor-pointer flex items-center justify-center text-white text-xs",
            isSelected &&
                !isSeatNull &&
                "bg-brand-selected border-green-700 border-2",
            !isSelectionMode && "cursor-not-allowed"
        )}
        style={{ userSelect: "none" }}
    >
        {!!!isSeatNull && title?.toString()}
    </div>
);

export default Seat;
