import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import React from "react";
import useSectionStore from "../../stores/section-store";
import { Edit, Eye } from "lucide-react";

const SeatSelectorSwitch = () => {
  const { isSelectionMode, setIsSelectionMode } = useSectionStore();
  return (
    <div className="flex items-center space-x-2 w-[200px] justify-between">
      <Label htmlFor="edit-mode">
        {isSelectionMode ? (
          <span className="flex items-center">
            <Edit className="w-4 h-4 mr-1" /> Selection Mode
          </span>
        ) : (
          <span className="flex items-center">
            <Eye className="w-4 h-4 mr-1" /> View Mode
          </span>
        )}
      </Label>
      <Switch
        id="edit-mode"
        checked={isSelectionMode}
        onCheckedChange={setIsSelectionMode}
      />
    </div>
  );
};

export default SeatSelectorSwitch;
