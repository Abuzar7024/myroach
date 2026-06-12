import type { Metadata } from "next";
import { Orbitron, Rajdhani } from "next/font/google";
import { SiteShell } from "@/components/layout/site-shell";
import { Providers } from "@/components/providers";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/lib/constants";
import { isMockDataMode } from "@/lib/firebase/config";
import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-orbitron",
  display: "swap",
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-rajdhani",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — Main Character Streetwear`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: "/apple-icon",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Squad Up, Full Send`,
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const appCheckDebugToken =
    !isMockDataMode() &&
    process.env.NODE_ENV === "development"
      ? process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_DEBUG_TOKEN
      : undefined;

  return (
    <html lang="en" className={`${orbitron.variable} ${rajdhani.variable} h-full`}>
      <head>
        {appCheckDebugToken ? (
          <script
            id="firebase-app-check-debug-token"
            dangerouslySetInnerHTML={{
              __html: `self.FIREBASE_APPCHECK_DEBUG_TOKEN=${JSON.stringify(appCheckDebugToken)};`,
            }}
          />
        ) : null}
      </head>
      <body className="min-h-full flex flex-col antialiased cyber-grid text-foreground bg-background">
        <Providers>
          <SiteShell>{children}</SiteShell>
        </Providers>
      </body>
    </html>
  );
}
