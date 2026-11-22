import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

interface LogoMotionProps {
  children: ReactNode;
  variant?: 'splash' | 'header';
  className?: string;
}

/**
 * The original splash/header animation without the motorcycle:
 * the logo is nudged, then springs back. Same 700ms start and 10s loop.
 */
export function LogoMotion({ children, variant = 'header', className }: LogoMotionProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const root = rootRef.current;
    const logo = logoRef.current;
    if (!root || !logo) return;

    let timeline: gsap.core.Timeline | undefined;
    const context = gsap.context(() => {
      timeline = gsap.timeline({ paused: true, defaults: { overwrite: 'auto' } });
      timeline
        .to(logo, { x: variant === 'splash' ? 28 : 12, duration: 0.95, ease: 'power2.out' }, 0.5)
        .to(logo, { x: 0, duration: 1.15, ease: 'elastic.out(1.15, 0.42)' }, 1.42);
    }, root);

    const play = () => {
      if (!document.hidden) timeline?.restart();
    };
    const initial = window.setTimeout(play, 700);
    const interval = window.setInterval(play, 10_000);
    const onVisibility = () => {
      if (document.hidden) timeline?.pause();
      else timeline?.resume();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.clearTimeout(initial);
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
      timeline?.kill();
      context.revert();
    };
  }, [reducedMotion, variant]);

  return (
    <div ref={rootRef} className={cn('relative isolate flex items-center', className)}>
      <div ref={logoRef} className="relative z-10 flex items-center will-change-transform">
        {children}
      </div>
    </div>
  );
}
