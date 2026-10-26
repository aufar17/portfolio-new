<script setup lang="ts" generic="T extends { id: number | string }">
import { Link } from '@inertiajs/vue3';
import { ArrowLeft, SearchX } from 'lucide-vue-next';
import { ref, watch } from 'vue';
import { Flip, gsap, prefersReducedMotion } from '@/motion/gsap';
import { scrollToTarget } from '@/motion/lenis';
import { useMotion } from '@/motion/useMotion';
import Pagination from './Pagination.vue';
import SearchInput from './SearchInput.vue';
import SectionHeading from './SectionHeading.vue';

/** Shared layout for the "All projects / achievements" pages. */
const props = defineProps<{
    title: string;
    description: string;
    backHref: string;
    searchLabel: string;
    searchPlaceholder: string;
    items: T[];
    total: number;
    totalPages: number;
    emptyText: string;
}>();

const search = defineModel<string>('search', { required: true });
const page = defineModel<number>('page', { required: true });

const listRef = ref<HTMLElement | null>(null);

const changePage = (value: number) => {
    page.value = value;

    if (listRef.value) {
        scrollToTarget(listRef.value);
    }
};

/* ---------- Re-layout: Flip on search, stagger on page change ---------- */

const listItems = () =>
    [...(listRef.value?.querySelector('ul')?.children ?? [])].filter(
        (el) => !(el as HTMLElement).dataset.leaving,
    ) as HTMLElement[];

let flipState: Flip.FlipState | null = null;
let lastPage = page.value;
let paging = false;

// Before the DOM updates: remember where the current cards are.
watch(
    () => props.items,
    () => {
        paging = page.value !== lastPage;
        lastPage = page.value;
        flipState =
            !paging && !prefersReducedMotion()
                ? Flip.getState(listItems())
                : null;
    },
    { flush: 'pre' },
);

// After: glide survivors to their new slots, fade new ones in.
watch(
    () => props.items,
    () => {
        const items = listItems();

        if (!items.length || prefersReducedMotion()) {
            flipState = null;

            return;
        }

        if (flipState) {
            Flip.from(flipState, {
                targets: items,
                duration: 0.6,
                onEnter: (entering) =>
                    gsap.fromTo(
                        entering,
                        { opacity: 0, scale: 0.96 },
                        { opacity: 1, scale: 1, duration: 0.5, stagger: 0.04 },
                    ),
            });
        } else {
            gsap.fromTo(
                items,
                { opacity: 0, y: 16 },
                { opacity: 1, y: 0, duration: 0.6, stagger: 0.05 },
            );
        }

        flipState = null;
    },
    { flush: 'post' },
);

/** Cards dropping out of a search lift out of the grid and fade away. */
const onLeave = (el: Element, done: () => void) => {
    const node = el as HTMLElement;

    if (paging || prefersReducedMotion()) {
        done();

        return;
    }

    const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = node;

    node.dataset.leaving = 'true';
    gsap.set(node, {
        position: 'absolute',
        left: offsetLeft,
        top: offsetTop,
        width: offsetWidth,
        height: offsetHeight,
    });
    gsap.to(node, {
        opacity: 0,
        scale: 0.94,
        duration: 0.25,
        onComplete: done,
    });
};

useMotion(listRef, ({ reduce }) => {
    if (reduce) {
        return;
    }

    gsap.from(listItems(), {
        opacity: 0,
        y: 16,
        duration: 0.6,
        stagger: 0.05,
        delay: 0.2,
    });
});
</script>

<template>
    <section class="container-page pt-32 pb-20 md:pt-40">
        <Link
            :href="backHref"
            view-transition
            class="group mb-8 inline-flex items-center gap-2 rounded-full text-sm font-semibold text-muted-foreground focus-ring transition-colors hover:text-foreground"
        >
            <ArrowLeft
                class="size-4 transition-transform duration-300 group-hover:-translate-x-1"
                aria-hidden="true"
            />
            Back to home
        </Link>

        <SectionHeading as="h1" :title="title" :description="description" />

        <div class="mx-auto max-w-2xl">
            <SearchInput
                v-model="search"
                :label="searchLabel"
                :placeholder="searchPlaceholder"
            />
            <p class="sr-only" aria-live="polite">
                {{ total }} result{{ total === 1 ? '' : 's' }}
            </p>
        </div>

        <div ref="listRef" class="scroll-mt-28 pt-12">
            <TransitionGroup
                v-if="items.length"
                tag="ul"
                :css="false"
                class="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                @leave="onLeave"
            >
                <li v-for="item in items" :key="item.id">
                    <slot name="item" :item="item" />
                </li>
            </TransitionGroup>

            <div
                v-else
                class="mx-auto flex max-w-md flex-col items-center gap-3 rounded-xl surface-glass px-6 py-14 text-center"
            >
                <span
                    class="grid size-14 place-items-center rounded-lg bg-primary/10 text-primary-strong"
                >
                    <SearchX class="size-6" aria-hidden="true" />
                </span>
                <p class="font-semibold text-foreground">{{ emptyText }}</p>
                <button
                    v-if="search"
                    type="button"
                    class="rounded-full text-sm font-semibold text-primary-strong focus-ring hover:underline"
                    @click="search = ''"
                >
                    Clear search
                </button>
            </div>

            <Pagination
                :page="page"
                :total-pages="totalPages"
                @change="changePage"
            />
        </div>
    </section>
</template>
