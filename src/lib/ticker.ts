// Centralized animation ticker and math utilities

export type TickCallback = (dt: number, time: number) => void;

class AnimationTicker {
  private fns: TickCallback[] = [];
  private raf: number = 0;
  private last: number = 0;

  private loop = (t: number) => {
    const dt = Math.min((t - this.last) / 1000, 0.05);
    this.last = t;
    for (let i = 0; i < this.fns.length; i++) {
      this.fns[i](dt, t);
    }
    this.raf = requestAnimationFrame(this.loop);
  };

  public add(fn: TickCallback) {
    if (this.fns.indexOf(fn) === -1) {
      this.fns.push(fn);
    }
    if (this.fns.length > 0 && !this.raf && typeof window !== 'undefined') {
      this.start();
    }
  }

  public remove(fn: TickCallback) {
    const i = this.fns.indexOf(fn);
    if (i > -1) {
      this.fns.splice(i, 1);
    }
  }

  public start() {
    if (!this.raf && typeof window !== 'undefined') {
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.loop);
    }
  }

  public stop() {
    if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    }
  }

  public isRunning(): boolean {
    return !!this.raf;
  }
}

export const TICKER = new AnimationTicker();

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export const clampNum = (v: number, lo: number, hi: number): number => Math.min(Math.max(v, lo), hi);

export const isTouch = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(hover: none)').matches;
};

export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const motionOff = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    document.documentElement.classList.contains('reduce-motion') ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
};

export function debounce<T extends (...args: any[]) => void>(fn: T, wait: number = 150): (...args: Parameters<T>) => void {
  let t: ReturnType<typeof setTimeout> | undefined;
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(t);
    t = setTimeout(() => {
      fn.apply(this, args);
    }, wait);
  };
}

export function goToSection(id: string) {
  if (typeof window === 'undefined') return;
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.pageYOffset - 78;
  window.scrollTo({ top, behavior: motionOff() ? 'auto' : 'smooth' });
}
