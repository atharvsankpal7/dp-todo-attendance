import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoose";
import Todo from "@/models/todo";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const assignedTo = searchParams.get("assignedTo");
    const date = searchParams.get("date");
    
    await connectToDB();

    let query: any = {};
    
    // If admin and assignedTo parameter provided, filter by assignedTo
    if (session.user.role === "admin" && assignedTo) {
      query.assignedTo = assignedTo;
    } else {
      // Regular users can only see their own todos
      query.assignedTo = session.user.id;
    }

    // Filter by date if provided
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      query.dueDate = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }

    const todos = await Todo.find(query)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json(todos);
  } catch (error) {
    console.error("Error fetching todos:", error);
    return NextResponse.json(
      { message: "Error fetching todos" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { title, description, assignedTo, dueDate } = await req.json();
    
    if (!title || !dueDate) {
      return NextResponse.json(
        { message: "Title and due date are required" },
        { status: 400 }
      );
    }

    await connectToDB();

    // Determine the assignedTo value
    let assignTo = session.user.id; // Default to current user
    
    // If admin is assigning to another user
    if (session.user.role === "admin" && assignedTo) {
      assignTo = assignedTo;
    }

    const newTodo = await Todo.create({
      title,
      description,
      assignedTo: assignTo,
      dueDate,
      status: "incomplete",
      createdBy: session.user.id,
    });

    // Populate the user fields
    const populatedTodo = await newTodo.populate([
      { path: "assignedTo", select: "name email" },
      { path: "createdBy", select: "name email" }
    ]);

    return NextResponse.json(populatedTodo, { status: 201 });
  } catch (error) {
    console.error("Error creating todo:", error);
    return NextResponse.json(
      { message: "Error creating todo" },
      { status: 500 }
    );
  }
}