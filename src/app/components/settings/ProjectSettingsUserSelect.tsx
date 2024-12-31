import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { ChevronsUpDown, Check } from "lucide-react";
import React from "react";
import { FirestoreUser } from "@/app/lib/definitions";

const ProjectSettingsUserSelect = ({
  users,
  fieldOnChange,
  value,
}: {
  users: FirestoreUser[];
  fieldOnChange: (value: string) => void;
  value?: string;
}) => {
  const dialogContainerRef = React.useRef<HTMLDivElement | null>(null);
  const [selectUserDialogOpen, setSelectUserDialogOpen] = React.useState(false);

  return (
    <div ref={dialogContainerRef} className="relative z-50">
      <Popover
        // modal={true}
        open={selectUserDialogOpen}
        onOpenChange={setSelectUserDialogOpen}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={selectUserDialogOpen}
            className="w-full justify-between"
          >
            {value
              ? users.find((user) => user.uuid === value)?.email
              : "Select user..."}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="z-popover w-full p-0"
          container={dialogContainerRef.current}
        >
          <Command>
            <CommandInput placeholder="Search user..." />
            <CommandList>
              <CommandEmpty>No user found.</CommandEmpty>
              <CommandGroup>
                {users.map((user) => (
                  <CommandItem
                    key={user.username}
                    value={user.uuid}
                    onSelect={(currentValue) => {
                      fieldOnChange(currentValue);
                      setSelectUserDialogOpen(false);
                    }}
                  >
                    <div className="flex flex-col">
                      <p className="font-medium">{user.username}</p>
                      <p className="text-xs">{user.email}</p>
                    </div>

                    <Check
                      className={cn(
                        "ml-auto",
                        value === user.uuid ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ProjectSettingsUserSelect;
