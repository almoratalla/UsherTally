import { create } from "zustand";
import { Section } from "../lib/definitions"; // Ensure this is correctly imported based on your project structure

export type SelectionAction =
  | "select-all-in-all-sections"
  | "deselect-all-in-all-sections"
  | "select-all-in-section"
  | "deselect-all-in-section";

export const SelectionActionsGrouping: {
  type: "Individual Sections" | "All Sections";
  actionName: SelectionAction;
}[] = [
  { type: "Individual Sections", actionName: "select-all-in-section" },
  { type: "All Sections", actionName: "select-all-in-all-sections" },
  { type: "Individual Sections", actionName: "deselect-all-in-section" },
  { type: "All Sections", actionName: "deselect-all-in-all-sections" },
];
// Define the shape of the Zustand store state
interface SectionStore {
  selectedSection: Section | null;
  setSelectedSection: (section: Section | null) => void;
  isSelectionMode: boolean; // New property for editing mode
  setIsSelectionMode: (isSelectionMode: boolean) => void; // Function to update editing mode
  selectionAction: SelectionAction; // Function to update editing mode
  setSelectionAction: (action: SelectionAction) => void;
}

// Create the store using Zustand
const useSectionStore = create<SectionStore>((set) => ({
  selectedSection: null, // Initial state is null
  setSelectedSection: (section) => set({ selectedSection: section }), // Function to update the state
  isSelectionMode: false, // Initial state is not editing (view mode)
  setIsSelectionMode: (isSelectionMode) => set({ isSelectionMode }), // Update the editing state
  selectionAction: "deselect-all-in-section",
  setSelectionAction: (action) => set({ selectionAction: action }),
}));

export default useSectionStore;
