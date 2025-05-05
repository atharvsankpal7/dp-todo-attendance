"use client";
import TodosContent from "@/components/todo/todo-content";


export default function TodosPage() {
  return (
    // <Suspense fallback={
    //   <div className="container py-10">
    //     <div className="flex justify-center items-center min-h-[50vh]">
    //       <div className="flex flex-col items-center">
    //         <Loader2 className="h-8 w-8 animate-spin mb-4" />
    //         <p>Loading todos...</p>
    //       </div>
    //     </div>
    //   </div>
    // }>
    //   <TodosContent />
    // </Suspense>
    <TodosContent/>
  );
}