<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import { ExternalLink, Github, MonitorCog } from 'lucide-vue-next';
import DetailLayout from '@/components/site/DetailLayout.vue';
import InfoCard from '@/components/site/InfoCard.vue';
import LandingPageLayout from '@/layouts/LandingPageLayout.vue';
import { storageUrl } from '@/lib/utils';
import { mediaTransitionName } from '@/motion/transition';
import { allProjects } from '@/routes';

const props = defineProps<{
    project: any;
}>();
</script>

<template>
    <Head :title="props.project.title" />

    <LandingPageLayout>
        <DetailLayout
            eyebrow="Project Detail"
            :title="project.title"
            :subtitle="project.subtitle"
            :image="storageUrl(project.image)"
            :fallback-icon="MonitorCog"
            :back-href="allProjects().url"
            :transition-name="mediaTransitionName('project', project.id)"
            back-label="All projects"
        >
            <template #sidebar>
                <InfoCard
                    :items="[
                        {
                            label: 'Responsibility',
                            value: project.responsibility,
                        },
                        { label: 'Year', value: project.date_range },
                        { label: 'Associate', value: project.associate },
                    ]"
                />

                <div
                    v-if="project.tech_list?.length"
                    class="rounded-xl surface-glass p-5 sm:p-6"
                >
                    <h2
                        class="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                    >
                        Tech Stack
                    </h2>
                    <ul class="mt-3 flex flex-wrap gap-2">
                        <li
                            v-for="(tech, i) in project.tech_list"
                            :key="i"
                            class="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary-strong"
                        >
                            {{ tech }}
                        </li>
                    </ul>
                </div>

                <a
                    v-if="project.link"
                    :href="project.link"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="group flex h-12 items-center justify-center gap-2 rounded-lg bg-foreground px-5 text-sm font-semibold text-background focus-ring transition-shadow duration-300 ease-out-expo hover:shadow-elevated"
                >
                    <Github class="size-5" aria-hidden="true" />
                    Github
                    <ExternalLink
                        class="size-4 opacity-60 transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                    />
                    <span class="sr-only">(opens in new tab)</span>
                </a>
            </template>

            <template #overview>
                <p>{{ project.description }}</p>
            </template>
        </DetailLayout>
    </LandingPageLayout>
</template>
