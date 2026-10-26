<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import { toRef } from 'vue';
import ListingShell from '@/components/site/ListingShell.vue';
import ProjectCard from '@/components/site/ProjectCard.vue';
import { useListing } from '@/composables/useListing';
import LandingPageLayout from '@/layouts/LandingPageLayout.vue';
import { landingPage } from '@/routes';

const props = withDefaults(
    defineProps<{
        projects?: any[];
    }>(),
    {
        projects: () => [],
    },
);

const { search, page, filtered, totalPages, paginated } = useListing(
    toRef(props, 'projects'),
    (p) => [
        p.title,
        p.associate,
        ...(Array.isArray(p.tech) ? p.tech : [p.tech]),
    ],
);
</script>

<template>
    <Head title="All Projects" />

    <LandingPageLayout>
        <ListingShell
            v-model:search="search"
            v-model:page="page"
            title="All Projects"
            description="Explore all projects I've built with passion and precision"
            :back-href="`${landingPage().url}#project`"
            search-label="Search projects"
            search-placeholder="Search project, tech stack, or associate"
            :items="paginated"
            :total="filtered.length"
            :total-pages="totalPages"
            empty-text="No projects found."
        >
            <template #item="{ item }">
                <ProjectCard :project="item" />
            </template>
        </ListingShell>
    </LandingPageLayout>
</template>
