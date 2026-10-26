<script setup lang="ts">
import { onBeforeUnmount, ref, useId } from 'vue';
import {
    A_CROSSBAR,
    A_KNEE,
    A_SILHOUETTE,
    A_SPLIT_LEFT,
    A_SPLIT_RIGHT,
    A_VISOR,
} from '@/components/site/abotShape';
import { gsap, prefersReducedMotion } from '@/motion/gsap';
import { useMotion } from '@/motion/useMotion';
import type { BotGesture } from '@/script/landingPage/botDialog';

/**
 * Hero mascot "Abot": a robot whose frame is the capital "A" of the logo,
 * drawn in SVG with every corner rounded (geometry in `abotShape.ts`) and
 * coloured only through theme tokens. The counter of the A
 * is its visor, the crossbar its shoulders (arms hang from the ends) and the
 * legs of the A are its legs. Like the logo, the left leg is a circuit panel
 * and the right one a solid slab.
 *
 * It stands, breathes and blinks on its own, follows the cursor with its eyes
 * and squints when hovered. It is the button that opens its introduction
 * dialog (the hero handles the click); while the dialog runs the hero drives
 * `speak()`, `gesture()` and `react()`. The entrance is driven via
 * `prepare()` and `enter()`. Gestures are skipped under reduced motion.
 */
defineProps<{
    expanded: boolean;
    controls: string;
}>();

// Pivots in viewBox units, so rotations stay put whatever the rendered size.
const SHOULDER_LEFT = '32 161';
const SHOULDER_RIGHT = '188 161';
const FEET = '110 212';

// Clip ids for the two legs, unique per instance.
const uid = useId();

const root = ref<HTMLButtonElement | null>(null);
const body = ref<SVGGElement | null>(null);
const visor = ref<SVGGElement | null>(null);
const eyes = ref<SVGGElement | null>(null);
const eyeLeft = ref<SVGRectElement | null>(null);
const eyeRight = ref<SVGRectElement | null>(null);
const armLeft = ref<SVGGElement | null>(null);
const armRight = ref<SVGGElement | null>(null);
const antenna = ref<SVGGElement | null>(null);
const halo = ref<SVGCircleElement | null>(null);
const shadow = ref<SVGEllipseElement | null>(null);

const wave = () =>
    gsap
        .timeline()
        .to(armRight.value, {
            rotation: -110,
            svgOrigin: SHOULDER_RIGHT,
            duration: 0.35,
        })
        .to(armRight.value, {
            rotation: -80,
            duration: 0.18,
            repeat: 3,
            yoyo: true,
            ease: 'sine.inOut',
        })
        .to(armRight.value, { rotation: 0, duration: 0.45 });

const hop = () =>
    gsap
        .timeline()
        .to(body.value, { y: -18, duration: 0.25 })
        .to(body.value, { y: 0, duration: 0.5 })
        .to(shadow.value, { scaleX: 0.7, svgOrigin: FEET, duration: 0.25 }, 0)
        .to(shadow.value, { scaleX: 1, duration: 0.5 }, 0.25);

const nod = () =>
    gsap.timeline().to(visor.value, {
        y: 4,
        duration: 0.16,
        repeat: 3,
        yoyo: true,
        ease: 'sine.inOut',
    });

/** Left arm towards the hero CTA: beside the robot from lg, below it otherwise. */
const point = () => {
    const angle = window.matchMedia('(min-width: 1024px)').matches ? 30 : -35;
    const jab = angle > 0 ? 8 : -8;

    return gsap
        .timeline()
        .to(armLeft.value, {
            rotation: angle,
            svgOrigin: SHOULDER_LEFT,
            duration: 0.35,
        })
        .to(armLeft.value, {
            rotation: angle + jab,
            duration: 0.15,
            repeat: 3,
            yoyo: true,
            ease: 'sine.inOut',
        })
        .to(armLeft.value, { rotation: 0, duration: 0.45 }, '+=0.6');
};

const dizzy = () =>
    gsap
        .timeline()
        .fromTo(
            body.value,
            { rotation: -6, svgOrigin: FEET },
            {
                rotation: 6,
                duration: 0.09,
                repeat: 5,
                yoyo: true,
                ease: 'sine.inOut',
            },
        )
        .to(body.value, { rotation: 0, duration: 0.2 })
        .to(
            eyes.value,
            {
                rotation: 360,
                transformOrigin: '50% 50%',
                duration: 0.8,
                ease: 'none',
            },
            0,
        )
        .set(eyes.value, { rotation: 0 });

const gestures: Record<BotGesture, () => gsap.core.Timeline> = {
    wave,
    hop,
    nod,
    point,
};

let current: gsap.core.Timeline | undefined;
let talk: gsap.core.Tween | undefined;

/** A new gesture first snaps the previous one to its (resting) end. */
const play = (make: () => gsap.core.Timeline) => {
    if (prefersReducedMotion()) {
        return;
    }

    current?.progress(1).kill();
    current = make();
};

const gesture = (name: BotGesture) => play(gestures[name]);

/** Reaction to being clicked many times in a row. */
const react = () => play(dizzy);

/** The visor pulses while the dialog is typing. */
const speak = (on: boolean) => {
    talk?.kill();
    talk = undefined;

    if (prefersReducedMotion()) {
        return;
    }

    talk = on
        ? gsap.to(visor.value, {
              scale: 1.05,
              transformOrigin: '50% 60%',
              duration: 0.12,
              yoyo: true,
              repeat: -1,
              ease: 'sine.inOut',
          })
        : gsap.to(visor.value, { scale: 1, duration: 0.15 });
};

const focus = () => root.value?.focus({ preventScroll: true });

onBeforeUnmount(() => {
    current?.kill();
    talk?.kill();
});

/** Hide before the intro plays (runs inside the hero's motion context). */
const prepare = () => {
    gsap.set(root.value, { opacity: 0, scale: 0.4, y: 24 });
};

/** Pop in and wave, as part of the hero intro timeline. */
const enter = (timeline: gsap.core.Timeline, position: number) => {
    timeline
        .to(root.value, { opacity: 1, scale: 1, y: 0, duration: 0.7 }, position)
        .add(wave(), position + 0.45);
};

defineExpose({ prepare, enter, gesture, react, speak, focus });

useMotion(root, ({ reduce, desktop }) => {
    if (reduce) {
        return;
    }

    const idle = { duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1 };

    gsap.to(body.value, { scaleY: 1.015, svgOrigin: FEET, ...idle });
    gsap.to(antenna.value, {
        rotation: 4,
        svgOrigin: '110 26',
        ...idle,
        duration: 1.8,
    });
    gsap.fromTo(
        halo.value,
        { scale: 1, opacity: 0.5 },
        {
            scale: 2.2,
            opacity: 0,
            transformOrigin: '50% 50%',
            duration: 1.6,
            repeat: -1,
        },
    );

    let blinkCall: gsap.core.Tween;
    const blink = () => {
        gsap.to([eyeLeft.value, eyeRight.value], {
            scaleY: 0.1,
            transformOrigin: '50% 50%',
            duration: 0.08,
            yoyo: true,
            repeat: 1,
            ease: 'none',
        });
        blinkCall = gsap.delayedCall(gsap.utils.random(2.5, 5.5), blink);
    };
    blinkCall = gsap.delayedCall(2, blink);

    if (!desktop || !window.matchMedia('(pointer: fine)').matches) {
        return () => blinkCall.kill();
    }

    const eyesX = gsap.quickTo(eyes.value, 'x', { duration: 0.4 });
    const eyesY = gsap.quickTo(eyes.value, 'y', { duration: 0.4 });
    const visorX = gsap.quickTo(visor.value, 'x', { duration: 0.6 });
    gsap.set(root.value, { transformOrigin: '50% 100%' });
    const lean = gsap.quickTo(root.value, 'rotation', { duration: 0.6 });

    const onPointerMove = (event: PointerEvent) => {
        const rect = root.value!.getBoundingClientRect();
        const dx = gsap.utils.clamp(
            -1,
            1,
            (event.clientX - (rect.left + rect.width / 2)) /
                (window.innerWidth / 2),
        );
        const dy = gsap.utils.clamp(
            -1,
            1,
            (event.clientY - (rect.top + rect.height / 2)) /
                (window.innerHeight / 2),
        );

        eyesX(dx * 4);
        eyesY(dy * 3);
        visorX(dx * 1.5);
        lean(dx * 3);
    };

    const squint = (amount: number) =>
        gsap.to(eyes.value, {
            scaleY: amount,
            transformOrigin: '50% 60%',
            duration: 0.2,
            overwrite: 'auto',
        });

    const onEnter = () => squint(0.45);
    const onLeave = () => squint(1);

    const el = root.value!;
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointerleave', onLeave);

    return () => {
        blinkCall.kill();
        window.removeEventListener('pointermove', onPointerMove);
        el.removeEventListener('pointerenter', onEnter);
        el.removeEventListener('pointerleave', onLeave);
    };
});
</script>

<template>
    <button
        ref="root"
        type="button"
        class="cursor-pointer touch-manipulation rounded-3xl select-none focus-ring"
        aria-label="Talk to Abot"
        :aria-expanded="expanded"
        :aria-controls="expanded ? controls : undefined"
    >
        <svg
            aria-hidden="true"
            viewBox="0 -12 220 240"
            class="block h-28 w-auto overflow-visible drop-shadow-[0_14px_24px_color-mix(in_oklab,var(--primary)_22%,transparent)] sm:h-32 md:h-36 lg:h-72 xl:h-80"
        >
            <ellipse
                ref="shadow"
                cx="110"
                cy="216"
                rx="92"
                ry="5"
                class="fill-foreground"
                fill-opacity="0.1"
            />

            <g ref="body">
                <!-- Antenna on the apex of the A -->
                <g ref="antenna">
                    <rect
                        x="108"
                        y="0"
                        width="4"
                        height="28"
                        rx="2"
                        class="fill-primary"
                    />
                    <circle
                        ref="halo"
                        cx="110"
                        cy="-2"
                        r="6"
                        class="fill-brand-red"
                    />
                    <circle cx="110" cy="-2" r="6" class="fill-brand-red" />
                </g>

                <defs>
                    <clipPath :id="`${uid}-left`">
                        <path :d="A_SPLIT_LEFT" />
                    </clipPath>
                    <clipPath :id="`${uid}-right`">
                        <path :d="A_SPLIT_RIGHT" />
                    </clipPath>
                </defs>

                <!-- Left leg of the A: circuit panel (the logo's PCB side) -->
                <path
                    :d="A_SILHOUETTE"
                    :clip-path="`url(#${uid}-left)`"
                    stroke-width="2"
                    stroke-linejoin="round"
                    class="fill-card stroke-border"
                />
                <g
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="fill-none stroke-primary max-sm:hidden"
                >
                    <path d="M96 72 L80 104" />
                    <path d="M84 84 L70 112" />
                    <path d="M77 120 L66 142" />
                </g>
                <g class="fill-primary max-sm:hidden">
                    <circle cx="80" cy="104" r="3" />
                    <circle cx="70" cy="112" r="3" />
                    <circle cx="66" cy="142" r="3" />
                </g>

                <!-- Right leg of the A, running over the apex: solid slab -->
                <path
                    :d="A_SILHOUETTE"
                    :clip-path="`url(#${uid}-right)`"
                    class="fill-primary"
                />
                <path
                    d="M120 44 L190 186"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-opacity="0.25"
                    class="fill-none stroke-primary-foreground"
                />

                <!-- The counter of the A is the visor -->
                <g ref="visor">
                    <path :d="A_VISOR" class="fill-primary" />
                    <path
                        d="M95 104 Q99 95 106 92"
                        stroke-width="3"
                        stroke-linecap="round"
                        stroke-opacity="0.5"
                        class="fill-none stroke-primary-foreground"
                    />

                    <g ref="eyes">
                        <rect
                            ref="eyeLeft"
                            x="94"
                            y="114"
                            width="10"
                            height="16"
                            rx="5"
                            class="fill-primary-foreground"
                        />
                        <rect
                            ref="eyeRight"
                            x="116"
                            y="114"
                            width="10"
                            height="16"
                            rx="5"
                            class="fill-primary-foreground"
                        />
                    </g>

                    <circle
                        cx="88"
                        cy="138"
                        r="4"
                        class="fill-brand-red"
                        fill-opacity="0.65"
                    />
                    <circle
                        cx="132"
                        cy="138"
                        r="4"
                        class="fill-brand-red"
                        fill-opacity="0.65"
                    />
                </g>

                <!-- Arms hang from the ends of the crossbar -->
                <g ref="armLeft">
                    <g transform="rotate(50 32 161)">
                        <rect
                            x="26"
                            y="160"
                            width="12"
                            height="30"
                            rx="6"
                            class="fill-primary"
                        />
                        <circle
                            cx="32"
                            cy="193"
                            r="6.5"
                            stroke-width="2"
                            class="fill-card stroke-border"
                        />
                    </g>
                </g>
                <g ref="armRight">
                    <g transform="rotate(-50 188 161)">
                        <rect
                            x="182"
                            y="160"
                            width="12"
                            height="30"
                            rx="6"
                            class="fill-primary"
                        />
                        <circle
                            cx="188"
                            cy="193"
                            r="6.5"
                            stroke-width="2"
                            class="fill-card stroke-border"
                        />
                    </g>
                </g>

                <!-- Crossbar of the A: shoulder panel -->
                <rect
                    v-bind="A_CROSSBAR"
                    :rx="A_CROSSBAR.height / 2"
                    stroke-width="2"
                    class="fill-card stroke-border"
                />
                <circle cx="32" cy="161" r="4" class="fill-primary" />
                <circle cx="188" cy="161" r="4" class="fill-primary" />
                <circle cx="98" cy="161" r="3.5" class="fill-primary" />
                <circle cx="110" cy="161" r="3.5" class="fill-brand-red" />
                <circle
                    cx="122"
                    cy="161"
                    r="3.5"
                    class="fill-primary"
                    fill-opacity="0.45"
                />

                <!-- Hexagon knee joint, from the logo -->
                <path :d="A_KNEE" class="fill-primary" />

                <!-- Feet under the legs of the A -->
                <rect
                    x="8"
                    y="202"
                    width="40"
                    height="11"
                    rx="5.5"
                    class="fill-primary"
                />
                <rect
                    x="172"
                    y="202"
                    width="40"
                    height="11"
                    rx="5.5"
                    class="fill-primary"
                />
            </g>
        </svg>
    </button>
</template>
