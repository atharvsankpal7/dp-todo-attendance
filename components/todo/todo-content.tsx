"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import TodoList from "@/components/todo/todo-list";
import TodosLoading from "@/components/todo/todo-loading";

export default function TodosContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [todos, setTodos] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = session?.user?.role === "admin";
  const dateParam = searchParams.get("date");
  const assignedToParam = searchParams.get("assignedTo");

  useEffect(() => {
    const fetchTodos = async () => {
      if (status === "authenticated") {
        try {
          let url = "/api/todos";
          const params = new URLSearchParams();

          if (dateParam) {
            params.append("date", dateParam);
          }

          if (assignedToParam && isAdmin) {
            params.append("assignedTo", assignedToParam);
          }

          if (params.toString()) {
            url += `?${params.toString()}`;
          }

          const response = await fetch(url);
          const data = await response.json();
          setTodos(data);
        } catch (error) {
          console.error("Error fetching todos:", error);
        }
      }
    };

    const fetchUsers = async () => {
      if (status === "authenticated" && isAdmin) {
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
      Promise.all([fetchTodos(), fetchUsers()]).finally(async () => {
        setLoading(false);
      });
    } else if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, isAdmin, router, dateParam, assignedToParam]);



  return (
    <div className="container py-10">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold mb-6">Todo List</h1>
      </motion.div>

      <TodoList todos={todos} isAdmin={isAdmin} users={users} />
    </div>
  );
}