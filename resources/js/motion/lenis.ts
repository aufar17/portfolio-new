import { router } from '@inertiajs/vue3';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { nextTick } from 'vue';
import { gsap, prefersReducedMotion, ScrollTrigger } from './gsap';

/**
 * One Lenis instance shared by every public page. The public layout is
 * re-mounted on each Inertia visit, so instances are reference counted and
 * the destroy is deferred a tick: the outgoing layout releases, the incoming
 * one acquires, and the same instance carries on.
 */
let lenis: Lenis | null = null;
let users = 0;
let destroyTimer: ReturnType<typeof setTimeout> | undefined;
let routerHooked = false;

const raf = (time: number) => lenis?.raf(time * 1000);

export const getLenis = () => lenis;

/** Smooth-scrolls to an element, `#id` or y position, honouring scroll-margin. */
export function scrollToTarget(
    target: HTMLElement | string | number,
    options: { immediate?: boolean } = {},
) {
    if (lenis) {
        lenis.scrollTo(target, { immediate: options.immediate });

        return;
    }

    if (typeof target === 'number') {
        window.scrollTo({ top: target, behavior: 'instant' });

        return;
    }

    const el =
        typeof target === 'string' ? document.querySelector(target) : target;
    el?.scrollIntoView();
}

/** Same-page `#hash` links glide with Lenis instead of jumping. */
const onAnchorClick = (event: MouseEvent) => {
    if (
        !lenis ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
    ) {
        return;
    }

    const link = (event.target as Element | null)?.closest('a[href]');

    if (!(link instanceof HTMLAnchorElement) || !link.hash) {
        return;
    }

    const url = new URL(link.href);

    if (url.origin !== location.origin || url.pathname !== location.pathname) {
        return;
    }

    const target = document.getElementById(
        decodeURIComponent(url.hash.slice(1)),
    );

    if (!target) {
        return;
    }

    event.preventDefault();
    lenis.scrollTo(target);
    // Keep Inertia's history state; only the hash changes.
    history.replaceState(history.state, '', url.hash);
};

/**
 * Inertia has already reset (or is about to restore) the native scroll
 * position: stop any running inertia so Lenis starts in sync, then let
 * ScrollTrigger measure the new page once it has rendered.
 */
const onNavigate = () => {
    if (lenis && !location.hash) {
        lenis.scrollTo(0, { immediate: true, force: true });
    }

    nextTick(() => requestAnimationFrame(() => ScrollTrigger.refresh()));
};

export function acquireLenis() {
    clearTimeout(destroyTimer);
    users++;

    if (!routerHooked) {
        routerHooked = true;
        router.on('navigate', onNavigate);
    }

    if (lenis || prefersReducedMotion()) {
        return;
    }

    lenis = new Lenis({ stopInertiaOnNavigate: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    document.addEventListener('click', onAnchorClick);
}

export function releaseLenis() {
    users = Math.max(0, users - 1);

    if (users > 0) {
        return;
    }

    destroyTimer = setTimeout(() => {
        if (users > 0 || !lenis) {
            return;
        }

        document.removeEventListener('click', onAnchorClick);
        gsap.ticker.remove(raf);
        gsap.ticker.lagSmoothing(500, 33);
        lenis.destroy();
        lenis = null;
    });
}
