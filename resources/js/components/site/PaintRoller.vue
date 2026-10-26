<script setup lang="ts">
import { ref } from 'vue';
import { gsap, ScrollTrigger } from '@/motion/gsap';
import { onThemeChange } from '@/motion/paintColors';
import { drawRollerStripe } from '@/motion/sprayPaint';
import { useMotion } from '@/motion/useMotion';

/**
 * Paint-roller divider: a roller crosses the container left to right,
 * scrubbed to scroll, laying a ragged stripe of paint (a static canvas
 * revealed with `clip-path`) and fading out at the end. The stripe is
 * redrawn after resize and theme change. Reduced motion shows the stripe
 * without the roller.
 */
const root = ref<HTMLElement | null>(null);
const stripe = ref<HTMLCanvasElement | null>(null);
const head = ref<HTMLElement | null>(null);

useMotion(root, ({ reduce }) => {
    const paint = () => stripe.value && drawRollerStripe(stripe.value);
    paint();

    const offTheme = onThemeChange(paint);
    ScrollTrigger.addEventListener('refresh', paint);

    if (!reduce) {
        gsap.timeline({
            scrollTrigger: {
                trigger: root.value,
                start: 'top 85%',
                end: 'top 45%',
                scrub: true,
                invalidateOnRefresh: true,
            },
        })
            .fromTo(
                stripe.value,
                { clipPath: 'inset(0% 100% 0% 0%)' },
                { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'none' },
                0,
            )
            .fromTo(
                head.value,
                { x: 0 },
                { x: () => root.value!.clientWidth, duration: 1, ease: 'none' },
                0,
            )
            .to(head.value, { autoAlpha: 0, duration: 0.15 }, 0.9);
    }

    return () => {
        offTheme();
        ScrollTrigger.removeEventListener('refresh', paint);
    };
});
</script>

<template>
    <div ref="root" class="relative h-14 sm:h-16" aria-hidden="true">
        <canvas ref="stripe" class="absolute inset-0 size-full" />
        <!-- Roller: centred on its x with a margin, since GSAP owns transforms -->
        <div
            ref="head"
            class="pointer-events-none absolute -top-1 -bottom-1 left-0 -ml-2.5 w-5 motion-reduce:hidden"
        >
            <div
                class="h-full rounded-md bg-primary-strong shadow-elevated ring-2 ring-background"
            />
            <span
                class="absolute top-full left-1/2 -ml-0.5 h-7 w-1 rounded-full bg-foreground/50"
            />
        </div>
    </div>
</template>
