"use client";
import Header from "@/app/components/Header";
import Seat from "@/app/components/seat";
import SeatSection from "@/app/components/seat-section";
import { cn } from "@/lib/utils";
import { PropsWithChildren, useEffect, useState } from "react";

// Seat Component

export const Planner: React.FC<PropsWithChildren> = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className=" max-w-7xl mx-auto px-4 sm:px-6 2xl:px-0 py-12">
        <SeatSection totalSeats={123} />
      </div>
    </div>
  );
};

export default Planner;
