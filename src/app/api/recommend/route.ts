import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supplementCategories } from '@/lib/supplements';
import { QuestionnaireAnswers, RecommendedCategory } from '@/lib/types';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const answers: QuestionnaireAnswers = await req.json();

  const categoryList = supplementCategories
    .map((c) => `- ${c.id} (${c.name}): ${c.description}. 타겟 고민: ${c.benefits.join(', ')}`)
    .join('\n');

  const prompt = `당신은 영양제 전문가입니다. 사용자의 답변을 분석해 가장 적합한 영양제 카테고리 3~4가지를 추천해주세요.

사용자 답변:
- 주요 건강 고민: ${answers.concerns.join(', ')}
- 연령대: ${answers.age}
- 식습관: ${answers.diet}
- 햇빛 노출: ${answers.sunlight}
- 추가 증상: ${answers.symptoms.join(', ')}

사용 가능한 영양제 카테고리:
${categoryList}

다음 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "recommendations": [
    {"categoryId": "vitaminC", "reason": "이유를 2문장 이내로", "priority": 1},
    {"categoryId": "omega3", "reason": "이유를 2문장 이내로", "priority": 2},
    {"categoryId": "magnesium", "reason": "이유를 2문장 이내로", "priority": 3}
  ]
}`;

  const message = await client.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  const text = message.choices[0].message.content ?? '{}';
  const parsed = JSON.parse(text);
  const recommendations: RecommendedCategory[] = parsed.recommendations;

  return NextResponse.json({ recommendations });
}
