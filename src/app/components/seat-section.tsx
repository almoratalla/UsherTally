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
import useCounters from "../hooks/useCounters";
import { cn } from "@/lib/utils";
import { Section } from "../lib/definitions";

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
      const newWidth = e.clientX - containerRect.left - selectionBox.xStart;
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

        const seats = containerRef.current.querySelectorAll("[data-index]");

        seats.forEach((seat: Element) => {
          const seatRect = seat.getBoundingClientRect();
          const seatIndex = parseInt(seat.getAttribute("data-index") || "-1");

          if (
            seatRect.left >= boxRect.left &&
            seatRect.right <= boxRect.right &&
            seatRect.top >= boxRect.top - 50 &&
            seatRect.bottom <= boxRect.bottom - 50
          ) {
            setSelectedSeats((prev) =>
              prev.includes(seatIndex)
                ? prev.filter((seat) => seat !== seatIndex)
                : [...prev, seatIndex],
            );
          }
        });
      }
      setSelectionBox(null);
    }
  };

  const handleSeatClick = (index: number) => {
    setSelectedSeats((prev) =>
      prev.includes(index)
        ? prev.filter((seat) => seat !== index)
        : [...prev, index],
    );
  };
  const [open, setOpen] = React.useState(false);
  const { activeProjectSections } = useCounters();
  const [selectedSection, setSelectedSection] = React.useState<Section | null>(
    null,
  );

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
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
          >
            {selectedSection?.name || "Select seat..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandList>
              <CommandInput placeholder=".Search sections.." />
              <CommandEmpty>No section found.</CommandEmpty>
              <CommandGroup className="overflow-y-auto max-h-[100px]">
                {activeProjectSections.map((section) => (
                  <CommandItem
                    key={section.id + section.name}
                    onSelect={() => {
                      setSelectedSection(section);
                      setOpen(false);
                    }}
                  >
                    {section.name}
                    <CheckIcon
                      className={cn(
                        "ml-auto h-4 w-4",
                        selectedSection?.name === section.name
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
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
