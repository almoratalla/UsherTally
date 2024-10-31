"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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
    href: "/counters",
  },
  {
    id: "contact",
    title: "Contact",
    href: "/#contact",
  },
];

export const Header = () => {
  const [activeSection, setActiveSection] = useState("");
  const observerRefs = useRef<IntersectionObserver[]>([]);
  console.log(activeSection);

  useEffect(() => {
    observerRefs.current = HeaderNavOptions.map((section) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(section.id.toLowerCase());
          }
        },
        { threshold: 0.5 },
      );
      console.log(section);

      const element = document.getElementById(section.id.toLowerCase());
      if (element) observer.observe(element);

      return observer;
    });

    return () => {
      observerRefs.current.forEach((observer) => observer.disconnect());
    };
  }, []);
  return (
    <header className="bg-white sticky top-0 w-full border-b px-4 sm:px-6 2xl:px-0 z-50">
      <div className="max-w-7xl mx-auto py-6 flex justify-between items-center">
        <div className="text-2xl font-bold text-gray-900">
          <h1 className="text-xl font-bold uppercase tracking-wider">Tallya</h1>
        </div>
        <nav className="space-x-6">
          {HeaderNavOptions.map((option) => (
            <a
              key={option.id}
              href={`${option.href}`}
              // className="text-gray-600 hover:text-gray-900 font-semibold"
              className={cn(
                "text-sm transition-colors  font-semibold",
                activeSection === option.id.toLowerCase()
                  ? "text-brand-primary hover:text-blue-900"
                  : "text-gray-600 hover:text-gray-900",
              )}
            >
              {option.title}
            </a>
          ))}
        </nav>
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
      </div>
    </header>
  );
};

export default Header;
