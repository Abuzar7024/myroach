"use client";

import { useEffect, useRef } from "react";

interface RecaptchaContainerProps {
  id?: string;
  className?: string;
}

export function RecaptchaContainer({
  id = "recaptcha-container",
  className,
}: RecaptchaContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.id = id;
    }
  }, [id]);

  return (
    <div
      ref={containerRef}
      id={id}
      className={className}
      aria-hidden="true"
    />
  );
}
