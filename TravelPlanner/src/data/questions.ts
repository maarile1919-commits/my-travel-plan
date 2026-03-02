import { Step } from "@/types";

export const STEPS: Step[] = [
    {
        id: 1,
        title: "기본 정보",
        icon: "✈️",
        description: "여행지와 날짜 설정",
    },
    {
        id: 2,
        title: "여행 성향",
        icon: "🧭",
        description: "나의 여행 스타일 파악",
    },
    {
        id: 3,
        title: "취향 & 관심사",
        icon: "❤️",
        description: "좋아하는 것들 탐색",
    },
    {
        id: 4,
        title: "맞춤 일정",
        icon: "🗺️",
        description: "AI 추천 여행 일정",
    },
];

export type QuestionKey =
    | "destination"
    | "duration"
    | "departureDate"
    | "companions"
    | "budget"
    | "travelStyle"
    | "pace"
    | "accommodation"
    | "interests"
    | "foodPreference"
    | "transport";

export interface Question {
    key: QuestionKey;
    step: number;
    message: string;
    options?: { label: string; value: string }[];
    multiSelect?: boolean;
    inputType?: "text" | "date" | "options";
}

export const QUESTIONS: Question[] = [
    // Step 1 - 기본 정보
    {
        key: "destination",
        step: 1,
        message:
            "안녕하세요! 저는 AI 여행 플래너예요 ✈️\n\n어디로 여행을 떠나고 싶으신가요? 국내외 어디든 알려주세요! 🌍",
        inputType: "text",
        options: [
            { label: "🇯🇵 일본", value: "일본" },
            { label: "🇹🇭 태국", value: "태국" },
            { label: "🇫🇷 프랑스", value: "프랑스" },
            { label: "🇻🇳 베트남", value: "베트남" },
            { label: "🇪🇸 스페인", value: "스페인" },
            { label: "🇺🇸 미국", value: "미국" },
            { label: "🏝️ 제주도", value: "제주도" },
            { label: "🌏 아직 미정", value: "미정" },
        ],
    },
    {
        key: "duration",
        step: 1,
        message: "여행은 며칠 동안 계획하고 계신가요? ⏰",
        options: [
            { label: "당일치기", value: "당일" },
            { label: "1박 2일", value: "1박 2일" },
            { label: "2박 3일", value: "2박 3일" },
            { label: "3박 4일", value: "3박 4일" },
            { label: "4박 5일", value: "4박 5일" },
            { label: "1주일", value: "1주일" },
            { label: "2주일 이상", value: "2주일 이상" },
        ],
    },
    {
        key: "companions",
        step: 1,
        message: "누구와 함께 떠나시나요? 👥",
        options: [
            { label: "혼자 (솔로 트립) 🧍", value: "혼자" },
            { label: "연인/배우자 💑", value: "커플" },
            { label: "친구들 👫", value: "친구" },
            { label: "가족 👨‍👩‍👧‍👦", value: "가족" },
            { label: "직장 동료 💼", value: "직장 동료" },
        ],
    },
    {
        key: "budget",
        step: 1,
        message: "1인 기준 예산은 어느 정도 생각하고 계신가요? 💰",
        options: [
            { label: "알뜰 여행 (~50만원)", value: "알뜰" },
            { label: "적당히 (~100만원)", value: "보통" },
            { label: "여유롭게 (~200만원)", value: "여유" },
            { label: "럭셔리 (200만원+)", value: "럭셔리" },
            { label: "예산 무관", value: "무관" },
        ],
    },
    // Step 2 - 여행 성향
    {
        key: "travelStyle",
        step: 2,
        message:
            "여행 스타일이 어떤가요? 나를 가장 잘 표현하는 유형을 선택해주세요! 🎯",
        options: [
            { label: "🗺️ 계획형 (미리 다 정하고 싶어요)", value: "계획형" },
            { label: "🌊 즉흥형 (그냥 떠나면 어떻게든 돼요)", value: "즉흥형" },
            { label: "🔄 반계획형 (큰 틀만 잡고 즉흥으로)", value: "반계획형" },
        ],
    },
    {
        key: "pace",
        step: 2,
        message: "하루 여행 페이스는 어떤가요? 🏃",
        options: [
            { label: "🚀 바쁘게! 최대한 많이 보기", value: "빡빡하게" },
            { label: "⚖️ 적당히 균형 있게", value: "적당히" },
            { label: "🌿 여유롭게 천천히", value: "여유롭게" },
            { label: "🛋️ 그냥 쉬러 갑니다", value: "휴식" },
        ],
    },
    {
        key: "accommodation",
        step: 2,
        message: "어떤 숙소를 선호하시나요? 🏨",
        options: [
            { label: "🏨 호텔 (편안한 서비스)", value: "호텔" },
            { label: "🛎️ 리조트 (올인클루시브)", value: "리조트" },
            { label: "🏠 에어비앤비 (현지 Feel)", value: "에어비앤비" },
            { label: "🎒 게스트하우스/호스텔", value: "게스트하우스" },
            { label: "⛺ 글램핑/캠핑", value: "글램핑" },
            { label: "💰 가성비 모텔", value: "모텔" },
        ],
    },
    // Step 3 - 취향 & 관심사
    {
        key: "interests",
        step: 3,
        message: "관심 있는 여행 활동을 모두 골라주세요! 여러 개 선택 가능해요 🎨",
        multiSelect: true,
        options: [
            { label: "🏛️ 역사/문화 유적", value: "역사" },
            { label: "🎨 미술관/박물관", value: "미술관" },
            { label: "🛍️ 쇼핑", value: "쇼핑" },
            { label: "🍜 맛집 탐방", value: "맛집" },
            { label: "🌿 자연/트레킹", value: "자연" },
            { label: "🏖️ 해변/수영", value: "해변" },
            { label: "🎡 테마파크/놀이", value: "놀이공원" },
            { label: "📸 사진 명소", value: "사진" },
            { label: "🎵 공연/축제", value: "공연" },
            { label: "💆 스파/웰니스", value: "웰니스" },
        ],
    },
    {
        key: "foodPreference",
        step: 3,
        message: "음식 취향은 어떠세요? 🍴",
        options: [
            { label: "🌶️ 현지 음식 적극 도전!", value: "현지식" },
            { label: "⚖️ 현지식 + 한식 반반", value: "반반" },
            { label: "🏠 한식 위주로", value: "한식" },
            { label: "🌱 채식/비건", value: "채식" },
            { label: "🍽️ 파인 다이닝", value: "파인다이닝" },
        ],
    },
    {
        key: "transport",
        step: 3,
        message: "현지 이동 수단은 어떤 걸 선호하세요? 🚗",
        options: [
            { label: "🚇 대중교통 (지하철/버스)", value: "대중교통" },
            { label: "🚕 택시/우버", value: "택시" },
            { label: "🚗 렌터카", value: "렌터카" },
            { label: "🚶 도보 위주", value: "도보" },
            { label: "🚲 자전거", value: "자전거" },
            { label: "🔀 상황에 따라 혼합", value: "혼합" },
        ],
    },
];
