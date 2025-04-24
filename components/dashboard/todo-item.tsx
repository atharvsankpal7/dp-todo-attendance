import { useRouter } from "next/navigation";
import { CheckCircle, CircleDashed, Clock } from "lucide-react";
import { format } from "date-fns";
import { formatDate } from "@/lib/utils";

export function TodoItem({ todo }: { todo: any }) {
  const router = useRouter();

  return (
    <div
      key={todo._id}
      className="flex items-start justify-between p-4 rounded-lg border cursor-pointer"
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
      <div className="text-sm text-muted-foreground flex items-center">
        {todo.dueDate && (
          <>
            <Clock className="h-3 w-3 mr-1" />
            <span>{format(new Date(todo.dueDate), "h:mm a")}</span>
          </>
        )}
        {todo.updatedAt && <span>{formatDate(todo.updatedAt)}</span>}
      </div>
    </div>
  );
}
