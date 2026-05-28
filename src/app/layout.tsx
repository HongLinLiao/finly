import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Geist, Geist_Mono, IBM_Plex_Sans } from "next/font/google";

import { AuthProvider } from "@/components/provider/auth-provider";
import { ThemeProvider } from "@/components/provider/theme-provider";
import { RegisterServiceWorker } from "@/components/pwa/register-service-worker";
import { environment } from "@/lib/environment";
import { cn } from "@/lib/utils";

import type { Metadata, Viewport } from "next";

import "./globals.css";

function getSiteUrl() {
  if (!environment.lineRedirectUri) {
    return "http://localhost:3000";
  }

  try {
    return new URL(environment.lineRedirectUri).origin;
  } catch {
    return "http://localhost:3000";
  }
}

const siteUrl = getSiteUrl();

const siteTitle = "Finly｜個人資產管理儀表板";
const siteDescription = "集中追蹤現金、股票與基金，清楚掌握你的資產配置與投資表現。";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s｜Finly",
  },
  description: siteDescription,
  applicationName: "Finly",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: ["/favicon.ico"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Finly",
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: "/",
    siteName: "Finly",
    locale: "zh_TW",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1024,
        height: 1024,
        alt: "Finly",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: siteTitle,
    description: siteDescription,
    images: ["/logo.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#f7faf8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        ibmPlexSans.variable
      )}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <RegisterServiceWorker />
            <SpeedInsights />
            <Analytics />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
