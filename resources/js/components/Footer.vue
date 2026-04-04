<script setup lang="ts">
const year = new Date().getFullYear();

const socials = [
    {
        name: 'GitHub',
        url: 'https://github.com/yourusername',
    },
    {
        name: 'LinkedIn',
        url: 'https://linkedin.com/in/yourusername',
    },
];
</script>

<template>
    <footer
        class="relative mt-24 border-t border-black/10 dark:border-white/10"
    >
        <div class="pointer-events-none absolute inset-0 opacity-30">
            <div
                class="absolute -top-10 left-1/4 h-40 w-40 rounded-full bg-primary/30 blur-3xl"
            ></div>
            <div
                class="absolute right-1/4 bottom-0 h-40 w-40 rounded-full bg-secondary/30 blur-3xl"
            ></div>
        </div>

        <div class="relative w-full px-4 py-10 lg:px-12">
            <div
                class="relative flex flex-col items-center gap-6 md:flex-row md:items-center md:justify-between"
            >
                <div class="text-center md:text-left">
                    <h3
                        class="text-lg font-semibold text-gray-900 dark:text-white"
                    >
                        Muammar Aufar Prasetya
                    </h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                        Web & Mobile Developer
                    </p>
                </div>

                <div class="md:absolute md:left-1/2 md:-translate-x-1/2">
                    <div
                        class="flex flex-wrap justify-center gap-6 text-sm font-medium"
                    >
                        <a
                            href="#home"
                            class="text-gray-600 hover:text-primary dark:text-gray-400"
                            >Home</a
                        >
                        <a
                            href="#about"
                            class="text-gray-600 hover:text-primary dark:text-gray-400"
                            >About</a
                        >
                        <a
                            href="#projects"
                            class="text-gray-600 hover:text-primary dark:text-gray-400"
                            >Projects</a
                        >
                        <a
                            href="#contact"
                            class="text-gray-600 hover:text-primary dark:text-gray-400"
                            >Contact</a
                        >
                    </div>
                </div>

                <div class="flex items-center gap-3">
                    <a
                        v-for="item in socials"
                        :key="item.name"
                        :href="item.url"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="group rounded-lg border border-white/10 bg-white/5 p-2 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-white/10"
                    >
                        <span
                            class="text-sm text-gray-700 transition group-hover:text-primary dark:text-gray-300"
                        >
                            {{ item.name }}
                        </span>
                    </a>
                </div>
            </div>

            <div
                class="mt-8 text-center text-xs text-gray-500 dark:text-gray-400"
            >
                © {{ year }} Muammar Aufar. All rights reserved.
            </div>
        </div>
    </footer>
</template>
