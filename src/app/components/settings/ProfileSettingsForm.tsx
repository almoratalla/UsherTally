import { useActiveUser } from "@/app/hooks/useActiveUser";
import { FirestorePreferences, iActiveUser } from "@/app/lib/definitions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { auth } from "@/utils/firebase";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import React, { use } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

const profileFormSchema = z.object({
  username: z
    .string()
    .min(2, {
      message: "Username must be at least 2 characters.",
    })
    .max(20, {
      message: "Username must not be longer than 20 characters.",
    })
    .optional(),
  firstName: z
    .string()
    .min(2, {
      message: "First name must be at least 2 characters.",
    })
    .max(20, {
      message: "First name must not be longer than 20 characters.",
    })
    .optional(),
  lastName: z
    .string()
    .min(2, {
      message: "Username must be at least 2 characters.",
    })
    .max(20, {
      message: "Username must not be longer than 20 characters.",
    })
    .optional(),
  email: z.string().email().optional(),
  description: z.string().max(20).min(4),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

const ProfileSettingsForm = ({
  user,
}: {
  user?: Partial<iActiveUser> | null;
  preferences?: Partial<FirestorePreferences> | null;
}) => {
  const { updateSettings, updateSettingsPending } = useActiveUser();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    mode: "onChange",
  });
  const onSubmit = async (data: ProfileFormValues) => {
    const result = await updateSettings({
      uuid: user?.uuid ?? "",
      data: data satisfies Partial<iActiveUser>,
    });
    if (result.changed) {
      toast({
        title: "Success",
        description: "Your profile has been updated successfully.",
        variant: "success",
        duration: 1500,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
        duration: 1500,
      });
    }
  };
  return (
    <div className="py-4">
      <div>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">
          This is how others will see you on the site.
        </p>
      </div>
      <Separator className="my-4" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input
                    placeholder={user?.username || "Display Name"}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This is your public display name. It can be your real name or
                  a pseudonym. You can only change this once every 30 days.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder={
                      user?.firstName ?? user?.username?.split(" ")?.[0] ?? ""
                    }
                    {...field}
                  />
                </FormControl>
                <FormDescription>Your first name for display.</FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder={
                      user?.lastName ?? user?.username?.split(" ")?.[1] ?? ""
                    }
                    {...field}
                  />
                </FormControl>
                <FormDescription>Your last name for display.</FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder={user?.email || ""}
                    className="!opacity-90 cursor-not-allowed !text-black dark:!text-white"
                    disabled
                    {...field}
                    value={user?.email || ""}
                  />
                </FormControl>
                <FormDescription>
                  This account is connected to your email and cannot be changed.
                </FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={
                      user?.description ?? "Tell us a little bit about yourself"
                    }
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  You can <span>@mention</span> other users and organizations to
                  link to them.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-col gap-2 lg:flex-row justify-between">
            <Button type="submit" disabled={updateSettingsPending}>
              {updateSettingsPending ? "Updating..." : "Update Profile"}
            </Button>
            {updateSettingsPending && (
              <div className="text-center text-sm text-muted-foreground">
                Updating your profile...
              </div>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProfileSettingsForm;
