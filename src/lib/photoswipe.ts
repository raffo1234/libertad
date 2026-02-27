// src/lib/photoswipe.ts
import PhotoSwipeLightbox from "photoswipe/lightbox";

export const pswpConfig = {
  pswpModule: () => import("photoswipe"),
  bgOpacity: 0.9,
  // prettier-ignore
  arrowPrevSVG:
    "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path d=\"M15 18l-6-6 6-6\"/></svg>",
  arrowNextSVG:
    // prettier-ignore
    "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path d=\"M9 18l6-6-6-6\"/></svg>",
  closeSVG:
    // prettier-ignore
    "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path d=\"M18 6L6 18M6 6l12 12\"/></svg>",
  zoomSVG:
    // prettier-ignore
    "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><circle cx=\"11\" cy=\"11\" r=\"8\"/><line x1=\"21\" y1=\"21\" x2=\"16.65\" y2=\"16.65\"/></svg>",
};

export const createLightbox = (selector: string) => {
  return new PhotoSwipeLightbox({
    gallery: selector,
    children: "a.pswp-link",
    ...pswpConfig,
  });
};
