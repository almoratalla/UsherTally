import { cn } from "@/lib/utils";
import { PropsWithChildren } from "react";

interface SeatProps {
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onMouseDown?: () => void;
  onMouseOver?: () => void;
}

export const Seat: React.FC<PropsWithChildren & SeatProps> = ({
  index,
  isSelected,
  onClick,
  onMouseDown,
  onMouseOver,
}) => (
  <div
    key={`seat-${index}`}
    onClick={onClick}
    onMouseDown={onMouseDown}
    onMouseOver={onMouseOver}
    data-index={index}
    className={cn(
      "bg-gray-700 h-6 w-8 m-1 rounded-t-lg cursor-pointer flex items-center justify-center text-white text-xs",
      isSelected && "bg-brand-selected border-green-700 border-2",
    )}
    style={{ userSelect: "none" }}
  >
    {(index + 1).toString()}
  </div>
);

export default Seat;
