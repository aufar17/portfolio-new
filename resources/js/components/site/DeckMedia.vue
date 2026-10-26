<script setup lang="ts">
import { Link } from '@inertiajs/vue3';
import { ref } from 'vue';
import { shareElement } from '@/motion/transition';

/**
 * Image-only card for `DeckShowcase`. It links to the detail page for
 * pointer users, but stays out of the tab order and the accessibility tree:
 * the panel next to it carries the real link. The image sits in a
 * `[data-parallax]` layer inside the `[data-media]` box (the element shared
 * with the detail hero); `[data-dim]` darkens cards further back.
 */
const props = defineProps<{
    href: string;
    image: string | null;
    alt: string;
    /** `view-transition-name` shared with the detail page's hero image. */
    transitionName: string;
}>();

const media = ref<HTMLElement | null>(null);

const shareMedia = () => shareElement(media.value, props.transitionName);
</script>

<template>
    <!-- Native link/image dragging is off so the stack can drag the card -->
    <Link
        :href="href"
        view-transition
        tabindex="-1"
        aria-hidden="true"
        draggable="false"
        class="relative block aspect-[16/10] overflow-hidden rounded-3xl border border-surface-border bg-muted shadow-elevated"
        @before="shareMedia"
    >
        <div ref="media" data-media class="absolute inset-0 overflow-hidden">
            <div data-parallax class="size-full">
                <img
                    v-if="image"
                    :src="image"
                    :alt="alt"
                    loading="lazy"
                    draggable="false"
                    class="size-full object-cover object-top"
                />
                <div v-else class="grid size-full place-items-center">
                    <slot name="fallback" />
                </div>
            </div>
        </div>
        <div
            data-dim
            class="pointer-events-none absolute inset-0 bg-background opacity-0"
        />
    </Link>
</template>
