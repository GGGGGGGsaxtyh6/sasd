import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Collabrix – AI-Native Collaborative Workspace",
  description: "A powerful collaborative platform with real-time editing, task management, and AI assistance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
