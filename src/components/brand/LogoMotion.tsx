import { useEffect, useRef, type PointerEvent, type ReactNode } from 'react';
import gsap from 'gsap';
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

interface LogoMotionProps {
  children: ReactNode;
  variant?: 'splash' | 'header';
  className?: string;
}

/**
 * VMS logo in a glass panel that gently tracks the pointer. The logo keeps the
 * original nudge-and-bounce timing: first run at 700ms, then every 10s.
 * Reduced motion and hidden tabs disable the animation.
 */
export function LogoMotion({ children, variant = 'header', className }: LogoMotionProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 260, damping: 24 });
  const smoothY = useSpring(pointerY, { stiffness: 260, damping: 24 });
  const rotateX = useTransform(smoothY, [-1, 1], [9, -9]);
  const rotateY = useTransform(smoothX, [-1, 1], [-11, 11]);
  const glareX = useTransform(smoothX, [-1, 1], [12, 88]);
  const glareY = useTransform(smoothY, [-1, 1], [12, 88]);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, color-mix(in srgb, var(--foreground) 16%, transparent), transparent 62%)`;

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

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - rect.left) / rect.width - 0.5) * 2);
    pointerY.set(((event.clientY - rect.top) / rect.height - 0.5) * 2);
  };

  const onPointerLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <div
      ref={rootRef}
      className={cn('relative isolate flex items-center [perspective:800px]', className)}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <motion.div
        className={cn(
          'vms-logo-glass relative flex items-center rounded-2xl [transform-style:preserve-3d]',
          variant === 'splash' ? 'px-4 py-3' : 'px-2 py-1',
        )}
        style={reducedMotion ? undefined : { rotateX, rotateY }}
      >
        <div ref={logoRef} className="relative z-10 flex items-center will-change-transform">
          {children}
        </div>
        {!reducedMotion && (
          <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ background: glare }} />
        )}
      </motion.div>
    </div>
  );
}
