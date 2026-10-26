<script setup lang="ts">
import { Link } from '@inertiajs/vue3';
import { ArrowRight } from 'lucide-vue-next';
import { ref } from 'vue';
import { useMagnetic } from '@/motion/useMagnetic';

defineProps<{
    href: string;
}>();

// The pull moves this wrapper, so the link's own colour transitions stay CSS.
const magnet = ref<HTMLElement | null>(null);
useMagnetic(magnet);
</script>

<template>
    <span ref="magnet" class="inline-flex">
        <Link
            :href="href"
            view-transition
            class="group inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-5 py-2.5 text-sm font-semibold text-primary-strong focus-ring transition-all duration-300 ease-out-expo hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-glow"
        >
            <slot />
            <ArrowRight
                class="size-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-1"
                aria-hidden="true"
            />
        </Link>
    </span>
</template>
