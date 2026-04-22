<script setup lang="ts">
import { Link } from '@inertiajs/vue3';

const year = new Date().getFullYear();

const items = [
    { label: 'Home', link: '#home' },
    { label: 'About', link: '#about' },
    { label: 'Project', link: '#project' },
    { label: 'Contact', link: '#contact' },
];

const props = withDefaults(
    defineProps<{
        lastRole: string;
    }>(),
    {
        lastRole: () => '',
    },
);
</script>

<template>
    <footer
        class="relative mt-16 border-t border-black/10 sm:mt-20 md:mt-24 dark:border-white/10"
    >
        <div class="pointer-events-none absolute inset-0 opacity-30">
            <div
                class="absolute -top-10 left-1/4 h-32 w-32 rounded-full bg-primary/30 blur-3xl sm:h-36 sm:w-36 md:h-40 md:w-40"
            ></div>
            <div
                class="absolute right-1/4 bottom-0 h-32 w-32 rounded-full bg-secondary/30 blur-3xl sm:h-36 sm:w-36 md:h-40 md:w-40"
            ></div>
        </div>

        <div class="relative w-full px-4 py-8 sm:py-10 lg:px-12">
            <div class="hidden items-center justify-between md:flex">
                <div class="text-left">
                    <h3
                        class="text-lg font-semibold text-gray-900 dark:text-white"
                    >
                        Muammar Aufar Prasetya
                    </h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                        {{ lastRole }}
                    </p>
                </div>

                <div class="md:absolute md:left-1/2 md:-translate-x-1/2">
                    <div
                        class="flex flex-wrap justify-center gap-6 text-sm font-medium"
                    >
                        <Link
                            v-for="item in items"
                            :key="item.label"
                            :href="item.link"
                            class="rounded-full border border-black/10 px-4 py-2 text-gray-600 transition hover:bg-black/10 hover:text-black dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
                        >
                            {{ item.label }}
                        </Link>
                    </div>
                </div>

                <div class="flex items-center gap-3">
                    <span
                        class="rounded-full border border-black/10 bg-black/5 px-3 py-1 text-xs text-black backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-white"
                    >
                        v2.0
                    </span>
                </div>
            </div>

            <div
                class="mt-4 text-center text-[10px] text-gray-500 sm:text-xs md:mt-8 dark:text-gray-400"
            >
                © {{ year }} Muammar Aufar. All rights reserved.
            </div>
        </div>
    </footer>
</template>
