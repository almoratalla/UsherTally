"use client";
import useCounters from "@/app/hooks/useCounters";
import { useRouteChangePrompt } from "@/app/hooks/useRouteChangePrompt";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { calculateLayoutStats } from "@/utils/functions";
import { Grid, Minus, Plus, Save, Trash2 } from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Seat = {
  id: string;
  label: string;
  isHighlighted: boolean;
};

type Row = {
  id: string;
  seats: Seat[];
};

type StagedSection = {
  id: string;
  name: string;
  rows: Row[];
};

type ConvertedSection = {
  id: string;
  name: string;
  rows: Row[];
  layout: number[][];
};

function convertToLayout(sections: StagedSection[]): ConvertedSection[] {
  return sections.map((section) => ({
    ...section,
    layout: section.rows.map((row) =>
      row.seats.map((seat) => (seat.isHighlighted ? 1 : 0)),
    ),
  }));
}

const ModeDropdown = ({
  currentMode,
  onChange,
}: {
  currentMode: "viewing" | "selection" | "removal";
  onChange: (mode: "viewing" | "selection" | "removal") => void;
}) => (
  <select
    value={currentMode}
    onChange={(e) =>
      onChange(e.target.value as "viewing" | "selection" | "removal")
    }
    className="border rounded px-2 py-1 text-sm"
  >
    <option value="viewing">Viewing Mode</option>
    <option value="selection">Selection Mode</option>
    <option value="removal">Removal Mode</option>
  </select>
);

const SeatPlanCreator = () => {
  const [sections, setSections] = useState<StagedSection[]>([]);
  const [newSectionName, setNewSectionName] = useState("");
  const [bulkRowCount, setBulkRowCount] = useState("");
  const [bulkColumnCount, setBulkColumnCount] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const lastHighlightedSeat = useRef<{
    sectionId: string;
    rowId: string;
    seatId: string;
  } | null>(null);
  const [mode, setMode] = useState<"viewing" | "selection" | "removal">(
    "viewing",
  );
  const { addSections } = useCounters();

  const addSection = () => {
    if (newSectionName.trim()) {
      setSections([
        ...sections,
        { id: Date.now().toString(), name: newSectionName, rows: [] },
      ]);
      setNewSectionName("");
    }
  };

  const deleteSection = (sectionId: string) => {
    setSections(sections.filter((section) => section.id !== sectionId));
  };

  const addRow = (sectionId: string) => {
    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          const newRow: Row = {
            id: Date.now().toString(),
            seats: [{ id: "0", label: "1", isHighlighted: false }],
          };
          return { ...section, rows: [...section.rows, newRow] };
        }
        return section;
      }),
    );
  };

  const deleteRow = (sectionId: string, rowId: string) => {
    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            rows: section.rows.filter((row) => row.id !== rowId),
          };
        }
        return section;
      }),
    );
  };

  const addSeat = (sectionId: string, rowId: string) => {
    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            rows: section.rows.map((row) => {
              if (row.id === rowId) {
                const newSeat: Seat = {
                  id: Date.now().toString(),
                  label: (row.seats.length + 1).toString(),
                  isHighlighted: false,
                };
                return {
                  ...row,
                  seats: [...row.seats, newSeat],
                };
              }
              return row;
            }),
          };
        }
        return section;
      }),
    );
  };

  const toggleSeatHighlight = useCallback(
    (sectionId: string, rowId: string, seatId: string) => {
      if (mode === "viewing") return;
      setSections((prevSections) =>
        prevSections.map((section) => {
          if (section.id === sectionId) {
            return {
              ...section,
              rows: section.rows.map((row) => {
                if (row.id === rowId) {
                  return {
                    ...row,
                    seats: row.seats.map((seat) =>
                      seat.id === seatId
                        ? {
                            ...seat,
                            isHighlighted: !seat.isHighlighted,
                          }
                        : seat,
                    ),
                  };
                }
                return row;
              }),
            };
          }
          return section;
        }),
      );
    },
    [mode],
  );

  const deleteSeat = useCallback(
    (sectionId: string, rowId: string, seatId: string) => {
      setSections((prevSections) =>
        prevSections.map((section) => {
          if (section.id === sectionId) {
            return {
              ...section,
              rows: section.rows.map((row) => {
                if (row.id === rowId) {
                  return {
                    ...row,
                    seats: row.seats.filter((seat) => seat.id !== seatId),
                  };
                }
                return row;
              }),
            };
          }
          return section;
        }),
      );
    },
    [],
  );

  const addBulkRowsAndColumns = (sectionId: string) => {
    const rowCount = parseInt(bulkRowCount);
    const columnCount = parseInt(bulkColumnCount);

    if (
      isNaN(rowCount) ||
      isNaN(columnCount) ||
      rowCount <= 0 ||
      columnCount <= 0
    ) {
      alert("Please enter valid numbers for rows and columns.");
      return;
    }

    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          const newRows: Row[] = Array.from(
            { length: rowCount },
            (_, rowIndex) => ({
              id: `${Date.now()}-${rowIndex}`,
              seats: Array.from({ length: columnCount }, (_, seatIndex) => ({
                id: `${Date.now()}-${rowIndex}-${seatIndex}`,
                label: (seatIndex + 1).toString(),
                isHighlighted: false,
              })),
            }),
          );
          return { ...section, rows: [...section.rows, ...newRows] };
        }
        return section;
      }),
    );

    setBulkRowCount("");
    setBulkColumnCount("");
  };

  const handleMouseDown = (
    sectionId: string,
    rowId: string,
    seatId: string,
  ) => {
    setIsDragging(true);
    if (mode === "removal") {
      deleteSeat(sectionId, rowId, seatId);
    } else {
      toggleSeatHighlight(sectionId, rowId, seatId);
    }
    lastHighlightedSeat.current = { sectionId, rowId, seatId };
  };

  const handleMouseEnter = (
    sectionId: string,
    rowId: string,
    seatId: string,
  ) => {
    if (isDragging && lastHighlightedSeat.current) {
      const {
        sectionId: lastSectionId,
        rowId: lastRowId,
        seatId: lastSeatId,
      } = lastHighlightedSeat.current;
      if (
        lastSectionId !== sectionId ||
        lastRowId !== rowId ||
        lastSeatId !== seatId
      ) {
        if (mode === "removal") {
          deleteSeat(sectionId, rowId, seatId);
        } else {
          toggleSeatHighlight(sectionId, rowId, seatId);
        }
        lastHighlightedSeat.current = { sectionId, rowId, seatId };
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    lastHighlightedSeat.current = null;
  };
  const sectionsLayout = useMemo(() => convertToLayout(sections), [sections]);

  const [showDialog, setShowDialog] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const handleSave = () => {
    setShowDialog(true);
  };

  const confirmSaveChanges = (section: StagedSection) => {
    // Call your save function logic here
    const sectionLayout = sectionsLayout.find(
      (s) => s.id === section.id,
    )?.layout;
    const layoutStats = calculateLayoutStats(sectionLayout ?? []);
    const sectionCapacity = layoutStats?.capacity;
    const sectionCount = layoutStats?.seatsTaken;
    addSections({
      newSectionName: section.name,
      capacity: !sectionCapacity ? undefined : sectionCapacity,
      layout: sectionLayout,
      count: sectionCount,
    });
    setSections(sections.filter((s) => s.id !== section.id));
    setUnsavedChanges(false); // Reset unsaved changes state
    setShowDialog(false); // Close dialog after saving
  };
  useEffect(() => {
    setUnsavedChanges(sections.length !== 0);
  }, [sections]);

  useRouteChangePrompt(unsavedChanges);

  return (
    <main className="flex flex-col gap-4 justify-between">
      <section className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="mb-4">
          <Label htmlFor="new-section">New Section Name</Label>
          <div className="flex mt-1">
            <Input
              id="new-section"
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              placeholder="Enter section name"
              className="mr-2"
            />
            <Button
              onClick={addSection}
              className="bg-brand-primary hover:bg-brand-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Section
            </Button>
          </div>
        </div>
      </section>
      <section className="flex flex-col md:flex-row gap-4 justify-between w-full">
        <div className="w-full">
          <Tabs defaultValue={sections[0]?.id} className="mt-6 w-full">
            <ScrollArea className="w-full whitespace-nowrap rounded-md border bg-white dark:bg-black">
              <div className="flex flex-col p-3">
                <span className="text-sm mb-4 border-2 border-gray-200 rounded-md p-2">
                  Pending section edits:
                </span>
                <TabsList className="inline-flex h-auto w-full gap-2  flex-wrap items-center justify-start rounded-none bg-transparent ">
                  {/* className="w-full overflow-x-auto justify-start" */}
                  {sections.map((section) => (
                    <TabsTrigger
                      key={section.id}
                      value={section.id}
                      className="inline-flex items-center justify-center rounded-none  whitespace-nowrap border-b-2 border-transparent bg-gray-100 px-3 py-1.5 text-sm font-medium text-muted-foreground ring-offset-background transition-all hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-brand-primary data-[state=active]:text-brand-primary data-[state=active]:shadow-none"
                    >
                      {section.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <ScrollBar orientation="horizontal" className="invisible" />
              </div>
            </ScrollArea>
            {sections.map((section) => (
              <TabsContent key={section.id} value={section.id}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                      {section.name}
                      <Dialog open={showDialog} onOpenChange={setShowDialog}>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" onClick={handleSave}>
                            <Save className="w-4 h-4 " /> Save Changes
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteSection(section.id)}
                          >
                            <Trash2 className=" h-4 w-4" /> Delete Section
                          </Button>
                        </div>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Confirm Save</DialogTitle>
                          </DialogHeader>
                          <p>Are you sure you want to save the changes?</p>
                          <DialogFooter>
                            <Button
                              onClick={() => setShowDialog(false)}
                              variant="outline"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => {
                                confirmSaveChanges(section);
                              }}
                              className="bg-green-500 hover:bg-green-600"
                            >
                              Confirm Save
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-2 mb-4">
                      <div className="flex flex-col sm:flex-row justify-between items-between w-full">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <Button onClick={() => addRow(section.id)}>
                            <Plus className="mr-2 h-4 w-4" /> Add Row
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline">
                                <Grid className="mr-2 h-4 w-4" /> Add Multiple
                                Rows & Columns
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  Add Multiple Rows & Columns
                                </DialogTitle>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label
                                    htmlFor="bulk-rows"
                                    className="text-right"
                                  >
                                    Rows
                                  </Label>
                                  <Input
                                    id="bulk-rows"
                                    value={bulkRowCount}
                                    onChange={(e) =>
                                      setBulkRowCount(e.target.value)
                                    }
                                    className="col-span-3"
                                    type="number"
                                    min="1"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label
                                    htmlFor="bulk-columns"
                                    className="text-right"
                                  >
                                    Columns
                                  </Label>
                                  <Input
                                    id="bulk-columns"
                                    value={bulkColumnCount}
                                    onChange={(e) =>
                                      setBulkColumnCount(e.target.value)
                                    }
                                    className="col-span-3"
                                    type="number"
                                    min="1"
                                  />
                                </div>
                              </div>
                              <Button
                                onClick={() =>
                                  addBulkRowsAndColumns(section.id)
                                }
                              >
                                Add
                              </Button>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <div className="flex justify-end items-center">
                          <Label
                            htmlFor="mode-dropdown"
                            className="mr-2 text-sm font-semibold"
                          >
                            Mode:
                          </Label>
                          <ModeDropdown
                            currentMode={mode}
                            onChange={setMode} // Update state when mode changes
                          />
                        </div>
                      </div>
                    </div>
                    {section.rows.map((row, rowIndex) => (
                      <div key={row.id} className="flex items-center mb-2">
                        <span className="mr-8 font-bold">
                          Row {rowIndex + 1}:
                        </span>
                        <div className="flex-1 flex flex-wrap gap-2">
                          {row.seats.map((seat) => (
                            <Button
                              key={seat.id}
                              variant={
                                seat.isHighlighted ? "outline" : "outline"
                              }
                              size="sm"
                              onMouseDown={() =>
                                handleMouseDown(section.id, row.id, seat.id)
                              }
                              onMouseEnter={() =>
                                handleMouseEnter(section.id, row.id, seat.id)
                              }
                              className={cn(
                                "select-none",
                                seat.isHighlighted &&
                                  "bg-brand-primary text-white",
                              )}
                            >
                              {seat.label}
                            </Button>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addSeat(section.id, row.id)}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={row.seats.length <= 1}
                          onClick={() => {
                            if (row.seats.length <= 1) return;
                            deleteSeat(
                              section.id,
                              row.id,
                              `${
                                row.seats
                                  .sort((ar, br) => {
                                    return (
                                      parseInt(ar.label) - parseInt(br.label)
                                    );
                                  })
                                  .pop()?.id
                              }`,
                            );
                          }}
                          className="ml-2"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteRow(section.id, row.id)}
                          className="ml-2 bg-black hover:bg-black"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>
    </main>
  );
};

export default SeatPlanCreator;
