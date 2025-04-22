import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoose";
import Todo from "@/models/todo";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDB();

    const todo = await Todo.findById(params.id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    if (!todo) {
      return NextResponse.json(
        { message: "Todo not found" },
        { status: 404 }
      );
    }

    // Check permissions
    const isOwner = todo.assignedTo._id.toString() === session.user.id;
    const isCreator = todo.createdBy._id.toString() === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isOwner && !isCreator && !isAdmin) {
      return NextResponse.json(
        { message: "Not authorized to view this todo" },
        { status: 403 }
      );
    }

    return NextResponse.json(todo);
  } catch (error) {
    console.error("Error fetching todo:", error);
    return NextResponse.json(
      { message: "Error fetching todo" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { title, description, assignedTo, dueDate, status, incompleteReason } = await req.json();
    
    await connectToDB();

    // Get the existing todo
    const todo = await Todo.findById(params.id);
    
    if (!todo) {
      return NextResponse.json(
        { message: "Todo not found" },
        { status: 404 }
      );
    }

    // Check permissions
    const isOwner = todo.assignedTo.toString() === session.user.id;
    const isCreator = todo.createdBy.toString() === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isOwner && !isCreator && !isAdmin) {
      return NextResponse.json(
        { message: "Not authorized to update this todo" },
        { status: 403 }
      );
    }

    // Update fields
    if (title) todo.title = title;
    if (description) todo.description = description;
    
    // Only admin can reassign todos
    if (isAdmin && assignedTo) {
      todo.assignedTo = assignedTo;
    }
    
    if (dueDate) todo.dueDate = dueDate;
    
    // Status update
    if (status) {
      todo.status = status;
      
      // Handle incomplete reason
      if (status === "incomplete" && incompleteReason) {
        todo.incompleteReason = incompleteReason;
      } else if (status === "complete") {
        todo.incompleteReason = undefined;
      }
    }

    await todo.save();

    // Populate the user fields
    const updatedTodo = await Todo.findById(params.id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    return NextResponse.json(updatedTodo);
  } catch (error) {
    console.error("Error updating todo:", error);
    return NextResponse.json(
      { message: "Error updating todo" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDB();

    // Get the existing todo
    const todo = await Todo.findById(params.id);
    
    if (!todo) {
      return NextResponse.json(
        { message: "Todo not found" },
        { status: 404 }
      );
    }

    // Check permissions - only creator or admin can delete
    const isCreator = todo.createdBy.toString() === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isCreator && !isAdmin) {
      return NextResponse.json(
        { message: "Not authorized to delete this todo" },
        { status: 403 }
      );
    }

    await Todo.findByIdAndDelete(params.id);

    return NextResponse.json({ message: "Todo deleted successfully" });
  } catch (error) {
    console.error("Error deleting todo:", error);
    return NextResponse.json(
      { message: "Error deleting todo" },
      { status: 500 }
    );
  }
}