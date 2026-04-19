<script setup lang="ts">
import { ref, onMounted } from 'vue';
import logo from '@/assets/img/logo.png';

const hasShown = sessionStorage.getItem('splash-shown');
const isVisible = ref(!hasShown);

const progress = ref(0);
const emit = defineEmits(['done']);

onMounted(() => {
    if (!hasShown) {
        const interval = setInterval(() => {
            progress.value += 3;

            if (progress.value >= 100) {
                clearInterval(interval);

                setTimeout(() => {
                    isVisible.value = false;
                    sessionStorage.setItem('splash-shown', 'true');
                    emit('done');
                }, 300);
            }
        }, 40);
    }
});
</script>
<style scoped>
@keyframes loadingBar {
    0% {
        transform: translateX(-100%);
    }
    100% {
        transform: translateX(200%);
    }
}

.animate-loading-bar {
    animation: loadingBar 1.2s ease-in-out infinite;
}
</style>
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
                    Aufar's Portfolio
                </h1>
                <div class="mx-auto mt-8 w-40 md:w-52">
                    <p
                        class="mb-2 text-center text-[11px] tracking-widest text-white/50"
                    >
                        Loading...
                    </p>

                    <div
                        class="relative h-[3px] w-full overflow-hidden rounded-full bg-white/10"
                    >
                        <div
                            class="animate-loading-bar h-full w-1/2 rounded-full bg-white"
                        ></div>

                        <div
                            class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-40 blur-sm"
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>
