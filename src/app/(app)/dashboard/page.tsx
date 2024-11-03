"use client";

import { useEffect, useRef, useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "recharts";
import { Calendar } from "@/components/ui/calendar";
import { ChevronDown, Users, CalendarDays, Edit3, Eye } from "lucide-react";
import Header from "@/app/components/Header";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useProjects } from "@/app/hooks/useProjects";
import { Switch } from "@/components/ui/switch";
import useCounters from "@/app/hooks/useCounters";
import AnimatedNumberDisplay from "@/app/components/animated-number";
import { formatShortDate } from "@/utils/functions";

const ResponsiveGridLayout = WidthProvider(Responsive);

// Mock data
const mockSections = [
  { id: 1, name: "Section A", rows: 10, columns: 15, count: 150 },
  { id: 2, name: "Section B", rows: 8, columns: 12, count: 96 },
  { id: 3, name: "Section C", rows: 12, columns: 20, count: 240 },
];

const mockEditHistory = [
  { date: "2023-06-01", edits: 5 },
  { date: "2023-06-02", edits: 3 },
  { date: "2023-06-03", edits: 7 },
  { date: "2023-06-04", edits: 2 },
  { date: "2023-06-05", edits: 6 },
];

const Dashboard = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [layouts, setLayouts] = useState({
    lg: [
      { i: "totalSeats", x: 0, y: 0, w: 3, h: 3 },
      { i: "totalSections", x: 3, y: 0, w: 3, h: 3 },
      { i: "lastUpdated", x: 6, y: 0, w: 3, h: 3 },
      { i: "totalEdits", x: 9, y: 0, w: 3, h: 3 },
      { i: "sectionOverview", x: 0, y: 2, w: 8, h: 8 },
      { i: "editHistory", x: 8, y: 2, w: 4, h: 8 },
      { i: "quickEdit", x: 0, y: 8, w: 8, h: 7 },
      { i: "editCalendar", x: 8, y: 8, w: 4, h: 10 },
    ],
  });

  const [rowHeight, setRowHeight] = useState(30);
  const gridRef = useRef<HTMLDivElement>(null);

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
  const [isEditMode, setIsEditMode] = useState(false);
  const { activeProjectSections, latestLastModified, totalEditsForDay } =
    useCounters();
  const totalCount = activeProjectSections.reduce(
    (sum, section) => sum + section.count,
    0,
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 2xl:px-0">
        <main className="flex flex-col py-12 min-h-screen bg-gray-100 gap-8">
          <section className="flex flex-col items-start gap-2">
            <div className="flex justify-between items-center w-full">
              <h1 className="text-4xl font-bold ">Tally Dashboard</h1>
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
            {activeProject && (
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
                <CardTitle className="text-sm font-medium">
                  Total Seats
                </CardTitle>
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
                <p className="text-xs text-muted-foreground">
                  Date of last edit
                </p>
              </CardContent>
            </Card>

            <Card key="totalEdits">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Edits
                </CardTitle>
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Section</TableHead>
                      <TableHead>Rows</TableHead>
                      <TableHead>Columns</TableHead>
                      <TableHead>Total Seats</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockSections.map((section) => (
                      <TableRow key={section.id}>
                        <TableCell className="font-medium">
                          {section.name}
                        </TableCell>
                        <TableCell>{section.rows}</TableCell>
                        <TableCell>{section.columns}</TableCell>
                        <TableCell>{section.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card key="editHistory">
              <CardHeader>
                <CardTitle>Edit History</CardTitle>
                <CardDescription>Number of edits per day</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={mockEditHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="edits" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card key="quickEdit">
              <CardHeader>
                <CardTitle>Quick Edit</CardTitle>
                <CardDescription>Update section counts</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  {mockSections.map((section) => (
                    <div
                      key={section.id}
                      className="flex items-center space-x-4"
                    >
                      <Label htmlFor={`section-${section.id}`} className="w-24">
                        {section.name}
                      </Label>
                      <Input
                        id={`section-${section.id}`}
                        type="number"
                        defaultValue={section.count}
                        className="w-24"
                      />
                      <Button type="button">Update</Button>
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
            </Card>
          </ResponsiveGridLayout>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
