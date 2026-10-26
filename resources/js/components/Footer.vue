<script setup lang="ts">
import { Link, usePage } from '@inertiajs/vue3';
import { computed } from 'vue';

const year = new Date().getFullYear();

const page = usePage();
const isLandingPage = computed(() => page.url.split(/[?#]/)[0] === '/');
const items = [
    { label: 'Home', link: 'home' },
    { label: 'About', link: 'about' },
    { label: 'Project', link: 'project' },
    { label: 'Achievement', link: 'achievement' },
];

withDefaults(
    defineProps<{
        lastRole?: string;
    }>(),
    {
        lastRole: '',
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
                class="absolute right-1/4 bottom-0 h-32 w-32 rounded-full bg-brand-red/20 blur-3xl sm:h-36 sm:w-36 md:h-40 md:w-40"
            ></div>
        </div>

        <div class="relative w-full px-4 pt-8 pb-24 sm:pt-10 md:pb-10 lg:px-12">
            <div class="hidden items-center justify-between md:flex">
                <div class="text-left">
                    <p class="text-lg font-semibold text-foreground">
                        Muammar Aufar Prasetya
                    </p>
                    <p v-if="lastRole" class="text-sm text-muted-foreground">
                        {{ lastRole }}
                    </p>
                </div>

                <nav
                    aria-label="Footer"
                    class="md:absolute md:left-1/2 md:-translate-x-1/2"
                >
                    <ul
                        class="flex flex-wrap justify-center gap-6 text-sm font-medium"
                    >
                        <li v-for="item in items" :key="item.label">
                            <component
                                :is="isLandingPage ? 'a' : Link"
                                :href="
                                    isLandingPage
                                        ? `#${item.link}`
                                        : `/#${item.link}`
                                "
                                class="block rounded-full border border-black/10 px-4 py-2 text-muted-foreground focus-ring transition hover:bg-black/10 hover:text-foreground dark:border-white/10 dark:hover:bg-white/10"
                            >
                                {{ item.label }}
                            </component>
                        </li>
                    </ul>
                </nav>

                <div class="flex items-center gap-3">
                    <span
                        class="rounded-full border border-black/10 bg-black/5 px-3 py-1 text-xs text-foreground backdrop-blur dark:border-white/10 dark:bg-white/5"
                    >
                        v2.0
                    </span>
                </div>
            </div>

            <p
                class="mt-4 text-center text-[10px] text-muted-foreground sm:text-xs md:mt-8"
            >
                © {{ year }} Muammar Aufar. All rights reserved.
            </p>
        </div>
    </footer>
</template>
