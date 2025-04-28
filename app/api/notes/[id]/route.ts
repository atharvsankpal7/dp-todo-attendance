import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoose";
import Note from "@/models/note";
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

    const note = await Note.findById(params.id)
      .populate("createdBy", "name email");

    if (!note) {
      return NextResponse.json(
        { message: "Note not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error("Error fetching note:", error);
    return NextResponse.json(
      { message: "Error fetching note" },
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
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { title, description, images, usedAsDescription } = await req.json();
    
    await connectToDB();

    const note = await Note.findById(params.id);
    
    if (!note) {
      return NextResponse.json(
        { message: "Note not found" },
        { status: 404 }
      );
    }

    // Update fields
    if (title) note.title = title;
    if (description) note.description = description;
    if (images) note.images = images;
    if (typeof usedAsDescription === "boolean") note.usedAsDescription = usedAsDescription;

    await note.save();

    const updatedNote = await note.populate("createdBy", "name email");

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json(
      { message: "Error updating note" },
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
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    await connectToDB();

    const note = await Note.findById(params.id);
    
    if (!note) {
      return NextResponse.json(
        { message: "Note not found" },
        { status: 404 }
      );
    }

    await Note.findByIdAndDelete(params.id);

    return NextResponse.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json(
      { message: "Error deleting note" },
      { status: 500 }
    );
  }
}