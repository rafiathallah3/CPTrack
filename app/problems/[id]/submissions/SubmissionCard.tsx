"use client";

import React, { useState, useTransition } from "react";
import { voteOnSubmission, removeVote } from "@/app/actions/votes";

interface SubmissionCardProps {
  submission: {
    id: string;
    code: string;
    programming_language: string;
    created_at: string;
    username: string;
  };
  likes: number;
  dislikes: number;
  currentUserVote: 'like' | 'dislike' | null;
}

const langDisplayMap: Record<string, { label: string; color: string }> = {
  cpp: { label: 'C++', color: 'text-blue-400' },
  python: { label: 'Python', color: 'text-yellow-400' },
  javascript: { label: 'JavaScript', color: 'text-amber-400' },
  java: { label: 'Java', color: 'text-red-400' },
};

export default function SubmissionCard({ submission, likes: initialLikes, dislikes: initialDislikes, currentUserVote: initialVote }: SubmissionCardProps) {
  // Synchronize local state with props when server data changes
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [currentVote, setCurrentVote] = useState<'like' | 'dislike' | null>(initialVote);
  const [isPending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState(false);

  // Use a ref to track if we're currently processing a vote to avoid overwriting optimistic state with stale props
  const isVotingRef = React.useRef(false);

  // Sync state when props change (if not currently voting)
  React.useEffect(() => {
    if (!isVotingRef.current) {
      setLikes(initialLikes);
      setDislikes(initialDislikes);
      setCurrentVote(initialVote);
    }
  }, [initialLikes, initialDislikes, initialVote]);

  const langInfo = langDisplayMap[submission.programming_language] || { label: submission.programming_language, color: 'text-gray-400' };

  const handleVote = (type: 'like' | 'dislike') => {
    if (isPending) return;

    // 1. Optimistic Update (Immediate)
    const prevVote = currentVote;
    const prevLikes = likes;
    const prevDislikes = dislikes;

    isVotingRef.current = true;

    // Logic for immediate state update
    if (prevVote === type) {
      // Removing vote
      if (type === 'like') setLikes(l => l - 1);
      else setDislikes(d => d - 1);
      setCurrentVote(null);
    } else {
      // Adding or switching vote
      if (prevVote === 'like') setLikes(l => l - 1);
      if (prevVote === 'dislike') setDislikes(d => d - 1);
      
      if (type === 'like') setLikes(l => l + 1);
      else setDislikes(d => d + 1);
      setCurrentVote(type);
    }

    // 2. Server Sync
    startTransition(async () => {
      try {
        let result;
        if (prevVote === type) {
          result = await removeVote(submission.id);
        } else {
          result = await voteOnSubmission(submission.id, type);
        }

        if (!result.success) {
          // Revert on failure
          setLikes(prevLikes);
          setDislikes(prevDislikes);
          setCurrentVote(prevVote);
          alert(result.error || "Failed to process vote");
        }
      } catch (err) {
        setLikes(prevLikes);
        setDislikes(prevDislikes);
        setCurrentVote(prevVote);
      } finally {
        isVotingRef.current = false;
      }
    });
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  const codeLines = submission.code.split('\n');
  const previewLines = codeLines.slice(0, 8).join('\n');
  const hasMore = codeLines.length > 8;

  return (
    <div className="bg-[#0a0a0a] border border-gray-800 hover:border-gray-700 transition-colors group">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800/50">
        <div className="flex items-center gap-4">
          {/* Avatar / Initial */}
          <div className="w-8 h-8 bg-gray-800 border border-gray-700 flex items-center justify-center text-xs font-black text-gray-400 uppercase">
            {submission.username.charAt(0)}
          </div>
          <div>
            <div className="text-sm font-bold text-white">{submission.username}</div>
            <div className="flex items-center gap-2 text-[10px] text-gray-600 uppercase tracking-widest">
              <span className={langInfo.color}>{langInfo.label}</span>
              <span>·</span>
              <span>{timeAgo(submission.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Vote buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleVote('like')}
            disabled={isPending}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-widest border transition-all ${
              currentVote === 'like'
                ? 'border-green-500/50 bg-green-500/10 text-green-400'
                : 'border-gray-800 text-gray-600 hover:border-gray-600 hover:text-gray-400'
            } disabled:opacity-50`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill={currentVote === 'like' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/>
            </svg>
            {likes}
          </button>
          <button
            onClick={() => handleVote('dislike')}
            disabled={isPending}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-widest border transition-all ${
              currentVote === 'dislike'
                ? 'border-red-500/50 bg-red-500/10 text-red-400'
                : 'border-gray-800 text-gray-600 hover:border-gray-600 hover:text-gray-400'
            } disabled:opacity-50`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill={currentVote === 'dislike' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(180deg)' }}>
              <path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/>
            </svg>
            {dislikes}
          </button>
        </div>
      </div>

      {/* Code */}
      <div className="relative">
        <pre className={`p-5 text-sm font-mono text-gray-300 overflow-x-auto ${!expanded && hasMore ? 'max-h-[220px] overflow-hidden' : ''}`}>
          <code>{expanded ? submission.code : previewLines}</code>
        </pre>
        {hasMore && !expanded && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0a0a0a] to-transparent flex items-end justify-center pb-3">
            <button
              onClick={() => setExpanded(true)}
              className="text-[10px] font-bold uppercase tracking-widest text-cyan-500 hover:text-cyan-400 transition-colors border border-cyan-500/30 px-3 py-1 bg-[#0a0a0a] hover:bg-cyan-500/10"
            >
              Show {codeLines.length - 8} more lines
            </button>
          </div>
        )}
        {hasMore && expanded && (
          <div className="flex justify-center py-3 border-t border-gray-800/50">
            <button
              onClick={() => setExpanded(false)}
              className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-gray-400 transition-colors"
            >
              Collapse
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
