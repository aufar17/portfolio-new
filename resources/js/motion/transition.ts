import { prefersReducedMotion } from './gsap';

/**
 * Shared-element page transitions. Inertia runs the page swap inside
 * `document.startViewTransition` for links with `view-transition`; an element
 * on the old page and one on the new page with the same
 * `view-transition-name` morph into each other.
 *
 * Names are only given to the card that was clicked, right before the visit,
 * so a page full of cards never has stray or duplicate names.
 */
let sharedPending = false;

export const supportsViewTransitions = () =>
    typeof document !== 'undefined' && 'startViewTransition' in document;

/** `view-transition-name` for an item's image, matching card and detail hero. */
export const mediaTransitionName = (
    kind: 'project' | 'achievement',
    id: number,
) => `${kind}-media-${id}`;

/** Names the clicked card's image so it flies into the detail hero. */
export function shareElement(el: HTMLElement | null, name: string) {
    if (!el || !supportsViewTransitions() || prefersReducedMotion()) {
        return;
    }

    el.style.setProperty('view-transition-name', name);
    sharedPending = true;
}

/**
 * True once if this page was reached through a shared-element transition,
 * so its own image reveal can be skipped instead of playing twice.
 */
export function takeSharedArrival() {
    const arrived = sharedPending;
    sharedPending = false;

    return arrived;
}
