import useCounters from "@/app/hooks/useCounters";
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
    }
> = ({ id, count, name, increment, decrement }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const { sections, renameSection } = useCounters();

  const toggleEditing = () => {
    setIsEditing((prevEditing) => !prevEditing);
  };

  const handleNameChange = (id: number, newName: string) => {
    const section = sections.find((section) => section.id === id);
    if (section) {
      renameSection({ ...section, id, name: newName });
    }

    toggleEditing(); // Stop editing after renaming
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
      {isEditing ? (
        <input
          type="text"
          defaultValue={name}
          onBlur={(e) => handleNameChange(id, e.target.value)}
          // onKeyPress={(e) => {
          //     if (e.key === "Enter") {
          //         handleNameChange(
          //             id,
          //             e.currentTarget.value
          //         );
          //     }
          // }}
          autoFocus
          className="text-2xl font-semibold mb-4 text-center border-b-2 border-gray-300 focus:outline-none"
        />
      ) : (
        <h2 className="text-2xl font-semibold mb-4">
          {name}: {count}
        </h2>
      )}
      <div className="flex space-x-4">
        <button
          onClick={() => {
            increment(id);
          }}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
        >
          Add
        </button>
        <button
          onClick={() => decrement(id)}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Subtract
        </button>
        <button
          onClick={() => toggleEditing()}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
        >
          {isEditing ? "Save" : "Edit"}
        </button>
      </div>
    </div>
  );
};

export default CounterSection;
