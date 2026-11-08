"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Mail,
  Copy,
  Check,
  Send,
  Users,
  ExternalLink,
  Shield,
  Sparkles,
  Clock,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { useRoom } from "../context/RoomContext";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose }) => {
  const {
    room,
    pendingInvites,
    sendEmailInvite,
    cancelInvite,
    participants,
    currentUser,
    joinRoomByCode,
  } = useRoom();

  const [emailInput, setEmailInput] = useState("");
  const [roleInput, setRoleInput] = useState("Focus Member");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [lastInvitedEmail, setLastInvitedEmail] = useState<string | null>(null);
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Reset feedback when modal opens
  useEffect(() => {
    if (isOpen) {
      setFeedback(null);
      setLastInvitedEmail(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const roomUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/room?code=${room.code}`
      : `https://sync.app/room?code=${room.code}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(roomUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);

    const result = await sendEmailInvite(emailInput.trim(), roleInput);
    setIsSubmitting(false);

    if (result.success) {
      const email = emailInput.trim();
      setLastInvitedEmail(email);
      setFeedback({
        type: "success",
        message: `Invite prepared for ${email}! Share the link or open your email client below.`,
      });
      setEmailInput("");
    } else {
      setFeedback({
        type: "error",
        message: result.error || "Failed to send invite.",
      });
    }
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = joinCodeInput.trim().toUpperCase();
    if (!clean) {
      setJoinError("Please enter a room code (e.g. SYNC-1234)");
      return;
    }
    if (clean === room.code) {
      setJoinError("You are already in this room!");
      return;
    }
    joinRoomByCode(clean);
    onClose();
  };

  // Generate mailto link for direct one-click email client dispatch
  const getMailtoHref = (targetEmail?: string) => {
    const recipient = targetEmail || emailInput.trim() || "";
    const subject = encodeURIComponent(`Join our focus session on Sync (${room.code})`);
    const body = encodeURIComponent(
      `Hi,\n\nI'm in a live focus sprint on Sync and would love for you to join!\n\n` +
      `Room Topic: ${room.name || 'Deep Work Session'}\n` +
      `Room Code: ${room.code}\n` +
      `Join directly here: ${roomUrl}\n\n` +
      `No camera or audio needed—just calm presence, live status dots, and shared accountability.\n\n` +
      `Best,\n${currentUser.name}`
    );
    return `mailto:${recipient}?subject=${subject}&body=${body}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gradient Stripe */}
        {/* <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" /> */}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-zinc-800 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
          title="Close modal"
          id="close-invite-modal-btn"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 sm:p-7 space-y-6">
          {/* Header */}
          <div className="flex items-start space-x-3.5">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                Invite Teammates
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-zinc-400 mt-0.5">
                Focus together in real-time. Invite via email or share the room link.
              </p>
            </div>
          </div>

          {/* 1. Email Invitation Section */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-neutral-700 dark:text-zinc-300 uppercase tracking-wider">
              Invite by Email Address
            </label>

            <form onSubmit={handleSendInvite} className="space-y-2.5">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-4 w-4 text-neutral-400" />
                  </div>
                  <input
                    type="email"
                    placeholder="teammate@company.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-zinc-700 bg-white dark:bg-zinc-950/80 pl-9 pr-3 py-2 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    autoFocus
                    id="invite-email-input"
                  />
                </div>

                <select
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value)}
                  className="rounded-lg border border-neutral-300 dark:border-zinc-700 bg-white dark:bg-zinc-950/80 px-3 py-2 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 focus:border-indigo-500 focus:outline-none"
                  id="invite-role-select"
                >
                  <option value="Focus Member">Focus Member</option>
                  <option value="Frontend Dev">Frontend Dev</option>
                  <option value="Backend Dev">Backend Dev</option>
                  <option value="Designer">Designer</option>
                  <option value="Product Lead">Product Lead</option>
                </select>

                <button
                  type="submit"
                  disabled={!emailInput.trim() || isSubmitting}
                  className="inline-flex items-center justify-center space-x-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs transition-colors cursor-pointer"
                  id="submit-email-invite-btn"
                >
                  {isSubmitting ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Invite</span>
                    </>
                  )}
                </button>
              </div>

              {/* Feedback Alert */}
              {feedback && (
                <div
                  className={`flex items-start space-x-2 p-2.5 rounded-lg text-xs ${
                    feedback.type === "success"
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20"
                  }`}
                >
                  {feedback.type === "success" ? (
                    <Check className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <span>{feedback.message}</span>
                    {feedback.type === "success" && lastInvitedEmail && (
                      <div className="mt-1.5 flex items-center space-x-2">
                        <a
                          href={getMailtoHref(lastInvitedEmail)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 font-semibold underline text-indigo-600 dark:text-indigo-400 hover:opacity-80"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>Open pre-filled email in Mail app</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Divider with 'OR' badge */}
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-neutral-200 dark:border-zinc-800" />
            <span className="absolute bg-white dark:bg-zinc-900 px-3 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">
              or share room link
            </span>
          </div>

          {/* 2. Instant Shareable Link & Room Code */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-700 dark:text-zinc-300 uppercase tracking-wider">
                Instant Room Link & Code
              </span>
              <span className="text-[11px] text-neutral-400">
                No signup required for guests
              </span>
            </div>

            {/* Link Box */}
            <div className="flex items-center space-x-2 rounded-lg border border-neutral-200 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-950 p-2">
              <input
                type="text"
                readOnly
                value={roomUrl}
                className="flex-1 bg-transparent text-xs font-mono text-neutral-700 dark:text-zinc-300 outline-none truncate"
                id="share-room-url-field"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center space-x-1 rounded-md bg-white dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 px-2.5 py-1 text-xs font-medium text-neutral-700 dark:text-zinc-200 hover:bg-neutral-100 dark:hover:bg-zinc-750 transition-colors cursor-pointer"
                id="copy-invite-link-btn"
              >
                {copiedLink ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-neutral-400" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>

            {/* Room Code Badge */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-zinc-800/80 bg-neutral-50/50 dark:bg-zinc-950/40">
              <div className="flex items-center space-x-2.5">
                <span className="text-xs text-neutral-500 dark:text-zinc-400">Room Code:</span>
                <span className="font-mono text-sm font-bold tracking-wider text-neutral-900 dark:text-neutral-100 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded border border-neutral-200 dark:border-zinc-700">
                  {room.code}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="text-xs text-neutral-500 hover:text-neutral-800 dark:text-zinc-400 dark:hover:text-zinc-200 inline-flex items-center space-x-1 cursor-pointer"
                id="copy-room-code-btn"
              >
                {copiedCode ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-500 font-medium">Copied Code</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 3. Pending Invites (if any) */}
          {pendingInvites.length > 0 && (
            <div className="pt-2 border-t border-neutral-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-700 dark:text-zinc-300 uppercase tracking-wider">
                  Pending Invites ({pendingInvites.length})
                </span>
                <span className="text-[10px] text-amber-500 dark:text-amber-400 font-medium">
                  Awaiting teammate to join
                </span>
              </div>

              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {pendingInvites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between p-2 rounded-lg border border-neutral-200/80 dark:border-zinc-800 bg-neutral-50/50 dark:bg-zinc-950/30 text-xs"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center space-x-1.5 truncate">
                        <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate">
                          {invite.email}
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          • {invite.role}
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-400 flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>Invited just now</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <a
                        href={getMailtoHref(invite.email)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Send invite via email app"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => cancelInvite(invite.id)}
                        className="p-1 rounded text-neutral-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Cancel invite"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Join another Room by Code */}
          <div className="pt-2 border-t border-neutral-200 dark:border-zinc-800 space-y-2">
            <span className="block text-xs font-semibold text-neutral-700 dark:text-zinc-300 uppercase tracking-wider">
              Have a code from a teammate?
            </span>
            <form onSubmit={handleJoinSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. SYNC-8899"
                value={joinCodeInput}
                onChange={(e) => {
                  setJoinCodeInput(e.target.value);
                  setJoinError(null);
                }}
                className="flex-1 rounded-lg border border-neutral-300 dark:border-zinc-700 bg-white dark:bg-zinc-950/80 px-3 py-1.5 text-xs font-mono uppercase text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:border-indigo-500 focus:outline-none"
                id="join-room-code-input"
              />
              <button
                type="submit"
                disabled={!joinCodeInput.trim()}
                className="inline-flex items-center justify-center rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 disabled:opacity-50 px-3.5 py-1.5 text-xs font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors cursor-pointer"
                id="join-room-code-btn"
              >
                Join Room
              </button>
            </form>
            {joinError && (
              <p className="text-[11px] text-rose-500 font-medium">{joinError}</p>
            )}
          </div>

          {/* 5. Real-Time Sync Indicator Info */}
          <div className="p-2.5 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-800/40 text-[11px] text-indigo-700 dark:text-indigo-300 flex items-start space-x-2">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
            <span>
              <strong>WebSocket Sync:</strong> When your teammate joins, you can assign tasks to each other and get instant live notifications when either person moves or completes a task.
            </span>
          </div>

          {/* 6. Active Live Members Overview */}
          <div className="pt-2 border-t border-neutral-200 dark:border-zinc-800 flex items-center justify-between text-xs text-neutral-500 dark:text-zinc-400">
            <div className="flex items-center space-x-1.5">
              <Users className="h-3.5 w-3.5 text-emerald-500" />
              <span>
                Active in room now:{" "}
                <strong className="text-neutral-900 dark:text-neutral-100 font-semibold">
                  {participants.length}
                </strong>
              </span>
            </div>
            <div className="flex -space-x-1.5">
              {participants.slice(0, 4).map((p) => (
                <img
                  key={p.id}
                  src={
                    p.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=6366f1&color=fff`
                  }
                  alt={p.name}
                  className="h-5 w-5 rounded-full border border-white dark:border-zinc-900 object-cover"
                  title={p.name}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
