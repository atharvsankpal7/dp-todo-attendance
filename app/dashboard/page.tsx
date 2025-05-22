"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PlusCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { StatCard } from "@/components/dashboard/state-card";
import { TodoListSection } from "@/components/dashboard/todo-list";
import { LoadingSkeletons } from "@/components/dashboard/loading-skeleton";

export default function DashboardPage() {
  const { data, status } = useSession();
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

  // Stats calculations
  const totalTodos = todos.length;
  const completedTodos = todos.filter((t) => t.status === "complete").length;
  const incompleteTodos = totalTodos - completedTodos;
  const completionRate =
    totalTodos > 0
      ? Math.round((completedTodos / totalTodos) * 100)
      : 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTodos = todos.filter((todo) => {
    const due = new Date(todo.dueDate);
    due.setHours(0, 0, 0, 0);
    return due.getTime() === today.getTime();
  });

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const upcomingTodos = todos.filter((todo) => {
    const due = new Date(todo.dueDate);
    due.setHours(0, 0, 0, 0);
    return due > today && due <= nextWeek;
  });

  const sortedTodos = [...upcomingTodos].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  const recentlyCompletedTodos = todos
    .filter((todo) => todo.status === "complete")
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  if (status === "loading" || loading) return <LoadingSkeletons />;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="container py-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex gap-2">
            <Button onClick={() => router.push("/todos/new")} className="w-full md:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Todo
            </Button>
            <Button onClick={() => router.push("/leave")} variant="outline" className="w-full md:w-auto">
              <FileText className="mr-2 h-4 w-4" />
              Apply Leave
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div variants={item}>
          <StatCard title="Total Tasks" value={totalTodos} description={`${completedTodos} completed, ${incompleteTodos} remaining`} />
        </motion.div>
        <motion.div variants={item}>
          <StatCard title="Completion Rate" value={`${completionRate}%`}>
            <Progress value={completionRate} className="h-2" />
          </StatCard>
        </motion.div>
        <motion.div variants={item}>
          <StatCard title="Due Today" value={todayTodos.length} description={`${todayTodos.filter(t => t.status === "complete").length} completed, ${todayTodos.filter(t => t.status === "incomplete").length} remaining`} />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Tabs defaultValue="today">
            <TabsList className="mb-4">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            </TabsList>
            <TabsContent value="today">
              <TodoListSection
                title="Today"
                todos={todayTodos}
                emptyMessage="No tasks due today"
                buttonText="Create a new task"
                buttonAction={() => router.push("/todos/new")}
              />
            </TabsContent>
            <TabsContent value="upcoming">
              <TodoListSection
                title="Upcoming"
                todos={sortedTodos}
                emptyMessage="No upcoming tasks"
                buttonText="Create a new task"
                buttonAction={() => router.push("/todos/new")}
              />
            </TabsContent>
          </Tabs>
        </div>

        <TodoListSection
          title="Recently Completed"
          todos={recentlyCompletedTodos}
          emptyMessage="No completed tasks yet"
          buttonText="Go to task list"
          buttonAction={() => router.push("/todos")}
        />
      </div>
    </div>
  );
}