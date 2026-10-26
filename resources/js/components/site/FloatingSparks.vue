<script setup lang="ts">
import { nextTick, ref } from 'vue';
import { gsap } from '@/motion/gsap';
import { useMotion } from '@/motion/useMotion';

/**
 * Decorative background sparks that drift to random positions forever.
 * Each spark chains eased tweens towards a new random target, so the
 * motion stays smooth but never repeats. None at all with reduced motion.
 */

type Spark = {
    id: number;
    left: number;
    top: number;
    size: number;
    shape: 'dot' | 'star';
    tone: 'blue' | 'red';
};

const random = gsap.utils.random;

const root = ref<HTMLElement | null>(null);
const sparks = ref<Spark[]>([]);
const els = ref<HTMLElement[]>([]);

useMotion(root, ({ reduce, mobile }, context) => {
    if (reduce) {
        return;
    }

    let stopped = false;

    const drift = (el: HTMLElement) => {
        if (stopped) {
            return;
        }

        const range = Math.min(window.innerWidth, 900) * 0.12;

        gsap.to(el, {
            x: random(-range, range),
            y: random(-range, range),
            scale: random(0.6, 1.25),
            opacity: random(0.3, 0.9),
            rotation: random(-90, 90),
            duration: random(5, 11),
            ease: 'sine.inOut',
            onComplete: () => drift(el),
        });
    };

    sparks.value = Array.from({ length: mobile ? 12 : 24 }, (_, id) => ({
        id,
        left: random(2, 98),
        top: random(2, 98),
        size: random(3, 7),
        shape: id % 3 === 0 ? 'star' : 'dot',
        tone: id % 3 === 1 ? 'red' : 'blue',
    }));

    nextTick(() => {
        if (stopped) {
            return;
        }

        // Stagger the start so sparks don't move in unison.
        context.add(() =>
            els.value.forEach((el) =>
                gsap.delayedCall(random(0, 1.5), () => drift(el)),
            ),
        );
    });

    return () => {
        stopped = true;
        gsap.killTweensOf(els.value);
        sparks.value = [];
    };
});
</script>

<template>
    <div
        ref="root"
        class="pointer-events-none fixed inset-0 -z-40 overflow-hidden"
        aria-hidden="true"
    >
        <span
            v-for="spark in sparks"
            :key="spark.id"
            ref="els"
            class="absolute opacity-0 will-change-transform"
            :class="
                spark.tone === 'red' ? 'text-brand-red' : 'text-primary-strong'
            "
            :style="{
                left: `${spark.left}%`,
                top: `${spark.top}%`,
                width: `${spark.shape === 'star' ? spark.size * 2.4 : spark.size}px`,
                height: `${spark.shape === 'star' ? spark.size * 2.4 : spark.size}px`,
            }"
        >
            <svg
                v-if="spark.shape === 'star'"
                viewBox="0 0 24 24"
                class="size-full drop-shadow-[0_0_6px_currentColor]"
                fill="currentColor"
            >
                <path
                    d="M12 0c.6 6.2 5.8 11.4 12 12-6.2.6-11.4 5.8-12 12-.6-6.2-5.8-11.4-12-12C6.2 11.4 11.4 6.2 12 0Z"
                />
            </svg>
            <span
                v-else
                class="block size-full rounded-full bg-current shadow-[0_0_10px_2px_currentColor]"
            />
        </span>
    </div>
</template>
