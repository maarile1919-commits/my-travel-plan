"use client";

import { STEPS } from "@/data/questions";
import { cn } from "@/lib/utils";

interface SidebarProps {
    currentStep: number;
}

export default function Sidebar({ currentStep }: SidebarProps) {
    return (
        <aside className="w-72 min-h-screen bg-white/70 backdrop-blur-xl border-r border-blue-100 flex flex-col p-6 shadow-xl shadow-blue-100/40">
            {/* Logo */}
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-400 to-sky-300 flex items-center justify-center shadow-lg shadow-blue-200/50 animate-pulse-ring">
                        <span className="text-white text-lg">✈️</span>
                    </div>
                    <div>
                        <h1 className="text-base font-bold text-blue-800 leading-tight">
                            AI 여행 플래너
                        </h1>
                        <p className="text-xs text-blue-400 font-medium">Trip Planner</p>
                    </div>
                </div>
                <div className="h-px bg-gradient-to-r from-blue-200 via-sky-200 to-transparent mt-4" />
            </div>

            {/* Steps */}
            <nav className="flex flex-col gap-2 flex-1">
                {STEPS.map((step, idx) => {
                    const isCompleted = currentStep > step.id;
                    const isActive = currentStep === step.id;
                    const isUpcoming = currentStep < step.id;

                    return (
                        <div key={step.id} className="relative">
                            {/* Connector line */}
                            {idx < STEPS.length - 1 && (
                                <div
                                    className={cn(
                                        "absolute left-[22px] top-[52px] w-0.5 h-6 transition-all duration-500",
                                        isCompleted ? "bg-blue-400" : "bg-blue-100"
                                    )}
                                />
                            )}

                            <div
                                className={cn(
                                    "flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 cursor-default",
                                    isActive &&
                                    "bg-gradient-to-r from-blue-500 to-sky-400 shadow-lg shadow-blue-200/60",
                                    isCompleted && "bg-blue-50 hover:bg-blue-100/70",
                                    isUpcoming && "opacity-50"
                                )}
                            >
                                {/* Step icon circle */}
                                <div
                                    className={cn(
                                        "w-11 h-11 rounded-2xl flex items-center justify-center text-lg flex-shrink-0 transition-all duration-300",
                                        isActive && "bg-white/25",
                                        isCompleted &&
                                        "bg-blue-100 ring-2 ring-blue-300 ring-offset-1",
                                        isUpcoming && "bg-gray-100"
                                    )}
                                >
                                    {isCompleted ? (
                                        <span className="text-blue-500 text-sm font-bold">✓</span>
                                    ) : (
                                        <span>{step.icon}</span>
                                    )}
                                </div>

                                {/* Step info */}
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={cn(
                                                "text-xs font-semibold uppercase tracking-wider",
                                                isActive ? "text-white/70" : "text-blue-300"
                                            )}
                                        >
                                            Step {step.id}
                                        </span>
                                    </div>
                                    <p
                                        className={cn(
                                            "text-sm font-semibold leading-tight",
                                            isActive ? "text-white" : "text-blue-800",
                                            isUpcoming && "text-gray-400"
                                        )}
                                    >
                                        {step.title}
                                    </p>
                                    <p
                                        className={cn(
                                            "text-xs mt-0.5 leading-tight",
                                            isActive ? "text-white/70" : "text-blue-400",
                                            isUpcoming && "text-gray-300"
                                        )}
                                    >
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </nav>

            {/* Bottom decoration */}
            <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 border border-blue-100">
                <p className="text-xs text-blue-500 text-center font-medium leading-relaxed">
                    🌟 AI가 당신만의<br />
                    완벽한 여행을 설계해드려요
                </p>
            </div>
        </aside>
    );
}
