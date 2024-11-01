"use client";

import React, { useState, useEffect } from "react";
import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    doc,
    onSnapshot,
} from "firebase/firestore";
import Pusher from "pusher-js";
import { db } from "@/utils/firebase";

// Interface for a seat
interface Seat {
    row: number;
    column: number;
    status: "available" | "selected" | "booked";
}

// Interface for a seat map
interface SeatMap {
    sectionId: number;
    rows: number;
    columns: number;
    seats: Seat[];
}

const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
});

const SeatMapPage: React.FC = () => {
    const [sections, setSections] = useState<SeatMap[]>([]);
    const [currentSectionId, setCurrentSectionId] = useState<number | null>(
        null
    );
    const [currentSeatMap, setCurrentSeatMap] = useState<SeatMap | null>(null);
    const [rows, setRows] = useState<number>(5);
    const [columns, setColumns] = useState<number>(5);

    // Fetch sections from Firestore
    useEffect(() => {
        const fetchSections = async () => {
            const sectionsRef = collection(db, "sections");
            const snapshot = await getDocs(sectionsRef);
            const sectionsData = snapshot.docs.map((doc) => ({
                ...doc.data(),
                sectionId: doc.data().id,
            })) as SeatMap[];

            setSections(sectionsData);
        };

        fetchSections();
    }, []);

    // Listen for real-time updates
    useEffect(() => {
        const unsubscribe = onSnapshot(
            collection(db, "seatMaps"),
            (snapshot) => {
                const updatedSeatMaps: SeatMap[] = snapshot.docs.map((doc) => ({
                    sectionId: doc.data().sectionId,
                    rows: doc.data().rows,
                    columns: doc.data().columns,
                    seats: doc.data().seats,
                }));
                setSections((prevSections) => {
                    const sectionMap = new Map(
                        prevSections.map((s) => [s.sectionId, s])
                    );
                    updatedSeatMaps.forEach((seatMap) =>
                        sectionMap.set(seatMap.sectionId, seatMap)
                    );
                    return Array.from(sectionMap.values());
                });
            }
        );

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const channel = pusher.subscribe("seat-map-channel");

        channel.bind("seat-map-updated", (data: SeatMap) => {
            setSections((prevSections) => {
                const sectionMap = new Map(
                    prevSections.map((s) => [s.sectionId, s])
                );
                sectionMap.set(data.sectionId, data);
                return Array.from(sectionMap.values());
            });
        });

        return () => {
            channel.unbind_all();
            channel.unsubscribe();
        };
    }, []);

    // Function to create or update a seat map
    const createOrUpdateSeatMap = async () => {
        try {
            if (currentSectionId === null) return;

            // Generate seats
            const seats: Seat[] = [];
            for (let row = 0; row < rows; row++) {
                for (let column = 0; column < columns; column++) {
                    seats.push({ row, column, status: "available" });
                }
            }

            const newSeatMap: SeatMap = {
                sectionId: currentSectionId,
                rows,
                columns,
                seats,
            };

            // Check if a seat map for this section already exists
            const existingSeatMap = sections.find(
                (section) => section.sectionId === currentSectionId
            );

            // Update Firestore document
            const seatMapsRef = collection(db, "seatMaps");
            const snapshot = await getDocs(seatMapsRef);
            const docId = snapshot.docs.find(
                (d) => d.data().id === currentSectionId
            )?.id;
            // if (!docId) throw "No doc Id";

            if (docId) {
                // Update existing seat map in Firestore
                const seatMapDocRef = doc(db, "seatMaps", docId);
                await updateDoc(
                    seatMapDocRef,
                    newSeatMap as { [x: string]: any }
                );
            } else {
                // Add new seat map to Firestore

                await addDoc(seatMapsRef, newSeatMap);
            }

            // Trigger Pusher event
            await fetch("/api/update-seat-map", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newSeatMap),
            });

            setCurrentSeatMap(newSeatMap);
        } catch (error) {
            console.log(error);
        }
    };

    // Function to handle seat click
    const handleSeatClick = (seat: Seat) => {
        if (!currentSeatMap) return;

        const updatedSeats: Seat[] = currentSeatMap.seats.map((s) =>
            s.row === seat.row && s.column === seat.column
                ? {
                      ...s,
                      status:
                          s.status === "available" ? "selected" : "available",
                  }
                : s
        );

        const updatedSeatMap: SeatMap = {
            ...currentSeatMap,
            seats: updatedSeats,
        };
        setCurrentSeatMap(updatedSeatMap as SeatMap);

        // Update Firestore with the new seat map
        updateFirestoreSeatMap(updatedSeatMap);
    };

    // Update Firestore with the new seat map
    const updateFirestoreSeatMap = async (seatMap: SeatMap) => {
        const seatMapDocRef = doc(db, "seatMaps", seatMap.sectionId.toString());
        await updateDoc(seatMapDocRef, seatMap as { [x: string]: any });

        // Trigger Pusher event
        await fetch("/api/update-seat-map", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(seatMap),
        });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-4xl font-bold mb-4">Seat Map</h1>

            {/* Section selection */}
            <select
                value={currentSectionId || ""}
                onChange={(e) => setCurrentSectionId(Number(e.target.value))}
                className="mb-4 p-2 border rounded"
            >
                <option value="" disabled>
                    Select Section
                </option>
                {sections.map((section) => (
                    <option key={section.sectionId} value={section.sectionId}>
                        Section {section.sectionId}
                    </option>
                ))}
            </select>

            {/* Row and column inputs */}
            <div className="mb-4">
                <input
                    type="number"
                    value={rows}
                    onChange={(e) => setRows(Number(e.target.value))}
                    min={1}
                    className="p-2 border rounded mr-2"
                    placeholder="Rows"
                />
                <input
                    type="number"
                    value={columns}
                    onChange={(e) => setColumns(Number(e.target.value))}
                    min={1}
                    className="p-2 border rounded"
                    placeholder="Columns"
                />
            </div>

            {/* Button to create or update the seat map */}
            <button
                onClick={createOrUpdateSeatMap}
                className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                disabled={currentSectionId === null}
            >
                Create/Update Seat Map
            </button>

            {/* Display the current seat map */}
            {currentSeatMap && (
                <div className="grid gap-2">
                    {Array.from({ length: currentSeatMap.rows }, (_, row) => (
                        <div key={row} className="flex">
                            {Array.from(
                                { length: currentSeatMap.columns },
                                (_, column) => {
                                    const seat = currentSeatMap.seats.find(
                                        (s) =>
                                            s.row === row && s.column === column
                                    );
                                    return (
                                        <div
                                            key={column}
                                            onClick={() =>
                                                seat && handleSeatClick(seat)
                                            }
                                            className={`w-8 h-8 flex items-center justify-center border cursor-pointer ${
                                                seat?.status === "available"
                                                    ? "bg-green-300"
                                                    : seat?.status ===
                                                        "selected"
                                                      ? "bg-yellow-300"
                                                      : "bg-gray-300"
                                            }`}
                                        >
                                            {row},{column}
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SeatMapPage;
