import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "./empty-state";
import { TodoItem } from "./todo-item";

export function TodoListSection({
  title,
  todos,
  emptyMessage,
  buttonText,
  buttonAction,
}: {
  title: string;
  todos: any[];
  emptyMessage: string;
  buttonText: string;
  buttonAction: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {todos.length === 0 ? (
          <EmptyState message={emptyMessage} action={buttonAction} />
        ) : (
          <div className="space-y-4">
            {todos.map((todo) => (
              <TodoItem key={todo._id} todo={todo} />
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full border-2 border-blue-400/50" onClick={buttonAction}>
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
}
