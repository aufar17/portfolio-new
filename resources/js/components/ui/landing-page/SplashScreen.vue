<script setup lang="ts">
import { onMounted, ref } from 'vue';
import logo from '@/assets/img/logo.png';
import { shouldShowSplash, useSplash } from '@/composables/useSplash';
import { gsap } from '@/motion/gsap';
import { endSplash, expectSplash, registerSplash } from '@/motion/intro';
import { getLenis } from '@/motion/lenis';
import { useMotion } from '@/motion/useMotion';

const { finishSplash } = useSplash();
const isVisible = ref(shouldShowSplash());

const root = ref<HTMLElement | null>(null);
const mark = ref<HTMLElement | null>(null);
const title = ref<HTMLElement | null>(null);
const track = ref<HTMLElement | null>(null);
const bar = ref<HTMLElement | null>(null);

if (isVisible.value) {
    expectSplash();
}

const done = () => {
    isVisible.value = false;
    document.documentElement.style.overflow = '';
    getLenis()?.start();
    finishSplash();
    endSplash();
};

/** Centre of the hero robot, where the closing circle lands. */
const introPoint = () => {
    const rect = document
        .querySelector('[data-intro-target]')
        ?.getBoundingClientRect();

    return rect
        ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
        : { x: window.innerWidth / 2, y: window.innerHeight / 2 };
};

onMounted(() => {
    if (!isVisible.value) {
        finishSplash();
        endSplash();
    }
});

useMotion(root, () => {
    document.documentElement.style.overflow = 'hidden';
    getLenis()?.stop();

    const radius = Math.hypot(window.innerWidth, window.innerHeight);
    let point = { x: 0, y: 0 };

    const timeline = gsap.timeline();

    timeline
        .from(mark.value, { opacity: 0, scale: 0.7, duration: 0.6 })
        .from(title.value, { opacity: 0, y: 12, duration: 0.6 }, 0.15)
        .from(bar.value, { scaleX: 0, duration: 1 }, 0.1)
        .addLabel('exit', 1.2)
        .to(
            [mark.value, title.value, track.value],
            { opacity: 0, y: -12, duration: 0.35, stagger: 0.04 },
            'exit',
        )
        .call(
            () => {
                point = introPoint();
            },
            [],
            'exit+=0.1',
        )
        .fromTo(
            root.value,
            {
                clipPath: () =>
                    `circle(${radius}px at ${point.x}px ${point.y}px)`,
            },
            {
                clipPath: () => `circle(0px at ${point.x}px ${point.y}px)`,
                duration: 0.8,
                immediateRender: false,
            },
            'exit+=0.1',
        )
        .addLabel('reveal', 'exit+=0.45')
        .call(done, [], 'exit+=0.9');

    registerSplash(timeline);
});
</script>

<template>
    <div
        v-if="isVisible"
        ref="root"
        class="fixed inset-0 z-[9999] grid place-items-center overflow-hidden bg-background px-4"
        role="status"
        aria-label="Loading portfolio"
    >
        <div
            class="pointer-events-none absolute size-[24rem] -translate-x-24 -translate-y-16 rounded-full bg-primary/25 blur-[100px]"
            aria-hidden="true"
        />
        <div
            class="pointer-events-none absolute size-[24rem] translate-x-24 translate-y-16 rounded-full bg-brand-red/20 blur-[100px]"
            aria-hidden="true"
        />

        <div class="relative flex flex-col items-center text-center">
            <div
                ref="mark"
                class="grid size-24 place-items-center rounded-full surface-glass sm:size-28"
            >
                <img :src="logo" alt="" class="h-14 w-auto sm:h-16" />
            </div>

            <p
                ref="title"
                class="mt-6 text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
            >
                Aufar's Portfolio
            </p>

            <div
                ref="track"
                class="mt-6 h-1 w-40 overflow-hidden rounded-full bg-muted sm:w-48"
                aria-hidden="true"
            >
                <div
                    ref="bar"
                    class="h-full origin-left rounded-full bg-primary"
                />
            </div>
        </div>
    </div>
</template>
