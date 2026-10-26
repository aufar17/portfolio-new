<script setup lang="ts">
import { ref, useId } from 'vue';
import { gsap } from '@/motion/gsap';
import { useMotion } from '@/motion/useMotion';

/**
 * Hero mascot: a small hovering robot drawn in SVG, coloured only through
 * theme tokens. It floats and blinks on its own, follows the cursor with its
 * eyes, squints when hovered and hops + waves when clicked. Decorative, so
 * hidden from assistive tech. The hero drives its entrance via `prepare()`
 * and `enter()`.
 */
const glowId = `herobot-glow-${useId()}`;

const root = ref<HTMLElement | null>(null);
const hop = ref<SVGGElement | null>(null);
const float = ref<SVGGElement | null>(null);
const head = ref<SVGGElement | null>(null);
const eyes = ref<SVGGElement | null>(null);
const eyeLeft = ref<SVGRectElement | null>(null);
const eyeRight = ref<SVGRectElement | null>(null);
const arm = ref<SVGGElement | null>(null);
const halo = ref<SVGCircleElement | null>(null);
const thruster = ref<SVGEllipseElement | null>(null);
const shadow = ref<SVGEllipseElement | null>(null);

const wave = () =>
    gsap
        .timeline()
        .to(arm.value, {
            rotation: -150,
            transformOrigin: '50% 12%',
            duration: 0.35,
        })
        .to(arm.value, {
            rotation: -118,
            duration: 0.18,
            repeat: 3,
            yoyo: true,
            ease: 'sine.inOut',
        })
        .to(arm.value, { rotation: 0, duration: 0.45 });

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

defineExpose({ prepare, enter });

useMotion(root, ({ reduce, desktop }) => {
    if (reduce) {
        return;
    }

    const idle = { duration: 2.2, ease: 'sine.inOut', yoyo: true, repeat: -1 };

    gsap.to(float.value, { y: -7, ...idle });
    gsap.to([thruster.value, shadow.value], {
        scaleX: 0.72,
        opacity: 0.5,
        transformOrigin: '50% 50%',
        ...idle,
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

    gsap.set(head.value, { transformOrigin: '50% 100%' });
    const eyesX = gsap.quickTo(eyes.value, 'x', { duration: 0.4 });
    const eyesY = gsap.quickTo(eyes.value, 'y', { duration: 0.4 });
    const tilt = gsap.quickTo(head.value, 'rotation', { duration: 0.6 });

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

        eyesX(dx * 6);
        eyesY(dy * 4);
        tilt(dx * 6);
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
    const onClick = () => {
        gsap.timeline()
            .to(hop.value, { y: -18, duration: 0.25 })
            .to(hop.value, { y: 0, duration: 0.5 });
        wave();
    };

    const el = root.value!;
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointerleave', onLeave);
    el.addEventListener('click', onClick);

    return () => {
        blinkCall.kill();
        window.removeEventListener('pointermove', onPointerMove);
        el.removeEventListener('pointerenter', onEnter);
        el.removeEventListener('pointerleave', onLeave);
        el.removeEventListener('click', onClick);
    };
});
</script>

<template>
    <div
        ref="root"
        data-intro-target
        class="select-none [@media(pointer:fine)]:cursor-pointer"
        aria-hidden="true"
    >
        <svg
            viewBox="0 0 160 196"
            class="h-28 w-auto overflow-visible drop-shadow-[0_14px_24px_color-mix(in_oklab,var(--primary)_22%,transparent)] sm:h-32 md:h-36"
        >
            <defs>
                <filter
                    :id="glowId"
                    x="-50%"
                    y="-200%"
                    width="200%"
                    height="500%"
                >
                    <feGaussianBlur stdDeviation="4" />
                </filter>
            </defs>

            <ellipse
                ref="shadow"
                cx="80"
                cy="192"
                rx="30"
                ry="4"
                class="fill-foreground"
                fill-opacity="0.1"
            />

            <g ref="hop">
                <g ref="float">
                    <ellipse
                        ref="thruster"
                        cx="80"
                        cy="180"
                        rx="16"
                        ry="5"
                        class="fill-primary"
                        fill-opacity="0.6"
                        :filter="`url(#${glowId})`"
                    />

                    <!-- Arms sit behind the body -->
                    <rect
                        x="30"
                        y="128"
                        width="14"
                        height="32"
                        rx="7"
                        class="fill-primary"
                    />
                    <g ref="arm">
                        <rect
                            x="116"
                            y="128"
                            width="14"
                            height="32"
                            rx="7"
                            class="fill-primary"
                        />
                    </g>

                    <rect
                        x="44"
                        y="122"
                        width="72"
                        height="50"
                        rx="22"
                        stroke-width="2"
                        class="fill-card stroke-border"
                    />
                    <circle cx="80" cy="145" r="8" class="fill-primary" />
                    <circle
                        cx="80"
                        cy="145"
                        r="3"
                        class="fill-primary-foreground"
                    />

                    <rect
                        x="70"
                        y="114"
                        width="20"
                        height="10"
                        rx="4"
                        class="fill-primary"
                        fill-opacity="0.6"
                    />

                    <g ref="head">
                        <rect
                            x="78"
                            y="18"
                            width="4"
                            height="22"
                            rx="2"
                            class="fill-primary"
                        />
                        <circle
                            ref="halo"
                            cx="80"
                            cy="14"
                            r="7"
                            class="fill-brand-red"
                        />
                        <circle cx="80" cy="14" r="7" class="fill-brand-red" />

                        <rect
                            x="18"
                            y="60"
                            width="14"
                            height="30"
                            rx="7"
                            class="fill-primary"
                        />
                        <rect
                            x="128"
                            y="60"
                            width="14"
                            height="30"
                            rx="7"
                            class="fill-primary"
                        />

                        <rect
                            x="26"
                            y="36"
                            width="108"
                            height="82"
                            rx="32"
                            stroke-width="2"
                            class="fill-card stroke-border"
                        />
                        <rect
                            x="38"
                            y="50"
                            width="84"
                            height="52"
                            rx="22"
                            class="fill-primary"
                        />
                        <path
                            d="M50 66 Q55 58 66 56"
                            stroke-width="3"
                            stroke-linecap="round"
                            stroke-opacity="0.5"
                            class="fill-none stroke-primary-foreground"
                        />

                        <g ref="eyes">
                            <rect
                                ref="eyeLeft"
                                x="58"
                                y="66"
                                width="12"
                                height="20"
                                rx="6"
                                class="fill-primary-foreground"
                            />
                            <rect
                                ref="eyeRight"
                                x="90"
                                y="66"
                                width="12"
                                height="20"
                                rx="6"
                                class="fill-primary-foreground"
                            />
                        </g>

                        <circle
                            cx="52"
                            cy="94"
                            r="4.5"
                            class="fill-brand-red"
                            fill-opacity="0.65"
                        />
                        <circle
                            cx="108"
                            cy="94"
                            r="4.5"
                            class="fill-brand-red"
                            fill-opacity="0.65"
                        />
                    </g>
                </g>
            </g>
        </svg>
    </div>
</template>
