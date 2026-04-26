<script setup lang="ts">
import { Link } from '@inertiajs/vue3';
import { Award, FileBadge, Search } from 'lucide-vue-next';
import { ref, computed, watch } from 'vue';
import LandingPageLayout from '@/layouts/LandingPageLayout.vue';
import { achievementsDetail } from '@/routes';

const props = withDefaults(
    defineProps<{
        achievements?: any[];
    }>(),
    {
        achievements: () => [],
    },
);

const search = ref('');
const currentPage = ref(1);
const perPage = 6;

const filteredAchievements = computed(() => {
    return props.achievements.filter((p) => {
        const keyword = search.value.toLowerCase();

        const matchTitle = p.title?.toLowerCase().includes(keyword);

        const matchIssuer = Array.isArray(p.issuer)
            ? p.issuer.some((t: string) => t.toLowerCase().includes(keyword))
            : p.issuer?.toLowerCase().includes(keyword);

        const matchType = typeLabel(p.type).toLowerCase().includes(keyword);
        return matchTitle || matchIssuer || matchType;
    });
});

const totalPages = computed(() =>
    Math.ceil(filteredAchievements.value.length / perPage),
);

const paginatedAchievements = computed(() => {
    const start = (currentPage.value - 1) * perPage;
    const end = start + perPage;
    return filteredAchievements.value.slice(start, end);
});

const pages = computed(() =>
    Array.from({ length: totalPages.value }, (_, i) => i + 1),
);

const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
    }
};

const typeLabel = (type: boolean) => {
    return type ? 'certification' : 'awards';
};

watch(filteredAchievements, () => {
    if (currentPage.value > totalPages.value) {
        currentPage.value = 1;
    }
});

const getPhoto = (path: string) =>
    path ? `/storage/${path}` : '/images/default-skill.png';
</script>

<template>
    <LandingPageLayout>
        <section
            class="mt-10 min-h-screen px-4 py-12 sm:mt-5 sm:px-6 sm:py-16 md:py-20"
        >
            <div class="mx-auto max-w-7xl text-center">
                <h1
                    class="text-2xl font-extrabold text-gray-900 sm:text-3xl md:text-5xl dark:text-white"
                >
                    All Achievements
                </h1>
                <p
                    class="mt-2 text-sm text-gray-500 sm:mt-3 sm:text-base dark:text-gray-400"
                >
                    Explore all Achievements I've built with passion and
                    precision
                </p>
            </div>

            <div class="mx-auto mt-8 max-w-4xl sm:mt-10">
                <div
                    class="flex items-center gap-3 rounded-xl border border-black/10 bg-white px-3 py-2 shadow-sm transition focus-within:ring-2 focus-within:ring-primary/40 sm:gap-4 sm:px-4 dark:border-white/10 dark:bg-white/10"
                >
                    <Search class="h-4 w-4 opacity-80 sm:h-5 sm:w-5" />
                    <input
                        v-model="search"
                        type="text"
                        placeholder="Search achievements, issuer or type"
                        class="w-full bg-transparent text-xs text-gray-800 outline-none sm:text-sm dark:text-white"
                    />
                </div>
            </div>

            <div
                class="mx-auto mt-10 grid max-w-7xl gap-5 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-2"
            >
                <Link
                    v-for="(item, i) in paginatedAchievements"
                    :key="item.id"
                    :href="achievementsDetail(item.slug).url"
                    class="group relative overflow-hidden rounded-2xl border border-black/10 bg-white/70 shadow-sm backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl dark:border-white/10 dark:bg-white/5"
                >
                    <div
                        class="relative h-[180px] overflow-hidden sm:h-[220px] md:h-[240px]"
                    >
                        <div class="h-full w-full overflow-hidden">
                            <img
                                v-if="item.photo"
                                :src="getPhoto(item.photo)"
                                :alt="item.title"
                                class="h-full w-full object-cover transition duration-700 ease-in-out group-hover:scale-110"
                            />

                            <div
                                v-else
                                class="flex h-full w-full items-center justify-center bg-gray-200 dark:bg-gray-800"
                            >
                                <Award
                                    v-if="!item.type"
                                    class="h-14 w-14 text-gray-500 sm:h-20 sm:w-20 md:h-24 md:w-24"
                                />
                                <FileBadge
                                    v-else
                                    class="h-14 w-14 text-gray-500 sm:h-20 sm:w-20 md:h-24 md:w-24"
                                />
                            </div>
                        </div>

                        <div
                            class="absolute inset-0 bg-black/10 opacity-0 transition duration-500 group-hover:opacity-100"
                        ></div>

                        <div
                            class="absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 group-hover:opacity-100"
                        >
                            <span
                                class="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-md transition hover:scale-105 sm:px-5 sm:py-2 sm:text-sm"
                            >
                                View Detail →
                            </span>
                        </div>
                    </div>

                    <div class="flex flex-col gap-2 p-4 sm:gap-3 sm:p-5">
                        <h3
                            class="text-base font-semibold tracking-tight text-gray-900 sm:text-lg dark:text-white"
                        >
                            {{ item.title }}
                        </h3>

                        <p
                            class="line-clamp-2 text-xs leading-relaxed text-gray-600 sm:text-sm dark:text-gray-300"
                        >
                            {{ item.description }}
                        </p>

                        <div
                            class="mt-2 flex items-center justify-between gap-2"
                        >
                            <span
                                class="rounded-full border border-black/10 bg-black/5 px-2 py-1 text-[10px] font-medium text-gray-700 sm:px-3 sm:text-[11px] dark:border-white/10 dark:bg-white/10 dark:text-gray-300"
                            >
                                {{ item.issuer }}
                            </span>
                            <span
                                class="rounded-full bg-primary px-2 py-1 text-[10px] font-semibold text-white uppercase shadow-sm sm:px-3 sm:text-[11px]"
                            >
                                {{ item.type ? 'Certification' : 'Award' }}
                            </span>
                        </div>
                    </div>
                </Link>
            </div>

            <div
                v-if="filteredAchievements.length === 0"
                class="mt-16 text-center text-sm text-gray-500 sm:mt-20 sm:text-base dark:text-gray-400"
            >
                No projects found.
            </div>

            <div
                v-if="filteredAchievements.length > perPage"
                class="mt-10 flex flex-wrap items-center justify-center gap-2 sm:mt-12"
            >
                <button
                    class="rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs transition-all hover:-translate-y-0.5 disabled:opacity-40 sm:px-4 sm:py-2 sm:text-sm dark:border-white/10 dark:bg-white/10 dark:text-white"
                    :disabled="currentPage === 1"
                    @click="goToPage(currentPage - 1)"
                >
                    ← Previous
                </button>

                <button
                    v-for="page in pages"
                    :key="page"
                    @click="goToPage(page)"
                    class="min-w-[32px] rounded-xl border px-2 py-1.5 text-xs transition-all hover:-translate-y-0.5 sm:min-w-[38px] sm:px-3 sm:py-2 sm:text-sm"
                    :class="
                        currentPage === page
                            ? 'border-black bg-black text-white dark:bg-white dark:text-black'
                            : 'border-black/10 bg-white text-gray-600 dark:border-white/10 dark:bg-white/10 dark:text-white'
                    "
                >
                    {{ page }}
                </button>

                <button
                    class="rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs transition-all hover:-translate-y-0.5 disabled:opacity-40 sm:px-4 sm:py-2 sm:text-sm dark:border-white/10 dark:bg-white/10 dark:text-white"
                    :disabled="currentPage === totalPages"
                    @click="goToPage(currentPage + 1)"
                >
                    Next →
                </button>
            </div>
        </section>
    </LandingPageLayout>
</template>
