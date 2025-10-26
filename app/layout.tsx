import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DateFilterProvider } from "@/contexts/DateFilterContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Inview AI - Call Centre Management",
  description: "AI-powered call centre management platform for team leaders",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <DateFilterProvider>
          {children}
        </DateFilterProvider>
      </body>
    </html>
  );
}
