"use client";
import Header from "@/app/components/Header";
import PlannerPanel from "@/app/components/panels/planner-panel";
import SeatSection from "@/app/components/planner/seat-section";

// Seat Component

const Planner = () => {
    return (
        <div className="min-h-screen bg-gray-100">
            <Header />
            <PlannerPanel />
            <div className=" max-w-7xl mx-auto px-4 sm:px-6 2xl:px-0 py-12"></div>
        </div>
    );
};

export default Planner;
