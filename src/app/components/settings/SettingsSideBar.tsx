"use client";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import React from "react";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
    items: {
        href: string;
        title: string;
    }[];
}

const SettingsSideBar = ({ className, items, ...props }: SidebarNavProps) => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const tab = searchParams.get("tab") ?? "account";
    return (
        <nav
            className={cn(
                "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 flex-wrap gap-2 lg:gap-0  py-4 xl:bg-white xl:dark:bg-black xl:rounded-md",
                className
            )}
            {...props}
        >
            {items.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        buttonVariants({ variant: "ghost" }),
                        "underline-offset-8 lg:px-7 px-2 border lg:border-0 !ml-0",
                        pathname + `?tab=${tab}` === item.href
                            ? "bg-white hover:bg-white dark:text-slate-900 dark:hover:text-slate-900 2xl:bg-transparent dark:2xl:bg-white 2xl:hover:bg-transparent dark:2xl:hover:bg-white 2xl:underline"
                            : "hover:bg-transparent hover:underline",
                        "justify-start"
                    )}
                >
                    {item.title}
                </Link>
            ))}
        </nav>
    );
};

export default SettingsSideBar;
