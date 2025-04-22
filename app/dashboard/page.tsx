"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { CalendarIcon, CheckCircle, CircleDashed, Clock, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [todos, setTodos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodos = async () => {
      if (status === "authenticated") {
        try {
          const response = await fetch("/api/todos");
          const data = await response.json();
          setTodos(data);
        } catch (error) {
          console.error("Error fetching todos:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (status === "authenticated") {
      fetchTodos();
    } else if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Calculate dashboard stats
  const totalTodos = todos.length;
  const completedTodos = todos.filter((todo) => todo.status === "complete").length;
  const incompleteTodos = totalTodos - completedTodos;
  const completionRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

  // Get today's todos
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTodos = todos.filter((todo) => {
    const todoDate = new Date(todo.dueDate);
    todoDate.setHours(0, 0, 0, 0);
    return todoDate.getTime() === today.getTime();
  });

  // Get upcoming todos (next 7 days excluding today)
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const upcomingTodos = todos.filter((todo) => {
    const todoDate = new Date(todo.dueDate);
    todoDate.setHours(0, 0, 0, 0);
    return todoDate > today && todoDate <= nextWeek;
  });

  // Sort todos by due date
  const sortedTodos = [...upcomingTodos].sort((a, b) => {
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  // Get recently completed todos
  const recentlyCompletedTodos = todos
    .filter((todo) => todo.status === "complete")
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  if (status === "loading" || loading) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              {[1, 2, 3].map((i) => (
                <div key={i} className="mb-4">
                  <Skeleton className="h-16 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              {[1, 2, 3].map((i) => (
                <div key={i} className="mb-4">
                  <Skeleton className="h-16 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="container py-10">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button 
            onClick={() => router.push("/todos/new")}
            className="w-full md:w-auto"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Todo
          </Button>
        </div>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Tasks</CardDescription>
              <CardTitle className="text-4xl">{totalTodos}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {completedTodos} completed, {incompleteTodos} remaining
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Completion Rate</CardDescription>
              <CardTitle className="text-4xl">{completionRate}%</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={completionRate} className="h-2" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Due Today</CardDescription>
              <CardTitle className="text-4xl">{todayTodos.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {todayTodos.filter(t => t.status === "complete").length} completed, {todayTodos.filter(t => t.status === "incomplete").length} remaining
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <Card>
          <CardHeader>
            <CardTitle>Today & Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="today">
              <TabsList className="mb-4">
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              </TabsList>
              <TabsContent value="today">
                {todayTodos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No tasks due today</p>
                    <Button 
                      variant="link" 
                      className="mt-2"
                      onClick={() => router.push("/todos/new")}
                    >
                      Create a new task
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todayTodos.map((todo) => (
                      <div
                        key={todo._id}
                        className="flex items-start justify-between p-4 rounded-lg border"
                        onClick={() => router.push(`/todos/${todo._id}/edit`)}
                      >
                        <div className="flex items-start gap-3">
                          {todo.status === "complete" ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                          ) : (
                            <CircleDashed className="h-5 w-5 text-amber-500 mt-0.5" />
                          )}
                          <div>
                            <p className="font-medium">{todo.title}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {todo.description || "No description"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>
                            {format(new Date(todo.dueDate), "h:mm a")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="upcoming">
                {sortedTodos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No upcoming tasks</p>
                    <Button 
                      variant="link" 
                      className="mt-2"
                      onClick={() => router.push("/todos/new")}
                    >
                      Create a new task
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sortedTodos.map((todo) => (
                      <div
                        key={todo._id}
                        className="flex items-start justify-between p-4 rounded-lg border"
                        onClick={() => router.push(`/todos/${todo._id}/edit`)}
                      >
                        <div className="flex items-start gap-3">
                          {todo.status === "complete" ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                          ) : (
                            <CircleDashed className="h-5 w-5 text-amber-500 mt-0.5" />
                          )}
                          <div>
                            <p className="font-medium">{todo.title}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {todo.description || "No description"}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end text-sm text-muted-foreground">
                          <span>{formatDate(todo.dueDate)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full" onClick={() => router.push("/todos")}>
              View all tasks
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recently Completed</CardTitle>
          </CardHeader>
          <CardContent>
            {recentlyCompletedTodos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No completed tasks yet</p>
                <Button 
                  variant="link" 
                  className="mt-2"
                  onClick={() => router.push("/todos")}
                >
                  Go to task list
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentlyCompletedTodos.map((todo) => (
                  <div
                    key={todo._id}
                    className="flex items-start justify-between p-4 rounded-lg border"
                    onClick={() => router.push(`/todos/${todo._id}/edit`)}
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium">{todo.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Completed on {format(new Date(todo.updatedAt), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full" onClick={() => router.push("/todos")}>
              View all tasks
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}