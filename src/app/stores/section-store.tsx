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

export interface SelectedSeats {
  id: string;
  seats: number[];
}
// Define the shape of the Zustand store state
interface SectionStore {
  selectedSection: Section | null;
  setSelectedSection: (section: Section | null) => void;
  isSelectionMode: boolean; // New property for editing mode
  setIsSelectionMode: (isSelectionMode: boolean) => void; // Function to update editing mode
  selectionAction: SelectionAction | null; // Function to update editing mode
  setSelectionAction: (action: SelectionAction) => void;
  selectedSeats: SelectedSeats[];
  setSelectedSeats: (selectedSeats: SelectedSeats[]) => void;
  // updateSelectedSeats: (sectionId: string, updatedSeats: number[]) => void;
  updateSelectedSeats: (
    sectionId: string,
    updateFn: (prevSeats: number[]) => number[],
  ) => void;
}

// Create the store using Zustand
const useSectionStore = create<SectionStore>((set, get) => ({
  selectedSection: null, // Initial state is null
  setSelectedSection: (section) => set({ selectedSection: section }), // Function to update the state
  isSelectionMode: false, // Initial state is not editing (view mode)
  setIsSelectionMode: (isSelectionMode) => set({ isSelectionMode }), // Update the editing state
  selectionAction: "deselect-all-in-section",
  setSelectionAction: (action) => set({ selectionAction: action }),
  selectedSeats: [],
  setSelectedSeats: (selectedSeats: SelectedSeats[]) => set({ selectedSeats }),
  updateSelectedSeats: (
    sectionId: string,
    updateFn: (prevSeats: number[]) => number[],
  ) => {
    set((state) => {
      const newSelectedSeats = state.selectedSeats.map((seat) =>
        seat.id === sectionId
          ? { id: sectionId, seats: updateFn(seat.seats) }
          : seat,
      );
      return { selectedSeats: newSelectedSeats };
    });
  },
}));

export default useSectionStore;
