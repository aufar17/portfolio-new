import { gsap, ScrollTrigger } from './gsap';

/**
 * "Hold, then swap" section boundaries (landing page). Mark each section
 * `data-scene` and put a boundary marker between two of them; at no scroll
 * position is the next scene seen before the transition has covered the
 * screen, nor the previous one after it, in either scroll direction.
 *
 * Scroll positions for one boundary, outgoing scene S, incoming scene T:
 *
 * - a: S's bottom reaches the bottom of the viewport.
 * - b: T's top reaches its scroll-margin (where an anchor to it lands).
 * - c: b + the opening length.
 *
 * Closing, a → b: S is pinned (no spacing, so the page keeps its length and
 * nothing inside T is thrown off) while T scrolls up underneath, clipped
 * away. The overlay shuts before b.
 * Swap at b, with the screen covered: T shows, S is clipped away. Released
 * from a pin without spacing, S carries on from where it was held, i.e.
 * shifted down by the length of the hold, so it stays clipped until it has
 * scrolled off the top, one screen past b.
 * Opening, b → c: T scrolls on naturally while the overlay opens. The
 * opening never runs into the point where whatever follows T would come
 * into view.
 *
 * Every state is a function of the scroll position, so scrolling back up
 * plays it all in reverse. Jumps across a boundary happen under a cover
 * (motion/lenis.ts) and land T at its scroll-margin (b), with the overlay
 * kept out of the way until the reader scrolls out of the opening (fading
 * back in if they head back up past b). Focus moving into a clipped scene
 * jumps it into view. Not used under reduced motion.
 */
type SwapOptions = {
    /** Zero-height element between the two scenes. */
    marker: HTMLElement;
    /** Overlay progress at the swap: the middle of its fully shut stretch. */
    shut: number;
    /** Preferred opening length, as a share of the viewport height. */
    open: number;
    /** The overlay element (faded back in after a jump, see above). */
    overlay: HTMLElement;
    /** Draws the overlay for a progress 0 → 1 (0 and 1: nothing shown). */
    render: (progress: number) => void;
    /** The overlay is in use: between a and c, unless set aside by a jump. */
    onActive: (active: boolean) => void;
    onRefresh?: () => void;
};

type Boundary = {
    from: HTMLElement;
    to: HTMLElement;
    a: number;
    b: number;
    c: number;
    /** Overlay set aside after a jump landed in the opening. */
    aside: boolean;
    sync: (scroll: number) => void;
};

const boundaries = new Set<Boundary>();
/** Why each scene is clipped away right now, per boundary. */
const hiddenBy = new Map<HTMLElement, Set<Boundary>>();

const HIDDEN = 'inset(0px 0px 100% 0px)';

function setHidden(el: HTMLElement, boundary: Boundary, hidden: boolean) {
    const reasons = hiddenBy.get(el) ?? new Set<Boundary>();

    if (hidden) {
        reasons.add(boundary);
    } else {
        reasons.delete(boundary);
    }

    hiddenBy.set(el, reasons);
    el.style.clipPath = reasons.size ? HIDDEN : '';
}

const docTop = (el: Element) => el.getBoundingClientRect().top + window.scrollY;

/** Scenes and the footer, in page order. */
const flow = () => [
    ...document.querySelectorAll<HTMLElement>('[data-scene], footer'),
];

let jump: ((y: number) => void) | undefined;

/** Lets motion/lenis.ts provide the covered jump used for focus moves. */
export function setSceneJump(fn: (y: number) => void) {
    jump = fn;
}

const onFocusIn = (event: FocusEvent) => {
    const target = event.target as HTMLElement | null;

    if (!target || !jump) {
        return;
    }

    const top = docTop(target) - window.innerHeight * 0.4;

    for (const boundary of boundaries) {
        if (
            hiddenBy.get(boundary.to)?.has(boundary) &&
            boundary.to.contains(target)
        ) {
            jump(Math.max(boundary.b, top));

            return;
        }

        if (
            hiddenBy.get(boundary.from)?.has(boundary) &&
            boundary.from.contains(target)
        ) {
            jump(Math.max(0, Math.min(boundary.a, top)));

            return;
        }
    }
};

/**
 * Where a jump to `el` should land when that would otherwise be mid-way
 * through a boundary: an incoming scene (or anything in its first screen)
 * at its scroll-margin, b; something in an outgoing scene before the
 * closing starts, a. `null`: no boundary involved.
 */
export function sceneAnchor(el: HTMLElement): number | null {
    const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
    const y = docTop(el) - margin;

    for (const boundary of boundaries) {
        if (el === boundary.to) {
            return boundary.b;
        }

        if (y > boundary.a && y < boundary.c) {
            return boundary.to.contains(el)
                ? Math.max(y, boundary.b)
                : boundary.a;
        }
    }

    return null;
}

/**
 * Call before an instant jump to `y`: a landing inside an opening keeps
 * that boundary's overlay aside, so the page shows as it is.
 */
export function settleJump(y: number) {
    boundaries.forEach((boundary) => {
        boundary.aside = y >= boundary.b && y < boundary.c;
        boundary.sync(y);
    });
}

/** True when scrolling between `from` and `to` passes through a boundary. */
export function crossesScene(from: number, to: number) {
    const low = Math.min(from, to);
    const high = Math.max(from, to);

    return [...boundaries].some(({ a, c }) => low < c && high > a);
}

/** True once the boundary after the first scene (the hero) has swapped. */
export function pastFirstScene(scroll = window.scrollY) {
    const first = [...boundaries].sort((x, y) => x.a - y.a)[0];

    return !!first && scroll >= first.b;
}

/** Sets up one boundary; returns its cleanup. */
export function createSceneSwap(options: SwapOptions): () => void {
    const scenes = flow();
    const before = (el: HTMLElement) =>
        !!(
            el.compareDocumentPosition(options.marker) &
            Node.DOCUMENT_POSITION_FOLLOWING
        );
    // The last scene before the marker and the first one after it.
    const from = scenes.filter(before).pop();
    const to = scenes.find((el) => !before(el));

    if (!from || !to || to.tagName === 'FOOTER') {
        return () => {};
    }

    const boundary: Boundary = {
        from,
        to,
        a: 0,
        b: 0,
        c: 0,
        aside: false,
        sync: () => {},
    };
    let active = false;

    /** Recomputes a, b and c from the layout (pins are reverted meanwhile). */
    const measure = () => {
        const height = window.innerHeight;
        const margin = parseFloat(getComputedStyle(to).scrollMarginTop) || 0;
        const next = flow()[flow().indexOf(to) + 1];
        const nextTop = next
            ? docTop(next)
            : document.documentElement.scrollHeight;

        boundary.a = docTop(from) + from.offsetHeight - height;
        // Whole pixels, rounded up the page: an anchor landing on T's
        // scroll-margin counts as swapped.
        boundary.b = Math.floor(docTop(to) - margin);
        // Open no further than where the content after T comes into view,
        // and at least far enough that S has left the top of the screen.
        const room = nextTop - height - boundary.b;
        boundary.c =
            boundary.b +
            Math.max(Math.min(height * options.open, room), margin + 1);
    };

    const sync = (scroll: number) => {
        const { a, b, c } = boundary;

        // A couple of pixels of slack, so a re-measure after the jump
        // doesn't bring the overlay back on its own.
        if (boundary.aside && (scroll < b - 2 || scroll >= c)) {
            boundary.aside = false;

            // Heading back up past the swap: bring the shut overlay back in
            // softly rather than popping it over the page.
            if (scroll < b && scroll > a) {
                gsap.fromTo(
                    options.overlay,
                    { opacity: 0 },
                    { opacity: 1, duration: 0.25, clearProps: 'opacity' },
                );
            }
        }

        const inside = scroll > a && scroll < c && !boundary.aside;
        const progress =
            scroll <= a
                ? 0
                : scroll >= c
                  ? 1
                  : scroll < b
                    ? (options.shut * (scroll - a)) / (b - a)
                    : options.shut +
                      ((1 - options.shut) * (scroll - b)) / (c - b);

        // After a jump into the opening, stay on T within the slack too.
        const swapped = scroll >= b || boundary.aside;

        setHidden(to, boundary, scroll >= a && !swapped);
        setHidden(from, boundary, swapped && scroll < b + window.innerHeight);
        options.render(progress);

        if (inside !== active) {
            active = inside;
            options.onActive(inside);
        }
    };

    boundary.sync = sync;
    measure();

    // Closing: hold the outgoing scene still while the incoming one scrolls
    // up out of sight. No spacing, so the page keeps its length.
    const hold = ScrollTrigger.create({
        trigger: from,
        // Refreshes before `range` below, so it measures for both.
        start: () => {
            measure();

            return boundary.a;
        },
        end: () => boundary.b,
        pin: from,
        pinSpacing: false,
        anticipatePin: 1,
        invalidateOnRefresh: true,
    });

    // Until S has scrolled off (see above); the overlay is done at c.
    const range = ScrollTrigger.create({
        trigger: options.marker,
        start: () => boundary.a,
        end: () => boundary.b + window.innerHeight,
        invalidateOnRefresh: true,
        onUpdate: (self) => sync(self.scroll()),
        onToggle: (self) => sync(self.scroll()),
        onRefresh: (self) => {
            options.onRefresh?.();
            sync(self.scroll());
        },
    });

    boundaries.add(boundary);

    if (boundaries.size === 1) {
        document.addEventListener('focusin', onFocusIn);
    }

    sync(window.scrollY);

    return () => {
        hold.kill();
        range.kill();
        setHidden(from, boundary, false);
        setHidden(to, boundary, false);
        options.onActive(false);
        boundaries.delete(boundary);

        if (!boundaries.size) {
            document.removeEventListener('focusin', onFocusIn);
        }
    };
}
