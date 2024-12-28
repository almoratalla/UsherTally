"use client";

import React, { useState } from "react";
import { Save, Trash2, UserPlus, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Role = "Admin" | "Moderator" | "Member";
type Permission = "None" | "Viewer" | "Editor";

interface Feature {
    id: string;
    name: string;
}

interface UserFeaturePermission {
    featureId: string;
    permission: Permission;
}

interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    featurePermissions: UserFeaturePermission[];
}

interface ProjectSettingsProps {
    projectName: string;
    initialUsers?: User[];
    features: Feature[];
}

interface AddUserFormData {
    name: string;
    email: string;
    role: Role;
}
const projects = [
    { id: "this", name: "This project" },
    { id: "all", name: "All projects" },
];

const ProjectSettings = ({
    projectName,
    initialUsers = [],
    features,
}: ProjectSettingsProps) => {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
    const [expandedUsers, setExpandedUsers] = useState<string[]>([]);
    const [tempPermissions, setTempPermissions] = useState<
        Record<string, UserFeaturePermission[]>
    >({});
    const [isRoleChangeDialogOpen, setIsRoleChangeDialogOpen] = useState(false);
    const [userToChangeRole, setUserToChangeRole] = useState<{
        id: string;
        newRole: Role;
    } | null>(null);
    const [currentProjectId, setCurrentProjectId] = useState("this");
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<AddUserFormData>();

    const addUser = (data: AddUserFormData) => {
        const newUser: User = {
            id: Date.now().toString(),
            name: data.name,
            email: data.email,
            role: data.role,
            featurePermissions: features.map((feature) => ({
                featureId: feature.id,
                permission: "None",
            })),
        };
        setUsers([...users, newUser]);
        setIsAddUserDialogOpen(false);
        reset();
        toast({
            title: "User added",
            description: `${data.name} has been added to the project.`,
        });
    };

    const removeUser = (id: string) => {
        const updatedUsers = users.filter((user) => user.id !== id);
        setUsers(updatedUsers);
        setExpandedUsers(expandedUsers.filter((userId) => userId !== id));
        toast({
            title: "User removed",
            description: "The user has been removed from the project.",
        });
    };

    const updateUserRole = (id: string, newRole: Role) => {
        setUserToChangeRole({ id, newRole });
        setIsRoleChangeDialogOpen(true);
    };

    const confirmRoleChange = () => {
        if (userToChangeRole) {
            const updatedUsers = users.map((user) =>
                user.id === userToChangeRole.id
                    ? { ...user, role: userToChangeRole.newRole }
                    : user
            );
            setUsers(updatedUsers);
            setIsRoleChangeDialogOpen(false);
            setUserToChangeRole(null);
            toast({
                title: "Role updated",
                description: `User role has been updated to ${userToChangeRole.newRole}.`,
            });
        }
    };

    const updateTempPermission = (
        userId: string,
        featureId: string,
        permission: Permission
    ) => {
        setTempPermissions((prev) => ({
            ...prev,
            [userId]: (prev[userId] || []).map((fp) =>
                fp.featureId === featureId ? { ...fp, permission } : fp
            ),
        }));
    };

    const submitPermissionChanges = (userId: string) => {
        const updatedUsers = users.map((user) => {
            if (user.id === userId && tempPermissions[userId]) {
                return { ...user, featurePermissions: tempPermissions[userId] };
            }
            return user;
        });
        setUsers(updatedUsers);
        setTempPermissions((prev) => ({ ...prev, [userId]: [] }));
        toast({
            title: "Permissions updated",
            description: "User's feature permissions have been updated.",
        });
    };

    const toggleUserExpansion = (userId: string) => {
        setExpandedUsers((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
        if (!tempPermissions[userId]) {
            setTempPermissions((prev) => ({
                ...prev,
                [userId]:
                    users.find((u) => u.id === userId)?.featurePermissions ||
                    [],
            }));
        }
    };

    const handleProjectChange = (projectId: string) => {
        setCurrentProjectId(projectId);
        const newProject = projects.find((p) => p.id === projectId)!;
        setUsers(initialUsers);
        setExpandedUsers([]);
        setTempPermissions({});
    };

    return (
        <div className="container mx-auto p-4 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Project Settings - {projectName}</CardTitle>
                    <CardDescription>
                        Manage users and their permissions for this project.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Project Users</h2>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-[200px] justify-between"
                                >
                                    {"aaa"}
                                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="w-[200px]"
                            >
                                {projects.map((project) => (
                                    <DropdownMenuItem
                                        key={project.id}
                                        onSelect={() =>
                                            handleProjectChange(project.id)
                                        }
                                    >
                                        {project.name}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Dialog
                            open={isAddUserDialogOpen}
                            onOpenChange={setIsAddUserDialogOpen}
                        >
                            <DialogTrigger asChild>
                                <Button>
                                    <UserPlus className="mr-2 h-4 w-4" /> Add
                                    User
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add New User</DialogTitle>
                                </DialogHeader>
                                <form
                                    onSubmit={handleSubmit(addUser)}
                                    className="space-y-4"
                                >
                                    <div>
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            {...register("name", {
                                                required: "Name is required",
                                            })}
                                            placeholder="Enter user's name"
                                        />
                                        {errors.name && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {errors.name.message}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            {...register("email", {
                                                required: "Email is required",
                                                pattern: {
                                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                    message:
                                                        "Invalid email address",
                                                },
                                            })}
                                            placeholder="Enter user's email"
                                        />
                                        {errors.email && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {errors.email.message}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="role">Role</Label>
                                        <Select
                                            onValueChange={(value: Role) =>
                                                register("role").onChange({
                                                    target: { value },
                                                })
                                            }
                                        >
                                            <SelectTrigger id="role">
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Member">
                                                    Member
                                                </SelectItem>
                                                <SelectItem value="Moderator">
                                                    Moderator
                                                </SelectItem>
                                                <SelectItem value="Admin">
                                                    Admin
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.role && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {errors.role.message}
                                            </p>
                                        )}
                                    </div>
                                    <Button type="submit">Add User</Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]"></TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.length > 0 ? (
                                users.map((user) => (
                                    <React.Fragment key={user.id}>
                                        <TableRow>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        toggleUserExpansion(
                                                            user.id
                                                        )
                                                    }
                                                >
                                                    {expandedUsers.includes(
                                                        user.id
                                                    ) ? (
                                                        <ChevronUp className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </TableCell>
                                            <TableCell>{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Select
                                                    value={user.role}
                                                    onValueChange={(
                                                        value: Role
                                                    ) =>
                                                        updateUserRole(
                                                            user.id,
                                                            value
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="w-[130px]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Member">
                                                            Member
                                                        </SelectItem>
                                                        <SelectItem value="Moderator">
                                                            Moderator
                                                        </SelectItem>
                                                        <SelectItem value="Admin">
                                                            Admin
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        removeUser(user.id)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                        {expandedUsers.includes(user.id) && (
                                            <TableRow>
                                                <TableCell colSpan={5}>
                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle>
                                                                Feature
                                                                Permissions for{" "}
                                                                {user.name}
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <ScrollArea className="h-[300px] w-full">
                                                                <div className="space-y-4">
                                                                    {features.map(
                                                                        (
                                                                            feature
                                                                        ) => {
                                                                            const userPermission =
                                                                                (
                                                                                    tempPermissions[
                                                                                        user
                                                                                            .id
                                                                                    ] ||
                                                                                    user.featurePermissions
                                                                                ).find(
                                                                                    (
                                                                                        fp
                                                                                    ) =>
                                                                                        fp.featureId ===
                                                                                        feature.id
                                                                                )
                                                                                    ?.permission ||
                                                                                "None";
                                                                            return (
                                                                                <div
                                                                                    key={
                                                                                        feature.id
                                                                                    }
                                                                                    className="flex items-center justify-between"
                                                                                >
                                                                                    <span className="font-medium">
                                                                                        {
                                                                                            feature.name
                                                                                        }
                                                                                    </span>
                                                                                    <Select
                                                                                        value={
                                                                                            userPermission
                                                                                        }
                                                                                        onValueChange={(
                                                                                            value: Permission
                                                                                        ) =>
                                                                                            updateTempPermission(
                                                                                                user.id,
                                                                                                feature.id,
                                                                                                value
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        <SelectTrigger className="w-[100px]">
                                                                                            <SelectValue />
                                                                                        </SelectTrigger>
                                                                                        <SelectContent>
                                                                                            <SelectItem value="None">
                                                                                                None
                                                                                            </SelectItem>
                                                                                            <SelectItem value="Viewer">
                                                                                                Viewer
                                                                                            </SelectItem>
                                                                                            <SelectItem value="Editor">
                                                                                                Editor
                                                                                            </SelectItem>
                                                                                        </SelectContent>
                                                                                    </Select>
                                                                                </div>
                                                                            );
                                                                        }
                                                                    )}
                                                                </div>
                                                            </ScrollArea>
                                                            <div className="mt-4 flex justify-end">
                                                                <Button
                                                                    onClick={() =>
                                                                        submitPermissionChanges(
                                                                            user.id
                                                                        )
                                                                    }
                                                                >
                                                                    <Save className="mr-2 h-4 w-4" />
                                                                    Save Changes
                                                                </Button>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </React.Fragment>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="text-center"
                                    >
                                        No users found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <AlertDialog
                open={isRoleChangeDialogOpen}
                onOpenChange={setIsRoleChangeDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Role Change</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to change this user's role to{" "}
                            {userToChangeRole?.newRole}? This action may affect
                            their permissions and access to certain features.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => setUserToChangeRole(null)}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={confirmRoleChange}>
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default ProjectSettings;
