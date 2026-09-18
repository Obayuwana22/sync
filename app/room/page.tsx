"use client";

import { Navbar } from "@/components/Navbar";
import { RoomView } from "@/components/RoomView";
import { GuestBanner } from "@/components/GuestBanner";
import { useRoom } from "@/context/RoomContext";
import React, { useState } from "react";
import { NudgeToastContainer } from "@/components/NudgeToastContainer";

export default function RoomPage() {
  const { isAuthenticated, setIsAuthModalOpen } = useRoom();
  const [bannerDismissed, setBannerDismissed] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-zinc-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-200 selection:bg-indigo-500/20 selection:text-indigo-400">
      <Navbar />
      {!isAuthenticated && !bannerDismissed && (
        <GuestBanner
          onSignInClick={() => setIsAuthModalOpen(true)}
          onDismiss={() => setBannerDismissed(true)}
        />
      )}
      <RoomView />
      <NudgeToastContainer />
    </div>
  );
}
