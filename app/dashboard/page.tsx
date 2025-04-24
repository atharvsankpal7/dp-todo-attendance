"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { StatCard } from "@/components/dashboard/state-card";
import { TodoListSection } from "@/components/dashboard/todo-list";
import { LoadingSkeletons } from "@/components/dashboard/loading-skeleton";

export default function DashboardPage() {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      return res.json();
    },
  });

  if (isLoading) return <LoadingSkeletons />;

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Tasks" value={data.totalTodos} />
        <StatCard
          title="Completion Rate"
          value={`${data.completionRate.toFixed(0)}%`}
          description="Compared to previous 30 days"
        />
        <StatCard title="Total Completed" value={data.completedTodos} />
      </div>

      {/* Today & Upcoming */}
      <TodoListSection
        title="Today & Upcoming"
        todos={data.todayAndUpcomingTodos}
        emptyMessage="No tasks scheduled. Plan your day!"
        buttonText="Create New Task"
        buttonAction={() => router.push("/todos/new")}
      />

      {/* Recently Completed */}
      <TodoListSection
        title="Recently Completed"
        todos={data.recentlyCompletedTodos}
        emptyMessage="You haven’t completed any tasks recently."
        buttonText="View All"
        buttonAction={() => router.push("/todos")}
      />
    </div>
  );
}
