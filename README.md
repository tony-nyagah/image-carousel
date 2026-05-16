# Image Carousel

A reusable, accessible image carousel component built with vanilla TypeScript — no external carousel library. Styled with a **neubrutalist** aesthetic using DaisyUI + Tailwind CSS v4.

---

## Features

| | |
|---|---|
| **Auto-play** | Advances every 4 s; pauses on hover, keyboard focus, and when the browser tab is hidden |
| **Prev / Next arrows** | Square chunky buttons with pressed-state feedback |
| **Indicator dots** | Click any dot to jump directly to a slide |
| **Keyboard navigation** | `←` `→` to step, `Home` / `End` for first / last |
| **Touch / swipe** | Horizontal swipe on mobile; ignores vertical scroll intent |
| **Lazy loading** | Only the current ±1 slides are fetched; others use `data-src` until needed |
| **No external carousel library** | Pure TypeScript + CSS custom properties |
| **Accessible** | Follows the [WAI-ARIA Carousel Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/) |

---

## Getting Started

```sh
bun install
bun run dev
```

Then open `http://localhost:5173`.

---

## Usage

```ts
import { Carousel } from './src/carousel/Carousel';

new Carousel(document.querySelector('#my-carousel'), {
  slides: [
    { src: 'photo.jpg', alt: 'A scenic photo', caption: 'Optional caption' },
    { src: 'photo2.jpg', alt: 'Another photo' },
  ],
  autoPlayInterval: 4000,  // ms — default
  loop: true,              // wrap at ends — default
});
```

### `CarouselOptions`

| Option | Type | Default | Description |
|---|---|---|---|
| `slides` | `SlideData[]` | required | Array of slide objects |
| `autoPlayInterval` | `number` | `4000` | Auto-advance delay in ms |
| `loop` | `boolean` | `true` | Wrap around at the ends |

### `SlideData`

| Field | Type | Description |
|---|---|---|
| `src` | `string` | Image URL |
| `alt` | `string` | Alt text **(required)** |
| `caption` | `string?` | Optional caption overlay |

### Public API

```ts
carousel.goTo(2);        // jump to slide index
carousel.prev();         // go back one
carousel.next();         // go forward one
carousel.startAutoPlay();
carousel.stopAutoPlay();
carousel.destroy();      // remove all markup & listeners
```

---

## How the animation works

Each slide is `display: none` by default. The active slide gets `.is-active` which sets it to `display: block` and plays a CSS `@keyframes fade-in`. That's it — no transform tricks, no CSS custom property math, no JavaScript animation.

---

## Accessibility decisions

### Roles & ARIA
- Root: `role="region"` + `aria-roledescription="carousel"` + `aria-label` — screen readers announce it as a named landmark.
- Each slide: `role="group"` + `aria-roledescription="slide"` + `aria-label="Slide N of M"` — follows the APG Carousel Pattern exactly.
- Off-screen slides: `aria-hidden="true"` **and** the HTML `inert` attribute. `aria-hidden` hides them from the accessibility tree; `inert` additionally prevents keyboard focus from reaching interactive content inside hidden slides.

### Live region
A visually hidden `role="status"` + `aria-live="polite"` element announces every slide change (e.g. _"Slide 3 of 5: Misty forest trail…"_) without interrupting ongoing screen reader speech.

### Keyboard
The carousel container receives `tabindex="0"` so a single Tab press lands on it. Arrow keys then drive navigation. `Home`/`End` skip to the first/last slide. The pause button is independently focusable and toggleable.

### Auto-play safety
Auto-play is suppressed when:
1. `prefers-reduced-motion: reduce` is set
2. The carousel is hovered (mouse users)
3. Any element inside the carousel has keyboard focus
4. The browser tab is backgrounded (Page Visibility API)

### Focus indicators
All interactive elements expose a `:focus-visible` ring using a high-contrast cyan (`#00d4ff`) outline — visible on both the dark viewport and the yellow controls bar.

### Images
Every image carries a descriptive `alt` text. Captions are `aria-hidden="true"` because they repeat information already in the `alt`.

---

## Project structure

```
src/
  carousel/
    types.ts        TypeScript interfaces (SlideData, CarouselOptions)
    Carousel.ts     Component class
    carousel.css    All component styles (neubrutalist, self-contained)
  main.ts           Demo page entry point
  style.css         Global page styles
index.html
```

---

## Tech stack

- **TypeScript** (ES2023 target, strict)
- **Vite 8**
- **Tailwind CSS v4** + **DaisyUI v5**
- **CSS custom properties** — drive slide animation without JS pixel maths
- **CSS `translate` property** — individual transform for smooth GPU compositing
- **CSS nesting** — component-scoped rules without a preprocessor
- **`@starting-style`** — one-shot mount animation when the carousel enters the DOM
- **`color-mix()`** — computed pressed-state colour on nav buttons
- **Page Visibility API** — pause auto-play on hidden tabs
