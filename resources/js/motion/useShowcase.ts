import type { Ref } from 'vue';
import { watch } from 'vue';
import { Draggable, gsap } from './gsap';
import type { PageFlip } from './pageFlip';
import { createPageFlip } from './pageFlip';
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

/** Length of a page turn, in seconds. */
const MOVE: Record<Exclude<Mode, 'reduce'>, number> = {
    desktop: 0.95,
    mobile: 0.7,
};

/** A drag across this share of the card width turns the page all the way. */
const DRAG_SPAN = 0.9;
/** Let go past half a turn (or flick) and the page carries on over. */
const FLICK_SPEED = 600; // px/s

type ShowcaseRefs = {
    /** Wraps stack and panel; motion is scoped to it. */
    root: Readonly<Ref<HTMLElement | null>>;
    /** Holds the cards: direct children marked `[data-deck-card]`. */
    stack: Readonly<Ref<HTMLElement | null>>;
    /** Holds one `[data-info]` block per card, in the same order. */
    panel: Readonly<Ref<HTMLElement | null>>;
};

/** A built move: its timeline, and how to tidy up if it is called off. */
type Move = { timeline: gsap.core.Timeline; undo: () => void };

/**
 * Image stack + info panel where one item is active at a time. `active` is
 * its index; change it from anywhere (buttons, keyboard, drag) and both sides
 * move together on one timeline.
 *
 * Moving on peels the front card off (motion/pageFlip.ts): its bottom-left
 * corner lifts and folds back, and the fold sweeps to the top-right corner,
 * uncovering the next card, which catches the shadow of the fold. Going back
 * folds the previous card back down over the stack the other way. In the panel,
 * the old lines slide out of their masks and the new ones in, upwards going
 * forward and downwards going back.
 *
 * Dragging the front card pulls the corner with the finger: rightwards (the
 * way the fold travels) peels it forward, leftwards brings the previous one
 * back. Let go past half way
 * (or flick) and it completes, otherwise it falls back.
 *
 * Cards hold `[data-dim]` (an overlay darkening cards further back) and
 * `[data-fold-shadow]` (the fold's shadow). Info blocks animate
 * `[data-lines]` (split into masked lines) and `[data-meta]` (faded). The
 * DOM is never reordered: stacking is `zIndex` + transforms. Reduced motion
 * swaps instantly.
 */
export function useShowcase(
    { root, stack, panel }: ShowcaseRefs,
    active: Ref<number>,
) {
    let mode: Mode = 'reduce';
    let order: number[] = [];
    let move: Move | undefined;
    let entrance: gsap.core.Timeline | undefined;
    let draggables: Draggable[] = [];
    let flip: PageFlip | undefined;
    let hint: Direction | undefined;
    let suppressClickUntil = 0;
    /** A page being pulled by a finger, not yet committed. */
    let drag:
        | {
              direction: Direction;
              to: number;
              move: Move;
              release?: gsap.core.Tween;
          }
        | undefined;

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
            });
            gsap.set(layer(card, 'dim'), { opacity: slot(position).dim });
            gsap.set(layer(card, 'fold-shadow'), { opacity: 0 });
        });
        flip?.hide();
        syncDraggables();
    };

    /**
     * Old info lines leave, new ones come in, on the shared timeline.
     * Returns how to undo it if the move is called off half way.
     */
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
            return () => {};
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

        const tidy = () => {
            splits.forEach((split) => split.revert());
            gsap.set([...metaBefore, ...metaAfter], {
                clearProps: 'opacity,transform',
            });
            gsap.set([before, after], { clearProps: 'visibility' });
        };

        // Vue swaps which block shows once `active` changes (straight away,
        // or only at the end of a drag): keep both on screen meanwhile.
        gsap.set([before, after], { visibility: 'visible' });

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
            .call(tidy);

        return tidy;
    };

    /**
     * Builds the move to `to`: plays it at once, or with `scrub` leaves it
     * paused (linear) for a finger to drive.
     */
    const build = (
        to: number,
        direction: Direction,
        scrub = false,
    ): Move | undefined => {
        entrance?.progress(1);
        move?.timeline.progress(1).kill();
        move = undefined;

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

        if (mode === 'reduce' || !flip) {
            place();

            return undefined;
        }

        const page = flip;
        const duration = MOVE[mode];
        const ease = scrub ? 'none' : 'power2.inOut';
        const forward = direction === 'forward';
        const moving = forward ? from[0] : order[0];
        // Forward the page uncovers the new front card; back, it covers the
        // old one. Either way that card catches the fold's shadow.
        const shaded = layer(els[forward ? order[0] : from[0]], 'fold-shadow');

        if (!scrub) {
            draggables.forEach((draggable) => draggable.disable());
        }

        const timeline = gsap.timeline({
            paused: scrub,
            defaults: scrub ? { duration, ease } : { duration },
            onComplete: () => {
                page.hide();
                gsap.set(shaded, { opacity: 0 });
                syncDraggables();
            },
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
            timeline
                .to(card, { ...pose(position), x: 0 }, 0)
                .to(layer(card, 'dim'), { opacity: slot(position).dim }, 0);
        });

        const card = els[moving];
        const position = order.indexOf(moving);
        const turn = { progress: forward ? 0 : 1 };
        const onUpdate = () => {
            page.turn(turn.progress);
            gsap.set(shaded, {
                opacity: Math.sin(Math.PI * turn.progress),
            });
        };

        if (forward) {
            // The page copy takes the front card's place and turns away; the
            // card itself rejoins the stack at the back, out of sight.
            page.load(card);
            gsap.set(card, { autoAlpha: 0 });
            timeline
                .to(turn, { progress: 1, ease, onUpdate }, 0)
                .set(card, {
                    ...pose(position),
                    x: 0,
                    autoAlpha: 0,
                    zIndex: n - position,
                })
                .set(layer(card, 'dim'), { opacity: slot(position).dim })
                .to(card, {
                    autoAlpha: pose(position).autoAlpha,
                    duration: 0.3,
                });
        } else {
            // The previous page comes back over the stack, then becomes the
            // front card again.
            gsap.set(card, { ...pose(0), x: 0, zIndex: n + 1, autoAlpha: 0 });
            gsap.set(layer(card, 'dim'), { opacity: 0 });
            page.load(card);
            page.turn(1);
            timeline
                .to(turn, { progress: 0, ease, onUpdate }, 0)
                .set(card, { autoAlpha: 1, zIndex: n });
        }

        const undoText = swapText(timeline, from[0], to, direction);

        move = {
            timeline,
            undo: () => {
                undoText();
                page.hide();
                gsap.set(shaded, { opacity: 0 });
            },
        };

        return move;
    };

    const transition = (to: number, direction: Direction) => {
        build(to, direction);
    };

    watch(active, (to) => {
        const n = cards().length;
        const current = order[0];

        // Also the end of a drag: the move already put `to` in front.
        if (n < 2 || current === undefined || to === current) {
            hint = undefined;

            return;
        }

        const distance = (to - current + n) % n;
        const direction = hint ?? (distance <= n / 2 ? 'forward' : 'backward');

        transition(to, direction);
        hint = undefined;
    });

    const go = (to: number, direction: Direction) => {
        const n = cards().length;

        // A page still held (or let go) mid-pull is settled first.
        settle();

        if (n < 2) {
            return;
        }

        hint = direction;
        active.value = (to + n) % n;
    };

    const next = () => go(active.value + 1, 'forward');
    const prev = () => go(active.value - 1, 'backward');

    /** Calls a pulled page off: back to how it was before the drag. */
    const dropDrag = () => {
        if (!drag) {
            return;
        }

        drag.release?.kill();
        drag.move.timeline.progress(0).kill();
        drag.move.undo();
        drag = undefined;
        move = undefined;
        place();
    };

    /** Lets a pulled page complete its turn and makes it the active one. */
    const commitDrag = () => {
        if (!drag) {
            return;
        }

        const { direction, to } = drag;
        drag.release?.kill();
        drag.move.timeline.progress(1);
        drag = undefined;
        hint = direction;
        active.value = to;
    };

    /** Finishes any running move, e.g. before a page transition starts. */
    const settle = () => {
        // A page let go on its way over completes; any other is called off.
        if (drag?.release?.vars.progress === 1) {
            commitDrag();
        } else {
            dropDrag();
        }

        entrance?.progress(1);
        move?.timeline.progress(1);
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
            settle();
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

        if (!reduce && els.length > 1 && stack.value) {
            flip = createPageFlip(stack.value, {
                shading: true,
            });
        }

        place();

        if (els.length > 1) {
            let samples: { x: number; t: number }[] = [];
            const turnLength = () => MOVE[mode as Exclude<Mode, 'reduce'>];

            const pull = (card: HTMLElement, dx: number) => {
                const direction: Direction = dx > 0 ? 'forward' : 'backward';

                if (drag && drag.direction !== direction) {
                    dropDrag();
                }

                if (!drag && Math.abs(dx) > 2) {
                    const n = els.length;
                    const step = direction === 'forward' ? 1 : -1;
                    const to = (active.value + step + n) % n;
                    const built = build(to, direction, true);

                    drag = built ? { direction, to, move: built } : undefined;
                }

                // The finger drives the turn itself; the timeline runs on a
                // little past it (the card rejoining the stack, text).
                drag?.move.timeline.time(
                    turnLength() *
                        gsap.utils.clamp(
                            0,
                            1,
                            Math.abs(dx) / (card.offsetWidth * DRAG_SPAN),
                        ),
                );
            };

            // The card itself never moves: an invisible proxy follows the
            // finger and the page turn follows the proxy.
            draggables = els.map(
                (card) =>
                    Draggable.create(document.createElement('div'), {
                        trigger: card,
                        type: 'x',
                        minimumMovement: 6,
                        onPress(this: Draggable) {
                            settle();
                            samples = [];
                            gsap.set(this.target, { x: 0 });
                            this.update();
                        },
                        onDrag(this: Draggable) {
                            if (mode !== 'reduce') {
                                pull(card, this.x);
                            }

                            samples = [
                                ...samples,
                                { x: this.x, t: performance.now() },
                            ].slice(-6);
                        },
                        // On release rather than drag end: a touch drag can
                        // end without the latter firing, which would leave
                        // the pulled page hanging.
                        onRelease(this: Draggable) {
                            // A plain tap (no pull) goes through as a click.
                            if (!drag && Math.abs(this.x) < 6) {
                                return;
                            }

                            suppressClickUntil = performance.now() + 300;

                            const first = samples[0];
                            const last = samples[samples.length - 1];
                            const speed =
                                first && last && last.t > first.t
                                    ? ((last.x - first.x) /
                                          (last.t - first.t)) *
                                      1000
                                    : 0;

                            if (mode === 'reduce') {
                                const far =
                                    Math.abs(this.x) >
                                    card.offsetWidth * DRAG_SPAN * 0.5;

                                if (far || Math.abs(speed) > FLICK_SPEED) {
                                    go(
                                        active.value + (this.x > 0 ? 1 : -1),
                                        this.x > 0 ? 'forward' : 'backward',
                                    );
                                }

                                return;
                            }

                            if (!drag) {
                                return;
                            }

                            const timeline = drag.move.timeline;
                            const turned = timeline.time() / turnLength();
                            const flick =
                                drag.direction === 'forward'
                                    ? speed > FLICK_SPEED
                                    : speed < -FLICK_SPEED;
                            const complete = turned > 0.5 || flick;
                            const left = complete ? 1 - turned : turned;

                            drag.release = gsap.to(timeline, {
                                progress: complete ? 1 : 0,
                                duration: Math.max(0.2, turnLength() * left),
                                ease: 'power2.out',
                                onComplete: complete ? commitDrag : dropDrag,
                            });
                        },
                    })[0],
            );
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
                    .from(
                        splits.flatMap((split) => split.lines),
                        {
                            yPercent: 105,
                            stagger: 0.05,
                        },
                    )
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
            drag?.release?.kill();
            drag = undefined;
            move?.timeline.kill();
            move = undefined;
            entrance = undefined;
            draggables.forEach((draggable) => draggable.kill());
            draggables = [];
            flip?.destroy();
            flip = undefined;
        };
    });

    return { next, prev, settle, onKeydown, onClickCapture };
}
