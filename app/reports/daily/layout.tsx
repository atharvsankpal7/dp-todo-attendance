import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daily Progress Report",
  description: "Track and summarize your daily tasks and achievements",
};

export default function DailyReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Daily Progress Report</h1>
        <p className="text-muted-foreground">
          Track and summarize your daily tasks and achievements
        </p>
      </div>
      {children}
    </div>
  );
}