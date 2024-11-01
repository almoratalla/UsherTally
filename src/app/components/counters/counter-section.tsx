import useCounters from "@/app/hooks/useCounters";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Check, Edit2, Minus, Plus, Trash2 } from "lucide-react";
import React, { FC, PropsWithChildren, useMemo, useState } from "react";

interface Section {
  id: number;
  count: number;
  name: string;
}

const CounterSection: FC<
  PropsWithChildren &
    Section & {
      increment: (id: number) => void;
      decrement: (id: number) => void;
      deleteSection: () => void;
    }
> = ({ id, count, name, increment, decrement, deleteSection }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingTitle, setEditingTitle] = useState(name);
  const { activeProjectSections: sections, renameSection } = useCounters();

  const toggleEditing = () => {
    if (isEditing) {
      handleNameChange();
    } else {
      setIsEditing(true);
    }
  };

  const handleNameChange = () => {
    if (editingTitle !== name) {
      const section = sections.find((section) => section.id === id);
      if (section) {
        renameSection({ ...section, id, name: editingTitle });
      }
    }
    setIsEditing(false);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-4">
        {isEditing ? (
          <Input
            type="text"
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            // onBlur={handleNameChange}
            className="w-[calc(100%-2.5rem)]"
            autoFocus
          />
        ) : (
          <CardTitle className="text-2xl font-bold">{editingTitle}</CardTitle>
        )}
        <div className="flex flex-row justify-end">
          <Button variant="ghost" size="icon" onClick={toggleEditing}>
            {isEditing ? (
              <Check className="h-4 w-4" />
            ) : (
              <Edit2 className="h-4 w-4" />
            )}
          </Button>
          <Button variant="ghost" size="icon" onClick={deleteSection}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardDescription className="px-6 pb-2">
        {/* Last modified: {new Date().toLocaleString()} */}
      </CardDescription>
      <CardContent className="py-8">
        <div className="flex items-center justify-center space-x-4">
          <span className="text-5xl font-bold">{count}</span>
        </div>
        <div className="flex items-center justify-center space-x-4 mt-4 font-medium">
          <Button
            variant="outline"
            size="icon"
            onClick={() => increment(id)}
            className="bg-green-500 hover:bg-green-600 w-full"
          >
            <Plus className="h-4 w-4" />
            <span>Add</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => decrement(id)}
            className="bg-red-500 hover:bg-red-600 w-full"
          >
            <Minus className="h-4 w-4 fill-white stroke-white" />
            <span className="text-white">Subtract</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CounterSection;
