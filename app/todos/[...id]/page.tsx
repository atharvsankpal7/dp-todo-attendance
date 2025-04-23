"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import TodoForm from "@/components/forms/todo-form";

export default function EditTodoPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const todoId = params.id;

  const [todo, setTodo] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = session?.user?.role === "admin";

  useEffect(() => {
    const fetchTodo = async () => {
      try {
        const response = await fetch(`/api/todos/${todoId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch todo");
        }

        const data = await response.json();
        setTodo(data);
      } catch (error) {
        console.error("Error fetching todo:", error);
        router.push("/todos");
      }
    };

    const fetchUsers = async () => {
      if (isAdmin) {
        try {
          const response = await fetch("/api/users");
          const data = await response.json();
          setUsers(data);
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      }
    };

    if (status === "authenticated") {
      Promise.all([fetchTodo(), fetchUsers()]).finally(() => {
        setLoading(false);
      });
    } else if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, isAdmin, router, todoId]);

  if (status === "loading" || loading) {
    return (
      <div className="container py-10">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p>Loading todo...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!todo) {
    return (
      <div className="container py-10">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="flex flex-col items-center">
            <p className="text-lg">Todo not found</p>
            <Button
              variant="link"
              className="mt-2"
              onClick={() => router.push("/todos")}
            >
              Back to Todos
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Edit Todo</h1>
        <p className="text-muted-foreground">Update todo details</p>
      </motion.div>

      <TodoForm
        isAdmin={isAdmin}
        users={users}
        initialData={todo}
        mode="edit"
      />
    </div>
  );
}
