import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { Draggable } from 'gsap/Draggable';
import { Flip } from 'gsap/Flip';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

/**
 * Single GSAP entry point for the public site. Import GSAP and its plugins
 * from here (never from 'gsap' directly) so registration and defaults run
 * once, and so the admin bundle never pulls GSAP in.
 */
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger, SplitText, Flip, CustomEase, Draggable);

    // The one brand easing, same curve as the CSS `--ease-out-expo` token.
    CustomEase.create('brand', '0.22, 1, 0.36, 1');
    gsap.defaults({ ease: 'brand', duration: 0.8 });
}

/** Durations in seconds. */
export const DURATION = {
    interaction: 0.2,
    entrance: 0.8,
} as const;

export const STAGGER = {
    desktop: 0.06,
    mobile: 0.04,
} as const;

/** Conditions every component registers through `useMotion`. */
export const MOTION_QUERIES = {
    desktop: '(min-width: 768px) and (prefers-reduced-motion: no-preference)',
    mobile: '(max-width: 767.98px) and (prefers-reduced-motion: no-preference)',
    reduce: '(prefers-reduced-motion: reduce)',
} as const;

export type MotionConditions = Record<keyof typeof MOTION_QUERIES, boolean>;

export const prefersReducedMotion = () =>
    window.matchMedia(MOTION_QUERIES.reduce).matches;

/**
 * Hands an element's transform back to CSS once a one-off GSAP animation is
 * done. GSAP leaves `translate/scale/rotate: none` inline on anything it
 * transforms, which would silently disable Tailwind `hover:translate-*` or
 * `hover:scale-*` on that element.
 */
export function releaseTransforms(targets: gsap.TweenTarget) {
    gsap.set(targets, { clearProps: 'transform' });
    gsap.utils.toArray<HTMLElement>(targets).forEach((el) => {
        el.style.removeProperty('translate');
        el.style.removeProperty('scale');
        el.style.removeProperty('rotate');
    });
}

export { CustomEase, Draggable, Flip, gsap, ScrollTrigger, SplitText };
