// app/todos/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function TodosLoading() {
  return (
    <div className="space-y-4">
      {Array(5).fill(null).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3 mb-3">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-3/4" />
            <div className="ml-auto">
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
          <div className="pl-9">
            <Skeleton className="h-4 w-1/2 mb-2" />
            <div className="flex items-center gap-2 mt-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <div className="ml-auto flex gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
