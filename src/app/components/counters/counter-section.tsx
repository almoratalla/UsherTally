import useCounters from "@/app/hooks/useCounters";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Check,
  ChevronDown,
  ChevronsDown,
  ChevronsDownIcon,
  ChevronsUpDown,
  Edit2,
  Maximize2,
  Minus,
  Plus,
  Trash2,
  UsersRound,
} from "lucide-react";
import React, {
  FC,
  PropsWithChildren,
  useCallback,
  useMemo,
  useState,
} from "react";
import AnimatedNumberDisplay from "../animated-number";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Command, CommandItem, CommandList } from "@/components/ui/command";
import { Section } from "@/app/lib/definitions";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { getProgressBarColor } from "@/utils/functions";

const CounterSection: FC<
  PropsWithChildren &
    Section & {
      increment: (id: number) => void;
      decrement: (id: number) => void;
      deleteSection: () => void;
      renameSection: ({ id, name }: { id: number; name: string }) => void;
      isEditMode: boolean;
      capacity?: number;
      handleAddCapacity: (capacity?: number) => void;
    }
> = ({
  id,
  count,
  name,
  increment,
  decrement,
  deleteSection,
  renameSection,
  isEditMode = false,
  capacity,
  handleAddCapacity,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingTitle, setEditingTitle] = useState(name);
  const [open, setOpen] = React.useState(false);
  const [newCapacity, setNewCapacity] = useState(capacity);
  const [isAddingCapacity, setIsAddingCapacity] = useState(false);
  const handleNameChange = useCallback(() => {
    if (editingTitle !== name) {
      renameSection({ id, name: editingTitle });
    }
    setIsEditing(false);
  }, [editingTitle, id, name, renameSection]);

  const toggleEditing = useCallback(() => {
    if (isEditing) {
      handleNameChange();
    } else {
      setIsEditing(true);
    }
  }, [isEditing, handleNameChange]);

  return (
    <Card className="w-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 py-4 pb-2 gap-4">
        {isEditing ? (
          <Input
            type="text"
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            // onBlur={handleNameChange}
            className="w-[calc(100%-2.5rem)]"
            autoFocus
          />
        ) : (
          <CardTitle className="text-lg font-semibold min-h-10">
            {editingTitle}
          </CardTitle>
        )}
        {isEditMode ? (
          <div className="flex flex-row justify-end self-start">
            {/* Hidden on smaller screens, shown as a combobox on 2xl */}
            <div className="hidden 2xl:block w-full max-w-xs ">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="justify-between p-2"
                  >
                    <ChevronDown className=" h-4 w-2 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-max p-0">
                  <Command>
                    <CommandList className="w-max">
                      <CommandItem onSelect={toggleEditing} className=" py-2">
                        {isEditing ? (
                          <div className="flex flex-row gap-2 items-center">
                            <Check className="h-4 w-4" />
                            <span>{"Confirm Rename"}</span>
                          </div>
                        ) : (
                          <div className="flex flex-row gap-2 items-center">
                            <Edit2 className="h-4 w-4" />
                            <span>{"Rename"}</span>
                          </div>
                        )}
                      </CommandItem>
                      <CommandItem
                        onSelect={() => {
                          setIsAddingCapacity(true);
                        }}
                        className=" py-2"
                      >
                        <div className="flex flex-row gap-2 items-center">
                          <UsersRound className="h-4 w-4" />
                          <span>{"Update Capacity"}</span>
                        </div>
                      </CommandItem>
                      <CommandItem onSelect={deleteSection} className=" py-2">
                        <div className="flex flex-row gap-2 items-center">
                          <Trash2 className="h-4 w-4" />
                          <span>{"Delete Section"}</span>
                        </div>
                      </CommandItem>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex 2xl:hidden ">
              <Button variant="ghost" size="icon" onClick={toggleEditing}>
                {isEditing ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Edit2 className="h-4 w-4" />
                )}
              </Button>
              <Dialog
                open={isAddingCapacity}
                onOpenChange={setIsAddingCapacity}
              >
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <UsersRound className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Update Capacity</DialogTitle>
                    <DialogDescription>
                      Set the maximum capacity for this counter.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="capacity" className="text-right">
                        Capacity
                      </Label>
                      <Input
                        id="capacity"
                        type="number"
                        className="col-span-3"
                        value={newCapacity}
                        max={1000}
                        onChange={(e) =>
                          setNewCapacity(
                            Number.isNaN(Number(e.target.value))
                              ? undefined
                              : Number(e.target.value),
                          )
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => handleAddCapacity(newCapacity)}>
                      Update Capacity
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button variant="ghost" size="icon" onClick={deleteSection}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="py-4 pt-0 2xl:flex 2xl:flex-1 2xl:flex-col 2xl:justify-end">
        <div className="flex flex-col gap-0">
          <div className="flex items-center justify-between">
            <span className="text-4xl font-bold ">{count}</span>

            {capacity && (
              <span className="text-sm text-muted-foreground self-end">
                / {capacity}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400 font-italic">Counts</span>
            {capacity && (
              <span className="text-sm text-gray-400 font-italic">
                Capacity
              </span>
            )}
          </div>
          {capacity && (
            <Progress
              value={(count / capacity) * 100}
              className={cn(
                "mb-2 ",
                `[&>*]:${getProgressBarColor((count / capacity) * 100)}`,
              )}
            />
          )}
          {!capacity && <Progress value={0} className={cn("mb-2 invisible")} />}
        </div>

        {/* <Progress value={occupancyPercentage} className="mb-2" /> */}
        <div
          className={cn(
            "flex flex-col space-x-0 gap-2 items-center justify-center md:space-x-0  mt-4 font-medium md:flex-row 2xl:space-x-0 2xl:gap-2 2xl:justify-start",
            // !capacity ? "mt-10" : ""
          )}
        >
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              if (capacity) {
                if (count + 1 <= capacity) {
                  increment(id);
                }
              } else {
                increment(id);
              }
            }}
            disabled={capacity ? count + 1 > capacity : false}
            className="bg-green-500 hover:bg-green-600 w-full 2xl:w-min 2xl:p-4"
          >
            <Plus className="h-4 w-4" />
            <span className="2xl:hidden">Add</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              if (count - 1 >= 0) {
                decrement(id);
              }
            }}
            disabled={count - 1 < 0}
            className="bg-red-500 hover:bg-red-600 w-full 2xl:w-min 2xl:p-4"
          >
            <Minus className="h-4 w-4 fill-white stroke-white" />
            <span className="text-white 2xl:hidden">Subtract</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CounterSection;
