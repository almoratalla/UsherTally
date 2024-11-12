import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function EmptyState({
    newSectionTitle,
    setNewSectionTitle,
    newSectionCapacity,
    setNewSectionCapacity,
    onAddSection,
}: {
    newSectionTitle: string;
    setNewSectionTitle: (value: string) => void;
    newSectionCapacity?: number;
    setNewSectionCapacity: (value: number) => void;
    onAddSection: () => void;
}) {
    return (
        <div className="flex items-center justify-center min-h-[400px] p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">
                        No Sections Yet
                    </CardTitle>
                    <CardDescription className="text-center">
                        Get started by creating your first section
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                    <div className="mb-6 p-6 bg-muted rounded-full">
                        <PlusCircle className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <Input
                        type="text"
                        placeholder="New section title"
                        value={newSectionTitle}
                        onChange={(e) => setNewSectionTitle(e.target.value)}
                        className="max-w-full md:max-w-xs my-4"
                    />
                    <Input
                        type="number"
                        placeholder="Capacity"
                        max={1000}
                        value={newSectionCapacity}
                        onChange={(e) =>
                            setNewSectionCapacity(Number(e.target.value))
                        }
                        className="max-w-full md:max-w-xs my-4"
                    />
                    <Button
                        onClick={onAddSection}
                        className="w-full max-w-xs"
                        disabled={!newSectionCapacity}
                    >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        {!newSectionCapacity
                            ? "Capacity Required"
                            : "Add Your First Section"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
