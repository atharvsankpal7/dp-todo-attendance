import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoose";
import Todo from "@/models/todo";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

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
    const title = searchParams.get("title");

    if (!title || title.length < 3) {
      return NextResponse.json({ suggestion: null });
    }

    await connectToDB();

    // Find the most recent todo that starts with the search term
    const suggestion = await Todo.findOne({
      title: { $regex: `^${title}`, $options: 'i' }
    })
    .sort({ createdAt: -1 })
    .select('title')
    .lean();

    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error("Error fetching todo suggestions:", error);
    return NextResponse.json(
      { message: "Error fetching suggestions" },
      { status: 500 }
    );
  }
}