import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { useThemeTokens } from '@/hooks/useTheme';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

/** Lazily-loaded three.js scene; colors are read from the live theme tokens. */
export function Scene3D({ compact = false, className }: { compact?: boolean; className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const tokens = useThemeTokens();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let disposeScene: (() => void) | undefined;

    void import('three').then((THREE) => {
      if (disposed || document.hidden && reducedMotion) return;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 100);
      camera.position.z = compact ? 5.4 : 6.4;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
      renderer.setClearColor(0x000000, 0);
      renderer.domElement.setAttribute('aria-hidden', 'true');
      host.appendChild(renderer.domElement);

      const group = new THREE.Group();
      const geometry = new THREE.IcosahedronGeometry(compact ? 1.25 : 1.75, 2);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(tokens.primary),
        wireframe: true,
        transparent: true,
        opacity: 0.55,
      });
      const coreGeometry = new THREE.IcosahedronGeometry(compact ? 0.5 : 0.7, 1);
      const coreMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(tokens.success),
        transparent: true,
        opacity: 0.16,
      });
      const shell = new THREE.Mesh(geometry, material);
      const core = new THREE.Mesh(coreGeometry, coreMaterial);
      group.add(shell, core);
      scene.add(group);

      const starGeometry = new THREE.BufferGeometry();
      const points = new Float32Array(150 * 3);
      for (let i = 0; i < points.length; i += 3) {
        points[i] = (Math.random() - 0.5) * 10;
        points[i + 1] = (Math.random() - 0.5) * 7;
        points[i + 2] = (Math.random() - 0.5) * 5;
      }
      starGeometry.setAttribute('position', new THREE.BufferAttribute(points, 3));
      const starMaterial = new THREE.PointsMaterial({ color: new THREE.Color(tokens.muted), size: 0.028 });
      scene.add(new THREE.Points(starGeometry, starMaterial));

      const resize = () => {
        const { clientWidth, clientHeight } = host;
        if (!clientWidth || !clientHeight) return;
        camera.aspect = clientWidth / clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(clientWidth, clientHeight, false);
      };
      resize();
      const observer = new ResizeObserver(resize);
      observer.observe(host);

      let frame = 0;
      const render = () => {
        if (!document.hidden) {
          if (!reducedMotion) {
            group.rotation.y += 0.0035;
            group.rotation.x += 0.0012;
            core.rotation.z -= 0.004;
          }
          renderer.render(scene, camera);
        }
        if (!reducedMotion) frame = requestAnimationFrame(render);
      };
      render();

      disposeScene = () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        geometry.dispose();
        material.dispose();
        coreGeometry.dispose();
        coreMaterial.dispose();
        starGeometry.dispose();
        starMaterial.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    });

    return () => {
      disposed = true;
      disposeScene?.();
    };
  }, [compact, reducedMotion, tokens.muted, tokens.primary, tokens.success]);

  return (
    <div
      ref={hostRef}
      className={cn(
        'relative overflow-hidden rounded-xl bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--primary)_10%,transparent),transparent_65%)]',
        compact ? 'h-52 w-full' : 'h-64 w-full max-w-md',
        className,
      )}
      role="img"
      aria-label={t('overview.liveEyebrow')}
    >
      <div className="pointer-events-none absolute inset-0 grid place-items-center text-muted-foreground/40">
        <Sparkles className="size-6" aria-hidden="true" />
      </div>
    </div>
  );
}
