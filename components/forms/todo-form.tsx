import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CalendarIcon, Clock, Loader2, Plus } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const todoSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  assignedTo: z.string().optional(),
  dueDate: z.date({
    required_error: "Due date is required",
  }),
  dueTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter a valid time in HH:mm format"),
  noteId: z.string().optional(),
  images: z.array(z.string()).optional(),
});

type TodoFormValues = z.infer<typeof todoSchema>;

interface User {
  _id: string;
  name: string;
  email: string;
}

interface TodoFormProps {
  isAdmin?: boolean;
  users?: User[];
  initialData?: any;
  mode?: "create" | "edit";
}

export default function TodoForm({ isAdmin = false, users = [], initialData, mode = "create" }: TodoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const router = useRouter();

  const defaultValues = initialData
    ? {
        ...initialData,
        dueDate: new Date(initialData.dueDate),
        dueTime: format(new Date(initialData.dueDate), "HH:mm"),
        assignedTo: initialData.assignedTo._id || initialData.assignedTo,
        noteId: initialData.noteId?._id,
      }
    : {
        title: "",
        description: "",
        dueDate: new Date(),
        dueTime: format(new Date(), "HH:mm"),
        images: [],
      };

  const form = useForm<TodoFormValues>({
    resolver: zodResolver(todoSchema),
    defaultValues,
  });

  const fetchNotes = async () => {
    try {
      const response = await fetch("/api/notes");
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast.error("Failed to fetch notes");
    }
  };

  const handleNoteSelect = async (note: any) => {
    setSelectedNote(note);
    form.setValue("description", note.description);
    form.setValue("noteId", note._id);
    form.setValue("images", [...(form.getValues("images") || []), ...(note.images || [])]);
    
    // Update note's usedAsDescription status
    try {
      await fetch(`/api/notes/${note._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usedAsDescription: true,
        }),
      });
    } catch (error) {
      console.error("Error updating note status:", error);
    }
    
    setIsNotesDialogOpen(false);
  };

  const onSubmit = async (data: TodoFormValues) => {
    setIsSubmitting(true);
    try {
      const [hours, minutes] = data.dueTime.split(":").map(Number);
      const dueDateTime = new Date(data.dueDate);
      dueDateTime.setHours(hours, minutes);

      const url = mode === "create" ? "/api/todos" : `/api/todos/${initialData._id}`;
      const method = mode === "create" ? "POST" : "PUT";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          dueDate: dueDateTime.toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save todo");
      }

      toast.success(mode === "create" ? "Todo created successfully" : "Todo updated successfully");
      router.push("/todos");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter todo title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <div className="flex gap-2">
                  <FormControl className="flex-1">
                    <Textarea
                      placeholder="Enter a detailed description (optional)"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="shrink-0"
                        onClick={() => fetchNotes()}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Note
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Select Note</DialogTitle>
                        <DialogDescription>
                          Choose a note to use as the description for this todo
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        {notes.map((note: any) => (
                          <div
                            key={note._id}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                              note.usedAsDescription
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:border-primary"
                            }`}
                            onClick={() => !note.usedAsDescription && handleNoteSelect(note)}
                          >
                            <h3 className="font-medium">{note.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {note.description}
                            </p>
                            {note.usedAsDescription && (
                              <p className="text-sm text-yellow-600 mt-2">
                                This note is already used in another todo
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {isAdmin && users.length > 0 && (
            <FormField
              control={form.control}
              name="assignedTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign To</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user._id} value={user._id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select a user to assign this todo
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={`w-full pl-3 text-left font-normal ${
                            !field.value ? "text-muted-foreground" : ""
                          }`}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Time</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="time"
                        {...field}
                        className="pl-8"
                      />
                      <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === "create" ? "Creating..." : "Updating..."}
              </>
            ) : (
              <>{mode === "create" ? "Create Todo" : "Update Todo"}</>
            )}
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}