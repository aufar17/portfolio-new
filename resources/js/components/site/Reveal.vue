<script setup lang="ts">
import { ref } from 'vue';
import { gsap } from '@/motion/gsap';
import { useMotion } from '@/motion/useMotion';

/** Fades and lifts its content in the first time it scrolls into view. */
const props = withDefaults(
    defineProps<{
        as?: string;
        delay?: number;
        y?: number;
        /** Share of the element that must be visible before it reveals. */
        amount?: number;
    }>(),
    {
        as: 'div',
        delay: 0,
        y: 24,
        amount: 0.2,
    },
);

const el = ref<HTMLElement | null>(null);

useMotion(el, ({ reduce, mobile }) => {
    if (reduce || !el.value) {
        return;
    }

    gsap.from(el.value, {
        opacity: 0,
        y: mobile ? Math.min(props.y, 16) : props.y,
        delay: props.delay,
        clearProps: 'transform',
        scrollTrigger: {
            trigger: el.value,
            start: `${props.amount * 100}% bottom`,
            once: true,
        },
    });
});
</script>

<template>
    <component :is="props.as" ref="el">
        <slot />
    </component>
</template>
