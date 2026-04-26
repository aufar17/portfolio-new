<script setup lang="ts">
import { achievementDetail } from '@/actions/App/Http/Controllers/LandingPageController';
import { allAchievements } from '@/routes';
import { Link } from '@inertiajs/vue3';
import { Award, Building2, CalendarDays, FileBadge } from 'lucide-vue-next';

const props = defineProps<{
    achievements?: any[];
}>();
const getPhoto = (path: string) =>
    path ? `/storage/${path}` : '/images/default-skill.png';
</script>

<template>
    <section
        id="achievement"
        class="relative mx-auto max-w-7xl px-4 py-28 sm:px-6"
    >
        <div
            class="pointer-events-none absolute inset-0 -z-10 opacity-30 blur-3xl"
        >
            <div
                class="absolute top-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/30"
            ></div>
        </div>

        <div class="mb-20 text-center">
            <h2
                class="text-3xl font-extrabold tracking-tight text-gray-900 md:text-5xl dark:text-gray-100"
            >
                Achievements
            </h2>
            <p
                class="md:text-md mt-3 text-sm text-gray-500 lg:text-lg dark:text-gray-400"
            >
                Awards and Certificates
            </p>
        </div>

        <div class="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Link
                :href="achievementDetail(item.slug).url"
                v-for="item in achievements"
                :key="item.id"
                class="group relative overflow-hidden rounded-xl border border-black/10 bg-white/70 shadow-sm backdrop-blur-xl transition-all duration-500 hover:shadow-2xl dark:border-white/10 dark:bg-white/5"
            >
                <div class="relative h-52 overflow-hidden">
                    <div class="h-full w-full overflow-hidden">
                        <img
                            v-if="item.photo"
                            :src="getPhoto(item.photo)"
                            :alt="item.title"
                            class="h-full w-full object-cover transition duration-700 ease-in-out group-hover:scale-110"
                        />

                        <div
                            v-else
                            class="flex h-full w-full items-center justify-center bg-gray-200 py-10 dark:bg-gray-800"
                        >
                            <Award
                                v-if="!item.type"
                                class="h-30 w-30 text-gray-500"
                            />

                            <FileBadge v-else class="h-30 w-30 text-gray-500" />
                        </div>
                    </div>

                    <div
                        class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"
                    ></div>

                    <span
                        class="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-black backdrop-blur dark:bg-black/60 dark:text-white"
                    >
                        {{ item.type ? 'Certification' : 'Awards' }}
                    </span>
                </div>

                <div class="flex flex-col gap-3 p-6">
                    <h3
                        class="text-lg leading-snug font-semibold tracking-tight text-gray-900 dark:text-white"
                    >
                        {{ item.title }}
                    </h3>

                    <span
                        class="inline-flex items-center gap-2 text-xs font-semibold text-chart-1 dark:text-chart-1"
                    >
                        <Building2 class="h-4 w-4" />
                        {{ item.issuer }}
                    </span>

                    <span
                        class="inline-flex items-center gap-2 text-xs font-medium text-chart-2 dark:text-chart-2"
                    >
                        <CalendarDays class="h-4 w-4" />
                        {{ item.date_format }}
                    </span>

                    <p
                        class="line-clamp-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300"
                    >
                        {{ item.description }}
                    </p>
                </div>
                <div
                    class="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100"
                >
                    <div
                        class="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent"
                    ></div>
                </div>
            </Link>
        </div>
        <div class="mt-10 flex items-center justify-center">
            <Link
                :href="allAchievements().url"
                class="group inline-flex items-center gap-2 rounded-full border border-black/10 bg-primary/10 px-6 py-2 text-sm font-medium text-black backdrop-blur transition-all duration-300 hover:bg-primary hover:text-white dark:border-white/10 dark:text-white"
            >
                See More Achievements
                <span
                    class="transition-transform duration-300 group-hover:translate-x-2"
                >
                    →
                </span>
            </Link>
        </div>
    </section>
</template>
