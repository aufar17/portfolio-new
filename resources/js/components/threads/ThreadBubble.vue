<script setup lang="ts">
import { MessageCircleMore } from 'lucide-vue-next';
</script>

<template>
    <button
        @click="$emit('open')"
        class="group fixed right-6 bottom-6 z-50 flex h-15 w-15 items-center justify-center rounded-full bg-gradient-to-br from-black to-gray-800 text-white shadow-lg shadow-black/30 transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-black/40 active:scale-95 dark:from-white dark:to-gray-200 dark:text-black dark:shadow-white/20"
    >
        <MessageCircleMore
            class="relative h-9 w-9 transition-transform duration-300 group-hover:rotate-12"
        />
    </button>
</template>
