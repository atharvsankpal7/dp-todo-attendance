"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import NoteForm from "@/components/forms/note-form";

export default function EditNotePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const noteId = params.id;

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await fetch(`/api/notes/${noteId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch note");
        }

        const data = await response.json();
        setNote(data);
      } catch (error) {
        console.error("Error fetching note:", error);
        router.push("/admin/notes");
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated" && session?.user?.role === "admin") {
      fetchNote();
    } else if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [status, session, router, noteId]);

  if (status === "loading" || loading) {
    return (
      <div className="container py-10">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p>Loading note...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="container py-10">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="flex flex-col items-center">
            <p className="text-lg">Note not found</p>
            <Button
              variant="link"
              className="mt-2"
              onClick={() => router.push("/admin/notes")}
            >
              Back to Notes
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Edit Note</h1>
        <p className="text-muted-foreground">Update note details</p>
      </motion.div>

      <NoteForm initialData={note} mode="edit" />
    </div>
  );
}