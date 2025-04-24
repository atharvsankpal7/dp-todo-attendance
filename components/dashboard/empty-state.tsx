import { CalendarIcon, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({
  message,
  action,
  icon = "calendar",
}: {
  message: string;
  action: () => void;
  icon?: "calendar" | "check";
}) {
  const Icon = icon === "calendar" ? CalendarIcon : CheckCircle;
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <Icon className="h-12 w-12 text-muted-foreground/50 mb-4" />
      <p className="text-muted-foreground">{message}</p>
      <Button variant="link" className="mt-2 border-2 border-blue-400/50" onClick={action}>
        Create a new task
      </Button>
    </div>
  );
}
