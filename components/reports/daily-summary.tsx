
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface DailySummaryProps {
  date: Date;
  completedTasks: string[];
  existingSummary?: string;
}

export default function DailySummary({ date, completedTasks, existingSummary }: DailySummaryProps) {
  const [summary, setSummary] = useState(existingSummary || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!summary.trim()) {
      toast.error("Please enter a summary for the day");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary,
          date,
          tasksCompleted: completedTasks,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save daily summary");
      }

      toast.success("Daily summary saved successfully");
      router.refresh();
    } catch (error) {
      console.error("Error saving daily summary:", error);
      toast.error("Failed to save daily summary");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div>
        <h3 className="text-lg font-semibold mb-2">Today&apos;s Summary</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Provide a summary of your completed tasks and achievements for the day.
        </p>
        <Textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Enter your daily summary..."
          className="min-h-[200px]"
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Summary"
        )}
      </Button>
    </motion.div>
  );
}