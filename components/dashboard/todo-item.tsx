import { useRouter } from "next/navigation";
import { CheckCircle, CircleDashed, Clock, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { formatDate } from "@/lib/utils";

export function TodoItem({ todo }: { todo: any }) {
  const router = useRouter();

  const isUrgent = todo.priority === "urgent";
  const isComplete = todo.status === "complete";

  return (
    <div
      key={todo._id}
      className={`flex flex-col sm:flex-row items-start justify-between p-4 rounded-lg border gap-4 sm:gap-0 transition-all duration-300
        ${isUrgent ? "border-red-600 " : "border-muted "}
      `}
    >
      <div className="flex items-start gap-3 w-full sm:w-auto">
        {isComplete ? (
          <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-500 mt-0.5" />
        ) : (
          <CircleDashed className={`h-5 w-5 flex-shrink-0 mt-0.5 ${isUrgent ? "text-red-500 animate-pulse" : "text-amber-500"}`} />
        )}
        <div>
          <p className="font-medium break-words">{todo.title}</p>
          {isUrgent && (
            <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full mt-1 inline-block">
              URGENT
            </span>
          )}
        </div>
      </div>

      <div className="text-sm text-muted-foreground flex flex-row sm:flex-col items-start sm:items-end gap-2 sm:gap-0 w-full sm:w-auto">
        {todo.dueDate && (
          <div className="flex items-center">
            <Clock className="h-3 w-3 flex-shrink-0 mr-1" />
            <span>{format(new Date(todo.dueDate), "h:mm a")}</span>
          </div>
        )}
        {todo.updatedAt && <span>{formatDate(todo.updatedAt)}</span>}
      </div>
    </div>
  );
}
