import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";
import SeatSection from "../planner/seat-section";
import SectionSwitcher from "../planner/section-switcher";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Edit, Eye } from "lucide-react";
import SeatSelectorSwitch from "../planner/seat-selector-switch";
import PlannerFilters from "../planner/planner-filters";
import SeatSelectionHeading from "../planner/seat-selection-heading";

const PlannerPanel = () => {
  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 2xl:px-0">
      <main className="flex flex-col py-12 min-h-screen bg-gray-100 gap-8">
        <section className="flex flex-col items-start gap-2">
          <div className="flex justify-between items-center w-full">
            <h1 className="text-4xl font-bold ">Planner Dashboard</h1>
          </div>
        </section>

        <section>
          <Tabs defaultValue="dashboard" className="space-y-4">
            <TabsList>
              <TabsTrigger value="plan-creator">Seat Plan Creator</TabsTrigger>
              <TabsTrigger value="seat-selections">Seat Selectors</TabsTrigger>
            </TabsList>
            <TabsContent
              value="plan-creator"
              className="space-y-4"
            ></TabsContent>
            <TabsContent value="seat-selections" className="space-y-4">
              <PlannerFilters />
              <SeatSelectionHeading />
              <SeatSection />
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </div>
  );
};

export default PlannerPanel;
