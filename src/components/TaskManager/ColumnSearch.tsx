import { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

import { useTaskManager } from "./utility/context";

interface ColumnSearchProps {
  onSearch: (column: string, query: string) => void;
}

const columns = ["name", "priority", "assignee"];

export default function ColumnSearch({ onSearch }: ColumnSearchProps) {
  const { columnToSearch, queryToSearch } = useTaskManager();

  const [selectedColumn, setSelectedColumn] = useState<string>(
    columnToSearch || columns[0] || ""
  );
  const [searchQuery, setSearchQuery] = useState<string>(queryToSearch || "");

  const handleSearch = (query = searchQuery) => {
    if (selectedColumn) {
      onSearch(selectedColumn, query.trim());
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex justify-end items-center gap-2 w-full max-w-[390px]">
      <Select value={selectedColumn} onValueChange={setSelectedColumn}>
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="Select column" />
        </SelectTrigger>
        <SelectContent>
          {columns.map((column) => (
            <SelectItem key={column} value={column}>
              {column}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="relative">
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 pr-7"
        />

        {searchQuery && (
          <X
            onClick={() => {
              setSearchQuery("");
              handleSearch("");
            }}
            className="size-4 text-gray-400 cursor-pointer absolute top-1/2 transform -translate-y-1/2 right-2"
          />
        )}
      </div>
    </div>
  );
}
