"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();

  // Redirect authenticated users to dashboard
  if (session) {
    router.push("/dashboard");
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-3xl mx-auto"
        >
          <motion.div variants={item}>
            <div className="mx-auto w-20 h-20 bg-primary-foreground rounded-full flex items-center justify-center mb-8">
              <CheckSquare className="w-10 h-10 text-primary" />
            </div>
          </motion.div>
          
          <motion.h1
            variants={item}
            className="text-4xl md:text-6xl font-bold tracking-tight"
          >
            Manage your tasks with ease
          </motion.h1>
          
          <motion.p
            variants={item}
            className="mt-6 text-xl text-muted-foreground"
          >
            A modern todo application with team collaboration, task assignment, and progress tracking.
          </motion.p>
          
          <motion.div
            variants={item}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              onClick={() => router.push("/auth/signup")}
              className="text-lg px-8"
            >
              Get Started
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/auth/signin")}
              className="text-lg px-8"
            >
              Sign In
            </Button>
          </motion.div>
        </motion.div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="py-12 bg-muted/40"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <CheckSquare className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Task Management</h3>
              <p className="text-muted-foreground">Create, update, and organize tasks with intuitive interfaces.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <CheckSquare className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Team Collaboration</h3>
              <p className="text-muted-foreground">Assign tasks to team members and track progress together.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <CheckSquare className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Progress Tracking</h3>
              <p className="text-muted-foreground">Monitor task completion status and understand why tasks are delayed.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}