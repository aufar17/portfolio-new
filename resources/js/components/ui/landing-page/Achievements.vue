<script setup lang="ts">
import { Link } from '@inertiajs/vue3';
import {
    ArrowUpRight,
    Award,
    Building2,
    CalendarDays,
    FileBadge,
} from 'lucide-vue-next';
import CtaLink from '@/components/site/CtaLink.vue';
import DeckMedia from '@/components/site/DeckMedia.vue';
import DeckShowcase from '@/components/site/DeckShowcase.vue';
import Reveal from '@/components/site/Reveal.vue';
import SectionHeading from '@/components/site/SectionHeading.vue';
import { storageUrl } from '@/lib/utils';
import { mediaTransitionName } from '@/motion/transition';
import { achievementsDetail, allAchievements } from '@/routes';

withDefaults(
    defineProps<{
        achievements?: any[];
    }>(),
    {
        achievements: () => [],
    },
);
</script>

<template>
    <section id="achievement" class="container-page section-y">
        <SectionHeading
            eyebrow="Recognition"
            title="Achievements"
            description="Awards and Certificates"
        />

        <!-- Same showcase as Projects: active item's info left, image stack right from lg -->
        <DeckShowcase
            v-if="achievements.length"
            :items="achievements"
            label="Achievements"
            item-label="achievement"
        >
            <template #info="{ item, shareMedia }">
                <span
                    data-meta
                    class="inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-red/10 px-3 py-1 text-xs font-semibold text-brand-red-strong"
                >
                    <FileBadge
                        v-if="item.type"
                        class="size-3.5"
                        aria-hidden="true"
                    />
                    <Award v-else class="size-3.5" aria-hidden="true" />
                    {{ item.type ? 'Certification' : 'Award' }}
                </span>
                <h3
                    data-lines
                    class="mt-3 text-subheading font-bold text-balance text-foreground lg:text-3xl"
                >
                    {{ item.title }}
                </h3>
                <div
                    v-if="item.issuer || item.date_format"
                    data-meta
                    class="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm font-medium text-muted-foreground"
                >
                    <span
                        v-if="item.issuer"
                        class="inline-flex items-center gap-1.5"
                    >
                        <Building2
                            class="size-3.5 text-brand-red-strong"
                            aria-hidden="true"
                        />
                        {{ item.issuer }}
                    </span>
                    <span
                        v-if="item.date_format"
                        class="inline-flex items-center gap-1.5"
                    >
                        <CalendarDays
                            class="size-3.5 text-primary-strong"
                            aria-hidden="true"
                        />
                        {{ item.date_format }}
                    </span>
                </div>
                <p
                    data-lines
                    class="mt-4 leading-relaxed text-pretty text-muted-foreground"
                >
                    {{ item.description }}
                </p>
                <div data-meta class="mt-6">
                    <Link
                        :href="achievementsDetail(item.slug).url"
                        view-transition
                        class="group inline-flex items-center gap-2 rounded-full text-sm font-semibold text-foreground focus-ring"
                        @before="
                            shareMedia(
                                mediaTransitionName('achievement', item.id),
                            )
                        "
                    >
                        View achievement
                        <span class="sr-only">{{ item.title }}</span>
                        <span
                            class="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground transition-transform duration-200 ease-out-expo group-hover:rotate-45"
                            aria-hidden="true"
                        >
                            <ArrowUpRight class="size-4" />
                        </span>
                    </Link>
                </div>
            </template>

            <template #media="{ item }">
                <DeckMedia
                    :href="achievementsDetail(item.slug).url"
                    :image="storageUrl(item.photo)"
                    :alt="item.title"
                    :transition-name="mediaTransitionName('achievement', item.id)"
                >
                    <template #fallback>
                        <FileBadge
                            v-if="item.type"
                            class="size-16 text-muted-foreground/60"
                            aria-hidden="true"
                        />
                        <Award
                            v-else
                            class="size-16 text-muted-foreground/60"
                            aria-hidden="true"
                        />
                    </template>
                </DeckMedia>
            </template>

            <template #cta>
                <CtaLink :href="allAchievements().url">
                    See More Achievements
                </CtaLink>
            </template>
        </DeckShowcase>
        <Reveal v-else class="flex justify-center">
            <CtaLink :href="allAchievements().url">
                See More Achievements
            </CtaLink>
        </Reveal>
    </section>
</template>
