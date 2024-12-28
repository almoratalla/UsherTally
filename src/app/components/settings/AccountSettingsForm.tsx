import { useActiveUser } from "@/app/hooks/useActiveUser";
import { FirestorePreferences, iActiveUser } from "@/app/lib/definitions";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { differenceInYears, format } from "date-fns";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const languages = [
  { label: "English", value: "en" },
  { label: "Korean", value: "ko" },
] as const;

const accountFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .max(30, {
      message: "Name must not be longer than 30 characters.",
    })
    .optional(),
  birthdate: z
    .date({
      required_error: "A date of birth is required.",
    })
    .refine((date) => differenceInYears(new Date(), date) >= 18, {
      message: "You must be at least 18 years old.",
    })
    .optional(),
  language: z
    .string({
      required_error: "Please select a language.",
    })
    .optional(),
});

export type AccountFormValues = z.infer<typeof accountFormSchema>;

const calculateAge = (birthdate: Date) =>
  differenceInYears(new Date(), birthdate);

const AccountSettingsForm = ({
  user,
  preferences: preferencesProp,
}: {
  user?: Partial<iActiveUser> | null;
  preferences?: Partial<FirestorePreferences> | null;
}) => {
  const { updateSettings, updateSettingsPending } = useActiveUser();
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
  });

  const onSubmit = async (data: AccountFormValues) => {
    const result = await updateSettings({
      uuid: user?.uuid ?? "",
      data: { birthdate: data.birthdate } satisfies Partial<iActiveUser>,
      preferences: {
        language: data.language,
      } satisfies Partial<FirestorePreferences>,
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
        <h3 className="text-lg font-medium">Account</h3>
        <p className="text-sm text-muted-foreground">
          Update your account settings. Set your preferred language and
          timezone.
        </p>
      </div>
      <Separator className="my-4" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder={
                      `${user?.firstName ?? ""} ${user?.lastName ?? ""}` || ""
                    }
                    className="!opacity-90 cursor-not-allowed !text-black dark:!text-white"
                    disabled
                    {...field}
                    value={
                      `${user?.firstName ?? ""} ${user?.lastName ?? ""}` || ""
                    }
                  />
                </FormControl>
                <FormDescription>
                  This is the name that will be displayed on your profile and in
                  emails.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="birthdate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date of birth</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          (!field.value ||
                            (user?.birthdate &&
                              calculateAge(user.birthdate) < 18)) &&
                            "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          // If field.value is selected, display it, prioritizing the selected date
                          calculateAge(field.value) >= 18 ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )
                        ) : user?.birthdate &&
                          calculateAge(user.birthdate) >= 18 ? (
                          // If no field.value, fall back to user.birthdate if they are 18 or older
                          format(user.birthdate, "PPP")
                        ) : (
                          // If neither is selected or valid, show "Pick a date"
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => {
                        const today = new Date();
                        const maxDate = new Date(
                          today.getFullYear() - 18,
                          today.getMonth(),
                          today.getDate(),
                        );
                        return date > maxDate || date < new Date("1900-01-01");
                      }}
                      defaultMonth={
                        new Date(
                          new Date().getFullYear() - 18,
                          new Date().getMonth(),
                          new Date().getDate(),
                        )
                      }
                      captionLayout="dropdown-buttons"
                      fromYear={1900} // Minimum year allowed
                      toYear={new Date().getFullYear() - 18}
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Your date of birth is used to calculate your age. You must be
                  at least 18 years old.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Language</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-[200px] justify-between",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value
                          ? languages.find(
                              (language) => language.value === field.value,
                            )?.label
                          : (languages.find(
                              (language) =>
                                language.value === preferencesProp?.language,
                            )?.label ?? "Select language")}
                        <ChevronsUpDown className="opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Search language..." />
                      <CommandList>
                        <CommandEmpty>No language found.</CommandEmpty>
                        <CommandGroup>
                          {languages.map((language) => (
                            <CommandItem
                              value={language.label}
                              key={language.value}
                              onSelect={() => {
                                form.setValue("language", language.value);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2",
                                  language.value === field.value
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {language.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  This is the language that will be used in the dashboard.
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

export default AccountSettingsForm;
