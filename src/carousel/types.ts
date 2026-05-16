export interface SlideData {
  /** Full image URL */
  src: string;
  /** Alt text — required for accessibility */
  alt: string;
  /** Optional caption rendered over the slide */
  caption?: string;
}

export interface CarouselOptions {
  slides: SlideData[];
  /** Auto-advance interval in ms. Default: 4000 */
  autoPlayInterval?: number;
  /** Wrap around at the ends. Default: true */
  loop?: boolean;
}
