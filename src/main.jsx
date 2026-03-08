import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  alert('시스템 에러: Gemini API 키가 설정되지 않았습니다. 관리자에게 문의하세요.');
}

async function callGemini(prompt) {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY가 설정되지 않았습니다. 코드를 수정해주세요.");
  }
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json",
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API Error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("API 응답에서 텍스트를 찾을 수 없습니다.");

    return text;
  } catch (err) {
    console.error("Gemini API Call Failed:", err);
    throw err;
  }
}

// ─── Fake Database ───
const DESTINATION_DB = {
  '일본': { name: '일본', tagline: '전통과 현대가 공존하는 동아시아의 보석', desc: '벚꽃 명소와 첨단 도시 문화, 깊은 역사 유적이 어우러진 나라입니다. 음식 문화 또한 세계 최고 수준입니다.', weather: { icon: '🌸', label: '온화 & 계절 뚜렷', desc: '3~5월 봄 날씨 최적(15~22°C) · 가을 단풍도 절경' }, safety: { score: 92, label: '매우 안전', color: '#22C55E' }, price: { score: 55, label: '한국 대비 약 1.1배', color: '#3B82F6', note: '식비·교통 비슷, 숙박 다소 높음' } },
  '태국': { name: '태국', tagline: '미소의 나라, 황금 사원과 에메랄드 바다', desc: '저렴한 물가, 따뜻한 날씨, 아름다운 해변과 불교 사원으로 유명합니다. 스트리트 푸드 문화가 큰 매력입니다.', weather: { icon: '☀️', label: '열대 기후', desc: '연중 덥고 습함(28~35°C) · 11~2월이 여행 최적기' }, safety: { score: 72, label: '보통', color: '#F59E0B' }, price: { score: 32, label: '한국 대비 약 0.5배', color: '#22C55E', note: '식비·숙박 매우 저렴' } },
  '베트남': { name: '베트남', tagline: '커피향과 쌀국수, 고요한 아름다움', desc: '하노이 골목 문화, 호이안 등불 축제, 하롱베이의 장관 등 다양한 매력을 가집니다. 물가가 매우 저렴합니다.', weather: { icon: '🌴', label: '열대·아열대 기후', desc: '지역마다 다름 · 하노이 11~4월 쾌적, 다낭 연중 온화' }, safety: { score: 78, label: '대체로 안전', color: '#22C55E' }, price: { score: 28, label: '한국 대비 약 0.4배', color: '#22C55E', note: '매우 저렴, 쌀국수 20~30만동' } },
  '프랑스': { name: '프랑스', tagline: '예술과 낭만의 도시, 에펠탑의 나라', desc: '세계 최고의 미술관, 와인, 요리 문화를 자랑합니다. 파리의 낭만부터 프로방스 시골 마을까지 다양합니다.', weather: { icon: '🌤️', label: '온대 대륙성 기후', desc: '6~8월 여행 최적(20~28°C) · 겨울 크리스마스 마켓 인기' }, safety: { score: 74, label: '보통 (소매치기 주의)', color: '#F59E0B' }, price: { score: 88, label: '한국 대비 약 1.5배', color: '#EF4444', note: '숙박·식비·교통 모두 높음' } },
  '스페인': { name: '스페인', tagline: '플라멩코와 가우디, 정열의 이베리아', desc: '바르셀로나 가우디 건축, 마드리드 예술 삼각지, 안달루시아 이슬람 유산 등 다양한 역사가 공존합니다.', weather: { icon: '☀️', label: '지중해성 기후', desc: '5~6월, 9~10월 최적(22~28°C) · 여름 내륙은 매우 더움' }, safety: { score: 77, label: '대체로 안전', color: '#F59E0B' }, price: { score: 74, label: '한국 대비 약 1.2배', color: '#3B82F6', note: '숙박 보통, 식비 합리적' } },
  '미국': { name: '미국', tagline: '광활한 대륙, 꿈의 나라', desc: '뉴욕 마천루, LA 할리우드, 그랜드 캐니언 등 다양한 매력이 공존합니다. 드라이브 여행이 특히 인기입니다.', weather: { icon: '🌎', label: '지역별 매우 다양', desc: '광대한 국토로 지역마다 차이 큼 · 서부 LA는 연중 온화' }, safety: { score: 70, label: '지역별 차이 큼', color: '#F59E0B' }, price: { score: 95, label: '한국 대비 약 1.6배+', color: '#EF4444', note: '숙박·팁 문화·교통 모두 높음' } },
  '제주': { name: '제주도', tagline: '한국의 하와이, 화산섬의 자연', desc: '한라산, 성산일출봉, 해안도로, 흑돼지와 해산물로 사랑받는 국내 최고의 여행지입니다.', weather: { icon: '🌊', label: '온화한 해양성 기후', desc: '봄·가을 최적(15~25°C) · 여름 해수욕, 겨울 눈꽃 한라산' }, safety: { score: 96, label: '매우 안전', color: '#22C55E' }, price: { score: 50, label: '한국 본토와 비슷', color: '#3B82F6', note: '항공·숙박 시즌 차이, 해산물 저렴' } },
};

function getDestData(input) {
  const q = input.trim().toLowerCase();
  for (const [key, val] of Object.entries(DESTINATION_DB)) {
    if (q.includes(key) || key.includes(q)) return val;
  }
  return {
    name: input || '여행지', tagline: `${input || '그곳'}의 특별한 여행을 계획해보세요`,
    desc: `${input || '그곳'}은(는) 독특한 문화와 풍경을 가진 매력적인 여행지입니다. 현지 음식과 관광지를 미리 조사해두면 더욱 풍성한 여행이 됩니다.`,
    weather: { icon: '🌤️', label: '사전 확인 필요', desc: '출발 전 현지 날씨를 꼭 검색해보세요.' },
    safety: { score: 75, label: '여행 전 확인 권장', color: '#F59E0B' },
    price: { score: 60, label: '한국 대비 평균 수준', color: '#3B82F6', note: '환율 및 현지 물가 확인' }
  };
}

// ─── UI Components ───
function TopHero({ step, title, subtitle }) {
  return (
    <div className="hero-bg px-6 pt-10 pb-14 text-center rounded-b-[40px] shadow-lg mb-[-30px]">
      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-xs font-bold mb-5 shadow-sm border border-white/20">
          <span>✈️</span> AI 여행 플래너 · Step {step} / 4
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight mb-2 drop-shadow-md">
          {title}
        </h1>
        <p className="text-white/90 text-sm md:text-base font-medium">{subtitle}</p>
      </div>
    </div>
  );
}

// ─── Step 1 Components ───
function QuickPicks({ selected, onSelect }) {
  const picks = ['일본', '태국', '베트남', '프랑스', '제주'];
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {picks.map(p => (
        <button key={p} onClick={() => onSelect(p)}
          className={`text-[13px] px-3.5 py-1.5 rounded-full border-2 font-bold transition-all duration-200
          ${selected === p ? 'bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/30'
              : 'bg-white text-brand-600 border-brand-100 hover:border-brand-300 hover:bg-brand-50'}`}>
          {p}
        </button>
      ))}
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="glass-card p-6 mt-8 animate-fade-in border-brand-200">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-300 to-brand-500 flex items-center justify-center text-2xl shadow-lg shadow-brand-500/30 animate-pulse-soft">🤖</div>
        <div>
          <h3 className="text-brand-700 font-bold text-[15px]">AI가 데이터를 분석 중입니다</h3>
          <p className="text-brand-500 text-xs font-semibold mt-1 flex gap-1">
            잠시만 기다려주세요 <span className="animate-bounce">.</span><span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span><span className="animate-bounce" style={{ animationDelay: '0.4s' }}>.</span>
          </p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 rounded-full shimmer-bg animate-shimmer w-full"></div>
        <div className="h-4 rounded-full shimmer-bg animate-shimmer w-3/4"></div>
        <div className="h-4 rounded-full shimmer-bg animate-shimmer w-5/6"></div>
      </div>
    </div>
  );
}

function SummaryCard({ destData, info, onNext }) {
  if (!destData) return null;
  return (
    <div className="mt-8 animate-slide-up space-y-4">
      {/* Header Card */}
      <div className="rounded-[24px] p-6 text-white relative overflow-hidden shadow-xl" style={{ background: 'linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)' }}>
        <div className="relative z-10">
          <h2 className="text-2xl font-extrabold mb-1">{destData.name}</h2>
          <p className="text-white/80 text-[13px] mb-3">{destData.tagline}</p>
          <p className="text-[14px] leading-relaxed font-medium">{destData.desc}</p>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold bg-black/10 inline-block px-3 py-1.5 rounded-lg border border-white/10">
            📅 {Math.max(0, Math.ceil((new Date(info.end) - new Date(info.start)) / 86400000))}박 {Math.max(0, Math.ceil((new Date(info.end) - new Date(info.start)) / 86400000)) + 1}일 &nbsp;·&nbsp; 👥 {info.memLabel}
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-card p-4 rounded-[20px] flex flex-col justify-center items-center text-center">
          <div className="text-2xl mb-2 bg-brand-50 w-10 h-10 flex items-center justify-center rounded-xl">{destData.weather.icon}</div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">날씨</p>
          <p className="text-[13px] font-bold text-slate-700">{destData.weather.label}</p>
        </div>
        <div className="glass-card p-4 rounded-[20px] flex flex-col justify-center items-center text-center col-span-1 md:col-span-2">
          <div className="text-2xl mb-2 bg-green-50 w-10 h-10 flex items-center justify-center rounded-xl">🛡️</div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">치안 수준</p>
          <div className="w-full px-2 mt-1">
            <div className="flex justify-between text-[11px] font-bold mb-1"><span style={{ color: destData.safety.color }}>{destData.safety.label}</span> <span>{destData.safety.score}/100</span></div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${destData.safety.score}%`, backgroundColor: destData.safety.color }}></div>
            </div>
          </div>
        </div>
        <div className="glass-card p-4 rounded-[20px] flex flex-col justify-center items-center text-center">
          <div className="text-2xl mb-2 bg-yellow-50 w-10 h-10 flex items-center justify-center rounded-xl">💰</div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">물가</p>
          <p className="text-[13px] font-bold" style={{ color: destData.price.color }}>{destData.price.label}</p>
        </div>
      </div>

      <button onClick={onNext} className="btn-gradient w-full py-4 rounded-[20px] text-white font-extrabold text-[15px] flex justify-center items-center gap-2 mt-2">
        계속 일정짜기 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
      </button>
    </div>
  );
}

// ─── Step 2 Components ───
function CustomSlider({ label, leftLabel, rightLabel, value, onChange }) {
  return (
    <div className="mb-6">
      <label className="block text-brand-700 text-[14px] font-bold mb-4">{label}</label>
      <div className="slider-container">
        <div className="slider-track-fill" style={{ width: `calc(${value * 100}%)` }}></div>
        <div className="slider-dots">
          {/* 연속된 스케일이므로 점 제거 */}
        </div>
        <input
          type="range" min="0" max="1" step="0.01"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>
      <div className="flex justify-between text-[12px] font-bold text-slate-500 mt-2 px-1">
        <span className={value <= 0.1 ? "text-brand-600" : ""}>{leftLabel}</span>
        <span className={value >= 0.9 ? "text-brand-600" : ""}>{rightLabel}</span>
      </div>
    </div>
  );
}

// ─── Main App ───
function App() {
  // Shared State
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1 State
  const [country, setCountry] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [member, setMember] = useState('');

  // Step 1 UI State
  const [isLoading, setIsLoading] = useState(false);
  const [step1Error, setStep1Error] = useState('');
  const [destData, setDestData] = useState(null);
  const summaryRef = useRef(null);

  // Step 2 State (0.0 ~ 1.0 continuous scale)
  const [traits, setTraits] = useState({
    adventure: 0.5, energy: 0.5, money: 0.5, plan: 0.5, social: 0.5
  });

  // Step 3 State (Array of selected preferences)
  const [preferences, setPreferences] = useState([]);

  // Step 4 State (Chat Logs)
  const [chatInput, setChatInput] = useState('');
  const [chatLogs, setChatLogs] = useState([]);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 100);
  };

  const members = [
    { id: 'solo', e: '🧍', l: '혼자' }, { id: 'couple', e: '💑', l: '연인' },
    { id: 'friend', e: '👫', l: '친구' }, { id: 'family', e: '👨‍👩‍👧', l: '가족' }
  ];

  // Helper for User Trait Analysis
  const getTraitSummary = () => {
    if (traits.adventure >= 0.7) return '새로운 건 겪어봐야만 하는 열정적 탐험가';
    if (traits.energy <= 0.3) return '여유를 온전히 즐길 줄 아는 힐링 마스터';
    if (traits.money >= 0.7) return '원하는 건 쿨하게 질러버리는 VIP';
    if (traits.plan >= 0.7) return '분 단위까지 통제해야 직성이 풀리는 J형 여행자';
    if (traits.social >= 0.7) return '사람을 만나고 에너지를 얻는 핵인싸';
    return '다양한 매력을 적당히 즐길 줄 아는 밸런스형 여행자';
  };

  // Generate Itinerary based on Dates and Preferences via Gemini API
  const generateItinerary = async () => {
    const startDate = new Date(start);
    const days = Math.max(1, Math.ceil((new Date(end) - startDate) / 86400000)) + 1;

    setChatLogs([{ role: 'ai', isAnalyzing: true, text: '제미나이가 일정을 분석 중이에요... ⏳' }]);
    scrollToBottom();

    try {
      const prompt = `당신은 최상급 여행 플래너 AI입니다.
목적지: ${country} (${days}일 일정)
여행 인원/유형: ${members.find(m => m.id === member)?.l}
사용자 성향 점수 (0~1): 모험(${traits.adventure}), 체력(${traits.energy}), 예산(${traits.money}), 계획성(${traits.plan}), 사교성(${traits.social})
여행 특별 취향: ${preferences.length > 0 ? preferences.join(', ') : '자유로움'}

이 정보들을 모두 분석하여 ${days}일간의 완벽한 여행 일차별 세부 일정을 JSON 배열 형식으로만 만들어주세요.

응답은 반드시 아래의 JSON 배열([]) 구조만을 완벽하게 반환하세요.
[
  {
    "day": 1,
    "dateString": "1일차\\n10월 1일\\n월요일",
    "region": "구체적 지역명",
    "summary": "150자 이내 짧은 핵심 요약",
    "scheduleTitle": "하루 컨셉 요약(첫줄 bold)",
    "morning": "오전 일정 설명",
    "afternoon": "오후 일정 설명",
    "evening": "저녁 일정 설명",
    "transport": "이동수단, 소요시간, 예상비용",
    "caution": "해당 일차의 유의점"
  }
]`;
      const responseText = await callGemini(prompt);

      // JSON 파싱 (responseMimeType 이 JSON 이므로 백틱이 포함되지 않음)
      const dumItin = JSON.parse(responseText);

      setChatLogs([{
        role: 'ai',
        title: `사용자 분석 : "${getTraitSummary()}"\n\n딱 맞는 여행 일정을 짜봤어용!`,
        summary: `전체 ${days}일 동안 ${country}의 매력을 담은 맞춤 코스입니다. 자연과 도심을 적절하게 분배하여 피로도는 낮추고 즐거움은 높이도록 기획했습니다.`,
        itinerary: dumItin
      }]);
    } catch (error) {
      console.error("4단계 초기 일정 생성 Error:", error);
      setChatLogs([{ role: 'ai', isError: true, text: `API 호출 실패: ${error.message || '네트워크 오류'}` }]);
    }
    scrollToBottom();
  };

  // Validations & Handlers
  const isStep1Valid = country.trim() && start && end && end >= start && member;

  const handleStep1Submit = async () => {
    if (!isStep1Valid) return;
    setIsLoading(true);
    setDestData(null);
    setStep1Error('');
    // Scroll slightly down to make room for loading
    setTimeout(() => window.scrollBy({ top: 200, behavior: 'smooth' }), 50);

    try {
      const prompt = `여행지 '${country}'의 특징, 날씨, 치안, 물가를 한국과 비교해서 1줄씩 요약해줘.
다음 JSON 형식으로만 완벽하게 반환해.
{
  "name": "${country}",
  "tagline": "여행지 한줄 소개 (예: 낭만과 예술의 도시)",
  "desc": "여행지 특징 요약",
  "weather": { "icon": "☀️", "label": "날씨 키워드", "desc": "요약" },
  "safety": { "score": 85, "label": "치안 점수(100만점)", "color": "#22C55E" },
  "price": { "score": 120, "label": "한국 100 기준", "color": "#EF4444", "note": "물가 요약" }
}`;
      const responseText = await callGemini(prompt);
      setDestData(JSON.parse(responseText));
    } catch (error) {
      console.error("1단계 Gemini API Error:", error);
      setStep1Error(`API 호출 실패: ${error.message || '네트워크 오류'}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    }
  };



  // Step 3 Data Categories
  const PREF_CATEGORIES = [
    {
      title: '음식',
      items: [
        { id: '로컬 맛집', icon: '🍜' }, { id: '파인 다이닝', icon: '🍽️' }, { id: '디저트 투어', icon: '🍰' },
        { id: '길거리 음식', icon: '🍢' }, { id: '나이트라이프', icon: '🍻' }, { id: '직접 해먹기', icon: '🍳' }
      ]
    },
    {
      title: '레저/액티비티',
      items: [
        { id: '익스트림 스포츠', icon: '🪂' }, { id: '수상 액티비티', icon: '🏄‍♂️' }, { id: '아웃도어(트래킹)', icon: '⛰️' },
        { id: '테마파크', icon: '🎢' }, { id: '정적인 레저(피크닉)', icon: '🧺' }
      ]
    },
    {
      title: '힐링/예술',
      items: [
        { id: '마사지&온천', icon: '♨️' }, { id: '문화 예술(전시)', icon: '🖼️' },
        { id: '역사 탐방', icon: '🏛️' }, { id: '공연 관람(뮤지컬)', icon: '🎭' }
      ]
    },
    {
      title: '쇼핑',
      items: [
        { id: '명품&백화점', icon: '🛍️' }, { id: '빈티지 마켓', icon: '🧥' },
        { id: '로컬 기념품', icon: '🎁' }, { id: '마트 털기', icon: '🛒' }
      ]
    }
  ];

  const togglePreference = (id) => {
    if (id === '아무 선호도 없어요') {
      if (preferences.includes('아무 선호도 없어요')) {
        setPreferences([]);
      } else {
        setPreferences(['아무 선호도 없어요']);
      }
      return;
    }

    setPreferences(prev => {
      // '아무 선호도 없어요'가 있다면 제거
      const filtered = prev.filter(p => p !== '아무 선호도 없어요');
      if (filtered.includes(id)) {
        return filtered.filter(p => p !== id);
      } else {
        return [...filtered, id];
      }
    });
  };

  return (
    <div className="pb-12 max-w-[600px] mx-auto">
      {currentStep === 1 && (
        <div className="animate-fade-in">
          <TopHero step="1" title="즐거운 여행 일정을 짜볼까요?" subtitle="어디로, 언제 떠나실 예정인가요? 🌍" />

          <div className="px-4">
            <div className="glass-card p-6 md:p-8">
              {/* 1. Country */}
              <div className="mb-7">
                <label className="block text-brand-700 text-[14px] font-bold mb-2">🏳️ 여행 국가 / 지역</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">🔍</span>
                  <input type="text" value={country} onChange={e => { setCountry(e.target.value); setDestData(null); }}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-brand-100 rounded-2xl text-[15px] font-semibold text-slate-700 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-50 transition-all"
                    placeholder="예: 일본, 파리, 하와이..." />
                </div>
                <QuickPicks selected={country} onSelect={c => { setCountry(c); setDestData(null); }} />
              </div>

              {/* 2. Dates */}
              <div className="mb-7">
                <label className="block text-brand-700 text-[14px] font-bold mb-2">📅 여행 일정</label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <p className="text-[11px] font-bold text-slate-400 mb-1 ml-1">출발일</p>
                    <input type="date" value={start} onChange={e => setStart(e.target.value)}
                      className="w-full px-4 py-3 bg-white border-2 border-brand-100 rounded-2xl text-[14px] font-medium text-slate-700 outline-none focus:border-brand-400 transition-all font-sans" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-bold text-slate-400 mb-1 ml-1">귀국일</p>
                    <input type="date" value={end} min={start} onChange={e => setEnd(e.target.value)}
                      className="w-full px-4 py-3 bg-white border-2 border-brand-100 rounded-2xl text-[14px] font-medium text-slate-700 outline-none focus:border-brand-400 transition-all font-sans" />
                  </div>
                </div>
              </div>

              {/* 3. Members */}
              <div className="mb-8">
                <label className="block text-brand-700 text-[14px] font-bold mb-3">👥 여행 구성원</label>
                <div className="grid grid-cols-4 gap-2 md:gap-3">
                  {members.map(m => (
                    <button key={m.id} onClick={() => setMember(m.id)}
                      className={`py-4 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 transition-all duration-200
                      ${member === m.id ? 'bg-gradient-to-br from-brand-400 to-brand-500 border-transparent text-white shadow-lg shadow-brand-400/30 -translate-y-1'
                          : 'bg-white border-brand-100 text-slate-500 hover:border-brand-300'}`}>
                      <span className="text-2xl leading-none">{m.e}</span>
                      <span className={`text-[12px] font-bold ${member === m.id ? 'text-white' : 'text-slate-600'}`}>{m.l}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit 1 */}
              <button onClick={handleStep1Submit} disabled={!isStep1Valid || isLoading}
                className="btn-gradient w-full py-4 rounded-2xl text-white font-extrabold text-[16px] flex justify-center items-center gap-2">
                <span>🤖</span> AI와 일정짜기 시작
              </button>
            </div>

            {isLoading && <LoadingCard />}
            {step1Error && (
              <div className="mt-4 p-4 mx-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600 font-bold text-center text-[13px] shadow-sm animate-fade-in break-keep">
                {step1Error}
              </div>
            )}

            <div ref={summaryRef}>
              <SummaryCard
                destData={destData}
                info={{ start, end, memLabel: members.find(m => m.id === member)?.l || '' }}
                onNext={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setCurrentStep(2);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="animate-fade-in">
          <TopHero step="2" title="성격에 맞춰 일정을 고려할게요" subtitle="평소 어떤 스타일의 여행을 좋아하시나요? 🎯" />

          <div className="px-4">
            <div className="glass-card p-6 md:p-8">

              <CustomSlider
                label="🗺️ 모험" leftLabel="귀차니즘 겁쟁이" rightLabel="활동적 모험가"
                value={traits.adventure} onChange={v => setTraits({ ...traits, adventure: v })}
              />

              <CustomSlider
                label="🏃 체력" leftLabel="저체력" rightLabel="강철 체력왕"
                value={traits.energy} onChange={v => setTraits({ ...traits, energy: v })}
              />

              <CustomSlider
                label="💸 머니" leftLabel="가성비 추구" rightLabel="원하는 건 Flex"
                value={traits.money} onChange={v => setTraits({ ...traits, money: v })}
              />

              <CustomSlider
                label="📝 계획" leftLabel="발길 닿는대로" rightLabel="분단위 완벽 계획"
                value={traits.plan} onChange={v => setTraits({ ...traits, plan: v })}
              />

              <CustomSlider
                label="🎪 외향성" leftLabel="한적하고 고요함" rightLabel="사람 북적이는 핫플"
                value={traits.social} onChange={v => setTraits({ ...traits, social: v })}
              />

              <div className="grid grid-cols-3 gap-3 mt-8">
                <button onClick={() => {
                  setCurrentStep(1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                  className="col-span-1 py-4 bg-white border-2 border-brand-200 text-brand-600 rounded-2xl font-bold text-[14px] hover:bg-brand-50 transition-colors">
                  이전 단계로
                </button>
                <button onClick={() => {
                  setCurrentStep(3);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                  className="col-span-2 btn-gradient py-4 rounded-2xl text-white font-extrabold text-[15px] flex justify-center items-center gap-2">
                  계속 일정짜기 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="animate-fade-in">
          <TopHero step="3" title="여행할 때 중요한 항목들을 선택해 주세요" subtitle="잘 기억해서 꼼꼼하게 일정을 짜볼게요 🎒" />

          <div className="px-4">
            <div className="glass-card p-6 md:p-8">

              {PREF_CATEGORIES.map(category => (
                <div key={category.title} className="mb-8">
                  <h3 className="text-brand-700 font-bold mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-brand-400 rounded-full"></span>
                    {category.title}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {category.items.map(item => {
                      const isSelected = preferences.includes(item.id);
                      return (
                        <button key={item.id} onClick={() => togglePreference(item.id)}
                          className={`p-3 rounded-2xl border-2 flex items-center text-left gap-3 transition-all duration-200
                            ${isSelected
                              ? 'bg-brand-50 border-brand-400 text-brand-700 shadow-sm'
                              : 'bg-white border-brand-100 text-slate-600 hover:border-brand-200'}
                          `}>
                          <span className="text-2xl">{item.icon}</span>
                          <span className="text-[13px] font-bold leading-tight">{item.id}</span>
                          {isSelected && (
                            <div className="ml-auto w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="mt-6 pt-6 border-t border-brand-100">
                <button onClick={() => togglePreference('아무 선호도 없어요')}
                  className={`w-full p-4 rounded-2xl border-2 flex items-center justify-center gap-2 font-bold transition-all duration-200
                    ${preferences.includes('아무 선호도 없어요')
                      ? 'bg-slate-700 border-slate-700 text-white shadow-md'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                  <span>🤷</span> 아무 선호도 없어요, 알아서 짜주세요!
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-8">
                <button onClick={() => {
                  setCurrentStep(2);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                  className="col-span-1 py-4 bg-white border-2 border-brand-200 text-brand-600 rounded-2xl font-bold text-[14px] hover:bg-brand-50 transition-colors">
                  이전 단계로
                </button>
                <button onClick={() => {
                  generateItinerary(); // Generate itinerary before moving to step 4
                  setCurrentStep(4);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                  className="col-span-2 py-4 rounded-2xl text-white font-extrabold text-[16px] flex justify-center items-center gap-2 shadow-lg shadow-green-500/30 transition-all hover:-translate-y-1 hover:shadow-green-500/40"
                  style={{ background: 'linear-gradient(135deg, #34D399 0%, #059669 100%)' }}>
                  🚀 Bon voyage!!
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {currentStep === 4 && (
        <div className="animate-fade-in relative pb-28 pt-2">
          {/* Top Controls */}
          <div className="flex justify-between items-center px-4 mb-3 sticky top-2 z-40">
            <button onClick={() => {
              if (confirm('정말 처음부터 다시 짤까요?')) {
                setCurrentStep(1); setCountry(''); setStart(''); setEnd(''); setMember(''); setChatLogs([]);
              }
            }}
              className="text-[11px] font-bold text-slate-500 hover:text-brand-600 transition-colors bg-white/90 backdrop-blur px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
              ↩ 처음부터 다시 짜기
            </button>
            <button onClick={() => alert('일정이 저장되었습니다! (데모 기능)')}
              className="text-[11px] font-bold text-white bg-brand-500 hover:bg-brand-600 transition-colors px-3 py-1.5 rounded-full shadow-md shadow-brand-500/30">
              💾 일정 저장하기
            </button>
          </div>

          {/* Chat Log Section */}
          <div className="px-3 md:px-4 flex flex-col gap-2 relative">
            {chatLogs.map((log, index) => (
              <div key={index}>
                {log.role === 'ai' ? (
                  log.isAnalyzing ? (
                    <div className="flex justify-start mb-6 animate-fade-in w-full">
                      <div className="w-8 h-8 rounded-full bg-brand-400 flex items-center justify-center text-white text-[16px] mr-2 md:mr-3 mt-1 shadow-sm shrink-0">🤖</div>
                      <div className="p-3.5 rounded-2xl text-[14px] font-bold bg-white text-brand-600 border border-brand-200 shadow-sm animate-pulse-soft flex items-center gap-2">
                        <span className="inline-block w-4 h-4 rounded-full border-2 border-brand-400 border-t-transparent animate-spin align-middle"></span>
                        {log.text}
                      </div>
                    </div>
                  ) : log.isError || (!log.itinerary && log.text) ? (
                    <div className="flex justify-start mb-6 animate-fade-in w-full max-w-full">
                      <div className="w-8 h-8 rounded-full bg-brand-400 flex items-center justify-center text-white text-[16px] mr-2 md:mr-3 mt-1 shadow-sm shrink-0">🤖</div>
                      <div className={`p-4 rounded-2xl rounded-tl-sm shadow-md border leading-relaxed font-bold break-words text-[14px]
                        ${log.isError ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-white border-slate-200 text-slate-800'}`}>
                        {log.text}
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-start mb-6 animate-fade-in w-full max-w-full">
                      <div className="w-8 h-8 rounded-full bg-brand-400 flex items-center justify-center text-white text-[16px] mr-2 md:mr-3 mt-1 shadow-sm shrink-0">🤖</div>
                      <div className="flex-1 bg-white border border-slate-200 rounded-2xl rounded-tl-sm shadow-md overflow-hidden min-w-0">
                        <div className="p-4 md:p-5 border-b border-slate-100">
                          <h2 className="text-[15px] md:text-[16px] font-extrabold text-slate-800 leading-relaxed whitespace-pre-line mb-3">
                            {log.title}
                          </h2>
                          <div className="bg-brand-50/50 p-3.5 rounded-xl border border-brand-100">
                            <h3 className="text-[12px] font-extrabold text-brand-700 mb-1 flex items-center gap-1">📋 핵심 요약</h3>
                            <p className="text-[13px] text-slate-700 font-medium leading-relaxed">{log.summary}</p>
                          </div>
                        </div>

                        {log.itinerary && (
                          <div className="p-0 overflow-x-auto w-full styled-scrollbar">
                            <table className="min-w-[800px] w-full border-collapse text-left text-[12px] md:text-[13px]">
                              <thead>
                                <tr className="bg-slate-50 text-brand-700 border-b border-slate-200 text-center">
                                  <th className="p-3 font-extrabold whitespace-nowrap border-r border-slate-100 bg-slate-100 w-24">일자</th>
                                  <th className="p-3 font-extrabold whitespace-nowrap min-w-[120px] border-r border-slate-100 w-32">지역</th>
                                  <th className="p-3 font-extrabold min-w-[180px] border-r border-slate-100">지역 설명</th>
                                  <th className="p-3 font-extrabold min-w-[280px] border-r border-slate-100">일정</th>
                                  <th className="p-3 font-extrabold min-w-[160px]">이동 수단</th>
                                </tr>
                              </thead>
                              <tbody>
                                {log.itinerary.map((item, idx) => (
                                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
                                    <td className="p-3 align-top border-r border-slate-100 bg-slate-50/50 text-center">
                                      <div className="font-extrabold text-brand-600 whitespace-pre-line leading-snug">{item.dateString}</div>
                                    </td>
                                    <td className="p-3 align-top border-r border-slate-100 text-center">
                                      <div className="text-slate-800 font-bold bg-white border border-slate-200 inline-block px-2 py-1 rounded shadow-sm break-keep">{item.region}</div>
                                    </td>
                                    <td className="p-3 align-top border-r border-slate-100 text-slate-700 leading-relaxed font-medium text-[12px] break-keep">{item.summary}</td>
                                    <td className="p-3 align-top border-r border-slate-100 text-slate-700 leading-relaxed">
                                      <p className="font-extrabold text-brand-700 mb-2">"{item.scheduleTitle}"</p>
                                      <ul className="space-y-1.5 text-[12px] font-medium text-slate-600">
                                        <li><span className="text-amber-500 font-bold mr-1">•</span>{item.morning}</li>
                                        <li><span className="text-blue-500 font-bold mr-1">•</span>{item.afternoon}</li>
                                        <li dangerouslySetInnerHTML={{ __html: `<span class="text-indigo-500 font-bold mr-1">•</span>${item.evening}` }}></li>
                                      </ul>
                                    </td>
                                    <td className="p-3 align-top text-slate-600 leading-relaxed font-medium text-[12px]">
                                      <p className="mb-2 text-slate-700 font-semibold">{item.transport}</p>
                                      <p className="text-rose-500 font-bold text-[11px] bg-rose-50 p-1.5 rounded inline-block">⚠️ {item.caution}</p>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                ) : (
                  <div className="flex justify-end mb-6 animate-fade-in w-full">
                    <div className="max-w-[85%] p-3.5 rounded-2xl text-[14px] font-bold leading-relaxed bg-brand-500 text-white rounded-tr-sm shadow-md">
                      {log.text}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} className="h-4"></div>
          </div>

          {/* Fixed Bottom Chat Input */}
          <div className="fixed bottom-0 left-0 right-0 w-full max-w-[600px] mx-auto bg-white/95 backdrop-blur-xl border-t border-slate-100 p-3 pb-safe z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!chatInput.trim()) return;

              const reqText = chatInput;
              setChatInput('');
              setChatLogs(prev => [...prev, { role: 'user', text: reqText }]);
              setChatLogs(prev => [...prev, { role: 'ai', isAnalyzing: true, text: '제미나이가 일정을 수정 분석 중이에요... ⏳' }]);
              scrollToBottom();

              setTimeout(async () => {
                try {
                  const lastAi = [...chatLogs].reverse().find(l => l.role === 'ai' && l.itinerary);
                  const baseItin = lastAi && lastAi.itinerary ? JSON.parse(JSON.stringify(lastAi.itinerary)) : [];

                  const prompt = `기존 여행 일정 JSON 배열:
${JSON.stringify(baseItin)}

사용자의 피드백: "${reqText}"

위 피드백사항을 철저하게 반영해서 기존 배열 데이터를 업데이트해라. (반드시 전체 배열을 반환해야 함).
특정 일자에 대한 요청이 있으면 집중적으로 반영하고, 비용이나 시간 등 앞뒤 문맥에 맞게 다른 일자도 자연스럽게 수정해라. 항상 JSON 배열 1개만 반환해.`;

                  const responseText = await callGemini(prompt);
                  const updatedItin = JSON.parse(responseText);

                  setChatLogs(prev => {
                    const newLogs = prev.filter(l => !l.isAnalyzing);
                    return [...newLogs, {
                      role: 'ai',
                      title: `요청하신 피드백을 반영하여 일정을 수정했어요! ✨\n\n(피드백: "${reqText}")`,
                      summary: `요청 사항을 완벽히 흡수하여 전체 일정을 최신화했습니다. 확인해 보세요!`,
                      itinerary: updatedItin
                    }];
                  });
                } catch (error) {
                  console.error("채팅 업데이트 실패:", error);
                  setChatLogs(prev => {
                    const newLogs = prev.filter(l => !l.isAnalyzing);
                    return [...newLogs, { role: 'ai', isError: true, text: `API 호출 실패: ${error.message || '네트워크 오류'}` }];
                  });
                }
                scrollToBottom();
              }, 150);

            }} className="relative flex items-center max-w-full">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="일정 수정을 요청해보세요..."
                className="w-full bg-slate-100 text-slate-800 text-[14px] font-semibold pl-5 pr-14 py-4 rounded-full outline-none focus:ring-2 focus:ring-brand-400 transition-all"
              />
              <button type="submit"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-10 h-10 bg-brand-500 hover:bg-brand-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg shadow-brand-500/30">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
