import { useActiveUser } from "@/app/hooks/useActiveUser";
import { FirestorePreferences, iActiveUser } from "@/app/lib/definitions";
import { Separator } from "@/components/ui/separator";
import React from "react";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";

const notificationsFormSchema = z.object({
    type: z.enum(["all", "mentions", "none"], {
        required_error: "You need to select a notification type.",
    }),
});

type NotificationsFormValues = z.infer<typeof notificationsFormSchema>;

const NotificationSettingsForm = ({
    user,
    preferences: preferencesProp,
}: {
    user?: Partial<iActiveUser> | null;
    preferences?: Partial<FirestorePreferences> | null;
}) => {
    const { updateSettingsPending } = useActiveUser();
    const form = useForm<NotificationsFormValues>({
        resolver: zodResolver(notificationsFormSchema),
        defaultValues: {
            type: "none",
        },
    });

    const onSubmit = async (data: NotificationsFormValues) => {
        toast({
            title: "Error",
            description: "Failed to update profile. This is not available yet",
            variant: "destructive",
            duration: 1500,
        });
    };

    return (
        <div className="py-4">
            <div>
                <h3 className="text-lg font-medium">Notifications</h3>
                <p className="text-sm text-muted-foreground">
                    Configure how you receive notifications.
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
                        name="type"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel>Notify me about...</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex flex-col space-y-1"
                                        disabled
                                    >
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="all" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                All new messages
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="mentions" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                Direct messages and mentions
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="none" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                Nothing
                                            </FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex flex-col gap-2 lg:flex-row justify-between cursor-not-allowed">
                        <Button
                            type="submit"
                            disabled={true}
                            className="cursor-not-allowed"
                        >
                            {updateSettingsPending
                                ? "Updating..."
                                : "Update Profile"}
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

export default NotificationSettingsForm;
