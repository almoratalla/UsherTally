import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

/**
 * The hero section of the homepage, which contains the main
 * introduction to the application and a call to action to get
 * started.
 *
 * @returns The hero section of the homepage.
 */
const HeroSection = () => {
  return (
    <section
      className="relative bg-white text-black py-32 h-[100vh] hero-section"
      id="hero"
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-70 z-0 pointer-events-none"
        style={{ backgroundImage: 'url("/bg.svg")' }}
        aria-hidden="true"
      ></div>

      <div className="flex flex-col items-center z-10">
        <div
          className="relative w-fit mx-auto px-4 sm:px-6 lg:px-8 lg:py-16 text-center flex flex-col items-center
                bg-[url('/hero-bg.svg')] bg-no-repeat bg-center bg-cover"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-center">
            Real-time People
            <br className="sm:inline-block my-4" />
            <span className="lg:mt-4 inline-block">Counting Made Easy</span>
          </h1>
          <p className="mt-5 text-lg leading-tight">
            Monitor and manage your event&apos;s
            <br className="sm:inline-block my-4" />
            <span className="lg:mt-3 inline-block">
              attendance effortlessly with Tally.
            </span>
          </p>
        </div>
        <div className="mt-6 flex flex-col lg:flex-row gap-4 z-10">
          <Button className="bg-brand-primary text-white text-base cursor-pointer hover:black min-w-[200px] w-full">
            <Link href="/counters">Get Started for Free</Link>
          </Button>
          <Button className="min-w-[200px] w-full" variant={"outline"}>
            <Link href="/#features">Learn More</Link>
          </Button>
        </div>
        <a
          href="#features"
          className={"text-brand-primary md:self-center self-center cta-scroll"}
        >
          Scroll for more..
        </a>
      </div>
    </section>
  );
};

export default HeroSection;
