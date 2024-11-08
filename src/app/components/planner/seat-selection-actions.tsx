import useCounters from "@/app/hooks/useCounters";
import useSectionStore, {
  SelectionAction,
  SelectionActionsGrouping,
} from "@/app/stores/section-store";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { capitalize } from "@/utils/functions";
import { CheckIcon } from "@radix-ui/react-icons";
import { ChevronsUpDown } from "lucide-react";
import { useState } from "react";

const SeatSelectionActions = () => {
  const [open, setOpen] = useState(false);
  const {
    selectionAction,
    setSelectionAction,
    selectedSection,
    selectedSeats,
    setSelectedSeats,
    updateSelectedSeats,
    isSelectionMode,
  } = useSectionStore();
  const { activeProjectSections } = useCounters();

  const groupedActions = SelectionActionsGrouping.reduce(
    (acc, action) => {
      (acc[action.type] = acc[action.type] || []).push(action);
      return acc;
    },
    {} as Record<string, { type: string; actionName: SelectionAction }[]>,
  );

  const toggleSelectAllInSection = (
    actionName: "select-all-in-section" | "deselect-all-in-section",
  ) => {
    if (!selectionAction || !selectedSection) return;

    const sectionId = `${selectedSection?.id}` || "";
    const allSeatsInSection = [...Array(selectedSection.capacity)].map(
      (_, index) => index,
    );

    const existingSelection = selectedSeats.find(
      (seat) => `${seat.id}` === `${sectionId}`,
    );

    if (!existingSelection) {
      setSelectedSeats([
        ...selectedSeats,
        { id: `${sectionId}`, seats: allSeatsInSection },
      ]);
    }

    if (actionName === "deselect-all-in-section") {
      updateSelectedSeats(sectionId, () => []);
    } else {
      updateSelectedSeats(sectionId, () => allSeatsInSection);
    }
  };

  const toggleSelectAllInAllSections = (
    actionName: "select-all-in-all-sections" | "deselect-all-in-all-sections",
  ) => {
    if (!selectionAction || !selectedSection) return;

    if (actionName === "deselect-all-in-all-sections") {
      setSelectedSeats([]);
    } else {
      setSelectedSeats(
        activeProjectSections.map((section) => ({
          id: `${section.id}`,
          seats: [...Array(section.capacity)].map((_, index) => index),
        })),
      );
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className=" justify-between"
        >
          {!selectedSection
            ? "Please select first a section"
            : !isSelectionMode
              ? "Toggle editing mode to enable"
              : selectionAction
                ? capitalize(selectionAction.split("-").join(" "))
                : "Select action..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandInput placeholder="Search actions..." />
          <CommandList>
            {Object.entries(groupedActions).map(([type, actions]) => (
              <CommandGroup
                key={type}
                className="overflow-y-auto"
                heading={type}
              >
                {actions.map((action) => (
                  <CommandItem
                    key={action.type + action.actionName}
                    onSelect={() => {
                      setSelectionAction(action.actionName);
                      if (
                        action.actionName === "select-all-in-section" ||
                        action.actionName === "deselect-all-in-section"
                      ) {
                        toggleSelectAllInSection(action.actionName);
                      }
                      if (
                        action.actionName === "select-all-in-all-sections" ||
                        action.actionName === "deselect-all-in-all-sections"
                      ) {
                        toggleSelectAllInAllSections(action.actionName);
                      }
                      setOpen(false);
                    }}
                    disabled={
                      (action.actionName === "select-all-in-section" &&
                        selectedSeats.find(
                          (ss) => ss.id === `${selectedSection?.id}`,
                        )?.seats.length === selectedSection?.capacity) ||
                      (action.actionName === "deselect-all-in-section" &&
                        selectedSeats.find(
                          (ss) => ss.id === `${selectedSection?.id}`,
                        )?.seats.length === 0) ||
                      !selectedSection ||
                      !isSelectionMode ||
                      (action.actionName === "deselect-all-in-all-sections" &&
                        selectedSeats.length === 0) ||
                      (action.actionName === "select-all-in-all-sections" &&
                        selectedSeats.filter(
                          (ss) =>
                            ss.seats.length ===
                            activeProjectSections.find(
                              (s) => `${s.id}` === ss.id,
                            )?.capacity,
                        ).length === activeProjectSections.length)
                    }
                    className="cursor-pointer"
                  >
                    {capitalize(action.actionName?.split("-").join(" "))}
                    <CheckIcon
                      className={cn(
                        "ml-auto h-4 w-4",
                        action.actionName === selectionAction
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default SeatSelectionActions;
