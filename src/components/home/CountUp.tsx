"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  value: number;
  duration?: number;
}

export default function CountUp({ value, duration = 1800 }: CountUpProps) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = elementRef.current;

    if (!element) return;

    let animationFrame = 0;
    let observer: IntersectionObserver | null = null;
    let started = false;

    const target = Math.max(0, Number(value) || 0);

    const startAnimation = () => {
      if (started) return;
      started = true;

      if (target === 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setCount(target);
        return;
      }

      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const progress = Math.min((currentTime - startTime) / Math.max(duration, 1), 1);

        const easedProgress = 1 - Math.pow(1 - progress, 4);

        setCount(Math.floor(easedProgress * target));

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        } else {
          setCount(target);
        }
      };

      animationFrame = requestAnimationFrame(animate);
    };

    setCount(0);

    if (!("IntersectionObserver" in window)) {
      startAnimation();
    } else {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            startAnimation();
            observer?.disconnect();
          }
        },
        {
          threshold: 0,
          rootMargin: "0px 0px -5% 0px",
        },
      );

      observer.observe(element);
    }

    return () => {
      observer?.disconnect();
      cancelAnimationFrame(animationFrame);
    };
  }, [value, duration]);

  return (
    <span ref={elementRef} aria-label={String(value)}>
      {count.toLocaleString("en-IN")}
    </span>
  );
}
