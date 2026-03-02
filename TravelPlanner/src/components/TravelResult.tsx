"use client";

import { TravelData } from "@/types";

interface TravelResultProps {
    data: TravelData;
    onRestart: () => void;
}

const DESTINATION_EMOJI: Record<string, string> = {
    일본: "🇯🇵",
    태국: "🇹🇭",
    프랑스: "🇫🇷",
    베트남: "🇻🇳",
    스페인: "🇪🇸",
    미국: "🇺🇸",
    제주도: "🏝️",
};

function getDestinationEmoji(dest?: string): string {
    if (!dest) return "🌍";
    for (const [key, emoji] of Object.entries(DESTINATION_EMOJI)) {
        if (dest.includes(key)) return emoji;
    }
    return "🌍";
}

function generateItinerary(data: TravelData): {
    day: number;
    morning: string;
    afternoon: string;
    evening: string;
}[] {
    const durationMap: Record<string, number> = {
        당일: 1,
        "1박 2일": 2,
        "2박 3일": 3,
        "3박 4일": 4,
        "4박 5일": 5,
        "1주일": 7,
        "2주일 이상": 10,
    };
    const days = durationMap[data.duration || "3박 4일"] || 3;
    const dest = data.destination || "여행지";
    const hasNature = data.interests?.includes("자연");
    const hasHistory = data.interests?.includes("역사");
    const hasShopping = data.interests?.includes("쇼핑");
    const hasFood = data.interests?.includes("맛집");
    const hasBeach = data.interests?.includes("해변");
    const hasMuseum = data.interests?.includes("미술관");

    const activities = {
        morning: [
            hasHistory ? `${dest} 역사 유적지 탐방` : `${dest} 도심 산책 & 조식`,
            hasNature ? `${dest} 자연 공원 트레킹` : `${dest} 로컬 카페에서 아침`,
            hasBeach ? `${dest} 해변 일출 감상` : `${dest} 시장 구경`,
        ],
        afternoon: [
            hasMuseum ? `${dest} 주요 미술관/박물관 방문` : `${dest} 주요 명소 관람`,
            hasShopping ? `${dest} 쇼핑 스트리트 탐방` : `${dest} 현지 투어 참가`,
            hasFood ? `${dest} 유명 맛집 점심` : `${dest} 카페 휴식`,
        ],
        evening: [
            hasFood ? `${dest} 현지 레스토랑 디너` : `${dest} 야경 감상`,
            `${dest} 야시장/나이트마켓 탐방`,
            `숙소 인근 바/카페에서 여유로운 저녁`,
        ],
    };

    return Array.from({ length: Math.min(days, 5) }, (_, i) => ({
        day: i + 1,
        morning: activities.morning[i % 3],
        afternoon: activities.afternoon[i % 3],
        evening: activities.evening[i % 3],
    }));
}

export default function TravelResult({ data, onRestart }: TravelResultProps) {
    const itinerary = generateItinerary(data);
    const emoji = getDestinationEmoji(data.destination);

    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            {/* Header Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 via-sky-400 to-blue-300 p-6 text-white shadow-xl shadow-blue-200/50">
                <div className="absolute top-0 right-0 text-[120px] opacity-10 leading-none select-none">
                    {emoji}
                </div>
                <div className="relative z-10">
                    <span className="text-xs font-semibold uppercase tracking-widest text-white/70 bg-white/20 px-3 py-1 rounded-full">
                        🎉 AI 맞춤 여행 플랜 완성
                    </span>
                    <h2 className="text-2xl font-bold mt-3 mb-1">
                        {emoji} {data.destination || "나만의 여행지"} {data.duration || ""} 여행
                    </h2>
                    <p className="text-white/80 text-sm">
                        {data.companions && `${data.companions}과 함께 `}
                        {data.travelStyle && `${data.travelStyle} 스타일로 `}
                        {data.pace && `${data.pace} 페이스의 여행`}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-4">
                        {data.budget && (
                            <span className="bg-white/25 text-white text-xs px-3 py-1 rounded-full font-medium">
                                💰 {data.budget} 예산
                            </span>
                        )}
                        {data.accommodation && (
                            <span className="bg-white/25 text-white text-xs px-3 py-1 rounded-full font-medium">
                                🏨 {data.accommodation}
                            </span>
                        )}
                        {data.transport && (
                            <span className="bg-white/25 text-white text-xs px-3 py-1 rounded-full font-medium">
                                🚗 {data.transport}
                            </span>
                        )}
                        {data.foodPreference && (
                            <span className="bg-white/25 text-white text-xs px-3 py-1 rounded-full font-medium">
                                🍽️ {data.foodPreference}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Interests */}
            {data.interests && data.interests.length > 0 && (
                <div className="bg-white rounded-3xl p-5 border border-blue-100 shadow-sm">
                    <h3 className="text-sm font-bold text-blue-800 mb-3">🎯 선택한 관심사</h3>
                    <div className="flex flex-wrap gap-2">
                        {data.interests.map((interest) => (
                            <span
                                key={interest}
                                className="bg-blue-50 text-blue-600 text-xs px-3 py-1.5 rounded-full border border-blue-200 font-medium"
                            >
                                {interest}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Itinerary */}
            <div className="bg-white rounded-3xl p-5 border border-blue-100 shadow-sm">
                <h3 className="text-sm font-bold text-blue-800 mb-4">🗺️ 추천 여행 일정</h3>
                <div className="flex flex-col gap-3">
                    {itinerary.map((day) => (
                        <div
                            key={day.day}
                            className="border border-blue-100 rounded-2xl overflow-hidden hover:border-blue-300 transition-colors duration-200"
                        >
                            <div className="bg-gradient-to-r from-blue-50 to-sky-50 px-4 py-2.5 border-b border-blue-100">
                                <span className="text-sm font-bold text-blue-700">
                                    Day {day.day}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 divide-x divide-blue-50">
                                <div className="p-3 text-center">
                                    <div className="text-lg mb-1">🌅</div>
                                    <p className="text-xs text-blue-500 font-semibold mb-1">오전</p>
                                    <p className="text-[11px] text-gray-600 leading-relaxed">
                                        {day.morning}
                                    </p>
                                </div>
                                <div className="p-3 text-center">
                                    <div className="text-lg mb-1">☀️</div>
                                    <p className="text-xs text-blue-500 font-semibold mb-1">오후</p>
                                    <p className="text-[11px] text-gray-600 leading-relaxed">
                                        {day.afternoon}
                                    </p>
                                </div>
                                <div className="p-3 text-center">
                                    <div className="text-lg mb-1">🌙</div>
                                    <p className="text-xs text-blue-500 font-semibold mb-1">저녁</p>
                                    <p className="text-[11px] text-gray-600 leading-relaxed">
                                        {day.evening}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* AI Tips */}
            <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-3xl p-5 border border-blue-100">
                <h3 className="text-sm font-bold text-blue-800 mb-3">💡 AI 여행 팁</h3>
                <ul className="flex flex-col gap-2">
                    {[
                        "여행 전 해당 국가의 여행 경보 및 입국 조건을 꼭 확인하세요.",
                        "환전은 출발 3~5일 전에 미리 준비하면 좋아요.",
                        "숙소 예약은 최소 2주~1개월 전에 하면 더 좋은 가격을 얻을 수 있어요.",
                        "여행자 보험 가입을 잊지 마세요!",
                    ].map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-blue-700">
                            <span className="text-blue-400 mt-0.5 flex-shrink-0">•</span>
                            {tip}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Restart button */}
            <button
                onClick={onRestart}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-sky-400 text-white font-bold text-sm shadow-lg shadow-blue-200/50 hover:shadow-blue-300/60 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
                🔄 새로운 여행 플랜 만들기
            </button>
        </div>
    );
}
