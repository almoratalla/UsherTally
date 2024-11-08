import useSectionStore from "@/app/stores/section-store";
import React from "react";

const SeatSelectionHeading = () => {
    const { selectedSection } = useSectionStore();
    return (
        <div className="w-full flex flex-col items-center border-b border-gray-200 p-4">
            <span className="text-lg font-semibold">
                {selectedSection?.name}
            </span>
        </div>
    );
};

export default SeatSelectionHeading;
