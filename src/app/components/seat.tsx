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
  isSelected = true,
  onClick,
  onMouseDown,
  onMouseOver,
}) => (
  <div
    key={`seat-${index}`}
    onClick={onClick}
    data-index={index}
    className={cn(
      "bg-gray-700 h-6 w-8 m-1 rounded-t-lg cursor-pointer flex flex-col items-center justify-center text-white text-xs",
      isSelected && "bg-brand-selected border-green-700 border-2",
    )}
    onMouseDown={onMouseDown}
    onMouseOver={onMouseOver}
    style={{ userSelect: "none" }}
  >
    {(index + 1).toString()}
  </div>
);

export default Seat;
