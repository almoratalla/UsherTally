import { FirestorePreferences, iActiveUser } from "@/app/lib/definitions";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";

const reportSettingsSchema = z.object({
    area: z.enum(
        ["dashboard", "counters", "planner", "billing", "account", "support"],
        {
            required_error: "You need to select an area for report.",
        }
    ),
    level: z.enum(["1", "2", "3", "4"], {
        required_error: "You need to select a security level.",
    }),
    subject: z
        .string({
            required_error: "Subject is required.",
        })
        .min(2, { message: "Subject must be at least 2 characters long" })
        .max(30, {
            message: "Subject must not be longer than 30 characters.",
        }),
    description: z
        .string({
            required_error: "Message is required.",
        })
        .min(7, { message: "Message must be at least 7 characters long" })
        .max(50, {
            message: "Subject must not be longer than 50 characters.",
        }),
});

type ReportSettingsSchema = z.infer<typeof reportSettingsSchema>;

const ReportSettings = ({
    user,
    preferences: preferencesProp,
}: {
    user?: Partial<iActiveUser> | null;
    preferences?: Partial<FirestorePreferences> | null;
}) => {
    const form = useForm<ReportSettingsSchema>({
        resolver: zodResolver(reportSettingsSchema),
        defaultValues: {
            area: "support",
            level: "2",
        },
    });
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const onSubmit = async (data: ReportSettingsSchema) => {
        try {
            if (!user) throw new Error("User not found");
            setIsSubmitting(true);
            await fetch("/api/report-issue", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...data,
                    uuid: user?.uuid,
                    reportedDate: new Date(),
                    status: "unresolved",
                }),
            });
            form.reset({
                description: "",
                subject: "",
            });
            toast({
                title: "Report sent.",
                description: "Your report has been sent successfully.",
                variant: "success",
                duration: 5000,
            });
            setIsSubmitting(false);
        } catch (error) {
            console.log(error);
            toast({
                title: "Something went wrong.",
                description: "Your report could not be sent. Please try again.",
                variant: "destructive",
                duration: 5000,
            });
            setIsSubmitting(false);
        }
    };
    return (
        <div className="py-4">
            <div>
                <h3 className="text-lg font-medium">Report a problem</h3>
                <p className="text-sm text-muted-foreground">
                    If you encounter any issues or have suggestions for
                    improvements, please let us know.
                </p>
            </div>
            <Separator className="my-4" />
            <Card>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8"
                    >
                        <CardHeader>
                            <CardTitle>Report an issue</CardTitle>
                            <CardDescription>
                                What area are you having problems with?
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <FormField
                                        control={form.control}
                                        name="area"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Area</FormLabel>
                                                <FormControl>
                                                    <Select
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                        defaultValue="support"
                                                        // {...field}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="dashboard">
                                                                Dashboard
                                                            </SelectItem>
                                                            <SelectItem value="counters">
                                                                Counters
                                                            </SelectItem>
                                                            <SelectItem value="planner">
                                                                Planner
                                                            </SelectItem>
                                                            <SelectItem value="billing">
                                                                Billing
                                                            </SelectItem>
                                                            <SelectItem value="account">
                                                                Account
                                                            </SelectItem>
                                                            <SelectItem value="support">
                                                                Support
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <FormField
                                        control={form.control}
                                        name="level"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Security Level
                                                </FormLabel>
                                                <FormControl>
                                                    <Select
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                        defaultValue="2"
                                                        // {...field}
                                                    >
                                                        <SelectTrigger aria-label="Security Level">
                                                            <SelectValue placeholder="Select level" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="1">
                                                                Severity 1
                                                                (Highest -
                                                                Breaking
                                                                changes)
                                                            </SelectItem>
                                                            <SelectItem value="2">
                                                                Severity 2
                                                                (High)
                                                            </SelectItem>
                                                            <SelectItem value="3">
                                                                Severity 3
                                                                (Medium)
                                                            </SelectItem>
                                                            <SelectItem value="4">
                                                                Severity 4
                                                                (Lowest)
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <FormField
                                    control={form.control}
                                    name="subject"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Subject</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="I need help with..."
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid gap-2">
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Please include all information relevant to your issue."
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="justify-between space-x-2">
                            {/* <Button variant="ghost" size="sm">
                                Cancel
                            </Button> */}
                            <Button size="sm" disabled={isSubmitting}>
                                Submit
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </div>
    );
};

export default ReportSettings;
