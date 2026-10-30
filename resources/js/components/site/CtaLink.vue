<script setup lang="ts">
import { Link } from '@inertiajs/vue3';
import { ArrowRight } from 'lucide-vue-next';

defineProps<{
    href: string;
}>();
</script>

<template>
    <!-- The button stays put on hover: only its colours change and the arrow moves -->
    <Link
        :href="href"
        view-transition
        class="group inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-5 py-2.5 text-sm font-semibold text-primary-strong focus-ring transition-[color,background-color,border-color,box-shadow] duration-300 ease-out-expo hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-glow"
    >
        <slot />
        <ArrowRight
            class="size-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-1"
            aria-hidden="true"
        />
    </Link>
</template>
