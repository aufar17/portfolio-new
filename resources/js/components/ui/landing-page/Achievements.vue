<script setup lang="ts">
import { ref } from 'vue';
import AchievementCard from '@/components/site/AchievementCard.vue';
import CardDeck from '@/components/site/CardDeck.vue';
import CtaLink from '@/components/site/CtaLink.vue';
import DeckPanel from '@/components/site/DeckPanel.vue';
import Reveal from '@/components/site/Reveal.vue';
import SectionHeading from '@/components/site/SectionHeading.vue';
import { allAchievements } from '@/routes';

withDefaults(
    defineProps<{
        achievements?: any[];
    }>(),
    {
        achievements: () => [],
    },
);

// Index of the front card, shared by the deck and its panel.
const activeAchievement = ref(0);
</script>

<template>
    <section id="achievement" class="container-page section-y">
        <SectionHeading
            eyebrow="Recognition"
            title="Achievements"
            description="Awards and Certificates"
        />

        <!-- Mirror of Projects: deck left, panel right from lg; deck first,
             compact controls below it otherwise -->
        <div
            v-if="achievements.length"
            class="grid items-center gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14"
        >
            <CardDeck
                v-model:active="activeAchievement"
                :items="achievements"
                label="Achievements"
                variant="flip"
            >
                <template #card="{ item }">
                    <AchievementCard :item="item" variant="deck" />
                </template>
            </CardDeck>

            <Reveal>
                <DeckPanel
                    v-model:active="activeAchievement"
                    :items="achievements"
                    item-label="achievement"
                    list-label="Achievements"
                >
                    <template #cta>
                        <CtaLink :href="allAchievements().url">
                            See More Achievements
                        </CtaLink>
                    </template>
                </DeckPanel>
            </Reveal>
        </div>
        <Reveal v-else class="flex justify-center">
            <CtaLink :href="allAchievements().url">
                See More Achievements
            </CtaLink>
        </Reveal>
    </section>
</template>
