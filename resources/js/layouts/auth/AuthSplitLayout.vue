<script setup lang="ts">
import { Link, usePage } from '@inertiajs/vue3';
import logo from '@/assets/img/logo.png';

const page = usePage();
const name = page.props.name;

defineProps<{
    title?: string;
    description?: string;
}>();
</script>

<template>
    <div
        class="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0"
    >
        <div
            class="relative hidden h-full items-center justify-center bg-muted lg:flex dark:border-r"
        >
            <div class="absolute inset-0 overflow-hidden bg-zinc-900">
                <div
                    class="absolute top-[-15%] left-[10%] h-[500px] w-[500px] rotate-12 bg-indigo-500/20 blur-3xl"
                ></div>

                <div
                    class="absolute right-[5%] bottom-[-20%] h-[600px] w-[600px] -rotate-12 bg-pink-500/20 blur-3xl"
                ></div>

                <div
                    class="absolute top-[40%] left-[-10%] h-[300px] w-[300px] rotate-45 bg-cyan-400/10 blur-3xl"
                ></div>
            </div>

            <div class="relative z-20 flex flex-col items-center gap-6">
                <div
                    class="flex h-32 w-32 items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-xl backdrop-blur-md"
                >
                    <img :src="logo" alt="logo" class="h-20 w-auto" />
                </div>

                <h2
                    class="text-center text-4xl font-semibold tracking-wide text-primary uppercase"
                >
                    Portfolio
                </h2>
                <h3
                    class="text-xl font-normal tracking-wider text-white uppercase"
                >
                    - Panel Admin -
                </h3>
            </div>
        </div>
        <div class="lg:p-8">
            <div
                class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]"
            >
                <div class="flex flex-col space-y-2 text-center">
                    <h1 class="text-xl font-medium tracking-tight" v-if="title">
                        {{ title }}
                    </h1>
                    <p class="text-sm text-muted-foreground" v-if="description">
                        {{ description }}
                    </p>
                </div>
                <slot />
            </div>
        </div>
    </div>
</template>
