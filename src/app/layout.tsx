import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, JetBrains_Mono } from "next/font/google";
import Header from "@/components/Header";
import ProgressSync from "@/components/ProgressSync";
import "./globals.css";

const arabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
});
const code = JetBrains_Mono({ subsets: ["latin"], variable: "--font-code" });

export const metadata: Metadata = {
  title: "فاهم — افهم البرمجة، لا تحفظها",
  description: "تعلّم الفل ستاك بالرسوم المتحركة: شاهد ما يحدث داخل الجهاز وهو ينفّذ كودك.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${arabic.variable} ${code.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <Header />
        <ProgressSync />
        {children}
      </body>
    </html>
  );
}
