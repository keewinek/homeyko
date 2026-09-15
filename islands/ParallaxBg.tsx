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

    let raf = 0;

    function apply() {
      raf = 0;
      if (el) {
        const offset = window.scrollY * 0.35;
        el.style.transform = `scale(1.12) translate3d(0, ${offset}px, 0)`;
      }
    }

    function handleScroll() {
      if (!raf) raf = requestAnimationFrame(apply);
    }

    apply();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (raf) cancelAnimationFrame(raf);
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
