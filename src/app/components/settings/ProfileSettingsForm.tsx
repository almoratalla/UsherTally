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
import { cn } from "@/lib/utils";
import { auth } from "@/utils/firebase";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import React from "react";
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
        }),
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
    bio: z.string().max(20).min(4),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const ProfileSettingsForm = () => {
    const [user] = useAuthState(auth);
    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        mode: "onChange",
    });
    const onSubmit = async (data: ProfileFormValues) => {
        await fetch("/api/update-settings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: user?.uid, payload: data }),
        });
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
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8"
                >
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder={
                                            user?.displayName || "Display Name"
                                        }
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    This is your public display name. It can be
                                    your real name or a pseudonym. You can only
                                    change this once every 30 days.
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
                                            user?.displayName?.split(
                                                " "
                                            )?.[0] || ""
                                        }
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Your first name for display.
                                </FormDescription>
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
                                            user?.displayName?.split(
                                                " "
                                            )?.[1] || ""
                                        }
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Your last name for display.
                                </FormDescription>
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
                                        className="!opacity-90 cursor-not-allowed !text-black"
                                        disabled
                                        {...field}
                                        value={user?.email || ""}
                                    />
                                </FormControl>
                                <FormDescription>
                                    This account is connected to your email and
                                    cannot be changed.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Bio</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Tell us a little bit about yourself"
                                        className="resize-none"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    You can <span>@mention</span> other users
                                    and organizations to link to them.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit">Update profile</Button>
                </form>
            </Form>
        </div>
    );
};

export default ProfileSettingsForm;
