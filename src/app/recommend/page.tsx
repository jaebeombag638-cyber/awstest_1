'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RecommendedCategory } from '@/lib/types';
import { supplementCategories } from '@/lib/supplements';

export default function RecommendPage() {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<RecommendedCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => setDots((d) => (d.length >= 3 ? '' : d + '.')), 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const raw = sessionStorage.getItem('vitAnswers');
    if (!raw) {
      router.push('/');
      return;
    }
    const answers = JSON.parse(raw);

    fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(answers),
    })
      .then((res) => res.json())
      .then((data) => {
        setRecommendations(data.recommendations || []);
        setLoading(false);
      })
      .catch(() => {
        setError('추천을 가져오는 중 오류가 발생했습니다. 다시 시도해주세요.');
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-2xl">🤖</div>
        </div>
        <div className="text-center">
          <p className="text-gray-700 font-medium text-lg">AI가 분석 중이에요{dots}</p>
          <p className="text-gray-400 text-sm mt-1">답변을 바탕으로 최적의 영양제를 찾고 있어요</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-white rounded-3xl p-10 shadow-lg max-w-sm">
          <div className="text-5xl mb-4">😕</div>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition-colors"
          >
            처음으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const priorityLabels = ['🥇 1순위', '🥈 2순위', '🥉 3순위', '➕ 추가'];
  const priorityColors = [
    'bg-yellow-100 text-yellow-700',
    'bg-gray-100 text-gray-600',
    'bg-orange-100 text-orange-600',
    'bg-blue-100 text-blue-600',
  ];

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block bg-green-100 text-green-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            ✅ 분석 완료
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">맞춤 영양제 추천</h1>
          <p className="text-gray-500 text-sm">
            답변 분석 결과, 아래 영양제가 가장 필요해요
          </p>
        </div>

        {/* Recommendation cards */}
        <div className="space-y-4 mb-10">
          {recommendations.map((rec, i) => {
            const category = supplementCategories.find((c) => c.id === rec.categoryId);
            if (!category) return null;
            return (
              <button
                key={rec.categoryId}
                onClick={() => router.push(`/compare/${rec.categoryId}`)}
                className="w-full bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-all duration-200 animate-fade-in text-left group"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-linear-to-br ${category.color} flex items-center justify-center text-2xl shrink-0 shadow-sm group-hover:scale-105 transition-transform`}
                >
                  {category.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${priorityColors[i] ?? priorityColors[3]}`}
                    >
                      {priorityLabels[i] ?? '추가'}
                    </span>
                    <span className="font-bold text-gray-800">{category.name}</span>
                  </div>
                  <p className="text-sm text-gray-500 leading-snug line-clamp-2">{rec.reason}</p>
                </div>
                <div className="text-gray-300 group-hover:text-blue-400 transition-colors shrink-0">
                  →
                </div>
              </button>
            );
          })}
        </div>

        {/* All categories */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-bold text-gray-700 mb-4 text-sm">다른 영양제도 찾아보기</h2>
          <div className="grid grid-cols-5 gap-2">
            {supplementCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => router.push(`/compare/${cat.id}`)}
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-linear-to-br ${cat.color} flex items-center justify-center text-lg`}
                >
                  {cat.emoji}
                </div>
                <span className="text-xs text-gray-600 text-center leading-tight">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => router.push('/')}
          className="mt-6 w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors py-3"
        >
          ← 설문 다시 하기
        </button>
      </div>
    </div>
  );
}
