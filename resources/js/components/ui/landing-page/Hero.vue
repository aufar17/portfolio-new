<script setup lang="ts">
import { ArrowRight, ChevronDown, Medal } from 'lucide-vue-next';
import { ref } from 'vue';
import HeroBot from '@/components/site/HeroBot.vue';
import { gsap, releaseTransforms } from '@/motion/gsap';
import { discardHeroIntro, playHeroIntro } from '@/motion/intro';
import { splitLines, whenFontsReady } from '@/motion/split';
import { useMagnetic } from '@/motion/useMagnetic';
import { useMotion } from '@/motion/useMotion';
import { UserHeroScript } from '@/script/landingPage/hero';

const props = defineProps<{
    personal: any;
}>();

const { roles } = UserHeroScript(props.personal);

const roleIconColors = [
    'text-primary-strong',
    'text-brand-red-strong',
    'text-primary-strong',
];

const section = ref<HTMLElement | null>(null);
const botWrap = ref<HTMLElement | null>(null);
const bot = ref<InstanceType<typeof HeroBot> | null>(null);
const content = ref<HTMLElement | null>(null);
const greeting = ref<HTMLElement | null>(null);
const name = ref<HTMLElement | null>(null);
const roleList = ref<HTMLElement | null>(null);
const desc = ref<HTMLElement | null>(null);
const ctas = ref<HTMLElement | null>(null);
const hint = ref<HTMLElement | null>(null);
const primaryCta = ref<HTMLElement | null>(null);

useMagnetic(primaryCta);

// The intro plays once; a later breakpoint change only rebuilds the parallax.
let introPlayed = false;

useMotion(section, ({ reduce, desktop }, context) => {
    if (reduce) {
        return;
    }

    if (desktop) {
        const scrub = {
            trigger: section.value,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
        };

        gsap.to(content.value, {
            yPercent: -12,
            opacity: 0.35,
            ease: 'none',
            scrollTrigger: scrub,
        });
        gsap.to(botWrap.value, {
            y: -140,
            rotation: -6,
            ease: 'none',
            scrollTrigger: scrub,
        });
    }

    if (introPlayed) {
        return;
    }

    const roleItems = roleList.value?.children ?? [];
    const ctaItems = ctas.value?.children ?? [];

    gsap.set(name.value, { opacity: 0 });
    gsap.set([greeting.value, desc.value], { opacity: 0, y: 16 });
    gsap.set([roleItems, ctaItems], { opacity: 0, y: 12 });
    gsap.set(hint.value, { opacity: 0 });
    bot.value?.prepare();

    let timeline: gsap.core.Timeline | undefined;

    const cancel = whenFontsReady(context, () => {
        const split = splitLines(name.value!);

        timeline = gsap.timeline({
            onComplete: () => {
                introPlayed = true;
                split.revert();
                // Give the chips and secondary CTA their CSS hover lift back.
                releaseTransforms([roleItems, ctaItems]);
            },
        });

        timeline
            .to(greeting.value, { opacity: 1, y: 0 }, 0.1)
            .set(name.value, { opacity: 1 }, 0.2)
            .from(split.words, { yPercent: 110, stagger: 0.06 }, 0.2)
            .to(
                roleItems,
                { opacity: 1, y: 0, stagger: 0.06, duration: 0.6 },
                '-=0.5',
            )
            .to(desc.value, { opacity: 1, y: 0 }, '-=0.5')
            .to(
                ctaItems,
                { opacity: 1, y: 0, stagger: 0.08, duration: 0.6 },
                '-=0.55',
            )
            .to(hint.value, { opacity: 1, duration: 0.6 }, '-=0.3');

        // Added last so its longer wave doesn't push the relative text positions.
        bot.value?.enter(timeline, 0);
        playHeroIntro(timeline);
    });

    return () => {
        cancel();

        if (timeline) {
            discardHeroIntro(timeline);
        }
    };
});
</script>

<template>
    <section
        id="home"
        ref="section"
        class="relative container-page flex min-h-[100svh] flex-col items-center justify-center pt-28 pb-20 text-center"
    >
        <div ref="botWrap" class="mb-3 sm:mb-4">
            <HeroBot ref="bot" />
        </div>

        <div ref="content" class="flex flex-col items-center">
            <h1 class="max-w-5xl font-bold text-foreground">
                <span
                    ref="greeting"
                    class="block text-2xl sm:text-3xl md:text-4xl"
                >
                    Hi, I'm
                </span>
                <span ref="name" class="mt-2 block text-display text-primary">
                    Muammar Aufar Prasetya
                </span>
            </h1>

            <ul
                v-if="roles.length"
                ref="roleList"
                class="mt-8 flex flex-wrap justify-center gap-2 sm:gap-3"
                aria-label="Roles"
            >
                <li
                    v-for="(role, index) in roles"
                    :key="index"
                    class="inline-flex items-center gap-2 rounded-lg surface-glass px-3 py-1.5 text-sm font-semibold text-foreground transition-transform duration-300 ease-out-expo hover:-translate-y-0.5 sm:px-3.5 sm:py-2"
                >
                    <component
                        :is="role.icon"
                        v-if="role.icon"
                        class="size-4"
                        :class="roleIconColors[index % roleIconColors.length]"
                        aria-hidden="true"
                    />
                    {{ role.name }}
                </li>
            </ul>

            <p
                ref="desc"
                class="mt-6 max-w-2xl text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg"
            >
                {{ personal.desc }}
            </p>

            <div
                ref="ctas"
                class="mt-10 flex flex-row items-center justify-center gap-3"
            >
                <a
                    ref="primaryCta"
                    href="#project"
                    class="group inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold whitespace-nowrap text-primary-foreground shadow-glow focus-ring transition-[filter] duration-300 ease-out-expo hover:brightness-110 sm:h-12 sm:px-7 sm:text-base"
                >
                    View Projects
                    <ArrowRight
                        class="size-4 transition-transform duration-300 group-hover:translate-x-1"
                        aria-hidden="true"
                    />
                </a>
                <a
                    href="#achievement"
                    class="group inline-flex h-11 items-center justify-center gap-2 rounded-full surface-glass px-5 text-sm font-semibold whitespace-nowrap text-foreground focus-ring transition-all duration-300 ease-out-expo hover:-translate-y-0.5 hover:text-brand-red-strong sm:h-12 sm:px-7 sm:text-base"
                >
                    <Medal
                        class="size-4 transition-transform duration-300 group-hover:rotate-12"
                        aria-hidden="true"
                    />
                    Achievement
                </a>
            </div>
        </div>

        <a
            ref="hint"
            href="#about"
            class="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 rounded-full p-2 text-xs font-medium text-muted-foreground focus-ring transition-colors hover:text-foreground sm:flex"
            aria-label="Scroll to About section"
        >
            <span
                class="flex h-9 w-6 justify-center rounded-full border-2 border-current pt-1.5"
                aria-hidden="true"
            >
                <span
                    class="block h-2 w-1 animate-scroll-hint rounded-full bg-current"
                />
            </span>
            <ChevronDown class="size-3.5" aria-hidden="true" />
        </a>
    </section>
</template>
