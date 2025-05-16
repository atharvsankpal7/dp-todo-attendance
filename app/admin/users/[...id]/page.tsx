"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  ChevronLeft,
  Loader2,
  CheckCircle,
  CircleDashed,
  Calendar,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import Todo from "@/models/todo";
import { TodoItem } from "@/components/dashboard/todo-item";

export default function UserProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const userId = params.id;

  const [user, setUser] = useState<any>(null);
  const [todos, setTodos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (status === "authenticated" && session?.user?.role === "admin") {
        try {
          // Fetch user details
          const userResponse = await fetch(`/api/users/${userId}`);
          if (!userResponse.ok) throw new Error("Failed to fetch user");
          const userData = await userResponse.json();
          setUser(userData);

          // Fetch user's todos
          const todosResponse = await fetch(`/api/todos?assignedTo=${userId}`);
          if (!todosResponse.ok) throw new Error("Failed to fetch todos");
          const todosData = await todosResponse.json();
          setTodos(todosData);
        } catch (error) {
          console.error("Error fetching user data:", error);
          router.push("/admin/users");
        } finally {
          setLoading(false);
        }
      } else if (
        status === "authenticated" &&
        session?.user?.role !== "admin"
      ) {
        router.push("/dashboard");
      } else if (status === "unauthenticated") {
        router.push("/auth/signin");
      }
    };

    if (status === "authenticated") {
      fetchUserData();
    }
  }, [status, session, router, userId]);

  if (status === "loading" || loading) {
    return (
      <div className="container py-10">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p>Loading user profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-10">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="flex flex-col items-center">
            <p className="text-lg">User not found</p>
            <Button
              variant="link"
              className="mt-2"
              onClick={() => router.push("/admin/users")}
            >
              Back to Users
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate user stats
  const totalTodosCount = todos.length;
  const completedTodosCount = todos.filter(
    (todo) => todo.status === "complete"
  ).length;
  const incompleteTodosCount = totalTodosCount - completedTodosCount;
  const completionRate =
    totalTodosCount > 0
      ? Math.round((completedTodosCount / totalTodosCount) * 100)
      : 0;

  // Get today's todos
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTodos = todos.filter((todo) => {
    const todoDate = new Date(todo.dueDate);
    todoDate.setHours(0, 0, 0, 0);
    return todoDate.getTime() === today.getTime();
  });
  const incompleteTodosList = todos.filter(
    (todo) => todo.status === "incomplete"
  );

  // Get recently completed todos
  const recentlyCompletedTodosList = todos
    .filter((todo) => todo.status === "complete")
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 5);

  return (
    <div className="container py-10">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => router.push("/admin/users")}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">{user.name}&apos;s Profile</h1>
          <p className="text-muted-foreground">{user.email}</p>
          <div className="flex items-center gap-2">
            <Badge variant={user.role === "admin" ? "default" : "outline"}>
              {user.role === "admin" ? "Admin" : "User"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Joined {format(new Date(user.createdAt), "MMMM d, yyyy")}
            </span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Tasks</CardDescription>
            <CardTitle className="text-4xl">{totalTodosCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {completedTodosCount} completed, {incompleteTodosCount} remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completion Rate</CardDescription>
            <CardTitle className="text-4xl">{completionRate}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={completionRate} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Due Today</CardDescription>
            <CardTitle className="text-4xl">{todayTodos.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {todayTodos.filter((t) => t.status === "complete").length}{" "}
              completed,{" "}
              {todayTodos.filter((t) => t.status === "incomplete").length}{" "}
              remaining
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Incomplete Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {todayTodos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No incomplete tasks</p>
              </div>
            ) : (
              <div className="space-y-4">
                {incompleteTodosList.map((todo) => (
                  <TodoItem key ={todo.id} todo={todo} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recently Completed</CardTitle>
          </CardHeader>
          <CardContent>
            {recentlyCompletedTodosList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No completed tasks yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentlyCompletedTodosList.map((todo) => (
                  <div
                    key={todo._id}
                    className="flex items-start justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium">{todo.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Completed on{" "}
                          {format(new Date(todo.updatedAt), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
