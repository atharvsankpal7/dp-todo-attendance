"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TodoItemLoading() {
  return (
    <div className="container py-10">
      <div className="mb-6">
        <Button variant="ghost" className="mb-4" disabled>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Description + Add Note */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <div className="flex gap-2">
            <Skeleton className="h-24 flex-1" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>

        {/* Assigned To (admin only placeholder) */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Due Date + Due Time */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        {/* Submit Button */}
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
