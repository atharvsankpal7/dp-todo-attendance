import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function DailyReportLoading() {
  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <Skeleton className="h-10 w-[150px]" />
        <Skeleton className="h-10 w-[200px] md:ml-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Tasks Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-[120px]" />
                <Skeleton className="h-6 w-8" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-[120px]" />
                <Skeleton className="h-6 w-8" />
              </div>
            </div>

            <div className="mt-6">
              <Skeleton className="h-5 w-[100px] mb-3" />
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}