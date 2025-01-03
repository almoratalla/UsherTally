"use client";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Label as ChartLabel,
  Legend,
} from "recharts";
import { ChevronDown, Users, CalendarDays, Edit3, Eye } from "lucide-react";
import AnimatedNumberDisplay from "@/app/components/animated-number";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useEffect, useMemo, useRef, useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useProjects } from "@/app/hooks/useProjects";

import useCounters from "@/app/hooks/useCounters";

import {
  formatShortDate,
  getColorForSection,
  getLastNDates,
} from "@/utils/functions";
import NoDataFound from "@/app/components/no-data-found";
import { usePathname } from "next/navigation";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Section } from "@/app/lib/definitions";
import DataTablePagination from "../data-table-pagination";
import { useTheme } from "next-themes";

const ResponsiveGridLayout = WidthProvider(Responsive);

const today = new Date();
const lastSixDates = getLastNDates(7, today);

export const DashboardPanel = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [layouts, setLayouts] = useState({
    lg: [
      { i: "totalSeats", x: 0, y: 0, w: 3, h: 3 },
      { i: "totalSections", x: 3, y: 0, w: 3, h: 3 },
      { i: "lastUpdated", x: 6, y: 0, w: 3, h: 3 },
      { i: "totalEdits", x: 9, y: 0, w: 3, h: 3 },
      { i: "sectionOverview", x: 0, y: 2, w: 8, h: 9 },
      { i: "editHistory", x: 8, y: 2, w: 4, h: 9 },
      { i: "quickEdit", x: 0, y: 8, w: 8, h: 7 },
      { i: "editCalendar", x: 8, y: 8, w: 4, h: 10 },
      { i: "totalSeatsPerSection", x: 0, y: 8, w: 6, h: 10 },
      { i: "sectionCapacityUtilization", x: 9, y: 8, w: 6, h: 10 },
    ],
  });

  const [rowHeight, setRowHeight] = useState(30);
  const gridRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const { theme } = useTheme();

  useEffect(() => {
    const updateRowHeight = () => {
      if (gridRef.current) {
        const gridWidth = gridRef.current.offsetWidth;
        const newRowHeight = Math.max(30, gridWidth / 40); // Adjust the divisor as needed
        setRowHeight(newRowHeight);
      }
    };

    updateRowHeight();
    window.addEventListener("resize", updateRowHeight);
    return () => window.removeEventListener("resize", updateRowHeight);
  }, []);

  const onLayoutChange = (layout: any, layouts: any) => {
    if (isEditMode) {
      setLayouts(layouts);
    }
  };
  const { activeProject } = useProjects();

  const {
    activeProjectSections,
    latestLastModified,
    totalEditsForDay,
    totalEditsForLastFiveDays,
  } = useCounters();
  const totalCount = activeProjectSections.reduce(
    (sum, section) => sum + section.count,
    0,
  );

  const totalSectionsChartConfig: ChartConfig = useMemo(() => {
    return activeProjectSections.length > 0
      ? activeProjectSections
          .map((section, sectionId) => ({
            [section.name.toLowerCase()]: {
              label: section.name,
              color: getColorForSection(sectionId),
            },
          }))
          .reduce(
            (acc, curr) => {
              const [key, value] = Object.entries(curr)[0];
              acc[key] = value;
              return acc;
            },
            {} as Record<string, { label: string }>,
          )
      : { none: { label: "No section added", color: "#E5E7EB" } };
  }, [activeProjectSections]);
  const totalSectionsData = useMemo(() => {
    return activeProjectSections.length > 0
      ? activeProjectSections.map((section, sectionId) => ({
          section: section.name.toLowerCase(),
          counts: Number(section.count) === 0 ? 0.00001 : section.count,
          fill: getColorForSection(sectionId),
        }))
      : [{ section: "none", counts: 0.00001, fill: "#E5E7EB" }];
  }, [activeProjectSections]);
  const sectionOverviewColumns = useMemo<ColumnDef<Section>[]>(
    () => [
      {
        header: "Section",
        accessorKey: "name",
        cell: ({ table, row }) => (
          <span className="font-medium">{row.getValue("name")}</span>
        ),
      },
      {
        header: "Rows",
        cell: () => "-",
      },
      {
        header: "Columns",
        cell: () => "-",
      },
      {
        header: "Total Seats",
        accessorKey: "count",
      },
    ],
    [],
  );

  const sectionOverviewTable = useReactTable({
    data: activeProjectSections,
    columns: sectionOverviewColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });
  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 2xl:px-0">
      <main className="flex flex-col py-12 min-h-screen bg-gray-100 dark:bg-gray-900 gap-8">
        <section className="flex flex-col items-start gap-2">
          <div className="flex flex-col sm:flex-row items-start justify-between sm:items-center w-full">
            {pathname === "/dashboard" ? (
              <h1 className="text-4xl font-bold ">Tally Dashboard</h1>
            ) : (
              <h2 className="text-xl font-semibold mb-4 text-gray-500">
                Active Project: {activeProject?.projectName || "Demo"}
              </h2>
            )}
            <div className="flex items-center space-x-2">
              <Switch
                checked={isEditMode}
                onCheckedChange={setIsEditMode}
                id="edit-mode"
              />
              <Label htmlFor="edit-mode">
                {isEditMode ? (
                  <span className="flex items-center">
                    <Edit3 className="w-4 h-4 mr-1" /> Edit Mode
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" /> View Mode
                  </span>
                )}
              </Label>
            </div>
          </div>
          {activeProject && pathname !== "/demo" && (
            <h2 className="text-xl font-semibold mb-4 text-gray-500">
              Active Project: {activeProject.projectName}
            </h2>
          )}
        </section>

        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          onLayoutChange={onLayoutChange}
          breakpoints={{
            lg: 1200,
            md: 996,
            sm: 768,
            xs: 480,
            xxs: 0,
          }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          autoSize={true}
          margin={[16, 16]}
          rowHeight={rowHeight}
          containerPadding={[0, 0]}
          useCSSTransforms={true}
          isResizable={isEditMode}
          isDraggable={isEditMode}
        >
          <Card key="totalSeats">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Seats</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <AnimatedNumberDisplay value={totalCount} />
              </div>
              <p className="text-xs text-muted-foreground">
                Across all sections
              </p>
            </CardContent>
          </Card>

          <Card key="totalSections">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Sections
              </CardTitle>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <AnimatedNumberDisplay value={activeProjectSections.length} />
              </div>
              <p className="text-xs text-muted-foreground">
                In the seating plan
              </p>
            </CardContent>
          </Card>

          <Card key="lastUpdated">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Last Updated
              </CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatShortDate(latestLastModified)}
              </div>
              <p className="text-xs text-muted-foreground">Date of last edit</p>
            </CardContent>
          </Card>

          <Card key="totalEdits">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Edits</CardTitle>
              <Edit3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <AnimatedNumberDisplay value={totalEditsForDay} />
              </div>
              <p className="text-xs text-muted-foreground">
                In the last 5 days
              </p>
            </CardContent>
          </Card>

          <Card key="sectionOverview">
            <CardHeader>
              <CardTitle>Section Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="table-auto w-full border-collapse text-sm md:text-base">
                  <thead>
                    {sectionOverviewTable
                      .getHeaderGroups()
                      .map((headerGroup) => (
                        <tr key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <th
                              key={header.id}
                              className="border px-2 py-1 md:px-4 md:py-2"
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext(),
                                  )}
                            </th>
                          ))}
                        </tr>
                      ))}
                  </thead>
                  <tbody>
                    {sectionOverviewTable.getRowModel().rows.length > 0 ? (
                      sectionOverviewTable.getRowModel().rows.map((row) => (
                        <tr
                          key={row.id}
                          className="hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td
                              key={cell.id}
                              className="border px-2 py-1 md:px-4 md:py-2 truncate"
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center py-4">
                          No data found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <DataTablePagination table={sectionOverviewTable} />
              </div>
            </CardContent>
          </Card>

          <Card key="editHistory">
            <CardHeader>
              <CardTitle>Edit History</CardTitle>
              <CardDescription>Number of edits per day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={lastSixDates.map((dateString, index) => {
                    // Extract the day number from the date (1-31)
                    const day = parseInt(dateString.split("-")[2], 10);
                    const edits = totalEditsForLastFiveDays[day] ?? 0;

                    return {
                      date: dateString,
                      edits,
                    };
                  })}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === "dark" ? "#333" : "#fff",
                    }}
                  />
                  <Bar dataKey="edits" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* <Card key="quickEdit">
                            <CardHeader>
                                <CardTitle>Quick Edit</CardTitle>
                                <CardDescription>
                                    Update section counts
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form className="space-y-4">
                                    {activeProjectSections.map((section) => (
                                        <div
                                            key={section.id}
                                            className="flex items-center space-x-4"
                                        >
                                            <Label
                                                htmlFor={`section-${section.id}`}
                                                className="w-24"
                                            >
                                                {section.name}
                                            </Label>
                                            <Input
                                                id={`section-${section.id}`}
                                                type="number"
                                                defaultValue={section.count}
                                                className="w-24"
                                            />
                                            <Button type="button">
                                                Update
                                            </Button>
                                        </div>
                                    ))}
                                </form>
                            </CardContent>
                        </Card>

                        <Card key="editCalendar">
                            <CardHeader>
                                <CardTitle>Edit Calendar</CardTitle>
                                <CardDescription>
                                    Select a date to view or make edits
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    className="rounded-md border"
                                />
                            </CardContent>
                        </Card> */}
          <Card key="totalSeatsPerSection">
            <CardHeader>
              <CardTitle>Total Seats per Section</CardTitle>
              <CardDescription>
                Distribution of seats across sections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ChartContainer
                  config={totalSectionsChartConfig}
                  className="mx-auto aspect-square"
                >
                  <PieChart className="flex flex-col items-center">
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                      data={totalSectionsData}
                      dataKey="counts"
                      nameKey="section"
                      innerRadius={60}
                      strokeWidth={5}
                      // className="mb-10"
                    >
                      <ChartLabel
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            return (
                              <text
                                x={viewBox.cx}
                                y={viewBox.cy}
                                textAnchor="middle"
                                dominantBaseline="middle"
                              >
                                <tspan
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  className="fill-foreground text-3xl font-bold"
                                >
                                  {totalCount}
                                </tspan>
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) + 24}
                                  className="fill-muted-foreground"
                                >
                                  Seats
                                </tspan>
                              </text>
                            );
                          }
                        }}
                      />
                    </Pie>
                    <ChartLegend
                      content={<ChartLegendContent />}
                      wrapperStyle={{
                        maxWidth: "75%",
                        width: "75%",
                        height: "100px",
                        // paddingTop: "20px",
                        position: "initial",
                        overflow: "auto",
                        scrollbarWidth: "thin",
                        scrollbarColor: "black",
                      }}
                      layout="horizontal"
                      align="center"
                      verticalAlign="middle"
                      className="w-full flex flex-row items-center max-w-100 h-14"
                    />
                  </PieChart>
                </ChartContainer>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card key="sectionCapacityUtilization">
            <CardHeader>
              <CardTitle>Section Capacity Utilization</CardTitle>
              <CardDescription>Current seats vs total capacity</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[...activeProjectSections]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === "dark" ? "#333" : "#fff",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" name="Current Seats" />
                  <Bar
                    dataKey="capacity"
                    fill="#82ca9d"
                    name="Total Capacity"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </ResponsiveGridLayout>
      </main>
    </div>
  );
};

export default DashboardPanel;
