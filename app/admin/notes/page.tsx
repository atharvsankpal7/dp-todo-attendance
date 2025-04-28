"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PlusCircle, Loader2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default function NotesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      if (status === "authenticated") {
        try {
          const response = await fetch("/api/notes");
          const data = await response.json();
          setNotes(data);
        } catch (error) {
          console.error("Error fetching notes:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (status === "authenticated") {
      fetchNotes();
    } else if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="container py-10">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p>Loading notes...</p>
          </div>
        </div>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="container py-10">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold">Notes</h1>
          {session?.user?.role === "admin" && (
            <Button onClick={() => router.push("/admin/notes/new")}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Note
            </Button>
          )}
        </div>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {notes.map((note: any) => (
          <motion.div key={note._id} variants={item}>
            <Card className="h-full">
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <CardTitle className="line-clamp-2">{note.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Created by {note.createdBy.name}
                    </p>
                  </div>
                  {note.usedAsDescription && (
                    <Badge variant="secondary">
                      <Tag className="h-3 w-3 mr-1" />
                      Used
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {note.description}
                </p>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>{formatDate(note.createdAt)}</span>
                  {note.images?.length > 0 && (
                    <span>{note.images.length} image(s)</span>
                  )}
                </div>
                {session?.user?.role === "admin" && (
                  <div className="mt-4 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/admin/notes/${note._id}`)}
                    >
                      Edit
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}