<script setup lang="ts">
import { Contact } from 'lucide-vue-next';
defineEmits(['open']);
</script>

<template>
    <button
        @click="$emit('open')"
        class="group fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-black/10 bg-primary shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:scale-110 hover:shadow-2xl active:scale-95 dark:border-white/10"
    >
        <div
            class="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-transparent opacity-0 blur-xl transition duration-500 group-hover:opacity-100"
        ></div>

        <Contact
            class="relative h-6 w-6 text-white transition-all duration-300 group-hover:rotate-12"
        />

        <span
            class="absolute inset-0 animate-ping rounded-full border border-primary opacity-0 transition group-hover:opacity-100"
        ></span>
    </button>
</template>
