<script setup lang="ts">
import { MessageCircle } from 'lucide-vue-next';

defineEmits(['open']);
</script>

<template>
    <!-- Entrance on the wrapper so it doesn't clash with the button's pulse animation -->
    <div
        class="fixed right-5 bottom-5 z-40 animate-in duration-500 fade-in-0 zoom-in-75 sm:right-6 sm:bottom-6"
    >
        <button
            type="button"
            class="group grid size-14 animate-soft-pulse place-items-center rounded-full bg-primary text-primary-foreground shadow-glow focus-ring transition-[scale,filter] duration-200 ease-out-expo hover:scale-[1.08] hover:brightness-110 active:scale-[0.94]"
            aria-label="Open contact links"
            aria-haspopup="dialog"
            @click="$emit('open')"
        >
            <MessageCircle
                class="size-6 transition-transform duration-300 group-hover:-rotate-12"
                aria-hidden="true"
            />
        </button>
    </div>
</template>
