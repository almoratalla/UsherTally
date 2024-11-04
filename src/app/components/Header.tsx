"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ArrowLeftToLine, LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import UserProfile from "./UserProfileMenu";
import { auth } from "@/utils/firebase";
import { signOut } from "../hooks/useFirebaseAuth";
import ProjectSwitcher from "./project-switcher";

const HeaderNavOptions = [
    {
        id: "hero",
        title: "Home",
        href: "/#",
    },
    {
        id: "features",
        title: "Features",
        href: "/#features",
    },
    {
        id: "pricing",
        title: "Pricing",
        href: "/#pricing",
    },
    {
        id: "demo",
        title: "Demo",
        href: "/demo",
    },
    {
        id: "contact",
        title: "Contact",
        href: "/#contact",
    },
];

const HeaderNavUserOptions = [
    {
        id: "dashboard",
        title: "Dashboard",
        href: "/dashboard",
    },
    {
        id: "counters",
        title: "Counters",
        href: "/counters",
    },
    {
        id: "planner",
        title: "Planner",
        href: "/planner",
    },
];

export const Header = () => {
    const [activeSection, setActiveSection] = useState("");
    const [isMobile, setIsMobile] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [user] = useAuthState(auth);

    const observerRefs = useRef<IntersectionObserver[]>([]);
    const pathname = usePathname();

    const hideAuthButtons =
        pathname === "/login" || pathname === "/signup" || user;

    useEffect(() => {
        observerRefs.current = HeaderNavOptions.map((section) => {
            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        setActiveSection(section.id.toLowerCase());
                    }
                },
                { threshold: 0.5 }
            );

            const element = document.getElementById(section.id.toLowerCase());
            if (element) observer.observe(element);

            return observer;
        });

        return () => {
            observerRefs.current.forEach((observer) => observer.disconnect());
        };
    }, []);

    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkIsMobile();
        window.addEventListener("resize", checkIsMobile);

        return () => {
            window.removeEventListener("resize", checkIsMobile);
        };
    }, []);

    return (
        <header className="bg-white sticky top-0 w-full border-b px-4 sm:px-6 2xl:px-0 z-50">
            <div className="max-w-7xl mx-auto py-6 flex justify-between items-center">
                <div className="text-2xl font-bold text-gray-900 flex flex-row gap-8 items-center">
                    <Link href="/" className="cursor-pointer">
                        <h1 className="text-xl font-bold uppercase tracking-wider text-brand-primary">
                            Tallya
                        </h1>
                    </Link>

                    <div>
                        <ProjectSwitcher />
                    </div>
                </div>

                {!hideAuthButtons && (
                    <nav className="space-x-6 hidden md:block">
                        {HeaderNavOptions.map((option) => (
                            <Link
                                key={option.id}
                                href={`${option.href}`}
                                // className="text-gray-600 hover:text-gray-900 font-semibold"
                                className={cn(
                                    "text-sm transition-colors  font-semibold",
                                    activeSection === option.id.toLowerCase() ||
                                        pathname === option.href
                                        ? "text-brand-primary hover:text-blue-900"
                                        : "text-gray-600 hover:text-gray-900"
                                )}
                            >
                                {option.title}
                            </Link>
                        ))}
                    </nav>
                )}
                {user && (
                    <nav className="space-x-6 hidden md:block">
                        {HeaderNavUserOptions.map((option) => (
                            <Link
                                key={option.id}
                                href={`${option.href}`}
                                // className="text-gray-600 hover:text-gray-900 font-semibold"
                                className={cn(
                                    "text-sm transition-colors  font-semibold",
                                    pathname === option.href
                                        ? "text-brand-primary hover:text-blue-600"
                                        : "text-gray-600 hover:text-gray-900"
                                )}
                            >
                                {option.title}
                            </Link>
                        ))}
                    </nav>
                )}
                {isMobile && !hideAuthButtons ? (
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                className="px-0 text-base hover:bg-transparent focus:ring-0"
                            >
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent
                            side="right"
                            className="w-[300px] sm:w-[400px]"
                        >
                            <nav className="flex flex-col space-y-4">
                                {HeaderNavOptions.map((option) => (
                                    <Link
                                        key={option.id}
                                        href={`${option.href}`}
                                        // className="text-gray-600 hover:text-gray-900 font-semibold"
                                        className={cn(
                                            "text-sm transition-colors  font-semibold",
                                            activeSection ===
                                                option.id.toLowerCase()
                                                ? "text-brand-primary hover:text-blue-900"
                                                : "text-gray-600 hover:text-gray-900"
                                        )}
                                    >
                                        {option.title}
                                    </Link>
                                ))}
                            </nav>
                        </SheetContent>
                    </Sheet>
                ) : null}
                {!hideAuthButtons && (
                    <div className="hidden md:flex flex-row gap-2">
                        <Button variant="ghost" className="rounded-full">
                            <Link href="/login">Login</Link>
                        </Button>
                        <Button
                            variant="outline"
                            className="rounded-full bg-brand-primary hover:bg-black text-white hover:text-white"
                        >
                            <Link href="/signup">Sign Up</Link>
                        </Button>
                    </div>
                )}
                {hideAuthButtons && !user && (
                    <Button
                        variant="ghost"
                        className="rounded-full"
                        onClick={() => (window.location.pathname = "/")}
                    >
                        <ArrowLeftToLine />
                        <span>Return</span>
                    </Button>
                )}
                {hideAuthButtons && user && !isMobile && (
                    <UserProfile onLogout={signOut} />
                )}
                {isMobile && user && (
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                className="px-0 text-base hover:bg-transparent focus:ring-0"
                            >
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent
                            side="right"
                            className="w-[300px] sm:w-[400px]"
                        >
                            <nav className="flex flex-col space-y-4">
                                <Link
                                    href={"/profile"}
                                    className={cn(
                                        "text-sm transition-colors  font-semibold"
                                    )}
                                >
                                    {user?.displayName ||
                                        user?.email ||
                                        "Profile"}
                                </Link>
                                {HeaderNavUserOptions.map((option) => (
                                    <Link
                                        key={option.id}
                                        href={`${option.href}`}
                                        // className="text-gray-600 hover:text-gray-900 font-semibold"
                                        className={cn(
                                            "text-sm transition-colors  font-semibold",
                                            activeSection ===
                                                option.id.toLowerCase()
                                                ? "text-brand-primary hover:text-blue-900"
                                                : "text-gray-600 hover:text-gray-900"
                                        )}
                                    >
                                        {option.title}
                                    </Link>
                                ))}
                                <Button
                                    onClick={signOut}
                                    className="flex flex-row justify-center w-full"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </Button>
                            </nav>
                        </SheetContent>
                    </Sheet>
                )}
            </div>
        </header>
    );
};

export default Header;
