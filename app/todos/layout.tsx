"use client"
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {Calendar as DatePicker} from "@/components/ui/calendar"; 
import { useSession } from "next-auth/react";

export default function TodosLayout({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  return (
    <div className="container py-10 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold">Todo List</h1>
        <Button>Create Todo</Button>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <Input placeholder="Search todos..." className="w-60" />
        <DatePicker />
        {isAdmin && <Input placeholder="Filter by user..." className="w-60" />}
      </div>

      <div>{children}</div>
    </div>
  );
}
