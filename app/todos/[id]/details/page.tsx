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
  AlertCircle,
  Clock,
  User,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

export default function TodoDetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const todoId = params.id;

  const [todo, setTodo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchTodo();
    } else if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router, todoId]);

  if (status === "loading" || loading) {
    return (
      <div className="container py-10">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p>Loading task details...</p>
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
            <p className="text-lg">Task not found</p>
            <Button
              variant="link"
              className="mt-2"
              onClick={() => router.push("/todos")}
            >
              Back to Tasks
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isCreator = todo.createdBy._id === session?.user?.id;
  const isAdmin = session?.user?.role === "admin";
  const canEdit = isCreator || isAdmin;

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
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Task Details</h1>
          {canEdit && (
            <Button onClick={() => router.push(`/todos/${todoId}`)}>
              Edit Task
            </Button>
          )}
        </div>
      </motion.div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  {todo.title}
                  {todo.priority === "urgent" && (
                    <Badge variant="destructive" className="animate-pulse">
                      URGENT
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Created by {todo.createdBy.name} on{" "}
                  {format(new Date(todo.createdAt), "PPP")}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {todo.status === "complete" ? (
                  <Badge variant="default" className="bg-green-500/10 text-green-700">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Completed
                  </Badge>
                ) : (
                  <Badge variant="default" className="bg-amber-500/10 text-amber-700">
                    <CircleDashed className="mr-1 h-3 w-3" />
                    Pending
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-muted-foreground">
                  {todo.description || "No description provided"}
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <div>
                  <h3 className="font-medium mb-2">Due Date</h3>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {format(new Date(todo.dueDate), "PPP p")}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Assigned To</h3>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    {todo.assignedTo.name}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Version</h3>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <History className="h-4 w-4" />
                    v{todo.version}
                  </div>
                </div>
              </div>

              {todo.status === "incomplete" && todo.incompleteReason && (
                <div className="mt-4 rounded-md bg-amber-50 p-4 text-amber-900">
                  <h3 className="font-medium mb-2">Reason for Incomplete Status</h3>
                  <p>{todo.incompleteReason}</p>
                </div>
              )}
            </div>

            <div>
              <h3 className="font-medium mb-4">Edit History</h3>
              {todo.editHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Editor</TableHead>
                      <TableHead>Changes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {todo.editHistory.map((edit: any, index: number) => {
                      const changes = [];
                      const prev = edit.previousVersion;
                      
                      if (prev.title !== todo.title) changes.push("Title");
                      if (prev.description !== todo.description) changes.push("Description");
                      if (prev.status !== todo.status) changes.push("Status");
                      if (prev.priority !== todo.priority) changes.push("Priority");
                      if (new Date(prev.dueDate).getTime() !== new Date(todo.dueDate).getTime()) changes.push("Due Date");
                      if (prev.assignedTo.toString() !== todo.assignedTo._id.toString()) changes.push("Assigned User");

                      return (
                        <TableRow key={index}>
                          <TableCell>
                            {format(new Date(edit.editedAt), "PPP p")}
                          </TableCell>
                          <TableCell>{edit.editor.name}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {changes.map((change) => (
                                <Badge key={change} variant="outline">
                                  {change}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No edit history available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}