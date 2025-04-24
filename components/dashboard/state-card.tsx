import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: number | string;
  description?: string;
  children?: React.ReactNode;
}

export function StatCard({ title, value, description, children }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-4xl">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
        {children}
      </CardContent>
    </Card>
  );
}
