"use client";

import React from 'react';
import { ParticipantsSidebar } from './ParticipantsSidebar';
import { TaskList } from './TaskList';

export const RoomView: React.FC = () => {
  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-3.5rem)] w-full">
      <ParticipantsSidebar />
      <TaskList />
    </div>
  );
};
