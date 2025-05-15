import { Loader2 } from "lucide-react";

export default function DailyReportLoading() {
  return (
    <div className="container py-10">
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p>Loading reports...</p>
        </div>
      </div>
    </div>
  );
}
