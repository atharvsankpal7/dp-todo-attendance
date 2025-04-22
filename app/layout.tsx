import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import NextAuthProvider from "@/components/providers/nextauth-provider";
import { ThemeProvider } from "@/components/ui/theme-provider";
import Navbar from "@/components/layout/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Todo App",
  description: "A modern todo application with user and admin roles",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="system" 
          enableSystem 
          disableTransitionOnChange
        >
          <NextAuthProvider>
            <Navbar />
            <main className="pt-16 min-h-screen">
              {children}
            </main>
            <Toaster position="top-center" />
          </NextAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}