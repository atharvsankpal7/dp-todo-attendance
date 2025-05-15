// app/daily-report/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  CalendarIcon,
  CheckCircle,
  CircleDashed,
  Loader2,
  User,
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DailySummary from "@/components/reports/daily-summary";

export default function DailyReportPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [users, setUsers] = useState<any[]>([]);
  const [todos, setTodos] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = session?.user?.role === "admin";

  useEffect(() => {
    const fetchData = async () => {
      if (status === "authenticated") {
        try {
          setLoading(true);

          // Fetch users if admin
          if (isAdmin) {
            const usersResponse = await fetch("/api/users");
            const usersData = await usersResponse.json();
            setUsers(usersData);
          }

          // Fetch todos
          const todosUrl = new URL("/api/todos", window.location.origin);
          todosUrl.searchParams.set("date", selectedDate.toISOString());
          if (selectedUser) {
            todosUrl.searchParams.set("assignedTo", selectedUser);
          }

          const todosResponse = await fetch(todosUrl);
          const todosData = await todosResponse.json();
          setTodos(todosData);

          // Fetch reports
          const reportsUrl = new URL("/api/reports", window.location.origin);
          reportsUrl.searchParams.set("date", selectedDate.toISOString());
          if (selectedUser) {
            reportsUrl.searchParams.set("userId", selectedUser);
          }

          const reportsResponse = await fetch(reportsUrl);
          const reportsData = await reportsResponse.json();
          setReports(reportsData);
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      } else if (status === "unauthenticated") {
        router.push("/auth/signin");
      }
    };

    fetchData();
  }, [status, isAdmin, selectedDate, selectedUser, router]);



  const completedTasks = todos.filter((todo: any) => todo.status === "complete");
  const incompleteTasks = todos.filter((todo: any) => todo.status === "incomplete");

  const currentUserReport = reports.find(
    (report: any) => report.user._id === (selectedUser || session?.user?.id)
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* Date Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full md:w-auto">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(selectedDate, "PPP")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* User Selector */}
        {isAdmin && (
          <Select
            value={selectedUser}
            onValueChange={setSelectedUser}
          >
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Select user" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user: any) => (
                <SelectItem key={user._id} value={user._id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Tasks Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle>Tasks Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Completed Tasks</span>
                </div>
                <Badge variant="secondary">{completedTasks.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CircleDashed className="h-5 w-5 text-amber-500" />
                  <span>Incomplete Tasks</span>
                </div>
                <Badge variant="secondary">{incompleteTasks.length}</Badge>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-medium mb-3">Completed Tasks</h4>
              {completedTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No completed tasks for today</p>
              ) : (
                <div className="space-y-2">
                  {completedTasks.map((todo: any) => (
                    <div
                      key={todo._id}
                      className="flex items-start gap-2 p-2 rounded-md bg-muted/50"
                    >
                      <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                      <div>
                        <p className="text-sm font-medium">{todo.title}</p>
                        {todo.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {todo.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Daily Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <DailySummary
              date={selectedDate}
              completedTasks={completedTasks.map((todo: any) => todo._id)}
              existingSummary={currentUserReport?.summary}
            />
          </CardContent>
        </Card>
      </div>

      {/* Team Reports Card */}
      {isAdmin && reports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Team Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {reports.map((report: any) => (
                <div
                  key={report._id}
                  className="p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{report.user.name}</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{report.summary}</p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Last updated: {format(new Date(report.updatedAt), "PPp")}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}