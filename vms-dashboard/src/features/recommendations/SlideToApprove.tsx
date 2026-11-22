import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Check, ChevronRight } from 'lucide-react';

export function SlideToApprove({ label, onApprove }: { label: string; onApprove: () => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const dragging = useRef(false);
  const startX = useRef(0);
  const maxDistance = useRef(1);
  const direction = useRef(1);
  const [maxDistanceValue, setMaxDistanceValue] = useState(1);
  const [directionValue, setDirectionValue] = useState(1);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  const finish = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    if (progressRef.current >= 0.72) {
      setProgress(1);
      onApprove();
      window.setTimeout(() => setProgress(0), 350);
    } else {
      setProgress(0);
    }
  }, [onApprove]);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      if (!dragging.current) return;
      const delta = (event.clientX - startX.current) * direction.current;
      setProgress(Math.min(1, Math.max(0, delta / Math.max(1, maxDistance.current))));
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', finish);
    window.addEventListener('pointercancel', finish);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', finish);
      window.removeEventListener('pointercancel', finish);
    };
  }, [finish]);

  const start = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    direction.current = getComputedStyle(track).direction === 'rtl' ? -1 : 1;
    maxDistance.current = Math.max(1, rect.width - 40);
    setDirectionValue(direction.current);
    setMaxDistanceValue(maxDistance.current);
    startX.current = event.clientX;
    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  return (
    <div
      ref={trackRef}
      className="relative h-9 w-[170px] max-w-full touch-none overflow-hidden rounded-lg border border-[var(--success)] bg-[var(--success-soft)]"
    >
      <div
        aria-hidden="true"
        className="absolute inset-y-0 start-0 w-full bg-[color-mix(in_srgb,var(--success)_22%,transparent)]"
        style={{ transform: `scaleX(${progress})`, transformOrigin: directionValue === -1 ? 'right center' : 'left center' }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 grid place-items-center px-4 text-[10px] font-bold text-[var(--success)] transition-opacity"
        style={{ opacity: 1 - progress }}
      >
        {label}
      </span>
      <button
        type="button"
        aria-label={label}
        onPointerDown={start}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onApprove();
          }
        }}
        className="absolute start-[3px] top-[3px] grid size-7 place-items-center rounded-md bg-[var(--success)] text-white shadow-sm will-change-transform"
        style={{ transform: `translateX(${progress * maxDistanceValue * directionValue}px)` }}
      >
        {progress >= 0.72 ? <Check className="size-3.5" /> : <ChevronRight className="size-3.5" />}
      </button>
    </div>
  );
}
