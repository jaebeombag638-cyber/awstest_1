'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const questions = [
  {
    id: 'concerns',
    text: '요즘 가장 신경 쓰이는 건강 문제가 무엇인가요?',
    subtitle: '해당되는 것을 모두 선택해주세요 (복수 선택 가능)',
    multiSelect: true,
    options: [
      { value: 'fatigue', label: '😴 만성 피로 / 에너지 부족' },
      { value: 'immunity', label: '🛡️ 면역력 강화' },
      { value: 'eyes', label: '👁️ 눈 건강 / 눈 피로' },
      { value: 'stress', label: '💆 스트레스 / 수면 장애' },
      { value: 'cardiovascular', label: '🫀 혈관 / 심장 건강' },
      { value: 'bones', label: '🦴 뼈 / 관절 건강' },
      { value: 'digestive', label: '🌿 소화 / 장 건강' },
      { value: 'skin', label: '✨ 피부 / 미용' },
    ],
  },
  {
    id: 'age',
    text: '연령대를 알려주세요',
    subtitle: '나이에 맞는 영양제를 추천해드려요',
    multiSelect: false,
    options: [
      { value: '20s', label: '20대' },
      { value: '30s', label: '30대' },
      { value: '40s', label: '40대' },
      { value: '50plus', label: '50대 이상' },
    ],
  },
  {
    id: 'diet',
    text: '평소 식습관이 어떤가요?',
    subtitle: '가장 가까운 것을 선택해주세요',
    multiSelect: false,
    options: [
      { value: 'meat', label: '🥩 고기류를 자주 먹어요' },
      { value: 'vegetarian', label: '🥗 채식 위주로 먹어요' },
      { value: 'irregular', label: '⏰ 불규칙하게 먹거나 끼니를 자주 거릅니다' },
      { value: 'balanced', label: '🍱 비교적 균형 있게 먹는 편이에요' },
    ],
  },
  {
    id: 'sunlight',
    text: '하루에 햇빛을 얼마나 쬐나요?',
    subtitle: '비타민D 생성과 관련이 있어요',
    multiSelect: false,
    options: [
      { value: 'indoor', label: '🏠 거의 실내에서만 생활해요' },
      { value: 'moderate', label: '🚶 하루 1~2시간 정도 야외 활동해요' },
      { value: 'outdoor', label: '☀️ 야외 활동이 많아요 (2시간 이상)' },
    ],
  },
  {
    id: 'symptoms',
    text: '다음 중 해당되는 증상이 있나요?',
    subtitle: '복수 선택 가능해요',
    multiSelect: true,
    options: [
      { value: 'none', label: '해당 없음' },
      { value: 'dry_skin', label: '💧 피부가 건조하고 칙칙해요' },
      { value: 'hair_loss', label: '💇 머리카락이 많이 빠져요' },
      { value: 'constipation', label: '🚽 변비가 있어요' },
      { value: 'muscle_cramp', label: '⚡ 근육 경련이나 쥐가 자주 나요' },
      { value: 'blurry_vision', label: '👀 눈이 침침하거나 뻑뻑해요' },
    ],
  },
];

type Answers = {
  concerns: string[];
  age: string;
  diet: string;
  sunlight: string;
  symptoms: string[];
};

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({
    concerns: [],
    age: '',
    diet: '',
    sunlight: '',
    symptoms: [],
  });

  const question = questions[step];

  const handleSelect = (value: string) => {
    const key = question.id as keyof Answers;
    if (question.multiSelect) {
      const arr = answers[key] as string[];
      setAnswers((prev) => ({
        ...prev,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      }));
    } else {
      setAnswers((prev) => ({ ...prev, [key]: value }));
    }
  };

  const isSelected = (value: string) => {
    const key = question.id as keyof Answers;
    const val = answers[key];
    return Array.isArray(val) ? val.includes(value) : val === value;
  };

  const canProceed = () => {
    const key = question.id as keyof Answers;
    const val = answers[key];
    return Array.isArray(val) ? val.length > 0 : val !== '';
  };

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep((prev) => prev + 1);
    } else {
      sessionStorage.setItem('vitAnswers', JSON.stringify(answers));
      router.push('/recommend');
    }
  };

  const progress = ((step + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Hero header */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">💊</div>
        <h1 className="text-3xl font-bold text-gray-800">영양제 추천</h1>
        <p className="text-gray-500 mt-1 text-sm">내 몸에 딱 맞는 영양제를 AI가 골라드려요</p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-2xl mb-6">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>건강 분석 설문</span>
          <span>
            {step + 1} / {questions.length}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div
        key={step}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-lg p-8 animate-fade-in"
      >
        <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-2">
          Q{step + 1}
        </p>
        <h2 className="text-xl font-bold text-gray-800 mb-1">{question.text}</h2>
        {question.subtitle && (
          <p className="text-gray-400 text-sm mb-6">{question.subtitle}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {question.options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={`p-4 rounded-2xl border-2 text-left transition-all duration-150 ${
                isSelected(opt.value)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              <span className="text-sm font-medium">{opt.label}</span>
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center mt-8">
          <button
            onClick={() => setStep((prev) => prev - 1)}
            disabled={step === 0}
            className="px-5 py-2.5 text-gray-400 disabled:opacity-30 hover:text-gray-600 transition-colors text-sm"
          >
            ← 이전
          </button>
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="px-8 py-3 bg-blue-500 text-white rounded-full font-semibold disabled:opacity-30 hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg text-sm"
          >
            {step === questions.length - 1 ? '결과 보기 ✨' : '다음 →'}
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-6">총 {questions.length}개 질문 · 1분 소요</p>
    </div>
  );
}
