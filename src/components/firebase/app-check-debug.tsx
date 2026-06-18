import Script from "next/script";

interface AppCheckDebugProps {
  token: string;
}

/** Sets Firebase App Check debug token before SDK init (dev only). */
export function AppCheckDebug({ token }: AppCheckDebugProps) {
  return (
    <Script
      id="firebase-app-check-debug-token"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{
        __html: `self.FIREBASE_APPCHECK_DEBUG_TOKEN=${JSON.stringify(token)};`,
      }}
    />
  );
}
