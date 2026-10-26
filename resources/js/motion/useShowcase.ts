import type { Ref } from 'vue';
import { watch } from 'vue';
import { Draggable, gsap } from './gsap';
import { revealMedia } from './reveal';
import { splitLines, whenFontsReady } from './split';
import { useMotion } from './useMotion';

type Mode = 'desktop' | 'mobile' | 'reduce';
type Direction = 'forward' | 'backward';
type Slot = { y: number; scale: number; dim: number };

/** Cards drawn in the stack; the rest wait, hidden, behind the last one. */
const VISIBLE = 3;

/** Front card first; the ones behind peek out above it, dimmed. */
const SLOTS: Record<Mode, Slot[]> = {
    desktop: [
        { y: 0, scale: 1, dim: 0 },
        { y: -18, scale: 0.95, dim: 0.3 },
        { y: -34, scale: 0.9, dim: 0.5 },
    ],
    mobile: [
        { y: 0, scale: 1, dim: 0 },
        { y: -12, scale: 0.95, dim: 0.3 },
        { y: -22, scale: 0.9, dim: 0.5 },
    ],
    reduce: [
        { y: 0, scale: 1, dim: 0 },
        { y: -12, scale: 0.95, dim: 0.3 },
        { y: -22, scale: 0.9, dim: 0.5 },
    ],
};

/** Length of the curtain move, in seconds. */
const MOVE: Record<Exclude<Mode, 'reduce'>, number> = {
    desktop: 0.9,
    mobile: 0.6,
};

/** Image zoom inside its card: the headroom the parallax moves in (4%). */
const IMAGE_SCALE = 1.08;
/** Image travel inside a card, in % of its height. */
const PARALLAX = { leaving: -6, arriving: 4 };
/** Clip margin beyond the card, in px, so its shadow isn't cut off. */
const CLIP_PAD = 48;

/** Drag further than this share of the card width (or flick) to move on. */
const DRAG_THRESHOLD = 0.25;
const FLICK_SPEED = 600; // px/s

const open = `inset(${-CLIP_PAD}px ${-CLIP_PAD}px ${-CLIP_PAD}px ${-CLIP_PAD}px)`;
/** Clip collapsed onto the card's top edge. */
const closed = (card: HTMLElement) =>
    `inset(${-CLIP_PAD}px ${-CLIP_PAD}px ${card.offsetHeight + CLIP_PAD}px ${-CLIP_PAD}px)`;

type ShowcaseRefs = {
    /** Wraps stack and panel; motion is scoped to it. */
    root: Readonly<Ref<HTMLElement | null>>;
    /** Holds the cards: direct children marked `[data-deck-card]`. */
    stack: Readonly<Ref<HTMLElement | null>>;
    /** Holds one `[data-info]` block per card, in the same order. */
    panel: Readonly<Ref<HTMLElement | null>>;
};

/**
 * Image stack + info panel where one item is active at a time. `active` is
 * its index; change it from anywhere (buttons, keyboard, drag) and both sides
 * move together on one timeline.
 *
 * Forward, the front card's curtain lifts (clip from the bottom edge up)
 * while its image drifts up more slowly inside, and the next card comes to
 * the front. Backward, the incoming card's curtain falls over the stack.
 * In the panel, the old lines slide out of their masks and the new ones in,
 * upwards going forward and downwards going back.
 *
 * Cards hold `[data-parallax]` (the image layer) and `[data-dim]` (an
 * overlay darkening cards further back). Info blocks animate `[data-lines]`
 * (split into masked lines) and `[data-meta]` (faded). The DOM is never
 * reordered: stacking is `zIndex` + transforms. Reduced motion swaps
 * instantly.
 */
export function useShowcase(
    { root, stack, panel }: ShowcaseRefs,
    active: Ref<number>,
) {
    let mode: Mode = 'reduce';
    let order: number[] = [];
    let timeline: gsap.core.Timeline | undefined;
    let entrance: gsap.core.Timeline | undefined;
    let draggables: Draggable[] = [];
    let hint: Direction | undefined;
    let suppressClickUntil = 0;

    const cards = () =>
        stack.value
            ? [
                  ...stack.value.querySelectorAll<HTMLElement>(
                      ':scope > [data-deck-card]',
                  ),
              ]
            : [];

    const blocks = () =>
        panel.value
            ? [...panel.value.querySelectorAll<HTMLElement>('[data-info]')]
            : [];

    const layer = (card: HTMLElement | undefined, name: string) =>
        card?.querySelector<HTMLElement>(`[data-${name}]`) ?? null;

    const cyclic = (start: number, n: number) =>
        Array.from({ length: n }, (_, k) => (start + k) % n);

    const slot = (position: number) =>
        SLOTS[mode][Math.min(position, VISIBLE - 1)];

    const pose = (position: number) => ({
        y: slot(position).y,
        scale: slot(position).scale,
        autoAlpha: position < VISIBLE ? 1 : 0,
    });

    const syncDraggables = () =>
        draggables.forEach((draggable, i) =>
            i === order[0] ? draggable.enable() : draggable.disable(),
        );

    /** Puts every card in its slot for the current `active`, no animation. */
    const place = () => {
        const els = cards();
        order = cyclic(active.value, els.length);
        els.forEach((card, i) => {
            const position = order.indexOf(i);
            gsap.set(card, {
                ...pose(position),
                x: 0,
                zIndex: els.length - position,
                transformOrigin: '50% 0%',
                clearProps: 'clipPath',
            });
            gsap.set(layer(card, 'dim'), { opacity: slot(position).dim });
            gsap.set(layer(card, 'parallax'), {
                xPercent: 0,
                yPercent: 0,
                scale: mode === 'reduce' ? 1 : IMAGE_SCALE,
            });
        });
        syncDraggables();
    };

    /** Old info lines leave, new ones come in, on the shared timeline. */
    const swapText = (
        tl: gsap.core.Timeline,
        from: number,
        to: number,
        direction: Direction,
    ) => {
        const els = blocks();
        const before = els[from];
        const after = els[to];

        if (!before || !after || before === after) {
            return;
        }

        const sign = direction === 'forward' ? 1 : -1;
        const splits = [
            ...before.querySelectorAll<HTMLElement>('[data-lines]'),
            ...after.querySelectorAll<HTMLElement>('[data-lines]'),
        ].map(splitLines);
        const linesOf = (block: HTMLElement) =>
            splits
                .filter((split) => block.contains(split.elements[0] as Node))
                .flatMap((split) => split.lines);
        const metaBefore = before.querySelectorAll('[data-meta]');
        const metaAfter = after.querySelectorAll('[data-meta]');

        // Vue hides the old block right away; keep it on screen while it leaves.
        gsap.set(before, { visibility: 'visible' });

        tl.to(
            linesOf(before),
            { yPercent: -105 * sign, duration: 0.4, stagger: 0.03 },
            0,
        )
            .to(
                metaBefore,
                { opacity: 0, y: -8 * sign, duration: 0.3, stagger: 0.02 },
                0,
            )
            .set(before, { visibility: 'hidden' }, 0.45)
            .fromTo(
                linesOf(after),
                { yPercent: 105 * sign },
                { yPercent: 0, duration: 0.7, stagger: 0.04 },
                0.3,
            )
            .fromTo(
                metaAfter,
                { opacity: 0, y: 8 * sign },
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.05 },
                0.4,
            )
            .call(() => {
                splits.forEach((split) => split.revert());
                gsap.set([...metaBefore, ...metaAfter], {
                    clearProps: 'opacity,transform',
                });
                gsap.set(before, { clearProps: 'visibility' });
            });
    };

    const transition = (to: number, direction: Direction) => {
        entrance?.progress(1);
        timeline?.progress(1).kill();

        const els = cards();
        const n = els.length;
        const from = order;
        order = cyclic(to, n);

        // Focus inside the old front card would be lost once it turns inert.
        const focused = document.activeElement;

        if (
            stack.value &&
            focused !== stack.value &&
            stack.value.contains(focused)
        ) {
            stack.value.focus({ preventScroll: true });
        }

        if (mode === 'reduce') {
            place();

            return;
        }

        const duration = MOVE[mode];
        const moving = direction === 'forward' ? from[0] : order[0];

        draggables.forEach((draggable) => draggable.disable());
        timeline = gsap.timeline({
            defaults: { duration },
            onComplete: syncDraggables,
        });

        els.forEach((card, i) => {
            if (i === moving) {
                return;
            }

            const position = order.indexOf(i);

            // Cards coming into view rise from behind the last slot.
            if (from.indexOf(i) >= VISIBLE && position < VISIBLE) {
                gsap.set(card, { ...pose(VISIBLE - 1), autoAlpha: 0 });
            }

            gsap.set(card, { zIndex: n - position });
            timeline!
                .to(card, { ...pose(position), x: 0 }, 0)
                .to(layer(card, 'dim'), { opacity: slot(position).dim }, 0);

            // The card stepping up to the front settles its image as it comes.
            if (position === 0) {
                timeline!.fromTo(
                    layer(card, 'parallax'),
                    { yPercent: PARALLAX.arriving },
                    { yPercent: 0 },
                    0,
                );
            }
        });

        const card = els[moving];
        const image = layer(card, 'parallax');
        const position = order.indexOf(moving);

        if (direction === 'forward') {
            // The curtain lifts off the front card, then it rejoins at the back.
            // Explicit from/to: reading a set clip back gives the browser's
            // shorthand (`inset(-48px)`), which tweens skewed.
            gsap.set(card, { zIndex: n + 1 });
            timeline
                .fromTo(card, { clipPath: open }, { clipPath: closed(card) }, 0)
                .to(image, { yPercent: PARALLAX.leaving, xPercent: 0 }, 0)
                .set(card, {
                    ...pose(position),
                    x: 0,
                    autoAlpha: 0,
                    zIndex: n - position,
                    clearProps: 'clipPath',
                })
                .set(layer(card, 'dim'), { opacity: slot(position).dim })
                .set(image, { yPercent: 0 })
                .to(card, {
                    autoAlpha: pose(position).autoAlpha,
                    duration: 0.3,
                });
        } else {
            // The incoming card's curtain falls over the front of the stack.
            gsap.set(card, { ...pose(0), x: 0, zIndex: n + 1 });
            gsap.set(layer(card, 'dim'), { opacity: 0 });
            timeline
                .fromTo(card, { clipPath: closed(card) }, { clipPath: open }, 0)
                .fromTo(image, { yPercent: PARALLAX.leaving }, { yPercent: 0 }, 0)
                .set(card, { zIndex: n, clearProps: 'clipPath' });
        }

        swapText(timeline, from[0], to, direction);
    };

    watch(active, (to) => {
        const n = cards().length;
        const current = order[0];

        if (n < 2 || current === undefined || to === current) {
            hint = undefined;

            return;
        }

        const distance = (to - current + n) % n;
        const direction =
            hint ?? (distance <= n / 2 ? 'forward' : 'backward');

        transition(to, direction);
        hint = undefined;
    });

    const go = (to: number, direction: Direction) => {
        const n = cards().length;

        if (n < 2) {
            return;
        }

        hint = direction;
        active.value = (to + n) % n;
    };

    const next = () => go(active.value + 1, 'forward');
    const prev = () => go(active.value - 1, 'backward');

    /** Finishes any running move, e.g. before a page transition starts. */
    const settle = () => {
        entrance?.progress(1);
        timeline?.progress(1);
    };

    const onKeydown = (event: KeyboardEvent) => {
        const n = cards().length;
        const keys: Record<string, () => void> = {
            ArrowRight: next,
            ArrowLeft: prev,
            Home: () => (active.value = 0),
            End: () => (active.value = n - 1),
        };

        if (event.key in keys) {
            event.preventDefault();
            keys[event.key]();
        }
    };

    /** Swallows the click that ends a drag, so the card link doesn't open. */
    const onClickCapture = (event: MouseEvent) => {
        if (performance.now() < suppressClickUntil) {
            event.preventDefault();
            event.stopPropagation();
        }
    };

    useMotion(root, ({ desktop, reduce }, context) => {
        mode = reduce ? 'reduce' : desktop ? 'desktop' : 'mobile';

        const els = cards();
        let stopFonts = () => {};
        place();

        if (els.length > 1) {
            let samples: { x: number; t: number }[] = [];

            draggables = Draggable.create(els, {
                type: 'x',
                zIndexBoost: false,
                minimumMovement: 6,
                onPress() {
                    settle();
                    samples = [];
                },
                onDrag(this: Draggable) {
                    const card = this.target as HTMLElement;

                    // The image lags behind the finger a little.
                    if (mode !== 'reduce') {
                        gsap.set(layer(card, 'parallax'), {
                            xPercent: gsap.utils.clamp(
                                -4,
                                4,
                                (-this.x / card.offsetWidth) * 8,
                            ),
                        });
                    }

                    samples = [
                        ...samples,
                        { x: this.x, t: performance.now() },
                    ].slice(-6);
                },
                onDragEnd(this: Draggable) {
                    suppressClickUntil = performance.now() + 300;

                    const first = samples[0];
                    const last = samples[samples.length - 1];
                    const speed =
                        first && last && last.t > first.t
                            ? ((last.x - first.x) / (last.t - first.t)) * 1000
                            : 0;
                    const card = this.target as HTMLElement;
                    const far =
                        Math.abs(this.x) > card.offsetWidth * DRAG_THRESHOLD;

                    // Either way is forward, like taking the top card off.
                    if (far || Math.abs(speed) > FLICK_SPEED) {
                        go(active.value + 1, 'forward');

                        return;
                    }

                    const back = { duration: mode === 'reduce' ? 0 : 0.3 };
                    gsap.to(card, { x: 0, ...back });
                    gsap.to(layer(card, 'parallax'), { xPercent: 0, ...back });
                },
            });
            syncDraggables();
        }

        if (!reduce) {
            // The visible cards land back to front.
            const visible = order
                .slice(0, VISIBLE)
                .map((i) => els[i])
                .reverse();

            gsap.from(visible, {
                y: desktop ? 80 : 48,
                opacity: 0,
                stagger: 0.08,
                scrollTrigger: {
                    trigger: stack.value,
                    start: 'top 85%',
                    once: true,
                },
            });

            const media = layer(els[order[0]], 'media');

            if (media) {
                revealMedia(media, { trigger: stack.value! });
            }

            // The active info block writes itself in, then the controls.
            stopFonts = whenFontsReady(context, () => {
                const block = blocks()[order[0]];

                if (!block || !panel.value) {
                    return;
                }

                const splits = [
                    ...block.querySelectorAll<HTMLElement>('[data-lines]'),
                ].map(splitLines);

                entrance = gsap
                    .timeline({
                        scrollTrigger: {
                            trigger: panel.value,
                            start: 'top 85%',
                            once: true,
                        },
                        onComplete: () => {
                            splits.forEach((split) => split.revert());
                            entrance = undefined;
                        },
                    })
                    .from(splits.flatMap((split) => split.lines), {
                        yPercent: 105,
                        stagger: 0.05,
                    })
                    .from(
                        [
                            ...block.querySelectorAll('[data-meta]'),
                            ...panel.value.querySelectorAll(
                                '[data-panel-controls]',
                            ),
                        ],
                        {
                            opacity: 0,
                            y: 12,
                            stagger: 0.06,
                            duration: 0.6,
                            clearProps: 'opacity,transform',
                        },
                        0.2,
                    );
            });
        }

        return () => {
            stopFonts();
            timeline?.kill();
            entrance = undefined;
            draggables.forEach((draggable) => draggable.kill());
            draggables = [];
        };
    });

    return { next, prev, settle, onKeydown, onClickCapture };
}
