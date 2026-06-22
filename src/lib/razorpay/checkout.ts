const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

let scriptPromise: Promise<boolean> | null = null;

export function loadRazorpayCheckout(): Promise<boolean> {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }

  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  if (!scriptPromise) {
    scriptPromise = new Promise((resolve) => {
      const existing = document.querySelector(`script[src="${RAZORPAY_SCRIPT}"]`);
      if (existing) {
        existing.addEventListener("load", () => resolve(Boolean(window.Razorpay)));
        existing.addEventListener("error", () => resolve(false));
        return;
      }

      const script = document.createElement("script");
      script.src = RAZORPAY_SCRIPT;
      script.async = true;
      script.onload = () => resolve(Boolean(window.Razorpay));
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  return scriptPromise;
}
