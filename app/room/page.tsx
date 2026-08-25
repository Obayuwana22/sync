"use client";

import { Navbar } from "@/components/Navbar";
import { RoomView } from "@/components/RoomView";
import React from "react";

export default function RoomPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-zinc-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-200 selection:bg-indigo-500/20 selection:text-indigo-400">
      <Navbar />
      <RoomView />
    </div>
  );
}
