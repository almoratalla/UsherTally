import React from "react";
import SectionSwitcher from "./section-switcher";
import SeatSelectorSwitch from "./seat-selector-switch";
import SeatSelectionActions from "./seat-selection-actions";

const PlannerFilters = () => {
  return (
    <section className="flex flex-col md:flex-row gap-4 justify-between">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold">Active section:</span>
          <SectionSwitcher />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold">Selection actions:</span>
          <SeatSelectionActions />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold">Toggle mode:</span>
        <SeatSelectorSwitch />
      </div>
    </section>
  );
};

export default PlannerFilters;
