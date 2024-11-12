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
import { CheckIcon } from "@radix-ui/react-icons";
import { ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import useCounters from "../../hooks/useCounters";
import { cn } from "@/lib/utils";
import useSectionStore from "../../stores/section-store";

const SectionSwitcher = () => {
  const { activeProjectSections } = useCounters();
  const { selectedSection, setSelectedSection } = useSectionStore();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selectedSection?.name || "Select section..."}
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
  );
};

export default SectionSwitcher;
