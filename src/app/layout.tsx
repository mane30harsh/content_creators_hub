import type { Metadata } from "next";
import { Host_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/shared/providers";

const hostGrotesk = Host_Grotesk({ subsets: ["latin"], variable: "--font-host-grotesk" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Brridge – Beyond your DM",
  description: "Get discovered for your influence, find brand deals & co-create on Brridge.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`min-h-screen bg-background text-foreground antialiased ${hostGrotesk.variable} ${inter.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
