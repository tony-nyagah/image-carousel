import "./style.css";
import { Carousel } from "./carousel/Carousel";
import type { SlideData } from "./carousel/types";

// ── Demo slide data ────────────────────────────────────────────────────────
// Images from picsum.photos (no API key required)
const slides: SlideData[] = [
  {
    src: "https://picsum.photos/seed/arch77/1200/675",
    alt: "Ancient stone archway bathed in dramatic afternoon light",
    caption: "01 — Architecture",
  },
  {
    src: "https://picsum.photos/seed/forest44/1200/675",
    alt: "Mist drifting through a dense pine forest at dawn",
    caption: "02 — Forest",
  },
  {
    src: "https://picsum.photos/seed/city55/1200/675",
    alt: "City skyline reflected on still water at golden hour",
    caption: "03 — Urban",
  },
  {
    src: "https://picsum.photos/seed/ocean12/1200/675",
    alt: "Turquoise ocean waves rolling onto a pale sandy beach",
    caption: "04 — Ocean",
  },
  {
    src: "https://picsum.photos/seed/peak33/1200/675",
    alt: "Snow-capped mountain peak piercing through the clouds at sunrise",
    caption: "05 — Mountain",
  },
];

// ── Page markup ────────────────────────────────────────────────────────────
document.querySelector<HTMLDivElement>("#app")!.innerHTML = /* html */ `
  <div class="page">

    <header class="page-header">
      <div class="page-header__inner">
        <span class="page-header__eyebrow">Component Demo</span>
        <h1 class="page-header__title">Image<br>Carousel</h1>
        <p class="page-header__sub">
          Accessible · Auto-play · Keyboard &amp; Swipe · Lazy Load · Zero deps
        </p>
      </div>
    </header>

    <main class="page-main">

      <!-- ── Carousel ──────────────────────────────────────────────── -->
      <section class="page-main__carousel-wrap" aria-label="Carousel demo">
        <div id="carousel"></div>
        <p class="keyboard-hint">
          Use
          <kbd class="kbd">←</kbd>
          <kbd class="kbd">→</kbd>
          to navigate &nbsp;·&nbsp;
          <kbd class="kbd">Home</kbd>
          <kbd class="kbd">End</kbd>
          for first / last &nbsp;·&nbsp;
          Hover or focus to pause
        </p>
      </section>

      <!-- ── Feature grid ───────────────────────────────────────────── -->
      <section aria-label="Features">
        <h2 class="section-title">Features</h2>
        <ul class="feature-grid">
          <li class="feature-card">
            <span class="feature-card__icon" aria-hidden="true">▶</span>
            <strong>Auto-play</strong>
            <span>Pauses on hover &amp; focus. Respects prefers-reduced-motion.</span>
          </li>
          <li class="feature-card">
            <span class="feature-card__icon" aria-hidden="true">⌨</span>
            <strong>Keyboard Nav</strong>
            <span>← / → arrows, Home &amp; End keys, full focus management.</span>
          </li>
          <li class="feature-card">
            <span class="feature-card__icon" aria-hidden="true">👆</span>
            <strong>Touch Swipe</strong>
            <span>Horizontal swipe on mobile. Ignores vertical scroll intent.</span>
          </li>
          <li class="feature-card">
            <span class="feature-card__icon" aria-hidden="true">🖼</span>
            <strong>Lazy Loading</strong>
            <span>Loads current ±1 slides on demand. Shimmer placeholder.</span>
          </li>
          <li class="feature-card">
            <span class="feature-card__icon" aria-hidden="true">♿</span>
            <strong>Accessible</strong>
            <span>WAI-ARIA Carousel Pattern. Live region announcements. inert.</span>
          </li>
          <li class="feature-card">
            <span class="feature-card__icon" aria-hidden="true">∅</span>
            <strong>Zero deps</strong>
            <span>Pure TypeScript. No external carousel library.</span>
          </li>
        </ul>
      </section>

      <!-- ── Usage snippet ──────────────────────────────────────────── -->
      <section aria-label="Usage">
        <h2 class="section-title">Usage</h2>
        <div class="code-block">
          <pre data-prefix=""><code>import { Carousel } from './carousel/Carousel';

new Carousel(document.querySelector('#my-carousel'), {
  slides: [
    { src: 'photo.jpg', alt: 'Description', caption: 'Optional' },
  ],
  autoPlayInterval: 4000,  // ms  (default)
  loop: true,              // wrap (default)
});</code></pre>
        </div>
      </section>

    </main>

    <footer class="page-footer">
      <p>Built with TypeScript + Tailwind CSS &nbsp;·&nbsp; Neubrutalist style</p>
    </footer>

  </div>
`;

// ── Mount carousel ─────────────────────────────────────────────────────────
new Carousel(document.querySelector<HTMLDivElement>("#carousel")!, {
  slides,
  autoPlayInterval: 4000,
  loop: true,
});
