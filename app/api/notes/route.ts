import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoose";
import Note from "@/models/note";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const notes = await Note.find({})
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { message: "Error fetching notes" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { title, description, images } = await req.json();

    if (!title || !description) {
      return NextResponse.json(
        { message: "Title and description are required" },
        { status: 400 }
      );
    }

    await connectToDB();

    const newNote = await Note.create({
      title,
      description,
      images: images || [],
      createdBy: session.user.id,
    });

    const populatedNote = await newNote.populate("createdBy", "name email");

    return NextResponse.json(populatedNote, { status: 201 });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { message: "Error creating note" },
      { status: 500 }
    );
  }
}
