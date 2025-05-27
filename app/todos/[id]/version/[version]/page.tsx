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

export default function TodoVersionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const todoId = params.id;
  const version = parseInt(params.version as string);

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
            <p>Loading version details...</p>
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

  const versionHistory = todo.editHistory[version - 2];
  if (!versionHistory) {
    return (
      <div className="container py-10">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="flex flex-col items-center">
            <p className="text-lg">Version not found</p>
            <Button
              variant="link"
              className="mt-2"
              onClick={() => router.push(`/todos/${todoId}/details`)}
            >
              Back to Todo Details
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const previousVersion = versionHistory.previousVersion;

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
          <h1 className="text-3xl font-bold">Version {version} Details</h1>
        </div>
      </motion.div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  {previousVersion.title}
                  {previousVersion.priority === "urgent" && (
                    <Badge variant="destructive">URGENT</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Edited by {versionHistory.editor.name} on{" "}
                  {format(new Date(versionHistory.editedAt), "PPP")}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {previousVersion.status === "complete" ? (
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
                  {previousVersion.description || "No description provided"}
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <div>
                  <h3 className="font-medium mb-2">Due Date</h3>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {format(new Date(previousVersion.dueDate), "PPP p")}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Priority</h3>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <History className="h-4 w-4" />
                    {previousVersion.priority}
                  </div>
                </div>
              </div>

              {previousVersion.status === "incomplete" && previousVersion.incompleteReason && (
                <div className="mt-4 rounded-md bg-amber-50 p-4 text-amber-900">
                  <h3 className="font-medium mb-2">Reason for Incomplete Status</h3>
                  <p>{previousVersion.incompleteReason}</p>
                </div>
              )}

              {previousVersion.images && previousVersion.images.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {previousVersion.images.map((image: string, index: number) => (
                      <div key={index} className="relative aspect-square">
                        <img
                          src={image}
                          alt={`Task image ${index + 1}`}
                          className="object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}