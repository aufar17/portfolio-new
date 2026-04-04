<script setup lang="ts">
import { ref, onMounted } from 'vue';
import logo from '@/assets/img/logo.png';

const hasShown = sessionStorage.getItem('splash-shown');
const isVisible = ref(!hasShown);
const emit = defineEmits(['done']);

onMounted(() => {
    if (!hasShown) {
        setTimeout(() => {
            isVisible.value = false;
            sessionStorage.setItem('splash-shown', 'true');
        }, 1500);
    }
});
</script>
<template>
    <transition name="fade">
        <div
            v-if="isVisible"
            class="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-gradient-to-br from-black via-neutral-900 to-black text-white"
        >
            <div
                class="bg-primary-500/30 absolute h-80 w-80 rounded-full blur-[120px]"
            ></div>
            <div
                class="absolute h-80 w-80 rounded-full bg-blue-500/20 blur-[140px]"
            ></div>
            <div class="particles">
                <span
                    v-for="i in 15"
                    :key="i"
                    :style="{
                        '--i': i / 15,
                        animationDelay: `${i * 0.5}s`,
                    }"
                ></span>
            </div>
            <div class="relative z-10 flex flex-col items-center text-center">
                <div
                    class="animate-fade-up relative flex h-28 w-28 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-lg backdrop-blur-xl md:h-32 md:w-32"
                >
                    <img
                        :src="logo"
                        alt="logo"
                        class="h-16 w-auto object-contain md:h-20"
                    />
                </div>
                <h1
                    class="animate-fade-up mt-6 bg-gradient-to-r from-white to-white/60 bg-clip-text text-3xl font-bold tracking-tight text-transparent md:text-5xl"
                >
                    Muammar Aufar Prasetya
                </h1>
                <p
                    class="animate-fade-up mt-3 text-xs text-white/50 delay-200 md:text-sm"
                >
                    Crafting modern web experiences...
                </p>
                <div
                    class="mx-auto mt-8 h-[3px] w-32 overflow-hidden rounded-full bg-white/10 md:w-48"
                >
                    <div class="loading-bar h-full bg-white"></div>
                </div>
            </div>
        </div>
    </transition>
</template>
