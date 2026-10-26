<script setup lang="ts">
import { Blocks } from 'lucide-vue-next';
import { nextTick, ref } from 'vue';
import { storageUrl } from '@/lib/utils';
import { gsap } from '@/motion/gsap';
import { useMotion } from '@/motion/useMotion';

/**
 * Endless horizontal row of skills. The list is rendered twice (the copy is
 * hidden from assistive tech) and the track slides by half its width, so
 * the loop is seamless. Hover or keyboard focus eases it to a stop. With
 * reduced motion it is a plain wrapped list.
 */
const props = withDefaults(
    defineProps<{
        items: any[];
        label: string;
        variant?: 'tile' | 'pill';
        direction?: 'left' | 'right';
    }>(),
    {
        variant: 'pill',
        direction: 'left',
    },
);

const root = ref<HTMLElement | null>(null);
const track = ref<HTMLElement | null>(null);

/** Copies of the list in the track; the first is the real one. */
const copies = ref(2);

/** Scroll speed in px per second, independent of list length. */
const SPEED = 45;

const startLoop = () => {
    const [from, to] = props.direction === 'left' ? [0, -50] : [-50, 0];

    return gsap.fromTo(
        track.value,
        { xPercent: from },
        {
            xPercent: to,
            ease: 'none',
            duration: track.value!.offsetWidth / 2 / SPEED,
            repeat: -1,
        },
    );
};

useMotion(root, ({ reduce }, context) => {
    if (reduce || !root.value || !track.value) {
        return;
    }

    // Each half of the track must be at least as wide as the row, or short
    // lists would leave a gap before the loop wraps.
    const single = (track.value.firstElementChild as HTMLElement).offsetWidth;
    copies.value = 2 * Math.max(1, Math.ceil(root.value.offsetWidth / single));

    let loop: gsap.core.Tween | undefined;
    let cancelled = false;

    nextTick(() => {
        if (!cancelled) {
            context.add(() => {
                loop = startLoop();
            });
        }
    });

    const ease = (timeScale: number) => {
        if (loop) {
            gsap.to(loop, { timeScale, duration: 0.4, overwrite: true });
        }
    };
    const pause = () => ease(0);
    const resume = () => ease(1);

    const el = root.value;
    el.addEventListener('pointerenter', pause);
    el.addEventListener('pointerleave', resume);
    el.addEventListener('focusin', pause);
    el.addEventListener('focusout', resume);

    return () => {
        cancelled = true;
        copies.value = 2;
        el.removeEventListener('pointerenter', pause);
        el.removeEventListener('pointerleave', resume);
        el.removeEventListener('focusin', pause);
        el.removeEventListener('focusout', resume);
    };
});
</script>

<template>
    <div
        ref="root"
        role="region"
        :aria-label="label"
        tabindex="0"
        class="overflow-hidden rounded-2xl [mask-image:linear-gradient(to_right,transparent,var(--foreground)_8%,var(--foreground)_92%,transparent)] py-2 focus-ring motion-reduce:[mask-image:none]"
    >
        <div
            ref="track"
            class="flex w-max motion-reduce:block motion-reduce:w-auto"
        >
            <ul
                v-for="copy in copies"
                :key="copy"
                class="flex shrink-0 gap-3 pr-3 md:gap-4 md:pr-4"
                :class="
                    copy > 1
                        ? 'motion-reduce:hidden'
                        : 'motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:pr-0'
                "
                :aria-hidden="copy > 1 ? 'true' : undefined"
            >
                <li
                    v-for="skill in items"
                    :key="skill.id"
                    :class="
                        variant === 'tile'
                            ? 'group flex w-28 shrink-0 flex-col items-center gap-3 rounded-2xl surface-tile px-2 py-5 text-center transition-transform duration-200 ease-out-expo hover:-translate-y-1 sm:w-32'
                            : 'shrink-0 rounded-2xl surface-tile px-4 py-2 text-sm font-semibold whitespace-nowrap text-foreground transition-colors duration-200 hover:text-primary-strong sm:px-5 sm:py-2.5'
                    "
                >
                    <template v-if="variant === 'tile'">
                        <span
                            class="grid size-14 place-items-center rounded-xl bg-primary/5 p-2.5 ring-1 ring-primary/10 transition-transform duration-200 ease-out-expo group-hover:scale-110 sm:size-16"
                        >
                            <img
                                v-if="storageUrl(skill.icon)"
                                :src="storageUrl(skill.icon)!"
                                alt=""
                                loading="lazy"
                                class="size-full object-contain"
                            />
                            <Blocks
                                v-else
                                class="size-6 text-muted-foreground"
                                aria-hidden="true"
                            />
                        </span>
                        <span
                            class="text-xs leading-tight font-semibold text-foreground sm:text-sm"
                        >
                            {{ skill.name }}
                        </span>
                    </template>
                    <template v-else>{{ skill.name }}</template>
                </li>
            </ul>
        </div>
    </div>
</template>
