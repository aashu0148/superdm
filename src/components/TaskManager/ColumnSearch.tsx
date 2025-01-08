import { useState, KeyboardEvent } from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
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

  const handleSearch = () => {
    if (selectedColumn) {
      onSearch(selectedColumn, searchQuery.trim());
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex items-center gap-2 w-full max-w-[390px]">
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

      <Input
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1"
      />

      <Button onClick={handleSearch} variant="default">
        <Search className="h-4 w-4 mr-2" />
        Search
      </Button>
    </div>
  );
}
