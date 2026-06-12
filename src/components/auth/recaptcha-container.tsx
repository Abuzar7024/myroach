"use client";

interface RecaptchaContainerProps {
  id?: string;
  className?: string;
}

/**
 * Legacy container for RecaptchaVerifier by element id.
 * Phone auth now attaches invisible reCAPTCHA to the Send OTP button instead.
 * @deprecated Prefer button-attached RecaptchaVerifier in PhoneAuthFlow.
 */
export function RecaptchaContainer({
  id = "recaptcha-container",
  className,
}: RecaptchaContainerProps) {
  return <div id={id} className={className} aria-hidden="true" />;
}
