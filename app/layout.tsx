import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { RoomProvider } from "@/context/RoomContext";
// import { NudgeToastContainer } from "@/components/NudgeToastContainer";
import { AuthProvider } from "@/components/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sync | Calm Live Focus Rooms & Co-Working for Remote Teams",
  description: "Sync is a calm, real-time co-working platform featuring live teammate presence status, synced Pomodoro timers, shared task boards, and silent focus rooms without video meeting fatigue.",
  keywords: ["co-working", "deep work", "pomodoro timer", "remote teams", "focus room", "real-time presence", "task management", "productivity"],
  openGraph: {
    title: "Sync | Calm Live Focus Rooms for Team Flow",
    description: "See live presence status, share real-time task progress, and keep each other accountable in quiet focus rooms.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <RoomProvider>
            {children}
            {/* <NudgeToastContainer /> */}
          </RoomProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

