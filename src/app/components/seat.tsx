import { cn } from "@/lib/utils";

interface SeatProps {
  isSelected: boolean;
  onClick: () => void;
}

export const Seat: React.FC<SeatProps> = ({ isSelected = true, onClick }) => (
  <div
    className={cn(
      "bg-gray-800 h-6 w-8 m-1 rounded-t-lg cursor-pointer",
      isSelected && "bg-green-700",
    )}
  ></div>
);

export default Seat;
