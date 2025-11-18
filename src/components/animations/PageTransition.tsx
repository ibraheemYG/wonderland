"use client";

import React, { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "@/lib/gsap";

// Fades content on route change for smoother page transitions.
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (!scope.current) return;
    const el = scope.current;
    gsap.fromTo(
      el.children,
      { autoAlpha: 0, y: 12 },
      { autoAlpha: 1, y: 0, stagger: 0.04, duration: 0.5 }
    );
  }, [pathname]);

  return <div ref={scope}>{children}</div>;
}