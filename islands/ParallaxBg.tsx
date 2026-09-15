import { useEffect, useRef } from "preact/hooks";

interface ParallaxBgProps {
  src: string;
  class?: string;
}

export default function ParallaxBg({ src, class: className }: ParallaxBgProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let raf = 0;

    function apply() {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      if (el) {
        el.style.transform =
          `scale(1.12) translate3d(${currentX}px, ${currentY}px, 0)`;
      }
      raf = requestAnimationFrame(apply);
    }

    function handlePointerMove(e: PointerEvent) {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      targetX = nx * -24;
      targetY = ny * -24;
    }

    function handleOrientation(e: DeviceOrientationEvent) {
      if (e.gamma == null || e.beta == null) return;
      const nx = Math.max(-1, Math.min(1, e.gamma / 30));
      const ny = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
      targetX = nx * -14;
      targetY = ny * -14;
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("deviceorientation", handleOrientation);
    raf = requestAnimationFrame(apply);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("deviceorientation", handleOrientation);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      class={className}
      style={{ backgroundImage: `url(${src})` }}
    />
  );
}
