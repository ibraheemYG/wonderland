"use client";

import { gsap } from "gsap";

// Central place to configure GSAP defaults.
gsap.defaults({ ease: "power2.out", duration: 0.6 });

export { gsap };

// Helper to run an animation context safely with cleanup.
export function withGsapContext(cb: (ctx: gsap.Context) => void, scope: React.RefObject<HTMLElement>) {
  if (typeof window === "undefined") return;
  const ctx = gsap.context(() => cb(ctx), scope);
  return () => ctx.revert();
}