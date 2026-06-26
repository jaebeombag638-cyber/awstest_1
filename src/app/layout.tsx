import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "영양제 추천 | 내 몸에 딱 맞는 영양제 찾기",
  description: "몇 가지 질문에 답하면 AI가 나에게 맞는 영양제를 추천해드려요. 약국 vs 해외직구 제품 비교와 실 사용자 후기까지!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${notoSansKR.variable} h-full`}>
      <body className="min-h-full bg-linear-to-br from-blue-50 via-white to-green-50">
        {children}
      </body>
    </html>
  );
}
