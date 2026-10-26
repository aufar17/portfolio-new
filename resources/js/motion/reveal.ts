import { gsap } from './gsap';

/**
 * Opens an image from a centred inset with `clip-path` while it settles
 * from a slight zoom, the first time `trigger` scrolls into view. Animate a
 * wrapper around the <img>, not the <img> itself, so CSS hover transforms
 * on the image keep working.
 */
export function revealMedia(
    el: Element,
    {
        trigger = el,
        start = 'top 85%',
    }: { trigger?: Element; start?: string } = {},
) {
    return gsap.fromTo(
        el,
        { clipPath: 'inset(14% 10% 14% 10%)', scale: 1.08 },
        {
            clipPath: 'inset(0% 0% 0% 0%)',
            scale: 1,
            duration: 0.9,
            scrollTrigger: { trigger, start, once: true },
        },
    );
}
