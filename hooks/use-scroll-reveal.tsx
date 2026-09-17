'use client';

import { useEffect } from 'react';

/**
 * Reveals every `[data-reveal]` element on the page as it scrolls into view.
 *
 * One observer for the whole page rather than a wrapper component per section:
 * the sections stay plain server components and only opt in with an attribute.
 *
 * Elements start hidden in CSS, which means a failure to reveal is a failure to
 * show content at all. Three guards against that:
 *   - reduced motion and no IntersectionObserver both reveal everything at once
 *   - anything already on screen at mount is revealed immediately
 *   - each element is unobserved once revealed, so it can never hide again
 */
export function useScrollReveal(deps: unknown[] = []) {
  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>('[data-reveal]'),
    );
    if (elements.length === 0) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      elements.forEach((element) => element.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      },
      // Fires slightly before the element's top edge arrives, so the motion
      // finishes about when the reader's eye does.
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
