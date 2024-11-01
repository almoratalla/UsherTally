import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CaretSortIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import { Label } from "@/components/ui/label";
import { useProjects } from "../hooks/useProjects";
import { capitalize } from "@/utils/functions";
import { cn } from "@/lib/utils";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/utils/firebase";

type PopoverTriggerProps = React.ComponentPropsWithoutRef<
    typeof PopoverTrigger
>;

interface TeamSwitcherProps extends PopoverTriggerProps {}

export default function ProjectSwitcher({ className }: TeamSwitcherProps) {
    const [open, setOpen] = useState(false);
    const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
    const [projectName, setProjectName] = useState("");
    const [projectType, setProjectType] = useState<"public" | "private" | "">(
        ""
    );

    const { projectsByType, activeProject, setActiveProject, createProject } =
        useProjects();
    const [user] = useAuthState(auth);

    const handleCreateProject = async () => {
        if (projectName && projectType) {
            await createProject({
                owner: user?.email || "",
                projectName,
                type: projectType,
                members: [],
            });
            setShowNewProjectDialog(false);
            setProjectName("");
        } else {
            alert("Please provide all project details.");
        }
    };
    return (
        <Dialog
            open={showNewProjectDialog}
            onOpenChange={setShowNewProjectDialog}
        >
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        aria-label="Select a project"
                        className={cn("w-[200px] justify-between", className)}
                    >
                        <Avatar className="mr-2 h-5 w-5">
                            <AvatarImage
                                src={`https://avatar.vercel.sh/${activeProject?.projectName}.png`}
                                alt={activeProject?.projectName}
                                className="grayscale"
                            />
                            <AvatarFallback>SC</AvatarFallback>
                        </Avatar>
                        {activeProject?.projectName}
                        <CaretSortIcon className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                    <Command>
                        <CommandList>
                            <CommandInput placeholder=".Search project.." />
                            <CommandEmpty>No project found.</CommandEmpty>
                            {projectsByType
                                ?.filter(
                                    (p) => (!user ? p.type !== "private" : p) // public projects are always visible
                                )
                                .filter((p) =>
                                    !user
                                        ? p
                                        : p.projects.some(
                                              (project) =>
                                                  project.owner === user.email
                                          )
                                )
                                ?.map((group) => (
                                    <CommandGroup
                                        key={group.type}
                                        heading={capitalize(group.type)}
                                    >
                                        {group.projects
                                            ?.filter((p) =>
                                                p.type === "public"
                                                    ? true
                                                    : user?.email
                                                      ? p.members.includes(
                                                            user.email
                                                        ) ||
                                                        p.owner === user?.email
                                                      : true
                                            )
                                            ?.map((project) => (
                                                <CommandItem
                                                    key={project.projectName}
                                                    onSelect={() => {
                                                        setActiveProject(
                                                            project
                                                        );
                                                        setOpen(false);
                                                    }}
                                                    className="text-sm"
                                                >
                                                    <Avatar className="mr-2 h-5 w-5">
                                                        <AvatarImage
                                                            src={`https://avatar.vercel.sh/test.png`}
                                                            alt={
                                                                project.projectName
                                                            }
                                                            className="grayscale"
                                                        />
                                                        <AvatarFallback>
                                                            SC
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    {project.projectName}
                                                    <CheckIcon
                                                        className={cn(
                                                            "ml-auto h-4 w-4",
                                                            activeProject?.projectName ===
                                                                project.projectName
                                                                ? "opacity-100"
                                                                : "opacity-0"
                                                        )}
                                                    />
                                                </CommandItem>
                                            ))}
                                    </CommandGroup>
                                ))}
                        </CommandList>
                        {user && (
                            <>
                                <CommandSeparator />
                                <CommandList>
                                    <CommandGroup>
                                        <DialogTrigger asChild>
                                            <CommandItem
                                                onSelect={() => {
                                                    setOpen(false);
                                                    setShowNewProjectDialog(
                                                        true
                                                    );
                                                }}
                                            >
                                                <PlusCircledIcon className="mr-2 h-5 w-5" />
                                                Create Project
                                            </CommandItem>
                                        </DialogTrigger>
                                    </CommandGroup>
                                </CommandList>
                            </>
                        )}
                    </Command>
                </PopoverContent>
            </Popover>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Project</DialogTitle>
                    <DialogDescription>
                        Add a new project to manage your work.
                    </DialogDescription>
                </DialogHeader>
                <div>
                    <div className="space-y-4 py-2 pb-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Project name</Label>
                            <Input
                                id="name"
                                placeholder="Project Name"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type">Project type</Label>
                            <Select
                                value={projectType}
                                onValueChange={(value) =>
                                    setProjectType(
                                        value as "public" | "private"
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a project type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="public">
                                        <span className="font-medium">
                                            Public
                                        </span>{" "}
                                        -{" "}
                                        <span className="text-muted-foreground">
                                            Accessible to anyone
                                        </span>
                                    </SelectItem>
                                    {user && (
                                        <SelectItem value="private">
                                            <span className="font-medium">
                                                Private
                                            </span>{" "}
                                            -{" "}
                                            <span className="text-muted-foreground">
                                                Visible to your account
                                            </span>
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setShowNewProjectDialog(false)}
                    >
                        Cancel
                    </Button>
                    <Button type="button" onClick={handleCreateProject}>
                        Create
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
