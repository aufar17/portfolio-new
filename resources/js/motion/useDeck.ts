import type { Ref } from 'vue';
import { watch } from 'vue';
import { Draggable, gsap } from './gsap';
import { revealMedia } from './reveal';
import { useMotion } from './useMotion';

export type DeckVariant = 'toss' | 'flip';

type Mode = 'desktop' | 'mobile' | 'reduce';
type Direction = 'forward' | 'backward';
type Pose = {
    x: number;
    y: number;
    rotation: number;
    scale: number;
    rotationY?: number;
    transformPerspective?: number;
};

/** Cards drawn in the stack; the rest wait, hidden, behind the last one. */
const VISIBLE = 3;

type MoveContext = {
    /** Number of cards. */
    n: number;
    mode: Mode;
    /** Horizontal side the card leaves towards / comes back from. */
    side: number;
    /** Where the moving card ends up, and its final stacking order. */
    landing: Pose & { autoAlpha: number };
    landingZ: number;
};

type Preset = {
    slots: Record<Mode, Pose[]>;
    /** When the other cards start moving to their new slots. */
    othersAt: Record<Direction, number>;
    /** Extra transform while the front card is dragged `x` px. */
    dragPose: (x: number) => gsap.TweenVars;
    /** The front card leaves and goes to the back. */
    forward: (
        timeline: gsap.core.Timeline,
        card: HTMLElement,
        ctx: MoveContext,
    ) => void;
    /** The back card comes out and lands in front. */
    backward: (
        timeline: gsap.core.Timeline,
        card: HTMLElement,
        ctx: MoveContext,
    ) => void;
};

/** Share of the card width a tossed card travels sideways. */
const TOSS_DISTANCE = 0.8;

/** Toss: thrown aside while spinning, then slid under the stack. */
const toss: Preset = {
    slots: {
        desktop: [
            { x: 0, y: 0, rotation: 0, scale: 1 },
            { x: 14, y: -18, rotation: 2.5, scale: 0.96 },
            { x: -10, y: -34, rotation: -2, scale: 0.92 },
        ],
        mobile: [
            { x: 0, y: 0, rotation: 0, scale: 1 },
            { x: 8, y: -12, rotation: 1.5, scale: 0.96 },
            { x: -6, y: -22, rotation: -1.5, scale: 0.92 },
        ],
        reduce: [
            { x: 0, y: 0, rotation: 0, scale: 1 },
            { x: 0, y: -12, rotation: 0, scale: 0.96 },
            { x: 0, y: -22, rotation: 0, scale: 0.92 },
        ],
    },
    othersAt: { forward: 0.1, backward: 0.1 },
    dragPose: (x) => ({ rotation: x * 0.05 }),
    forward(timeline, card, { n, mode, side, landing, landingZ }) {
        const spin = mode === 'mobile' ? 12 : 18;

        gsap.set(card, { zIndex: n + 1 });
        timeline
            .to(
                card,
                {
                    x: side * card.offsetWidth * TOSS_DISTANCE,
                    y: -24,
                    rotation: side * spin,
                    duration: 0.42,
                    overwrite: 'auto',
                },
                0,
            )
            .set(card, { zIndex: 0 })
            .to(card, { ...landing, duration: 0.38 })
            .set(card, { zIndex: landingZ });
    },
    backward(timeline, card, { n, mode, side, landing, landingZ }) {
        const spin = mode === 'mobile' ? 12 : 18;

        gsap.set(card, { zIndex: 0, autoAlpha: 1 });
        timeline
            .to(
                card,
                {
                    x: side * card.offsetWidth * TOSS_DISTANCE,
                    y: -24,
                    rotation: side * spin,
                    duration: 0.38,
                    overwrite: 'auto',
                },
                0,
            )
            .set(card, { zIndex: n + 1 })
            .to(card, { ...landing, duration: 0.42 })
            .set(card, { zIndex: landingZ });
    },
};

/** Perspective for the flip, in px. */
const FLIP_PERSPECTIVE = 1200;

const flipSlot = (y: number, scale: number): Pose => ({
    x: 0,
    y,
    rotation: 0,
    scale,
    rotationY: 0,
    transformPerspective: FLIP_PERSPECTIVE,
});

/**
 * Flip: turned over on top of the stack (rotateY), then slipped behind it.
 * The card turns face down (it rests there for a beat so the back reads),
 * then on to edge-on at -270°, which looks the same as 90°. It changes
 * stacking order there, while invisible, and finishes turning to its front
 * behind the stack without any jump. Going back is the same move reversed.
 * The stack itself stays straight.
 */
const flip: Preset = {
    slots: {
        desktop: [flipSlot(0, 1), flipSlot(-16, 0.95), flipSlot(-30, 0.9)],
        mobile: [flipSlot(0, 1), flipSlot(-10, 0.95), flipSlot(-19, 0.9)],
        reduce: [flipSlot(0, 1), flipSlot(-10, 0.95), flipSlot(-19, 0.9)],
    },
    // Going back, the stack waits until the incoming card is on top.
    othersAt: { forward: 0.1, backward: 0.35 },
    dragPose: (x) => ({ rotationY: gsap.utils.clamp(-25, 25, x * 0.08) }),
    forward(timeline, card, { n, landing, landingZ }) {
        gsap.set(card, { zIndex: n + 1 });
        timeline
            .to(card, { rotationY: -180, duration: 0.45, overwrite: 'auto' }, 0)
            .to(
                card,
                { x: 0, rotation: 0, y: -16, scale: 1.03, duration: 0.25 },
                0,
            )
            .to(card, { rotationY: -270, duration: 0.2 }, 0.45)
            .set(card, { zIndex: 0, rotationY: 90 }, 0.65)
            .to(card, { ...landing, duration: 0.4 }, 0.65)
            .set(card, { zIndex: landingZ });
    },
    backward(timeline, card, { n, landing, landingZ }) {
        gsap.set(card, { zIndex: 0, autoAlpha: 1 });
        timeline
            .to(
                card,
                {
                    x: 0,
                    y: 0,
                    rotation: 0,
                    scale: 1,
                    rotationY: 90,
                    duration: 0.35,
                    overwrite: 'auto',
                },
                0,
            )
            .set(card, { zIndex: n + 1, rotationY: -270 }, 0.35)
            .to(card, { rotationY: -180, duration: 0.2 }, 0.35)
            .to(card, { rotationY: 0, duration: 0.45 }, 0.55)
            .to(
                card,
                {
                    keyframes: [
                        { y: -16, scale: 1.03, duration: 0.25 },
                        { y: landing.y, scale: landing.scale, duration: 0.4 },
                    ],
                },
                0.35,
            )
            .set(card, { zIndex: landingZ }, 1);
    },
};

const PRESETS: Record<DeckVariant, Preset> = { toss, flip };

/** Drag further than this share of the card width (or flick) to move on. */
const DRAG_THRESHOLD = 0.25;
const FLICK_SPEED = 600; // px/s

type DeckOptions = {
    active: Ref<number>;
    variant?: DeckVariant;
    /** Side the front card leaves towards when not dragged: 1 right, -1 left. */
    side?: 1 | -1;
};

/**
 * A stack of cards where only the front one is live. `active` is the index
 * of the front card; change it from anywhere (panel, keyboard, drag) and the
 * deck animates there. One step forward plays the preset's `forward` move,
 * one step back its `backward` move; a longer jump plays one move and lets
 * the cards behind it settle into their new places.
 *
 * The DOM is never reordered: stacking is `zIndex` + transforms, so cards
 * keep their state (images, focus targets) and no Flip is needed.
 * Dragging the front card past a threshold in either direction moves
 * forward (a toss is thrown towards that side). Reduced motion swaps
 * instantly.
 *
 * Cards are the root's direct children marked `[data-deck-card]`.
 */
export function useDeck(
    root: Readonly<Ref<HTMLElement | null>>,
    { active, variant = 'toss', side = 1 }: DeckOptions,
) {
    const preset = PRESETS[variant];

    let mode: Mode = 'reduce';
    let order: number[] = [];
    let timeline: gsap.core.Timeline | undefined;
    let draggables: Draggable[] = [];
    let hint: { direction: Direction; side?: number } | undefined;
    let suppressClickUntil = 0;

    const cards = () =>
        root.value
            ? [
                  ...root.value.querySelectorAll<HTMLElement>(
                      ':scope > [data-deck-card]',
                  ),
              ]
            : [];

    const cyclic = (start: number, n: number) =>
        Array.from({ length: n }, (_, k) => (start + k) % n);

    const slot = (position: number) =>
        preset.slots[mode][Math.min(position, VISIBLE - 1)];

    const target = (position: number) => ({
        ...slot(position),
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
        els.forEach((el, i) => {
            const position = order.indexOf(i);
            gsap.set(el, {
                ...target(position),
                zIndex: els.length - position,
            });
        });
        syncDraggables();
    };

    const transition = (to: number, direction: Direction, toSide: number) => {
        timeline?.progress(1).kill();

        const els = cards();
        const n = els.length;
        const from = order;
        order = cyclic(to, n);

        // Focus inside the old front card would be lost once it turns inert.
        const focused = document.activeElement;

        if (
            root.value &&
            focused !== root.value &&
            root.value.contains(focused)
        ) {
            root.value.focus({ preventScroll: true });
        }

        if (mode === 'reduce') {
            place();

            return;
        }

        draggables.forEach((draggable) => draggable.disable());
        timeline = gsap.timeline({ onComplete: syncDraggables });

        const moving = direction === 'forward' ? from[0] : order[0];

        els.forEach((el, i) => {
            if (i === moving) {
                return;
            }

            const position = order.indexOf(i);

            // Cards coming into view rise from behind the last slot.
            if (from.indexOf(i) >= VISIBLE && position < VISIBLE) {
                gsap.set(el, { ...slot(VISIBLE - 1), autoAlpha: 0 });
            }

            gsap.set(el, { zIndex: n - position });
            timeline!.to(
                el,
                { ...target(position), duration: 0.45, overwrite: 'auto' },
                preset.othersAt[direction],
            );
        });

        const position = order.indexOf(moving);
        const card = els[moving];

        if (from.indexOf(moving) >= VISIBLE) {
            gsap.set(card, slot(VISIBLE - 1));
        }

        // The moving card gets its own timeline, so the preset's relative
        // positions don't land after the other cards' tweens.
        const move = gsap.timeline();

        preset[direction](move, card, {
            n,
            mode,
            side: toSide,
            landing: target(position),
            landingZ: n - position,
        });
        timeline.add(move, 0);
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
            hint?.direction ?? (distance <= n / 2 ? 'forward' : 'backward');

        transition(to, direction, hint?.side ?? side);
        hint = undefined;
    });

    const go = (to: number, direction: Direction, toSide?: number) => {
        const n = cards().length;

        if (n < 2) {
            return;
        }

        hint = { direction, side: toSide };
        active.value = (to + n) % n;
    };

    const next = () => go(active.value + 1, 'forward');
    const prev = () => go(active.value - 1, 'backward');

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

    useMotion(root, ({ desktop, reduce }) => {
        mode = reduce ? 'reduce' : desktop ? 'desktop' : 'mobile';

        const els = cards();
        place();

        if (els.length > 1) {
            let samples: { x: number; t: number }[] = [];

            draggables = Draggable.create(els, {
                type: 'x',
                zIndexBoost: false,
                minimumMovement: 6,
                onPress() {
                    timeline?.progress(1);
                    samples = [];
                },
                onDrag(this: Draggable) {
                    if (mode !== 'reduce') {
                        gsap.set(this.target, preset.dragPose(this.x));
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

                    if (far || Math.abs(speed) > FLICK_SPEED) {
                        go(
                            active.value + 1,
                            'forward',
                            Math.sign(this.x) || side,
                        );

                        return;
                    }

                    gsap.to(card, {
                        ...slot(0),
                        duration: mode === 'reduce' ? 0 : 0.3,
                    });
                },
            });
            syncDraggables();
        }

        if (!reduce) {
            // Entrance: the visible cards land back to front.
            const visible = order
                .slice(0, VISIBLE)
                .map((i) => els[i])
                .reverse();

            gsap.from(visible, {
                y: desktop ? 80 : 48,
                opacity: 0,
                stagger: 0.08,
                scrollTrigger: {
                    trigger: root.value,
                    start: 'top 85%',
                    once: true,
                },
            });

            const media = els[order[0]]?.querySelector('[data-media]');

            if (media) {
                revealMedia(media, { trigger: root.value! });
            }
        }

        return () => {
            timeline?.kill();
            draggables.forEach((draggable) => draggable.kill());
            draggables = [];
        };
    });

    return { next, prev, onKeydown, onClickCapture };
}
