import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Veterans Retirement Atlas",
  description:
    "Discover the best destinations for veterans to retire based on lifestyle, climate, taxes, and support resources.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <Script id="theme-init" strategy="beforeInteractive">
        {`(() => {
          try {
            const storageKey = "veterans-retirement-theme";
            const root = document.documentElement;
            if (!root) {
              return;
            }
            const stored = window.localStorage.getItem(storageKey);
            const theme = stored === "light" || stored === "dark"
              ? stored
              : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
            root.dataset.theme = theme;
          } catch (error) {
            // ignore
          }
        })();`}
      </Script>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-surface text-primary antialiased transition-colors`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
