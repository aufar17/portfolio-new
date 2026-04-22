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
            class="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-gradient-to-br from-black via-neutral-900 to-black px-4 text-white"
        >
            <!-- Blur background -->
            <div
                class="bg-primary-500/30 absolute h-56 w-56 rounded-full blur-[100px] sm:h-64 sm:w-64 sm:blur-[110px] md:h-80 md:w-80 md:blur-[120px]"
            ></div>

            <div
                class="absolute h-56 w-56 rounded-full bg-blue-500/20 blur-[110px] sm:h-64 sm:w-64 sm:blur-[120px] md:h-80 md:w-80 md:blur-[140px]"
            ></div>

            <!-- Content -->
            <div class="relative z-10 flex flex-col items-center text-center">
                <!-- Logo -->
                <div
                    class="animate-fade-up relative flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-lg backdrop-blur-xl sm:h-24 sm:w-24 md:h-32 md:w-32"
                >
                    <img
                        :src="logo"
                        alt="logo"
                        class="h-12 w-auto object-contain sm:h-14 md:h-20"
                    />
                </div>

                <!-- Title -->
                <h1
                    class="animate-fade-up mt-4 bg-gradient-to-r from-white to-white/60 bg-clip-text text-xl font-bold tracking-tight text-transparent sm:mt-5 sm:text-2xl md:mt-6 md:text-5xl"
                >
                    Aufar's Portfolio
                </h1>

                <!-- Loading -->
                <div class="mx-auto mt-6 w-32 sm:mt-7 sm:w-40 md:mt-8 md:w-52">
                    <p
                        class="mb-1 text-center text-[10px] tracking-widest text-white/50 sm:mb-2 sm:text-[11px]"
                    >
                        Loading...
                    </p>

                    <div
                        class="relative h-[2px] w-full overflow-hidden rounded-full bg-white/10 sm:h-[3px]"
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
