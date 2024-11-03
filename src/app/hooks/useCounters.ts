import { db } from "@/utils/firebase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addDoc,
  collection,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import Pusher from "pusher-js";
import { useEffect, useMemo, useRef, useState } from "react";
import { useProjects } from "./useProjects";
import {
  iTrackUpdates,
  ProjectSectionCountsRecord,
  Section,
} from "../lib/definitions";
import {
  convertFirebaseTimestampToDate,
  getDaysInMonth,
} from "@/utils/functions";

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
  const [trackUpdates, setTrackUpdates] = useState<iTrackUpdates[]>([]);
  const { activeProject } = useProjects();

  // Debounce references for section count
  const sectionCountTimerRef = useRef<NodeJS.Timeout | null>(null);
  const latestSectionCountUpdateRef = useRef<Section[] | null>(null);

  // Debounce references for section add
  const sectionAddTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sectionsToAddRef = useRef<Section[]>([]);

  // Debounce references for section delete
  const sectionDeleteTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sectionsToDeleteRef = useRef<number[]>([]);

  const queryClient = useQueryClient();

  const updateTrackUpdates = async (
    projectName: string,
    sectionIds: string[],
  ) => {
    const today = new Date();
    const dayNumber = today.getDate(); // Example: October 23 returns 23

    const docRef = doc(db, "trackUpdates", `day${dayNumber}`);
    const docSnap = await getDoc(docRef);

    let updatedCounts: ProjectSectionCountsRecord = Object.create(null);
    if (docSnap.exists()) {
      const currentData = docSnap.data() as iTrackUpdates;
      updatedCounts = currentData.counts;

      // Ensure the projectName exists in updatedCounts
      if (!updatedCounts[projectName]) {
        updatedCounts[projectName] = {};
      }

      // Increment counts for each sectionId
      sectionIds.forEach((sectionId) => {
        updatedCounts[projectName][sectionId] = updatedCounts[projectName][
          sectionId
        ]
          ? updatedCounts[projectName][sectionId] + 1
          : 1;
      });

      // Update the existing document
      await updateDoc(docRef, { counts: updatedCounts });
      // Update the existing document
    } else {
      // Create a new document for the day if it doesn't exist
      updatedCounts[projectName] = {};

      // Initialize counts for each sectionId
      sectionIds.forEach((sectionId) => {
        updatedCounts[projectName][sectionId] = 1;
      });

      await setDoc(docRef, {
        day: dayNumber,
        counts: updatedCounts,
      });
    }
  };

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
          projectName: doc.data().projectName,
          lastModified: doc.data().lastModified,
        }))
        .sort((a, b) => a.id - b.id);

      setSections(sectionsData);
      return sectionsData;
    },
  });

  const { data: trackUpdatesData, isLoading: isTrackUpdatesLoading } = useQuery(
    {
      queryKey: ["trackUpdates"],
      queryFn: async () => {
        const updatesRef = collection(db, "trackUpdates");
        const snapshot = await getDocs(updatesRef);
        const updatesData: iTrackUpdates[] = snapshot.docs.map(
          (doc: DocumentData) =>
            ({
              id: doc.id, // Optionally include the document ID
              ...doc.data(),
            }) as iTrackUpdates,
        );
        setTrackUpdates(updatesData);

        return updatesData; // This returns an array of updates
      },
    },
  );

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
          updateTrackUpdates(
            latestSectionCountUpdateRef.current[0].projectName,
            latestSectionCountUpdateRef.current.map(
              (section) => `${section.id}`,
            ),
          );
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
    mutationFn: async (data: { id: number; name: string }) => {
      const section = sections.find(
        (s) => s.id === data.id && s.projectName === activeProject?.projectName,
      );
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
        name: `${!!newSectionName ? newSectionName : "Section " + newId}`,
        count: 0,
        projectName: activeProject?.projectName || "",
        lastModified: new Date(),
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
            projectName: section.projectName,
            lastModifed: section.lastModified,
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
          projectName: doc.data().projectName,
          lastModified: doc.data().lastModified,
        }))
        .sort((a, b) => a.id - b.id);
      setSections(updatedSections);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Subscribe to real-time updates for the trackUpdates collection
    const unsubscribe = onSnapshot(
      collection(db, "trackUpdates"),
      (snapshot) => {
        const updatedTrackUpdates: iTrackUpdates[] = snapshot.docs.map(
          (doc) => ({
            day: doc.data().day,
            counts: doc.data().counts,
          }),
        ) as iTrackUpdates[];

        queryClient.setQueryData(["trackUpdates"], () => {
          return updatedTrackUpdates;
        });
        setTrackUpdates(updatedTrackUpdates);
      },
    );

    // Clean up the subscription on unmount
    return () => unsubscribe();
  }, [queryClient]);

  /**
   * Pusher subscription
   */
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
    channel.bind(
      "section-added",
      (data: { id: number; name: string; lastModified: Date }) => {
        setSections((prevSections) => {
          const sectionMap = new Map(prevSections.map((s) => [s.id, s]));

          // Add or update the section
          sectionMap.set(data.id, {
            id: data.id,
            count: 0,
            name: data.name,
            projectName: activeProject?.projectName || "",
            lastModified: data.lastModified,
          });

          // Return the sections as an array while retaining order
          return Array.from(sectionMap.values());
        });
      },
    );

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
  }, [activeProject?.projectName]);

  const sectionsByProject = sections.reduce(
    (acc, section) => {
      const { projectName } = section;
      if (!acc[projectName]) {
        acc[projectName] = [];
      }
      acc[projectName].push(section);
      return acc;
    },
    {} as Record<string, Section[]>,
  );

  const activeProjectSections = sections.filter(
    (section) => section.projectName === activeProject?.projectName,
  );

  const latestLastModified = activeProjectSections.reduce<{
    seconds: number;
    nanoseconds: number;
  } | null>(
    (latest, section) => {
      if (!section.lastModified) return latest;
      return !latest ||
        (section.lastModified as unknown as {
          seconds: number;
          nanoseconds: number;
        }) > latest
        ? (section.lastModified as unknown as {
            seconds: number;
            nanoseconds: number;
          } | null)
        : latest;
    },
    null, // Initial value for the reduction
  );

  const getTotalEditsForDay = (): number => {
    const updatedTrackUpdatesData = trackUpdates;
    const today = new Date();
    const dayNumber = today.getDate();
    if (!updatedTrackUpdatesData) {
      console.log("No track updates data available.");
      return 0;
    }

    // Find the document that corresponds to the given day
    const dayData = updatedTrackUpdatesData.find(
      (update) => update.day === dayNumber,
    );
    if (!dayData) {
      return 0;
    }

    const counts = dayData.counts;
    let totalEdits = 0;

    // Sum all counts for all projects and sections
    if (activeProject) {
      const sectionCounts = counts[activeProject.projectName];
      if (sectionCounts) {
        for (const sectionId in sectionCounts) {
          if (sectionCounts.hasOwnProperty(sectionId)) {
            totalEdits += sectionCounts[sectionId];
          }
        }
      }
    }

    return totalEdits;
  };

  const totalEditsForLastFiveDays = useMemo(() => {
    const updatedTrackUpdatesData = trackUpdates;
    const totalEditsPerDay: { [day: number]: number } = {};
    const today = new Date();
    const todayDayNumber = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Determine the number of days in the current and previous months
    const daysInCurrentMonth = getDaysInMonth(currentMonth, currentYear);
    const daysInPreviousMonth = getDaysInMonth(currentMonth - 1, currentYear);

    const daysToCheck = [];

    // Calculate days to check (handle wrap-around for varying month lengths)
    for (let i = 5; i >= 0; i--) {
      let dayToCheck = todayDayNumber - i;

      if (dayToCheck <= 0) {
        // Wrap around to the previous month
        dayToCheck = daysInPreviousMonth + dayToCheck;
      } else if (dayToCheck > daysInCurrentMonth) {
        // Wrap around if day exceeds the current month's total days (not needed here but for safety)
        dayToCheck = dayToCheck % daysInCurrentMonth || daysInCurrentMonth;
      }

      daysToCheck.push(dayToCheck);
    }

    if (activeProject) {
      daysToCheck.forEach((day) => {
        totalEditsPerDay[day] = 0;
        const dayData = updatedTrackUpdatesData.find(
          (update) => update.day === day,
        );

        if (!dayData) {
          totalEditsPerDay[day] = 0;
        } else {
          const counts = dayData.counts;

          // Check if counts exist for the day
          if (counts[activeProject.projectName]) {
            const projectCounts = counts[activeProject.projectName];

            if (projectCounts) {
              // Sum up edits for all sections in the active project
              for (const sectionId in projectCounts) {
                if (projectCounts.hasOwnProperty(sectionId)) {
                  totalEditsPerDay[day] += projectCounts[sectionId];
                }
              }
            }
          }
        }
      });
    }
    return totalEditsPerDay;
  }, [activeProject, trackUpdates]);

  const resetCounts = async () => {
    const resetData = sections.map((section) => ({
      ...section,
      count: 0,
    }));
    setSections(resetData);

    await fetch("/api/update-sections-counts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resetData),
    });
  };

  return {
    fetchedSections: sectionsData,
    sections,
    setSections,
    sectionsByProject,
    isSectionsLoading,
    activeProjectSections,
    updateSection: mutateSectionCount,
    renameSection: mutateSectionName,
    addSections: mutateSectionsAdd,
    deleteSections: mutateSectionsDelete,
    latestLastModified: convertFirebaseTimestampToDate(latestLastModified),
    trackUpdates: trackUpdatesData,
    isTrackUpdatesLoading,
    totalEditsForDay: getTotalEditsForDay(),
    totalEditsForLastFiveDays: totalEditsForLastFiveDays,
    resetCounts,
  };
};

export default useCounters;
