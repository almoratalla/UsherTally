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
  const { selectionAction, setSelectionAction } = useSectionStore();

  const groupedActions = SelectionActionsGrouping.reduce(
    (acc, action) => {
      (acc[action.type] = acc[action.type] || []).push(action);
      return acc;
    },
    {} as Record<string, { type: string; actionName: SelectionAction }[]>,
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className=" justify-between"
        >
          {capitalize(selectionAction.split("-").join(" ")) ||
            selectionAction ||
            "Select action..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className=" p-0">
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
                      setOpen(false);
                    }}
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
