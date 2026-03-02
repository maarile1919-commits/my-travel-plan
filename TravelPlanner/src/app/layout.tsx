import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
    title: "✈️ AI 여행 플래너 | 나만의 완벽한 여행 일정",
    description: "AI와 대화하며 나만의 완벽한 여행 일정을 만들어보세요. 취향과 성향에 맞는 맞춤형 여행 플랜을 제안해드립니다.",
    keywords: "여행 플래너, AI 여행, 여행 일정, 맞춤 여행",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko">
            <body className={`${inter.variable} font-sans antialiased`}>
                {children}
            </body>
        </html>
    );
}
