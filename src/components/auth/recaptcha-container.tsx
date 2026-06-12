"use client";

interface RecaptchaContainerProps {
  id?: string;
  className?: string;
}

/** Must stay mounted before RecaptchaVerifier is created (Firebase Phone Auth). */
export function RecaptchaContainer({
  id = "recaptcha-container",
  className,
}: RecaptchaContainerProps) {
  return <div id={id} className={className} aria-hidden="true" />;
}
