import type { CarouselOptions, SlideData } from "./types";
import "./carousel.css";

const PREV_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15,18 9,12 15,6"/></svg>`;
const NEXT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9,18 15,12 9,6"/></svg>`;

const pad = (n: number) => String(n).padStart(2, "0");

export class Carousel {
  private readonly el: HTMLElement;
  private readonly slides: SlideData[];
  private readonly autoPlayMs: number;
  private readonly loop: boolean;

  private current = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private isPlaying = false;
  private touchStartX = 0;
  private touchStartY = 0;

  // cached DOM refs
  private slideEls!: HTMLElement[];
  private dotEls!: HTMLButtonElement[];
  private prevBtn!: HTMLButtonElement;
  private nextBtn!: HTMLButtonElement;
  private liveRegion!: HTMLElement;
  private pauseBtn!: HTMLButtonElement;
  private counterEl!: HTMLElement;

  constructor(el: HTMLElement, options: CarouselOptions) {
    this.el = el;
    this.slides = options.slides;
    this.autoPlayMs = options.autoPlayInterval ?? 4000;
    this.loop = options.loop ?? true;

    this.render();
    this.bindEvents();
    this.loadAround(0);
    this.startAutoPlay();
  }

  // ── Build HTML ────────────────────────────────────────────────────────────
  private render(): void {
    const total = this.slides.length;

    this.el.classList.add("slideshow");
    this.el.setAttribute("role", "region");
    this.el.setAttribute("aria-roledescription", "carousel");
    this.el.setAttribute("aria-label", "Image gallery");
    this.el.tabIndex = 0;

    this.el.innerHTML = `
      <div class="sr-only" role="status" aria-live="polite" aria-atomic="true" data-ref="live"></div>

      ${this.slides
        .map(
          (s, i) => `
        <div
          class="slideshow__slide${i === 0 ? " is-active" : ""}"
          role="group"
          aria-roledescription="slide"
          aria-label="Slide ${i + 1} of ${total}"
          aria-hidden="${i !== 0}"
          ${i !== 0 ? "inert" : ""}
        >
          <img
            class="slideshow__img"
            ${i === 0 ? `src="${s.src}"` : `data-src="${s.src}"`}
            alt="${s.alt}"
            decoding="async"
            width="1200" height="675"
          />
          ${s.caption ? `<p class="slideshow__caption" aria-hidden="true">${s.caption}</p>` : ""}
        </div>
      `,
        )
        .join("")}

      <button class="slideshow__pause" type="button" aria-label="Pause auto-play" aria-pressed="false" data-ref="pause">
        ⏸
      </button>

      <div class="slideshow__controls" role="group" aria-label="Carousel controls">
        <button class="slideshow__btn" type="button" aria-label="Previous slide" data-ref="prev">${PREV_SVG}</button>

        <div class="slideshow__centre">
          <div class="slideshow__dots" role="list" aria-label="Slides">
            ${this.slides
              .map(
                (_, i) => `
              <button
                class="slideshow__dot${i === 0 ? " is-active" : ""}"
                type="button" role="listitem"
                aria-label="Slide ${i + 1}"
                aria-current="${i === 0}"
                data-index="${i}"
              ></button>
            `,
              )
              .join("")}
          </div>
          <div class="slideshow__counter" aria-hidden="true" data-ref="counter">
            ${pad(1)} / ${pad(total)}
          </div>
        </div>

        <button class="slideshow__btn" type="button" aria-label="Next slide" data-ref="next">${NEXT_SVG}</button>
      </div>
    `;

    const r = <T extends HTMLElement>(k: string) =>
      this.el.querySelector<T>(`[data-ref="${k}"]`)!;
    this.liveRegion = r("live");
    this.pauseBtn = r<HTMLButtonElement>("pause");
    this.prevBtn = r<HTMLButtonElement>("prev");
    this.nextBtn = r<HTMLButtonElement>("next");
    this.counterEl = r("counter");
    this.slideEls = [
      ...this.el.querySelectorAll<HTMLElement>(".slideshow__slide"),
    ];
    this.dotEls = [
      ...this.el.querySelectorAll<HTMLButtonElement>(".slideshow__dot"),
    ];

    if (!this.loop) this.syncEdgeButtons();
  }

  // ── Navigate ──────────────────────────────────────────────────────────────
  goTo(n: number): void {
    const total = this.slides.length;
    const next = this.loop
      ? ((n % total) + total) % total
      : Math.max(0, Math.min(n, total - 1));

    if (next === this.current) return;

    // hide current
    this.slideEls[this.current].classList.remove("is-active");
    this.slideEls[this.current].setAttribute("aria-hidden", "true");
    this.slideEls[this.current].setAttribute("inert", "");
    this.dotEls[this.current].classList.remove("is-active");
    this.dotEls[this.current].setAttribute("aria-current", "false");

    // show next
    this.current = next;
    this.slideEls[next].classList.add("is-active");
    this.slideEls[next].removeAttribute("aria-hidden");
    this.slideEls[next].removeAttribute("inert");
    this.dotEls[next].classList.add("is-active");
    this.dotEls[next].setAttribute("aria-current", "true");

    this.counterEl.textContent = `${pad(next + 1)} / ${pad(total)}`;
    this.loadAround(next);
    this.announce(`Slide ${next + 1} of ${total}: ${this.slides[next].alt}`);
    if (!this.loop) this.syncEdgeButtons();
  }

  prev(): void {
    this.goTo(this.current - 1);
  }
  next(): void {
    this.goTo(this.current + 1);
  }

  // ── Lazy load: fetch current ± 1 slides only ──────────────────────────────
  private loadAround(center: number): void {
    const total = this.slides.length;
    const targets = new Set(
      [-1, 0, 1].map((o) => (((center + o) % total) + total) % total),
    );

    for (const i of targets) {
      const img =
        this.slideEls[i]?.querySelector<HTMLImageElement>(".slideshow__img");
      if (!img || img.src) continue; // already loaded

      img.src = img.dataset["src"] ?? "";
      img.removeAttribute("data-src");
      img.addEventListener(
        "load",
        () => this.slideEls[i].classList.add("is-loaded"),
        { once: true },
      );
      img.addEventListener(
        "error",
        () => this.slideEls[i].classList.add("is-loaded"),
        { once: true },
      );
    }
  }

  // ── Auto-play ─────────────────────────────────────────────────────────────
  startAutoPlay(): void {
    if (this.timer || this.slides.length <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    this.isPlaying = true;
    this.timer = setInterval(() => this.next(), this.autoPlayMs);
    this.syncPauseBtn();
  }

  stopAutoPlay(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isPlaying = false;
    this.syncPauseBtn();
  }

  private syncPauseBtn(): void {
    this.pauseBtn.textContent = this.isPlaying ? "⏸" : "▶";
    this.pauseBtn.setAttribute(
      "aria-label",
      this.isPlaying ? "Pause auto-play" : "Resume auto-play",
    );
    this.pauseBtn.setAttribute(
      "aria-pressed",
      this.isPlaying ? "false" : "true",
    );
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  private announce(msg: string): void {
    this.liveRegion.textContent = "";
    requestAnimationFrame(() => {
      this.liveRegion.textContent = msg;
    });
  }

  private syncEdgeButtons(): void {
    this.prevBtn.disabled = this.current === 0;
    this.nextBtn.disabled = this.current === this.slides.length - 1;
  }

  // ── Events ────────────────────────────────────────────────────────────────
  private bindEvents(): void {
    this.prevBtn.addEventListener("click", () => this.prev());
    this.nextBtn.addEventListener("click", () => this.next());
    this.pauseBtn.addEventListener("click", () =>
      this.isPlaying ? this.stopAutoPlay() : this.startAutoPlay(),
    );

    this.dotEls.forEach((d) =>
      d.addEventListener("click", () => this.goTo(Number(d.dataset["index"]))),
    );

    // keyboard
    this.el.addEventListener("keydown", (e: KeyboardEvent) => {
      const actions: Record<string, () => void> = {
        ArrowLeft: () => this.prev(),
        ArrowRight: () => this.next(),
        Home: () => this.goTo(0),
        End: () => this.goTo(this.slides.length - 1),
      };
      if (actions[e.key]) {
        e.preventDefault();
        actions[e.key]();
      }
    });

    // swipe
    this.el.addEventListener(
      "touchstart",
      (e: TouchEvent) => {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
      },
      { passive: true },
    );

    this.el.addEventListener(
      "touchend",
      (e: TouchEvent) => {
        const dx = e.changedTouches[0].clientX - this.touchStartX;
        const dy = e.changedTouches[0].clientY - this.touchStartY;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy))
          dx < 0 ? this.next() : this.prev();
      },
      { passive: true },
    );

    // pause on hover / focus
    this.el.addEventListener("mouseenter", () => this.stopAutoPlay());
    this.el.addEventListener("mouseleave", () => this.startAutoPlay());
    this.el.addEventListener("focusin", () => this.stopAutoPlay());
    this.el.addEventListener("focusout", (e: FocusEvent) => {
      if (!this.el.contains(e.relatedTarget as Node | null))
        this.startAutoPlay();
    });

    // pause when tab is hidden
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) this.stopAutoPlay();
      else if (!this.el.matches(":hover, :focus-within")) this.startAutoPlay();
    });
  }

  destroy(): void {
    this.stopAutoPlay();
    this.el.innerHTML = "";
    this.el.classList.remove("slideshow");
    this.el.removeAttribute("role");
    this.el.removeAttribute("aria-roledescription");
    this.el.removeAttribute("aria-label");
    this.el.removeAttribute("tabindex");
  }
}
