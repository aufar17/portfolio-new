<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import { Award, FileBadge } from 'lucide-vue-next';
import DetailLayout from '@/components/site/DetailLayout.vue';
import InfoCard from '@/components/site/InfoCard.vue';
import LandingPageLayout from '@/layouts/LandingPageLayout.vue';
import { storageUrl } from '@/lib/utils';
import { mediaTransitionName } from '@/motion/transition';
import { allAchievements } from '@/routes';

const props = defineProps<{
    achievement: any;
}>();
</script>

<template>
    <Head :title="props.achievement.title" />

    <LandingPageLayout>
        <DetailLayout
            eyebrow="Achievement Detail"
            :title="achievement.title"
            :image="storageUrl(achievement.photo)"
            :fallback-icon="achievement.type ? FileBadge : Award"
            :back-href="allAchievements().url"
            :transition-name="
                mediaTransitionName('achievement', achievement.id)
            "
            back-label="All achievements"
        >
            <template #sidebar>
                <InfoCard
                    :items="[
                        {
                            label: 'Type',
                            value: achievement.type ? 'Certification' : 'Award',
                        },
                        { label: 'Year', value: achievement.date_format },
                        { label: 'Issuer', value: achievement.issuer },
                    ]"
                />
            </template>

            <template #overview>
                <p>{{ achievement.description }}</p>
            </template>
        </DetailLayout>
    </LandingPageLayout>
</template>
