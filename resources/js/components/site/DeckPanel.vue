<script
    setup
    lang="ts"
    generic="T extends { id: number | string; title: string }"
>
import { ArrowLeft, ArrowRight } from 'lucide-vue-next';
import { computed, nextTick, ref, watch } from 'vue';
import { prefersReducedMotion } from '@/motion/gsap';

/**
 * Controls for a `CardDeck` sharing the same `v-model:active`: the list of
 * titles (lg and up), a progress bar, previous/next buttons and a CTA slot.
 * Below lg it collapses to a compact row of buttons + progress. Changes are
 * announced politely ("Showing …") for screen readers.
 */
const props = defineProps<{
    items: T[];
    /** Singular noun for button labels, e.g. "project". */
    itemLabel: string;
    listLabel: string;
}>();

const active = defineModel<number>('active', { required: true });

const count = computed(() => props.items.length);
const progress = computed(() =>
    count.value ? (active.value + 1) / count.value : 0,
);

const step = (delta: number) => {
    active.value = (active.value + delta + count.value) % count.value;
};

// Empty until the first change, so nothing is read out on page load.
const announcement = ref('');
const list = ref<HTMLElement | null>(null);

watch(active, async (index) => {
    announcement.value = `Showing ${props.items[index]?.title ?? ''}`;

    // Keep the active title visible inside the (scrollable) list only.
    await nextTick();

    const box = list.value;
    const item = box?.children[index] as HTMLElement | undefined;

    if (!box || !item) {
        return;
    }

    const top = item.offsetTop;
    const bottom = top + item.offsetHeight;

    if (top < box.scrollTop || bottom > box.scrollTop + box.clientHeight) {
        box.scrollTo({
            top: top - box.clientHeight / 2 + item.offsetHeight / 2,
            behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        });
    }
});
</script>

<template>
    <div class="flex flex-col gap-6">
        <ol
            ref="list"
            :aria-label="listLabel"
            data-lenis-prevent
            class="relative hidden max-h-[24rem] flex-col gap-1 overflow-y-auto overscroll-contain lg:flex"
        >
            <li v-for="(item, i) in items" :key="item.id">
                <button
                    type="button"
                    class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold focus-ring transition-colors duration-200 sm:text-base"
                    :class="
                        i === active
                            ? 'bg-primary/10 text-primary-strong'
                            : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                    "
                    :aria-current="i === active ? 'true' : undefined"
                    @click="active = i"
                >
                    <span
                        class="h-0.5 shrink-0 rounded-full bg-current transition-[width] duration-300 ease-out-expo motion-reduce:transition-none"
                        :class="i === active ? 'w-6' : 'w-3'"
                        aria-hidden="true"
                    />
                    <span class="line-clamp-1">{{ item.title }}</span>
                </button>
            </li>
        </ol>

        <div v-if="count > 1" class="flex items-center gap-3">
            <button
                type="button"
                class="grid size-11 shrink-0 place-items-center rounded-full surface-glass text-foreground focus-ring transition-colors duration-200 hover:text-primary-strong"
                :aria-label="`Previous ${itemLabel}`"
                @click="step(-1)"
            >
                <ArrowLeft class="size-4" aria-hidden="true" />
            </button>
            <div
                class="relative h-1 flex-1 overflow-hidden rounded-full bg-muted"
                aria-hidden="true"
            >
                <span
                    class="absolute inset-0 origin-left rounded-full bg-primary transition-transform duration-500 ease-out-expo motion-reduce:transition-none"
                    :style="{ transform: `scaleX(${progress})` }"
                />
            </div>
            <button
                type="button"
                class="grid size-11 shrink-0 place-items-center rounded-full surface-glass text-foreground focus-ring transition-colors duration-200 hover:text-primary-strong"
                :aria-label="`Next ${itemLabel}`"
                @click="step(1)"
            >
                <ArrowRight class="size-4" aria-hidden="true" />
            </button>
        </div>

        <div class="flex justify-center lg:justify-start">
            <slot name="cta" />
        </div>

        <p class="sr-only" aria-live="polite">{{ announcement }}</p>
    </div>
</template>
