import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getCategoryById } from '@/lib/supplements';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { categoryId, userAnswers } = await req.json();

  const category = getCategoryById(categoryId);
  if (!category) {
    return NextResponse.json({ error: '카테고리를 찾을 수 없습니다.' }, { status: 404 });
  }

  const pharmacyList = category.pharmacyProducts
    .map(
      (p) =>
        `[약국] ${p.name} (${p.brand}) - ${p.price.toLocaleString()}원, 평점 ${p.rating}/5 (${p.reviewCount}명)`
    )
    .join('\n');

  const marketplaceList = category.marketplaceProducts
    .map(
      (p) =>
        `[대행업체] ${p.name} (${p.brand}) - ${p.price.toLocaleString()}원, 평점 ${p.rating}/5 (${p.reviewCount}명)`
    )
    .join('\n');

  const prompt = `당신은 영양제 전문가입니다. 사용자에게 ${category.name} 구매 방법을 추천해주세요.

사용자 정보:
- 주요 고민: ${userAnswers?.concerns?.join(', ') || '미제공'}
- 연령대: ${userAnswers?.age || '미제공'}
- 식습관: ${userAnswers?.diet || '미제공'}

약국 제품 목록:
${pharmacyList}

해외 대행업체 제품 목록:
${marketplaceList}

다음 JSON 형식으로만 응답하세요:
{
  "winner": "pharmacy" 또는 "marketplace",
  "winnerReason": "결론을 2-3문장으로",
  "pharmacyAnalysis": "약국 제품 장단점 2-3문장",
  "marketplaceAnalysis": "대행업체 제품 장단점 2-3문장",
  "topPick": {
    "type": "pharmacy" 또는 "marketplace",
    "productId": "제품 ID (예: vc-ph-1)",
    "reason": "이 제품을 고른 이유 1-2문장"
  },
  "caution": "복용 시 주의사항 1-2문장"
}`;

  const message = await client.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  const text = message.choices[0].message.content ?? '{}';
  const result = JSON.parse(text);

  return NextResponse.json(result);
}
