<script setup lang="ts">
const { works } = defineProps<{
    works?: any[];
}>();
</script>

<template>
    <section
        class="relative rounded-2xl border border-black/10 bg-white/30 p-6 shadow-xl backdrop-blur-xl md:p-10 dark:border-white/10 dark:bg-white/5"
    >
        <h2
            class="mb-14 text-center text-3xl font-semibold tracking-tight md:text-5xl dark:text-white"
        >
            Work <span class="text-primary">Experience</span>
        </h2>

        <div class="relative mx-auto hidden max-w-5xl md:block">
            <div
                class="absolute top-0 left-1/2 h-full w-[3px] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary/40 via-gray-300 to-primary/40 dark:via-gray-700"
            ></div>

            <div
                v-for="(work, index) in works"
                :key="work.id"
                class="group relative mb-16 flex w-full items-center justify-between"
                :class="index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'"
            >
                <div class="w-[45%]">
                    <div
                        class="relative flex h-full flex-col rounded-2xl border border-white/20 bg-white/70 p-6 shadow-lg backdrop-blur-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-800/40"
                    >
                        <div
                            class="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 transition group-hover:opacity-100"
                        ></div>

                        <div class="flex items-start justify-between gap-3">
                            <div>
                                <h3
                                    class="text-lg font-semibold dark:text-white"
                                >
                                    {{ work.company }}
                                </h3>
                            </div>

                            <span
                                class="shrink-0 rounded-md bg-destructive px-3 py-1 text-xs font-medium text-white dark:bg-chart-5"
                            >
                                {{ work.date_range }}
                            </span>
                        </div>

                        <div class="mt-3 space-y-2">
                            <div class="flex items-center">
                                <div
                                    class="flex items-center gap-2 text-sm text-chart-2 dark:text-chart-3"
                                >
                                    <i class="pi pi-info-circle"></i>
                                    <span class="font-semibold">{{
                                        work.status
                                    }}</span>
                                </div>
                            </div>

                            <div class="flex items-center">
                                <div
                                    class="flex items-center gap-2 text-sm text-primary dark:text-chart-2"
                                >
                                    <i class="pi pi-user"></i>
                                    <span class="font-semibold">{{
                                        work.role
                                    }}</span>
                                </div>
                            </div>
                        </div>
                        <p
                            class="mt-3 text-sm leading-relaxed text-black dark:text-gray-300"
                        >
                            {{ work.desc }}
                        </p>
                    </div>
                </div>

                <div class="relative z-10 flex flex-col items-center">
                    <div
                        class="h-6 w-6 rounded-full border-4 border-white bg-gradient-to-br from-primary to-secondary shadow-md dark:border-gray-900"
                    ></div>

                    <div
                        class="mt-1 h-10 w-[2px] bg-gray-300 opacity-0 transition-all duration-300 group-hover:opacity-100 dark:bg-gray-700"
                    ></div>
                </div>

                <div class="w-[45%]"></div>
            </div>
        </div>

        <div class="relative mt-10 space-y-10 md:hidden">
            <div v-for="(work, index) in works" :key="work.id" class="relative">
                <!-- Timeline dot -->
                <div class="absolute top-6 left-0 flex flex-col items-center">
                    <div
                        class="h-5 w-5 rounded-full border-4 border-white bg-gradient-to-br from-primary to-secondary shadow-md dark:border-gray-900"
                    ></div>
                    <div
                        class="h-full w-[2px] bg-gray-300 dark:bg-gray-700"
                    ></div>
                </div>

                <div class="ml-10">
                    <div
                        class="group relative flex flex-col rounded-2xl border border-white/20 bg-white/70 p-6 shadow-lg backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-800/40"
                    >
                        <div
                            class="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 transition group-hover:opacity-100"
                        ></div>

                        <div class="flex items-start justify-between gap-3">
                            <div>
                                <h3
                                    class="text-lg font-semibold dark:text-white"
                                >
                                    {{ work.company }}
                                </h3>
                            </div>

                            <span
                                class="shrink-0 rounded-md bg-destructive px-3 py-1 text-xs font-medium text-white dark:bg-chart-5"
                            >
                                {{ work.date_range }}
                            </span>
                        </div>

                        <div class="mt-3 space-y-2">
                            <div
                                class="flex items-center gap-2 text-sm text-chart-2 dark:text-chart-3"
                            >
                                <i class="pi pi-info-circle"></i>
                                <span class="font-semibold">
                                    {{ work.status }}
                                </span>
                            </div>

                            <div
                                class="flex items-center gap-2 text-sm text-primary dark:text-chart-2"
                            >
                                <i class="pi pi-user"></i>
                                <span class="font-semibold">
                                    {{ work.role }}
                                </span>
                            </div>
                        </div>

                        <p
                            class="mt-3 text-sm leading-relaxed text-black dark:text-gray-300"
                        >
                            {{ work.desc }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
