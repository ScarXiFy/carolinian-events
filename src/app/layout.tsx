import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Carolinian Events",
  description: "Browse and manage University of San Carlos campus events.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster
          theme="dark"
          richColors
          position="top-center"
          toastOptions={{
            classNames: {
              toast: "border-[#2a8c4f]/40 bg-[#071f11] text-[#d9ffe5]",
              success: "border-[#2a8c4f]/50 bg-[#071f11] text-[#d9ffe5]",
              info: "border-[#d4a843]/45 bg-[#241d0b] text-[#f6e6b4]",
            },
          }}
        />
      </body>
    </html>
  );
}
