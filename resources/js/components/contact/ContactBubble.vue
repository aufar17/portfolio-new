<script setup lang="ts">
import { MessageCircle } from 'lucide-vue-next';

defineEmits(['open']);
</script>

<template>
    <!-- Entrance on the wrapper so it doesn't clash with the button's pulse animation.
         Clear of the home indicator on phones (MiniBot.vue sits right above). -->
    <div
        class="fixed right-5 bottom-[max(1.25rem,env(safe-area-inset-bottom)_+_0.75rem)] z-40 animate-in duration-500 fade-in-0 zoom-in-75 sm:right-6 sm:bottom-[max(1.5rem,env(safe-area-inset-bottom)_+_0.75rem)]"
    >
        <button
            type="button"
            class="group grid size-14 animate-soft-pulse place-items-center rounded-full bg-primary text-primary-foreground shadow-glow focus-ring transition-[filter] duration-200 ease-out-expo hover:brightness-110"
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
