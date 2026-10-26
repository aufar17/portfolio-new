<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import { toRef } from 'vue';
import AchievementCard from '@/components/site/AchievementCard.vue';
import ListingShell from '@/components/site/ListingShell.vue';
import { useListing } from '@/composables/useListing';
import LandingPageLayout from '@/layouts/LandingPageLayout.vue';
import { landingPage } from '@/routes';

const props = withDefaults(
    defineProps<{
        achievements?: any[];
    }>(),
    {
        achievements: () => [],
    },
);

const typeLabel = (type: boolean) => (type ? 'certification' : 'awards');

const { search, page, filtered, totalPages, paginated } = useListing(
    toRef(props, 'achievements'),
    (a) => [
        a.title,
        ...(Array.isArray(a.issuer) ? a.issuer : [a.issuer]),
        typeLabel(a.type),
    ],
);
</script>

<template>
    <Head title="All Achievements" />

    <LandingPageLayout>
        <ListingShell
            v-model:search="search"
            v-model:page="page"
            title="All Achievements"
            description="Explore all Achievements I've built with passion and precision"
            :back-href="`${landingPage().url}#achievement`"
            search-label="Search achievements"
            search-placeholder="Search achievements, issuer or type"
            :items="paginated"
            :total="filtered.length"
            :total-pages="totalPages"
            empty-text="No achievements found."
        >
            <template #item="{ item }">
                <AchievementCard :item="item" />
            </template>
        </ListingShell>
    </LandingPageLayout>
</template>
