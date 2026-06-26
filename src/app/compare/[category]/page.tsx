'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCategoryById } from '@/lib/supplements';
import { Product } from '@/lib/types';
import PharmacyFinder from '@/components/PharmacyFinder';

interface AIResult {
  winner: 'pharmacy' | 'marketplace';
  winnerReason: string;
  pharmacyAnalysis: string;
  marketplaceAnalysis: string;
  topPick: { type: string; productId: string; reason: string };
  caution: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={`text-sm ${s <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}`}>
          ★
        </span>
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating}</span>
    </div>
  );
}

function ProductCard({
  product,
  isTopPick,
}: {
  product: Product;
  isTopPick: boolean;
}) {
  const [showReviews, setShowReviews] = useState(false);
  const [showPharmacy, setShowPharmacy] = useState(false);
  const isPharmacy = product.type === 'pharmacy';

  return (
    <div
      className={`bg-white rounded-2xl p-4 border-2 transition-all ${
        isTopPick ? 'border-purple-400 shadow-md' : 'border-gray-100 shadow-sm'
      }`}
    >
      {isTopPick && (
        <div className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-full mb-3">
          🤖 AI 추천
        </div>
      )}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0 pr-2">
          <p className="font-bold text-gray-800 text-sm leading-tight">{product.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">{product.brand}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-bold text-gray-800 text-sm">{product.price.toLocaleString()}원</p>
        </div>
      </div>

      <StarRating rating={product.rating} />
      <p className="text-xs text-gray-400 mt-0.5 mb-3">리뷰 {product.reviewCount.toLocaleString()}개</p>

      <p className="text-xs text-gray-600 mb-3 leading-relaxed">{product.description}</p>

      <div className="flex flex-wrap gap-1 mb-3">
        {product.features.map((f) => (
          <span key={f} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {f}
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setShowReviews((v) => !v)}
          className="flex-1 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          {showReviews ? '리뷰 접기 ▲' : `리뷰 보기 ▼ (${product.reviewCount.toLocaleString()})`}
        </button>
        {!isPharmacy && (
          <a
            href={`https://www.coupang.com/np/search?q=${encodeURIComponent(product.name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2 rounded-xl bg-orange-500 text-white text-xs font-semibold text-center hover:bg-orange-600 transition-colors"
          >
            구매하기 →
          </a>
        )}
      </div>

      {isPharmacy && (
        <button
          onClick={() => setShowPharmacy((v) => !v)}
          className="mt-2 w-full py-2 rounded-xl bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-colors"
        >
          {showPharmacy ? '📍 약국 찾기 닫기 ▲' : '📍 근처 약국 찾기 ▼'}
        </button>
      )}

      {showReviews && (
        <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
          {product.reviews.map((review, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-gray-700">{review.author}</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className={`text-xs ${s <= review.rating ? 'text-yellow-400' : 'text-gray-200'}`}>
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{review.content}</p>
              <p className="text-xs text-gray-400 mt-1">{review.date}</p>
            </div>
          ))}
        </div>
      )}

      {isPharmacy && showPharmacy && (
        <div className="mt-3 border-t border-gray-100 pt-3">
          <PharmacyFinder />
        </div>
      )}
    </div>
  );
}

export default function ComparePage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = use(params);
  const router = useRouter();
  const cat = getCategoryById(category);

  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  if (!cat) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">카테고리를 찾을 수 없습니다.</p>
          <button onClick={() => router.push('/recommend')} className="text-blue-500 hover:underline text-sm">
            추천 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const handleAIRecommend = async () => {
    setAiLoading(true);
    setAiError('');
    try {
      const answers = JSON.parse(sessionStorage.getItem('vitAnswers') || '{}');
      const res = await fetch('/api/ai-final', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId: category, userAnswers: answers }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAiResult(data);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : 'AI 추천을 가져오는 중 오류가 발생했습니다.');
    } finally {
      setAiLoading(false);
    }
  };

  const getTopPickProduct = (result: AIResult) => {
    const products =
      result.topPick.type === 'pharmacy' ? cat.pharmacyProducts : cat.marketplaceProducts;
    return products.find((p) => p.id === result.topPick.productId);
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Navigation */}
        <button
          onClick={() => router.push('/recommend')}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors mb-6 flex items-center gap-1"
        >
          ← 추천 목록으로
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div
            className={`inline-flex w-20 h-20 rounded-3xl bg-linear-to-br ${cat.color} items-center justify-center text-4xl mb-4 shadow-lg`}
          >
            {cat.emoji}
          </div>
          <h1 className="text-2xl font-bold text-gray-800">{cat.name}</h1>
          <p className="text-gray-500 text-sm mt-1 max-w-md mx-auto">{cat.description}</p>
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            {cat.benefits.map((b) => (
              <span key={b} className="bg-white text-gray-600 text-xs px-3 py-1 rounded-full shadow-sm border border-gray-100">
                {b}
              </span>
            ))}
          </div>
        </div>

        {/* Compare label */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-sm text-gray-400 font-medium whitespace-nowrap">제품 비교</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Two-column product grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Pharmacy column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full">
                🏥 약국 제품
              </div>
              <span className="text-xs text-gray-400">전국 약국에서 바로 구매</span>
            </div>
            <div className="space-y-4">
              {cat.pharmacyProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  isTopPick={aiResult?.topPick.productId === p.id}
                />
              ))}
            </div>
          </div>

          {/* Marketplace column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1.5 rounded-full">
                🛒 대행업체 제품
              </div>
              <span className="text-xs text-gray-400">쿠팡 등 온라인 구매</span>
            </div>
            <div className="space-y-4">
              {cat.marketplaceProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  isTopPick={aiResult?.topPick.productId === p.id}
                />
              ))}
            </div>
          </div>
        </div>

        {/* AI Recommendation section */}
        {!aiResult && (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm mb-4">
              약국과 대행업체 제품 중 어느 것이 더 나을까요?
            </p>
            <button
              onClick={handleAIRecommend}
              disabled={aiLoading}
              className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 text-white rounded-2xl font-bold text-base shadow-lg hover:bg-purple-700 transition-all duration-200 disabled:opacity-50 hover:shadow-xl"
            >
              {aiLoading ? (
                <>
                  <span className="animate-spin">⚙️</span> AI 분석 중...
                </>
              ) : (
                <>🤖 AI 최종 추천 받기</>
              )}
            </button>
            {aiError && <p className="text-red-500 text-sm mt-3">{aiError}</p>}
          </div>
        )}

        {/* AI Result */}
        {aiResult && (
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden animate-fade-in">
            {/* Winner banner */}
            <div
              className={`p-6 text-white ${
                aiResult.winner === 'pharmacy'
                  ? 'bg-linear-to-r from-blue-600 to-blue-500'
                  : 'bg-linear-to-r from-orange-500 to-orange-400'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">🤖</span>
                <div>
                  <p className="text-xs font-semibold opacity-80 uppercase tracking-wider">AI 최종 추천</p>
                  <h2 className="text-xl font-bold">
                    {aiResult.winner === 'pharmacy' ? '🏥 약국 제품' : '🛒 대행업체 제품'}을 추천해요
                  </h2>
                </div>
              </div>
              <p className="text-sm opacity-90 leading-relaxed">{aiResult.winnerReason}</p>
            </div>

            <div className="p-6 space-y-5">
              {/* Analysis */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-2xl p-4">
                  <p className="text-xs font-bold text-blue-600 mb-1.5">🏥 약국 제품 분석</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{aiResult.pharmacyAnalysis}</p>
                </div>
                <div className="bg-orange-50 rounded-2xl p-4">
                  <p className="text-xs font-bold text-orange-600 mb-1.5">🛒 대행업체 제품 분석</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{aiResult.marketplaceAnalysis}</p>
                </div>
              </div>

              {/* Top pick */}
              {(() => {
                const topProduct = getTopPickProduct(aiResult);
                return topProduct ? (
                  <div className="border-2 border-purple-300 rounded-2xl p-4 bg-purple-50">
                    <p className="text-xs font-bold text-purple-700 mb-2">🌟 이 제품이 최선의 선택이에요</p>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{topProduct.name}</p>
                        <p className="text-xs text-gray-400">{topProduct.brand} · {topProduct.price.toLocaleString()}원</p>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">{aiResult.topPick.reason}</p>
                      </div>
                    </div>
                    {aiResult.topPick.type === 'marketplace' && (
                      <a
                        href={`https://www.coupang.com/np/search?q=${encodeURIComponent(topProduct.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-block px-4 py-2 bg-orange-500 text-white text-xs font-semibold rounded-xl hover:bg-orange-600 transition-colors"
                      >
                        쿠팡에서 구매하기 →
                      </a>
                    )}
                  </div>
                ) : null;
              })()}

              {/* Caution */}
              <div className="flex items-start gap-2 bg-yellow-50 rounded-xl p-4">
                <span className="text-lg shrink-0">⚠️</span>
                <p className="text-xs text-gray-600 leading-relaxed">{aiResult.caution}</p>
              </div>

              {/* Pharmacy finder if winner is pharmacy */}
              {aiResult.winner === 'pharmacy' && <PharmacyFinder />}
            </div>
          </div>
        )}

        {/* Re-ask AI */}
        {aiResult && (
          <div className="text-center mt-6">
            <button
              onClick={handleAIRecommend}
              disabled={aiLoading}
              className="text-sm text-purple-500 hover:text-purple-700 transition-colors"
            >
              {aiLoading ? '분석 중...' : '↺ AI 추천 다시 받기'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
