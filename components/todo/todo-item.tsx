"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "sonner";
import { CheckCircle, CircleDashed, Edit, Trash2, Calendar, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TodoItemProps {
  todo: any;
  isAdmin?: boolean;
  onUpdate?: () => void;
  onDelete?: () => void;
}

export default function TodoItem({ todo, isAdmin = false, onUpdate, onDelete }: TodoItemProps) {
  const router = useRouter();
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [incompleteReason, setIncompleteReason] = useState(todo.incompleteReason || "");
  const [selectedStatus, setSelectedStatus] = useState(todo.status);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStatusChange = async () => {
    setIsSubmitting(true);
    
    try {
      if (selectedStatus === "incomplete" && !incompleteReason.trim()) {
        toast.error("Please provide a reason for marking as incomplete");
        return;
      }

      const response = await fetch(`/api/todos/${todo._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: selectedStatus,
          incompleteReason: selectedStatus === "incomplete" ? incompleteReason : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update todo status");
      }

      toast.success(`Todo marked as ${selectedStatus}`);
      setIsStatusDialogOpen(false);
      
      // Call the onUpdate callback to refresh the todo list
      if (onUpdate) {
        onUpdate();
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/todos/${todo._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete todo");
      }

      toast.success("Todo deleted successfully");
      setIsDeleteDialogOpen(false);
      
      // Call the onDelete callback to refresh the todo list
      if (onDelete) {
        onDelete();
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div variants={item} layout>
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {todo.status === "complete" ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <CircleDashed className="h-5 w-5 text-amber-500" />
                )}
                <h3 className="font-semibold tracking-tight text-lg">{todo.title}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(todo.dueDate)}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {format(new Date(todo.dueDate), "h:mm a")}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {todo.assignedTo.name}
                </Badge>
                <Badge 
                  variant={todo.status === "complete" ? "outline" : "default"}
                  className={`${todo.status === "complete" ? "bg-green-500/10 text-green-700 hover:bg-green-500/20" : "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20"}`}
                >
                  {todo.status === "complete" ? "Completed" : "Pending"}
                </Badge>
              </div>
            </div>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(`/todos/${todo._id}`)}
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {todo.description || "No description provided"}
          </p>
          
          {todo.status === "incomplete" && todo.incompleteReason && (
            <div className="mt-3 rounded-md bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
              <p className="font-medium">Reason for incomplete status:</p>
              <p className="mt-1">{todo.incompleteReason}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t px-6 py-3">
          <div className="text-xs text-muted-foreground">
            Created by {todo.createdBy.name}
          </div>
          <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                Update Status
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Update Todo Status</DialogTitle>
                <DialogDescription>
                  Choose a status for this todo. If marking as incomplete, please provide a reason.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="complete">Complete</SelectItem>
                    <SelectItem value="incomplete">Incomplete</SelectItem>
                  </SelectContent>
                </Select>

                {selectedStatus === "incomplete" && (
                  <Textarea
                    placeholder="Enter reason for incomplete status"
                    value={incompleteReason}
                    onChange={(e) => setIncompleteReason(e.target.value)}
                    className="w-full"
                    disabled={isSubmitting}
                  />
                )}
              </div>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsStatusDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleStatusChange}
                  disabled={isSubmitting}
                >
                  Update Status
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Todo</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this todo? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}