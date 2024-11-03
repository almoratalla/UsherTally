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
    Minus,
    Plus,
    Trash2,
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

const CounterSection: FC<
    PropsWithChildren &
        Section & {
            increment: (id: number) => void;
            decrement: (id: number) => void;
            deleteSection: () => void;
            renameSection: ({ id, name }: { id: number; name: string }) => void;
            isEditMode: boolean;
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
}) => {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editingTitle, setEditingTitle] = useState(name);
    const [open, setOpen] = React.useState(false);
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
                                            <CommandItem
                                                onSelect={toggleEditing}
                                                className=" py-2"
                                            >
                                                {isEditing ? (
                                                    <div className="flex flex-row gap-2 items-center">
                                                        <Check className="h-4 w-4" />
                                                        <span>
                                                            {"Confirm Rename"}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-row gap-2 items-center">
                                                        <Edit2 className="h-4 w-4" />
                                                        <span>{"Rename"}</span>
                                                    </div>
                                                )}
                                            </CommandItem>
                                            <CommandItem
                                                onSelect={deleteSection}
                                                className=" py-2"
                                            >
                                                <div className="flex flex-row gap-2 items-center">
                                                    <Trash2 className="h-4 w-4" />
                                                    <span>
                                                        {"Delete Section"}
                                                    </span>
                                                </div>
                                            </CommandItem>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="flex 2xl:hidden ">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleEditing}
                            >
                                {isEditing ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <Edit2 className="h-4 w-4" />
                                )}
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={deleteSection}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ) : null}
            </CardHeader>
            <CardDescription className="px-6 pb-2">
                {/* Last modified: {new Date().toLocaleString()} */}
            </CardDescription>
            <CardContent className="py-4 pt-0 2xl:flex 2xl:flex-1 2xl:flex-col 2xl:justify-end">
                <div className="flex items-center justify-center space-x-4">
                    <span className="text-5xl font-bold w-auto min-w-0 min-h-12">
                        {count}
                    </span>
                </div>
                <div className="flex items-center justify-center space-x-4 mt-4 font-medium 2xl:flex-col 2xl:space-x-0 2xl:gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => increment(id)}
                        className="bg-green-500 hover:bg-green-600 w-full"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => decrement(id)}
                        className="bg-red-500 hover:bg-red-600 w-full"
                    >
                        <Minus className="h-4 w-4 fill-white stroke-white" />
                        <span className="text-white">Subtract</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default CounterSection;
