import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Bag Check - Проверка подлинности сумок",
    description: "Профессиональная проверка подлинности дизайнерских сумок",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ru">
        <body className="antialiased bg-white text-gray-900">
        {children}
        </body>
        </html>
    );
}