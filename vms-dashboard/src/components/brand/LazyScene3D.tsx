import { lazy, Suspense } from 'react';
import { cn } from '@/lib/utils';

const Scene3D = lazy(() => import('./Scene3D').then((module) => ({ default: module.Scene3D })));

type SceneProps = React.ComponentProps<typeof Scene3D>;

export function LazyScene3D({ className, ...props }: SceneProps) {
  return (
    <Suspense
      fallback={
        <div
          className={cn(
            'vms-skeleton h-52 w-full sm:h-64',
            props.compact ? 'max-w-none' : 'max-w-md',
            className,
          )}
          aria-hidden="true"
        />
      }
    >
      <Scene3D className={className} {...props} />
    </Suspense>
  );
}
