'use client';

import React, { useEffect, useRef, useState } from 'react';

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/** Retorna true quando o elemento entra na tela (uma única vez). */
export function useInView<T extends HTMLElement>(enabled = true, threshold = 0.15) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(!enabled);

  useEffect(() => {
    if (!enabled || inView) return;
    const el = ref.current;
    if (!el || prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [enabled, inView, threshold]);

  return { ref, inView };
}

/** Faz o conteúdo subir e aparecer suavemente ao entrar na tela. */
export function Reveal({
  children,
  className = '',
  delay = 0,
  enabled = true,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  enabled?: boolean;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(enabled);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: enabled ? `${delay}ms` : undefined }}
      className={`${
        enabled ? 'transition-all duration-700 ease-out print:!opacity-100 print:!translate-y-0' : ''
      } ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'} ${className}`}
    >
      {children}
    </div>
  );
}

/** Número que "sobe" até o valor final quando aparece na tela. */
export function CountUp({
  value,
  enabled = true,
  duration = 900,
}: {
  value: number;
  enabled?: boolean;
  duration?: number;
}) {
  const { ref, inView } = useInView<HTMLSpanElement>(enabled);
  const [display, setDisplay] = useState(enabled ? 0 : value);

  useEffect(() => {
    if (!enabled) {
      setDisplay(value);
      return;
    }
    if (!inView) return;
    if (prefersReducedMotion()) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, enabled, duration]);

  return <span ref={ref}>{display}</span>;
}

/** Barra de progresso que enche ao aparecer na tela. */
export function AnimatedBar({
  percent,
  color,
  trackClass,
  enabled = true,
  delay = 0,
  glow = false,
}: {
  percent: number;
  color: string;
  trackClass: string;
  enabled?: boolean;
  delay?: number;
  glow?: boolean;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(enabled);
  return (
    <div ref={ref} className={`h-1.5 rounded-full overflow-hidden ${trackClass}`}>
      <div
        className="h-full rounded-full transition-[width] duration-1000 ease-out"
        style={{
          width: inView ? `${percent}%` : '0%',
          background: color,
          transitionDelay: `${delay}ms`,
          boxShadow: glow ? `0 0 12px ${color}99` : undefined,
        }}
      />
    </div>
  );
}

/**
 * Mockup estilizado de produto: janela de navegador com a captura do projeto
 * ou, quando não há imagem, uma interface de dashboard desenhada em CSS.
 */
export function ProductMockup({
  title,
  url,
  imageUrl,
  tags = [],
  primary,
  accent,
  dark = true,
  className = '',
}: {
  title: string;
  url?: string;
  imageUrl?: string;
  tags?: string[];
  primary: string;
  accent: string;
  dark?: boolean;
  className?: string;
}) {
  let host = 'app.projeto.dev';
  try {
    if (url) host = new URL(url).host;
  } catch {
    host = url || host;
  }

  const frame = dark ? 'bg-[#0a0c12] border-white/10' : 'bg-white border-zinc-200';
  const bar = dark ? 'bg-white/[0.04] border-white/10' : 'bg-zinc-100 border-zinc-200';
  const pill = dark ? 'bg-white/10' : 'bg-zinc-200';

  return (
    <div
      className={`rounded-xl border overflow-hidden shadow-[0_24px_48px_-24px_rgba(0,0,0,0.55)] ${frame} ${className}`}
    >
      <div className={`flex items-center gap-2 px-3 py-2 border-b ${bar}`}>
        <span className="flex gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-zinc-500/60" />
          <span className="w-2 h-2 rounded-full bg-zinc-500/60" />
          <span className="w-2 h-2 rounded-full bg-zinc-500/60" />
        </span>
        <span
          className={`flex-1 min-w-0 truncate text-center text-[10px] px-2 py-0.5 rounded ${pill} ${
            dark ? 'text-zinc-400' : 'text-zinc-500'
          }`}
        >
          {host}
        </span>
      </div>

      <div className="relative aspect-[16/10] overflow-hidden">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex">
            {/* sidebar */}
            <div className={`w-1/4 p-2 space-y-1.5 border-r ${dark ? 'border-white/10' : 'border-zinc-200'}`}>
              <span className="block h-2 w-2/3 rounded-full" style={{ backgroundColor: primary }} />
              {(tags.length ? tags.slice(0, 4) : ['', '', '', '']).map((t, i) => (
                <span
                  key={i}
                  className={`block truncate text-[8px] px-1.5 py-1 rounded ${pill} ${
                    dark ? 'text-zinc-400' : 'text-zinc-600'
                  }`}
                >
                  {t || '\u00A0'}
                </span>
              ))}
            </div>
            {/* content */}
            <div className="flex-1 p-3 space-y-2.5">
              <div className="grid grid-cols-3 gap-2">
                {[primary, accent, primary].map((c, i) => (
                  <div key={i} className={`rounded-md p-2 ${pill}`}>
                    <span className="block h-1 w-1/2 rounded-full bg-zinc-500/50 mb-1.5" />
                    <span className="block h-2.5 w-3/4 rounded" style={{ backgroundColor: c, opacity: 0.85 }} />
                  </div>
                ))}
              </div>
              <div className={`rounded-md p-2 flex items-end gap-1.5 h-[46%] ${pill}`}>
                {[40, 65, 50, 80, 62, 92, 74].map((h, i) => (
                  <span
                    key={i}
                    className="flex-1 rounded-sm"
                    style={{
                      height: `${h}%`,
                      background: `linear-gradient(180deg, ${i % 2 ? accent : primary}, ${primary}55)`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
