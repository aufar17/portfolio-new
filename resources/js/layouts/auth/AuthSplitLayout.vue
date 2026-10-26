<script setup lang="ts">
import logo from '@/assets/img/logo.png';
import ThemeToggle from '@/components/site/ThemeToggle.vue';

defineProps<{
    title?: string;
    description?: string;
}>();
</script>

<template>
    <div class="relative grid min-h-dvh lg:grid-cols-2">
        <!-- Brand panel -->
        <div
            class="relative hidden overflow-hidden bg-[hsl(222_30%_8%)] lg:flex lg:items-center lg:justify-center"
        >
            <div class="absolute inset-0" aria-hidden="true">
                <div
                    class="absolute -top-32 -left-24 size-[32rem] rounded-full bg-primary/40 blur-[120px]"
                />
                <div
                    class="absolute -right-24 -bottom-40 size-[36rem] rounded-full bg-brand-red/35 blur-[120px]"
                />
                <div
                    class="absolute inset-0 [background-image:radial-gradient(hsl(0_0%_100%/0.07)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_30%,transparent_80%)] [background-size:24px_24px]"
                />
            </div>

            <div
                class="relative z-10 flex flex-col items-center gap-6 text-center"
            >
                <div
                    class="grid size-32 place-items-center rounded-full border border-white/15 bg-white/10 shadow-2xl backdrop-blur-md"
                >
                    <img :src="logo" alt="" class="h-20 w-auto" />
                </div>

                <div>
                    <p
                        class="text-4xl font-extrabold tracking-tight text-white"
                    >
                        Portfolio
                    </p>
                    <p
                        class="mt-2 text-sm font-semibold tracking-[0.3em] text-white/60 uppercase"
                    >
                        Panel Admin
                    </p>
                </div>
            </div>
        </div>

        <!-- Form -->
        <div
            class="relative flex items-center justify-center px-6 py-12 sm:px-8"
        >
            <div class="absolute top-4 right-4">
                <ThemeToggle />
            </div>

            <div class="flex w-full max-w-sm flex-col gap-8">
                <div class="flex flex-col items-center gap-4 text-center">
                    <img :src="logo" alt="" class="h-12 w-auto lg:hidden" />
                    <div class="space-y-1.5">
                        <h1
                            v-if="title"
                            class="text-2xl font-bold tracking-tight text-foreground"
                        >
                            {{ title }}
                        </h1>
                        <p
                            v-if="description"
                            class="text-sm text-muted-foreground"
                        >
                            {{ description }}
                        </p>
                    </div>
                </div>
                <slot />
            </div>
        </div>
    </div>
</template>
