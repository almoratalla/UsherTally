import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { register } from "module";
import React, { useMemo } from "react";
import ProjectSettingsUserSelect from "../ProjectSettingsUserSelect";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import { useActiveUser } from "@/app/hooks/useActiveUser";
import { Project, useProjects } from "@/app/hooks/useProjects";
import { FirestoreUser } from "@/app/lib/definitions";

const addNewProjectUserSchema = z.object({
  uid: z.string({ required_error: "You need to select a user." }),
  role: z.enum(["Admin", "Moderator", "Member"], {
    required_error: "You need to select a role.",
  }),
});

type iAddNewProjectUserSchema = z.infer<typeof addNewProjectUserSchema>;

export const getProjectMembersAndAvailableUsers = (
  users: FirestoreUser[],
  projects: {
    type: "public" | "private";
    projects: Project[];
  }[],
  currentProjectName: string,
) => {
  // Find the current project
  const currentProject = projects
    .flatMap((group) => group.projects)
    .find((project) => project.projectName === currentProjectName);

  if (!currentProject) {
    console.error("Project not found");
    return { members: [], availableMembers: [] };
  }

  // Extract members and owner
  const projectMembers = currentProject.members; // Members can contain objects with role or just emails
  const projectOwner = currentProject.owner;

  // Map members with their roles
  const members = users
    .filter((user) => {
      return (
        projectMembers.some(
          (member) =>
            (typeof member === "string" && member === user.email) ||
            member.email === user.email,
        ) || user.email === projectOwner
      );
    })
    .map((user) => {
      // Add role to the user object
      const memberInfo: {
        uid: string;
        name: string;
        email: string;
        role: string;
      } =
        projectMembers.find(
          (member) =>
            (typeof member === "string" && member === user.email) ||
            (typeof member === "object" && member.email === user.email),
        ) || Object.create(null); // Fallback to empty object for owner

      return {
        ...user,
        role:
          user.email === projectOwner ? "Owner" : memberInfo.role || "Member",
      };
    });

  // Filter available members
  const availableMembers = users.filter(
    (user) =>
      !projectMembers.some(
        (member) =>
          (typeof member === "string" && member === user.email) ||
          (typeof member === "object" && member.email === user.email),
      ) && user.email !== projectOwner,
  );

  return {
    members, // Users already in the project with roles
    availableMembers, // Users not yet in the project
  };
};

const AddNewProjectUserForm = ({
  currentProject,
  addUserInForm,
}: {
  currentProject: Project | null;
  addUserInForm: (user: FirestoreUser, role: string) => void;
}) => {
  const form = useForm<iAddNewProjectUserSchema>({
    resolver: zodResolver(addNewProjectUserSchema),
    defaultValues: {
      role: "Member",
    },
  });
  const { getAllUsers } = useActiveUser();
  const { projectsByType } = useProjects();

  const users = useMemo(
    () =>
      getAllUsers
        ? getProjectMembersAndAvailableUsers(
            getAllUsers,
            projectsByType,
            currentProject?.projectName ?? "",
          ).availableMembers
        : [],
    [currentProject?.projectName, getAllUsers, projectsByType],
  );

  const addUser = async (data: iAddNewProjectUserSchema) => {
    const user = users?.find((user) => user?.uuid === data.uid);
    if (user) {
      addUserInForm(user, data.role);
      await fetch("/api/add-project-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: currentProject?.projectId,
          uid: user.uuid,
          name: user.username,
          role: data.role,
          email: user.email,
        }),
      });
      toast({
        title: "User added",
        description: `${user?.username} has been added to the project.`,
      });
    }
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(addUser)} className="space-y-4">
        <FormField
          control={form.control}
          name="uid"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <ProjectSettingsUserSelect
                  users={users ?? []}
                  fieldOnChange={field.onChange}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <FormControl>
                <Select onValueChange={(value) => field.onChange(value)}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Member">Member</SelectItem>
                    <SelectItem value="Moderator">Moderator</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit">Add User</Button>
      </form>
    </Form>
  );
};

export default AddNewProjectUserForm;
