<script setup lang="ts">
import { ref } from 'vue';
import { gsap, ScrollTrigger } from '@/motion/gsap';
import { useMotion } from '@/motion/useMotion';
import type { TimelineEntry } from './types';

defineProps<{
    items: TimelineEntry[];
    emptyText?: string;
}>();

/** Zigzag on md+: even entries sit left of the rail, odd entries right. */
const isLeft = (index: number) => index % 2 === 0;

const list = ref<HTMLElement | null>(null);

useMotion(list, ({ reduce, desktop }, context) => {
    if (reduce || !list.value) {
        return;
    }

    // The primary rail draws itself along the faint one as you scroll.
    gsap.fromTo(
        '[data-rail]',
        { scaleY: 0 },
        {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
                trigger: list.value,
                start: 'top 70%',
                end: 'bottom 70%',
                scrub: true,
            },
        },
    );

    const entries = gsap.utils.toArray<HTMLElement>('[data-entry]');

    entries.forEach((entry) => {
        const side = entry.dataset.side === 'left' ? -1 : 1;

        gsap.set(entry.querySelectorAll('[data-card]'), {
            opacity: 0,
            x: desktop ? side * 32 : 0,
            y: desktop ? 0 : 16,
        });
        gsap.set(entry.querySelectorAll('[data-dot]'), { scale: 0 });
        gsap.set(entry.querySelectorAll('[data-date]'), { opacity: 0 });
    });

    ScrollTrigger.batch(entries, {
        start: 'top 85%',
        once: true,
        onEnter: (batch) =>
            context.add(() =>
                batch.forEach((entry, i) =>
                    gsap
                        .timeline({ delay: i * 0.08 })
                        .to(entry.querySelectorAll('[data-dot]'), {
                            scale: 1,
                            duration: 0.5,
                        })
                        .to(
                            entry.querySelectorAll('[data-card]'),
                            { opacity: 1, x: 0, y: 0 },
                            0.05,
                        )
                        .to(
                            entry.querySelectorAll('[data-date]'),
                            { opacity: 1, duration: 0.6 },
                            0.2,
                        ),
                ),
            ),
    });
});
</script>

<template>
    <ol v-if="items.length" ref="list" class="relative">
        <!-- Rail: faint track plus the primary line drawn on scroll -->
        <span
            class="absolute top-2 bottom-2 left-[7px] w-px bg-gradient-to-b from-primary/70 via-brand-red/40 to-transparent md:left-1/2 md:-translate-x-1/2"
            aria-hidden="true"
        />
        <span
            data-rail
            class="absolute top-2 bottom-2 left-[7.5px] w-[2px] origin-top -translate-x-1/2 rounded-full bg-primary md:left-1/2"
            aria-hidden="true"
        />

        <li
            v-for="(item, index) in items"
            :key="item.id"
            data-entry
            :data-side="isLeft(index) ? 'left' : 'right'"
            class="relative grid gap-3 pb-10 pl-8 last:pb-0 md:grid-cols-[1fr_4rem_1fr] md:gap-0 md:pb-14 md:pl-0"
        >
            <!-- Dot + connector -->
            <div
                class="absolute top-1.5 left-0 md:relative md:top-auto md:left-auto md:col-start-2 md:row-start-1 md:mt-7 md:flex md:justify-center"
                aria-hidden="true"
            >
                <span
                    class="hidden h-px w-1/2 bg-border md:absolute md:top-[7px] md:block"
                    :class="isLeft(index) ? 'md:left-0' : 'md:right-0'"
                />
                <span
                    data-dot
                    class="relative grid size-[15px] place-items-center rounded-full border-2 bg-background"
                    :class="
                        isLeft(index) ? 'border-primary' : 'border-brand-red'
                    "
                >
                    <span
                        class="size-1.5 rounded-full"
                        :class="isLeft(index) ? 'bg-primary' : 'bg-brand-red'"
                    />
                </span>
            </div>

            <!-- Date (opposite side of the card on md+) -->
            <div
                v-if="item.date"
                data-date
                class="md:row-start-1 md:mt-[1.4rem]"
                :class="
                    isLeft(index)
                        ? 'md:col-start-3 md:justify-self-start'
                        : 'md:col-start-1 md:justify-self-end'
                "
            >
                <span
                    class="inline-flex items-center rounded-full bg-brand-red/10 px-3 py-1 text-xs font-semibold text-brand-red-strong sm:text-sm"
                >
                    {{ item.date }}
                </span>
            </div>

            <!-- Card -->
            <article
                data-card
                class="group rounded-2xl surface-glass p-5 transition-shadow duration-300 hover:shadow-elevated sm:p-6 md:row-start-1"
                :class="isLeft(index) ? 'md:col-start-1' : 'md:col-start-3'"
            >
                <h3 class="text-lg font-semibold text-foreground">
                    {{ item.title }}
                </h3>

                <ul
                    v-if="item.meta.length"
                    class="mt-3 flex flex-wrap gap-x-4 gap-y-2"
                >
                    <li
                        v-for="meta in item.meta.filter((m) => m.label)"
                        :key="meta.label"
                        class="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground"
                    >
                        <component
                            :is="meta.icon"
                            class="size-4 text-primary-strong"
                            aria-hidden="true"
                        />
                        {{ meta.label }}
                    </li>
                </ul>

                <p
                    v-if="item.body"
                    class="mt-4 text-sm leading-relaxed text-pretty text-muted-foreground sm:text-[0.9375rem]"
                >
                    {{ item.body }}
                </p>
            </article>
        </li>
    </ol>

    <p v-else class="py-10 text-center text-sm text-muted-foreground">
        {{ emptyText ?? 'No data yet.' }}
    </p>
</template>
