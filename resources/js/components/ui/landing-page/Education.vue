<script setup>
const workHistory = [
    {
        position: 'Frontend Developer',
        company: 'PT Example A',
        duration: 'Jan 2021 - Dec 2021',
        description:
            'Membuat UI modern dengan Vue dan Tailwind, fokus pada clean design.',
    },
    {
        position: 'Fullstack Developer',
        company: 'PT Example B',
        duration: 'Feb 2022 - Sekarang',
        description:
            'Membangun aplikasi web end-to-end menggunakan Laravel & Vue.',
    },
];
</script>
<template>
    <section
        class="relative rounded-xl border border-black/10 bg-white/20 p-8 shadow-xl backdrop-blur-xl md:p-12 dark:border-white/10 dark:bg-white/5 dark:shadow-none"
    >
        <h2
            class="mb-16 text-center text-3xl font-extrabold tracking-tight text-gray-900 md:text-5xl dark:text-gray-100"
        >
            Education <span class="text-primary">History</span>
        </h2>

        <div
            class="relative mx-auto hidden w-full max-w-7xl p-8 md:block md:p-12"
        >
            <div
                class="absolute top-10 left-1/2 h-[calc(100%-6rem)] w-1 -translate-x-1/2 bg-gray-300 dark:bg-gray-700"
            ></div>

            <div
                v-for="(job, index) in workHistory"
                :key="index"
                class="relative mb-10 grid grid-cols-12 items-center"
            >
                <div class="col-span-5" v-if="index % 2 === 0">
                    <div class="relative flex justify-start pl-8">
                        <div
                            class="group relative w-full rounded-xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-800/30"
                        >
                            <div class="flex items-center justify-between">
                                <h3
                                    class="text-lg font-bold text-gray-900 dark:text-gray-100"
                                >
                                    {{ job.position }}
                                </h3>
                                <span
                                    class="text-sm text-gray-500 dark:text-gray-400"
                                >
                                    {{ job.duration }}
                                </span>
                            </div>

                            <span
                                class="mt-2 inline-block rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400"
                            >
                                {{ job.company }}
                            </span>

                            <p
                                class="mt-4 leading-relaxed text-gray-600 dark:text-gray-300"
                            >
                                {{ job.description }}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="col-span-5" v-else></div>

                <div class="relative z-10 col-span-2 flex justify-center">
                    <div
                        class="h-6 w-6 rounded-full border-2 border-white bg-gradient-to-br from-primary to-secondary shadow-md dark:border-gray-900"
                    ></div>
                </div>

                <div class="col-span-5" v-if="index % 2 !== 0">
                    <div class="relative flex justify-start pl-8">
                        <div
                            class="group relative w-full rounded-xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-800/30"
                        >
                            <div class="flex items-center justify-between">
                                <h3
                                    class="text-lg font-bold text-gray-900 dark:text-gray-100"
                                >
                                    {{ job.position }}
                                </h3>
                                <span
                                    class="text-sm text-gray-500 dark:text-gray-400"
                                >
                                    {{ job.duration }}
                                </span>
                            </div>

                            <span
                                class="mt-2 inline-block rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400"
                            >
                                {{ job.company }}
                            </span>

                            <p
                                class="mt-4 leading-relaxed text-gray-600 dark:text-gray-300"
                            >
                                {{ job.description }}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="col-span-5" v-else></div>
            </div>
        </div>

        <div class="relative block md:hidden">
            <div
                class="absolute top-0 left-6 h-full w-1 bg-gray-300 dark:bg-gray-700"
            ></div>

            <div
                v-for="(job, index) in workHistory"
                :key="index"
                class="relative mb-12 pl-16"
            >
                <div
                    class="absolute top-0 left-4 flex h-full flex-col items-center"
                >
                    <div
                        class="h-6 w-6 rounded-full border-2 border-white bg-gradient-to-br from-primary to-secondary shadow-md dark:border-gray-900"
                    ></div>
                    <div
                        v-if="index !== workHistory.length - 1"
                        class="w-px flex-1 bg-gray-300 dark:bg-gray-700"
                    ></div>
                </div>

                <div class="relative">
                    <div
                        class="group w-full rounded-3xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/30"
                    >
                        <div class="flex items-center justify-between">
                            <h3
                                class="text-lg font-bold text-gray-900 dark:text-gray-100"
                            >
                                {{ job.position }}
                            </h3>
                            <span
                                class="text-sm text-gray-500 dark:text-gray-400"
                            >
                                {{ job.duration }}
                            </span>
                        </div>
                        <span
                            class="mt-2 inline-block rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400"
                        >
                            {{ job.company }}
                        </span>
                        <p
                            class="mt-4 leading-relaxed text-gray-600 dark:text-gray-300"
                        >
                            {{ job.description }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
