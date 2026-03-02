"use client";

import { cn } from "@/lib/utils";

interface OptionButtonProps {
    label: string;
    value: string;
    selected?: boolean;
    multiSelect?: boolean;
    onClick: (value: string) => void;
}

export default function OptionButton({
    label,
    value,
    selected = false,
    multiSelect = false,
    onClick,
}: OptionButtonProps) {
    return (
        <button
            onClick={() => onClick(value)}
            className={cn(
                "px-4 py-2.5 rounded-2xl text-sm font-medium border-2 transition-all duration-200",
                "hover:scale-105 hover:shadow-md active:scale-95",
                selected
                    ? "bg-gradient-to-r from-blue-500 to-sky-400 border-transparent text-white shadow-md shadow-blue-200/50"
                    : "bg-white border-blue-200 text-blue-700 hover:border-blue-400 hover:bg-blue-50",
                multiSelect && selected && "ring-2 ring-offset-1 ring-blue-300"
            )}
        >
            {label}
        </button>
    );
}
