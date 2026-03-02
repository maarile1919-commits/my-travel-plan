"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import ChatMessage from "@/components/ChatMessage";
import OptionButton from "@/components/OptionButton";
import TravelResult from "@/components/TravelResult";
import { QUESTIONS, STEPS } from "@/data/questions";
import { Message, TravelData } from "@/types";

function getStepForQuestionIndex(idx: number): number {
    if (idx < 0) return 1;
    if (idx >= QUESTIONS.length) return 4;
    return QUESTIONS[idx].step;
}

function makeId() {
    return Math.random().toString(36).slice(2);
}

function aiMessage(content: string): Message {
    return { id: makeId(), role: "ai", content, timestamp: new Date() };
}

function userMessage(content: string): Message {
    return { id: makeId(), role: "user", content, timestamp: new Date() };
}

export default function HomePage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [travelData, setTravelData] = useState<TravelData>({});
    const [questionIndex, setQuestionIndex] = useState<number>(0);
    const [textInput, setTextInput] = useState("");
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const hasInitialized = useRef(false);

    const scrollToBottom = useCallback(() => {
        setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    }, []);

    const addAIMessage = useCallback(
        (content: string) => {
            return new Promise<void>((resolve) => {
                setIsTyping(true);
                setTimeout(() => {
                    setMessages((prev) => [...prev, aiMessage(content)]);
                    setIsTyping(false);
                    scrollToBottom();
                    resolve();
                }, 800);
            });
        },
        [scrollToBottom]
    );

    // Initialize first message
    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;
        setIsTyping(true);
        setTimeout(() => {
            setMessages([aiMessage(QUESTIONS[0].message)]);
            setIsTyping(false);
        }, 600);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, scrollToBottom]);

    const advanceQuestion = useCallback(
        async (answerText: string, newData: TravelData, nextIdx: number) => {
            setMessages((prev) => [...prev, userMessage(answerText)]);
            setSelectedOptions([]);
            setTextInput("");

            if (nextIdx >= QUESTIONS.length) {
                // Done — show result
                await addAIMessage(
                    `완벽해요! 🎉\n\n${answerText}까지 선택해 주셨군요.\n\n잠깐만 기다려 주세요, AI가 여행 일정을 만들고 있어요... ✨`
                );
                setTimeout(() => {
                    setTravelData(newData);
                    setCurrentStep(4);
                    setIsFinished(true);
                }, 1200);
            } else {
                const nextQ = QUESTIONS[nextIdx];
                const nextStep = nextQ.step;
                if (nextStep > currentStep) {
                    let stepMsg = "";
                    if (nextStep === 2)
                        stepMsg =
                            "기본 정보 입력 완료! 이제 여행 성향을 파악해볼게요 🧭\n\n";
                    if (nextStep === 3)
                        stepMsg = "성향 파악 완료! 마지막으로 취향을 알아볼게요 ❤️\n\n";
                    setCurrentStep(nextStep);
                    await addAIMessage(stepMsg + nextQ.message);
                } else {
                    await addAIMessage(nextQ.message);
                }
                setQuestionIndex(nextIdx);
            }
        },
        [addAIMessage, currentStep]
    );

    const handleOptionClick = useCallback(
        (value: string) => {
            const q = QUESTIONS[questionIndex];
            if (!q) return;

            if (q.multiSelect) {
                setSelectedOptions((prev) =>
                    prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
                );
            } else {
                // Single select — immediately advance
                const newData = { ...travelData, [q.key]: value } as TravelData;
                advanceQuestion(value, newData, questionIndex + 1);
            }
        },
        [questionIndex, travelData, advanceQuestion]
    );

    const handleMultiSelectConfirm = useCallback(() => {
        if (selectedOptions.length === 0) return;
        const q = QUESTIONS[questionIndex];
        const newData = {
            ...travelData,
            [q.key]: selectedOptions,
        } as TravelData;
        advanceQuestion(selectedOptions.join(", "), newData, questionIndex + 1);
    }, [questionIndex, selectedOptions, travelData, advanceQuestion]);

    const handleTextSubmit = useCallback(
        (e?: React.FormEvent) => {
            e?.preventDefault();
            const val = textInput.trim();
            if (!val) return;
            const q = QUESTIONS[questionIndex];
            const newData = { ...travelData, [q.key]: val } as TravelData;
            advanceQuestion(val, newData, questionIndex + 1);
        },
        [textInput, questionIndex, travelData, advanceQuestion]
    );

    const handleRestart = useCallback(() => {
        setMessages([]);
        setTravelData({});
        setQuestionIndex(0);
        setTextInput("");
        setSelectedOptions([]);
        setIsFinished(false);
        setCurrentStep(1);
        hasInitialized.current = false;
        setTimeout(() => {
            hasInitialized.current = true;
            setIsTyping(true);
            setTimeout(() => {
                setMessages([aiMessage(QUESTIONS[0].message)]);
                setIsTyping(false);
            }, 600);
        }, 100);
    }, []);

    const currentQ = QUESTIONS[questionIndex];
    const hasOptions = currentQ?.options && !isFinished;
    const isMultiSelect = currentQ?.multiSelect;
    const isTextInput = currentQ?.inputType === "text" && !isFinished;
    const showTextArea = isTextInput && !isFinished;

    return (
        <div className="flex h-screen overflow-hidden bg-gradient-to-br from-sky-50 via-blue-50 to-white">
            {/* Sidebar */}
            <Sidebar currentStep={currentStep} />

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col min-w-0 h-full">
                {/* Top bar */}
                <header className="h-16 flex items-center px-6 bg-white/60 backdrop-blur-xl border-b border-blue-100/60 flex-shrink-0 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-sky-300 flex items-center justify-center shadow-md shadow-blue-200/50">
                                <span className="text-base">🤖</span>
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-blue-800">AI 여행 플래너</p>
                            <p className="text-[11px] text-green-500 font-medium">온라인</p>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="ml-auto flex items-center gap-3">
                        <span className="text-xs text-blue-400 font-medium hidden sm:block">
                            Step {Math.min(currentStep, STEPS.length)} / {STEPS.length}
                        </span>
                        <div className="w-32 h-1.5 bg-blue-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-sky-400 rounded-full transition-all duration-700"
                                style={{
                                    width: `${(Math.min(currentStep, STEPS.length) / STEPS.length) * 100}%`,
                                }}
                            />
                        </div>
                    </div>
                </header>

                {/* Messages area */}
                <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-6 sm:px-8">
                    <div className="max-w-2xl mx-auto flex flex-col gap-5">
                        {messages.map((msg) => (
                            <ChatMessage key={msg.id} message={msg} />
                        ))}

                        {/* AI typing indicator */}
                        {isTyping && (
                            <div className="flex gap-3 animate-fade-in">
                                <div className="flex-shrink-0 w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-400 to-sky-300 flex items-center justify-center shadow-md shadow-blue-200/50">
                                    <span className="text-base">✈️</span>
                                </div>
                                <div className="bg-white border border-blue-100 rounded-3xl rounded-tl-lg px-5 py-4 shadow-sm">
                                    <div className="flex gap-1.5 items-center">
                                        {[0, 1, 2].map((i) => (
                                            <span
                                                key={i}
                                                className="w-2 h-2 bg-blue-300 rounded-full animate-bounce-dot"
                                                style={{ animationDelay: `${i * 0.2}s` }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Result */}
                        {isFinished && (
                            <div className="animate-slide-up">
                                <TravelResult data={travelData} onRestart={handleRestart} />
                            </div>
                        )}

                        <div ref={bottomRef} />
                    </div>
                </div>

                {/* Input area */}
                {!isFinished && !isTyping && (
                    <div className="flex-shrink-0 border-t border-blue-100/60 bg-white/60 backdrop-blur-xl px-4 py-4 sm:px-8">
                        <div className="max-w-2xl mx-auto">
                            {/* Options grid */}
                            {hasOptions && (
                                <div className="mb-3">
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {currentQ.options!.map((opt) => (
                                            <OptionButton
                                                key={opt.value}
                                                label={opt.label}
                                                value={opt.value}
                                                selected={
                                                    isMultiSelect
                                                        ? selectedOptions.includes(opt.value)
                                                        : false
                                                }
                                                multiSelect={isMultiSelect}
                                                onClick={handleOptionClick}
                                            />
                                        ))}
                                    </div>
                                    {isMultiSelect && (
                                        <button
                                            onClick={handleMultiSelectConfirm}
                                            disabled={selectedOptions.length === 0}
                                            className="mt-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-500 to-sky-400 text-white text-sm font-semibold shadow-md shadow-blue-200/50 hover:shadow-blue-300/60 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                                        >
                                            {selectedOptions.length > 0
                                                ? `${selectedOptions.length}개 선택 완료 →`
                                                : "항목을 선택해주세요"}
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Text input */}
                            <form
                                onSubmit={handleTextSubmit}
                                className="flex gap-3 items-center"
                            >
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                    placeholder={
                                        showTextArea
                                            ? "직접 입력하거나 위 버튼을 선택하세요..."
                                            : hasOptions
                                                ? "또는 직접 입력하세요..."
                                                : "메시지를 입력하세요..."
                                    }
                                    className="flex-1 rounded-2xl border-2 border-blue-200 bg-white/80 px-5 py-3 text-sm text-blue-900 placeholder-blue-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                                />
                                <button
                                    type="submit"
                                    disabled={!textInput.trim()}
                                    className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center shadow-md shadow-blue-200/50 hover:shadow-blue-300/60 hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex-shrink-0"
                                >
                                    <svg
                                        className="w-5 h-5 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2.5}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                                        />
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
