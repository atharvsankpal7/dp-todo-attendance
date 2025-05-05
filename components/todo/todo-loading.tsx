import { Skeleton } from "@/components/ui/skeleton";

export default function TodosLoading() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl border bg-background p-5 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>

          <div className="space-y-2 pl-14">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
            <div className="flex items-center gap-3 pt-4">
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
