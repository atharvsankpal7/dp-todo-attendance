"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  Search,
  Calendar,
  Filter,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import TodoItem from "./todo-item";
import { formatDate } from "@/lib/utils";
import TodosLoading from "./todo-loading";

interface TodoListProps {
  todos: any[];
  isAdmin?: boolean;
  users: any[];
}

export default function TodoList({
  todos: initialTodos = [],
  isAdmin = false,
  users = [],
}: TodoListProps) {
  const router = useRouter();
  const [todos, setTodos] = useState(initialTodos);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true); // ✅ start loading
      let url = "/api/todos";
      const params = new URLSearchParams();

      if (selectedDate) {
        params.append("date", selectedDate.toISOString().split("T")[0]);
      }

      if (selectedUser && isAdmin) {
        params.append("assignedTo", selectedUser);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error("Error fetching todos:", error);
    } finally {
      setLoading(false); // ✅ stop loading
    }
  }, [selectedDate, selectedUser, isAdmin]);

  // ✅ fetch todos when filter changes
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const filteredTodos = todos.filter((todo) => {
    let matchesSearch = true;
    if (searchQuery) {
      matchesSearch = todo.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    }
    return matchesSearch;
  });

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUser(userId === "__all__" ? "" : userId);
  };

  const clearFilters = () => {
    setSelectedDate(undefined);
    setSelectedUser("");
    setSearchQuery("");
    router.push("/todos");
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  // if (loading) {
  //   return <TodosLoading />;
  // }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full items-center space-x-2">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search todos..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Pick a date">
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {isAdmin && (
            <Select value={selectedUser} onValueChange={handleUserSelect}>
              <SelectTrigger className="w-[180px]" aria-label="Filter by user">
                <SelectValue placeholder="Filter by user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All users</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user._id} value={user._id ?? "userid"}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {(selectedDate || selectedUser) && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>

        <Button onClick={() => router.push("/todos/new")} className="shrink-0">
          Create Todo
        </Button>
      </div>

      {selectedDate && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Filtered by date: {formatDate(selectedDate)}</span>
        </div>
      )}

      {selectedUser && isAdmin && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>
            Filtered by user:{" "}
            {users.find((u) => u._id === selectedUser)?.name || "Unknown"}
          </span>
        </div>
      )}

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        <AnimatePresence>
          {loading ? (
            <TodosLoading />
          ) : filteredTodos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center"
            >
              <div className="text-4xl">📋</div>
              <h3 className="mt-4 text-lg font-medium">No todos found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "Create your first todo to get started"}
              </p>
            </motion.div>
          ) : (
            filteredTodos.map((todo) => (
              <TodoItem
                key={todo._id}
                todo={todo}
                isAdmin={isAdmin}
                onUpdate={fetchTodos}
                onDelete={fetchTodos}
              />
            ))
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
