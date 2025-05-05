import { Skeleton } from "@/components/ui/skeleton";

export default function NewTodoLoading() {
  return (
    <div className="container py-10">
      {/* Header Section Skeleton */}
      <div className="mb-6">
        <Skeleton className="h-9 w-24 mb-4" /> {/* Back button */}
        <Skeleton className="h-10 w-48 mb-2" /> {/* Page title */}
        <Skeleton className="h-5 w-64" /> {/* Subtitle */}
      </div>

      {/* Form Skeleton */}
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Title Field */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-20" /> {/* Label */}
          <Skeleton className="h-10 w-full" /> {/* Input */}
        </div>

        {/* Description Field */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-28" /> {/* Label */}
          <Skeleton className="h-32 w-full" /> {/* Textarea */}
        </div>

        {/* Due Date Field */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-24" /> {/* Label */}
          <Skeleton className="h-10 w-full" /> {/* Date picker */}
        </div>

        {/* Priority Field */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-20" /> {/* Label */}
          <div className="flex gap-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        {/* Assigned To Field (for admin) */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-28" /> {/* Label */}
          <Skeleton className="h-10 w-full" /> {/* Select */}
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Skeleton className="h-10 w-32" /> {/* Button */}
        </div>
      </div>
    </div>
  );
}