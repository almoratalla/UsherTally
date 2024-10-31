import { db } from "@/utils/firebase";
import { useMutation, useQuery } from "@tanstack/react-query";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import Pusher from "pusher-js";
import { useEffect, useRef, useState } from "react";

interface Section {
  id: number;
  count: number;
  name: string;
}

/**
 * Updates an array of objects by overwriting or adding an item based on a key.
 *
 * @param items the array of objects to update
 * @param newItem the item to add or update
 * @param key the key to check for overwrite or addition
 * @returns the updated array of objects
 */
export const updateArray = <T, K extends keyof T>(
  items: T[],
  newItem: T,
  key: K,
): T[] => {
  if (items.some((item) => item[key] === newItem[key])) {
    return items.map((item) =>
      item[key] === newItem[key] ? { ...item, ...newItem } : item,
    );
  }
  return [...items, newItem];
};

const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
});

const TIMER_DELAY = 3000;

export const useCounters = () => {
  /**
   * Client Side Sections State
   */
  const [sections, setSections] = useState<Section[]>([]);

  // Debounce references for section count
  const sectionCountTimerRef = useRef<NodeJS.Timeout | null>(null);
  const latestSectionCountUpdateRef = useRef<Section[] | null>(null);

  // Debounce references for section add
  const sectionAddTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sectionsToAddRef = useRef<Section[]>([]);

  // Debounce references for section delete
  const sectionDeleteTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sectionsToDeleteRef = useRef<number[]>([]);

  /**
   * Server Side Sections State
   */
  const { data: sectionsData, isLoading: isSectionsLoading } = useQuery({
    queryKey: ["sectionsCount"],
    queryFn: async () => {
      const sectionsRef = collection(db, "sections");
      const snapshot = await getDocs(sectionsRef);
      const sectionsData: Section[] = snapshot.docs
        .map((doc) => ({
          id: doc.data().id,
          count: doc.data().count,
          name: doc.data().name,
        }))
        .sort((a, b) => a.id - b.id);

      setSections(sectionsData);
      return sectionsData;
    },
  });

  /**
   * Mutate sections counts
   */
  const { mutate: mutateSectionCount } = useMutation({
    mutationKey: ["sectionsCounts"],
    mutationFn: async (data: Section[]) => {
      // const section = sections.find((s) => s.id === data.id);
      const updatedSections = data
        .map((update) => {
          const section = sections.find((s) => s.id === update.id);
          return section ? { ...section, count: update.count } : section;
        })
        .filter(Boolean) as Section[];

      setSections((prevSections) => {
        // Batch update the sections by mapping over prevSections
        return prevSections.map(
          (section) =>
            updatedSections.find((updated) => updated.id === section.id) ||
            section,
        );
      });

      // Debouncing for batch updates
      const addLatestSection = updateArray(
        [...(latestSectionCountUpdateRef.current ?? [])],
        updatedSections[0],
        "id",
      );
      latestSectionCountUpdateRef.current = addLatestSection;

      if (sectionCountTimerRef.current) {
        clearTimeout(sectionCountTimerRef.current);
      }

      sectionCountTimerRef.current = setTimeout(async () => {
        if (latestSectionCountUpdateRef.current) {
          await fetch("/api/update-sections-counts", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(
              latestSectionCountUpdateRef.current.map((section) => ({
                id: section.id,
                count: section.count,
              })),
            ),
          });
          latestSectionCountUpdateRef.current = null;
          sectionCountTimerRef.current = null;
        }
      }, TIMER_DELAY);
    },
  });

  /**
   * Mutate section name
   */
  const { mutate: mutateSectionName } = useMutation({
    mutationKey: ["sectionName"],
    mutationFn: async (data: Section) => {
      const section = sections.find((s) => s.id === data.id);
      setSections((prevSections) => {
        if (section) {
          return [
            ...updateArray(prevSections, { ...section, name: data.name }, "id"),
          ];
        }
        return [...prevSections];
      });

      if (section && section.name !== data.name) {
        await fetch("/api/rename-section", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: data.id,
            name: data.name,
          }),
        });
      }
    },
  });

  /**
   * Mutate section add
   */
  const { mutate: mutateSectionsAdd } = useMutation({
    mutationKey: ["sectionsAdd"],
    mutationFn: async (newSectionName?: string) => {
      // Create a new section with an incremental ID
      const newId =
        sections.length > 0 ? sections[sections.length - 1].id + 1 : 1;
      const newSection = {
        id: newId,
        name: `Section ${!!newSectionName ? newSectionName : newId}`,
        count: 0,
      };

      // Accumulate the new section into the ref array
      sectionsToAddRef.current.push(newSection);

      // Update the sections state locally to reflect the new section immediately
      setSections((prevSections) => {
        const sectionMap = new Map(prevSections.map((s) => [s.id, s]));
        sectionsToAddRef.current.forEach((section) => {
          sectionMap.set(section.id, section);
        });
        return Array.from(sectionMap.values());
      });

      // Clear previous timer if it exists
      if (sectionAddTimerRef.current) {
        clearTimeout(sectionAddTimerRef.current);
      }

      // Set a new debounce timer
      sectionAddTimerRef.current = setTimeout(async () => {
        // If there are sections accumulated, send them to the API
        if (sectionsToAddRef.current.length > 0) {
          const newSections = sectionsToAddRef.current.map((section) => ({
            id: section.id,
            name: section.name,
            count: section.count,
          }));

          // API call to add the accumulated sections
          await fetch("/api/add-sections", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newSections),
          });

          // Reset the accumulator after the API call
          sectionsToAddRef.current = [];
        }

        // Reset the timer ref
        sectionAddTimerRef.current = null;
      }, 3000); // Debounce for 3 seconds before making the API call
    },
  });

  /**
   * Mutate section delete
   */
  const { mutate: mutateSectionsDelete } = useMutation({
    mutationKey: ["sectionsDelete"],
    mutationFn: async (idToDelete: number) => {
      sectionsToDeleteRef.current.push(idToDelete);
      setSections((prevSections) =>
        prevSections.filter(
          (section) => !sectionsToDeleteRef.current.includes(section.id),
        ),
      );
      // Clear previous timer if it exists
      if (sectionDeleteTimerRef.current) {
        clearTimeout(sectionDeleteTimerRef.current);
      }

      // Set a new debounce timer
      sectionDeleteTimerRef.current = setTimeout(async () => {
        if (sectionsToDeleteRef.current.length > 0) {
          const toDeleteSections = [...sectionsToDeleteRef.current];
          await fetch("/api/delete-sections", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(toDeleteSections),
          });
        }
        sectionAddTimerRef.current = null;
      }, 3000); // Debounce for 3 seconds before making the API call
    },
  });

  useEffect(() => {
    // Listen for real-time updates
    const unsubscribe = onSnapshot(collection(db, "sections"), (snapshot) => {
      const updatedSections: Section[] = snapshot.docs
        .map((doc) => ({
          id: doc.data().id,
          count: doc.data().count,
          name: doc.data().name,
        }))
        .sort((a, b) => a.id - b.id);
      setSections(updatedSections);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const channel = pusher.subscribe("counter-channel");

    // Bind the event for count updates
    channel.bind("count-updated", (data: { id: number; count: number }) => {
      setSections((prevSections) =>
        prevSections.map((section) => {
          return section.id === data.id
            ? { ...section, count: data.count }
            : section;
        }),
      );
    });

    // Bind the event for section addition
    channel.bind("section-added", (data: { id: number; name: string }) => {
      setSections((prevSections) => {
        const sectionMap = new Map(prevSections.map((s) => [s.id, s]));

        // Add or update the section
        sectionMap.set(data.id, {
          id: data.id,
          count: 0,
          name: data.name,
        });
        console.log(data);

        // Return the sections as an array while retaining order
        return Array.from(sectionMap.values());
      });
    });

    // Listen for the section-deleted event
    channel.bind("section-deleted", (data: { id: number }) => {
      setSections((prevSections) =>
        prevSections.filter((section) => section.id !== data.id),
      );
    });

    // Bind the event for renaming a section
    channel.bind("section-renamed", (data: { id: number; name: string }) => {
      setSections((prevSections) =>
        prevSections.map((section) =>
          section.id === data.id ? { ...section, name: data.name } : section,
        ),
      );
    });

    // Cleanup on component unmount
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [setSections]);

  return {
    fetchedSections: sectionsData,
    sections,
    setSections,
    isSectionsLoading,
    updateSection: mutateSectionCount,
    renameSection: mutateSectionName,
    addSections: mutateSectionsAdd,
    deleteSections: mutateSectionsDelete,
  };
};

export default useCounters;
