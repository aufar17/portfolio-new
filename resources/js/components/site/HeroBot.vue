<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import AbotFigure from '@/components/site/AbotFigure.vue';
import { SHOULDER_LEFT } from '@/components/site/abotShape';
import type { AbotParts } from '@/motion/abotMotion';
import {
    dizzy,
    gesturePlayer,
    hop,
    idle,
    nod,
    speaker,
    wave,
} from '@/motion/abotMotion';
import { gsap } from '@/motion/gsap';
import { useMotion } from '@/motion/useMotion';
import type { BotGesture } from '@/script/landingPage/botDialog';

/**
 * Hero mascot "Abot": a chubby toy robot whose outline is the capital "A" of
 * the logo (drawing in `AbotFigure.vue`, geometry in `abotShape.ts`). The dome
 * is the apex of the A, the arch between its stubby legs the counter and the
 * belt the crossbar, with the arms hanging from the belt's ends.
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

const root = ref<HTMLButtonElement | null>(null);
const figure = ref<InstanceType<typeof AbotFigure> | null>(null);

// The moving parts live in the drawing.
const parts = () => (figure.value ?? {}) as AbotParts;
const eyes = computed(() => figure.value?.eyes ?? null);
const visor = computed(() => figure.value?.visor ?? null);
const armLeft = computed(() => figure.value?.armLeft ?? null);

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

const gestures: Record<BotGesture, () => gsap.core.Timeline> = {
    wave: () => wave(parts()),
    hop: () => hop(parts()),
    nod: () => nod(parts()),
    point,
};

const player = gesturePlayer();
const voice = speaker(parts);

const gesture = (name: BotGesture) => player.play(gestures[name]);

/** Reaction to being clicked many times in a row. */
const react = () => player.play(() => dizzy(parts()));

/** The visor pulses while the dialog is typing. */
const speak = voice.speak;

const focus = () => root.value?.focus({ preventScroll: true });

onBeforeUnmount(() => {
    player.kill();
    voice.kill();
});

/** Hide before the intro plays (runs inside the hero's motion context). */
const prepare = () => {
    gsap.set(root.value, { opacity: 0, scale: 0.4, y: 24 });
};

/** Pop in and wave, as part of the hero intro timeline. */
const enter = (timeline: gsap.core.Timeline, position: number) => {
    timeline
        .to(root.value, { opacity: 1, scale: 1, y: 0, duration: 0.7 }, position)
        .add(wave(parts()), position + 0.45);
};

defineExpose({ prepare, enter, gesture, react, speak, focus });

useMotion(root, ({ reduce, desktop }) => {
    if (reduce) {
        return;
    }

    const stopBlinking = idle(parts());

    if (!desktop || !window.matchMedia('(pointer: fine)').matches) {
        return stopBlinking;
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
        stopBlinking();
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
        class="cursor-pointer touch-manipulation rounded-3xl focus-ring select-none"
        aria-label="Talk to Abot"
        :aria-expanded="expanded"
        :aria-controls="expanded ? controls : undefined"
    >
        <AbotFigure
            ref="figure"
            class="block h-28 w-auto drop-shadow-[0_14px_24px_color-mix(in_oklab,var(--primary)_22%,transparent)] sm:h-32 md:h-36 lg:h-64 xl:h-72"
        />
    </button>
</template>
