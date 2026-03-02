"use client";

import { Message } from "@/types";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
    message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
    const isAI = message.role === "ai";

    return (
        <div
            className={cn(
                "flex gap-3 animate-slide-up",
                isAI ? "flex-row" : "flex-row-reverse"
            )}
        >
            {/* Avatar */}
            {isAI && (
                <div className="flex-shrink-0 w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-400 to-sky-300 flex items-center justify-center shadow-md shadow-blue-200/50 mt-1">
                    <span className="text-base">✈️</span>
                </div>
            )}

            {/* Bubble */}
            <div
                className={cn(
                    "max-w-[75%] rounded-3xl px-5 py-3.5 shadow-sm transition-all duration-200",
                    isAI
                        ? "bg-white border border-blue-100 text-blue-900 rounded-tl-lg shadow-blue-100/40"
                        : "bg-gradient-to-br from-blue-500 to-sky-400 text-white rounded-tr-lg shadow-blue-300/40"
                )}
            >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                </p>
                <span
                    className={cn(
                        "text-[10px] mt-1.5 block",
                        isAI ? "text-blue-300" : "text-white/60"
                    )}
                >
                    {message.timestamp.toLocaleTimeString("ko-KR", {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </span>
            </div>
        </div>
    );
}
