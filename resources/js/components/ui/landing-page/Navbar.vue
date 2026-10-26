<script setup lang="ts">
import { Link, usePage } from '@inertiajs/vue3';
import {
    onKeyStroke,
    useEventListener,
    useResizeObserver,
    useWindowScroll,
} from '@vueuse/core';
import { FolderGit, House, Medal, Menu, User, X } from 'lucide-vue-next';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import logo from '@/assets/img/logo.png';
import ThemeToggle from '@/components/site/ThemeToggle.vue';
import { gsap, prefersReducedMotion, ScrollTrigger } from '@/motion/gsap';
import { useMotion } from '@/motion/useMotion';
import { landingPage } from '@/routes';
import type { NavItem } from '@/types/navigation';

const page = usePage();
const isLandingPage = computed(() => page.url.split(/[?#]/)[0] === '/');

const mainNavItems: NavItem[] = [
    { title: 'Home', href: 'home', section: 'home', icon: House },
    { title: 'About', href: 'about', section: 'about', icon: User },
    { title: 'Projects', href: 'project', section: 'project', icon: FolderGit },
    {
        title: 'Achievements',
        href: 'achievement',
        section: 'achievement',
        icon: Medal,
    },
];

const hrefFor = (section?: string) =>
    isLandingPage.value ? `#${section}` : `/#${section}`;

const activeSection = ref(isLandingPage.value ? 'home' : '');
const isOpen = ref(false);

const { y } = useWindowScroll();
const isScrolled = computed(() => y.value > 24 || isOpen.value);

const header = ref<HTMLElement | null>(null);
const nav = ref<HTMLElement | null>(null);
const list = ref<HTMLElement | null>(null);
const pill = ref<HTMLElement | null>(null);

/* ---------- Active indicator: a primary copy of the list, clipped to the active item ---------- */

const clipFor = (section: string) => {
    const item = list.value?.querySelector(`[data-section="${section}"]`);

    if (!list.value || !item) {
        return 'inset(0px 50% 0px 50% round 999px)';
    }

    const box = list.value.getBoundingClientRect();
    const rect = item.getBoundingClientRect();

    return `inset(0px ${box.right - rect.right}px 0px ${rect.left - box.left}px round 999px)`;
};

const placePill = (animate: boolean) => {
    if (!pill.value) {
        return;
    }

    const vars = {
        clipPath: clipFor(activeSection.value),
        opacity: activeSection.value ? 1 : 0,
    };

    if (animate && !prefersReducedMotion()) {
        gsap.to(pill.value, { ...vars, duration: 0.35, overwrite: true });
    } else {
        gsap.set(pill.value, vars);
    }
};

watch(activeSection, () => placePill(true));
useEventListener('resize', () => placePill(false));

/* ---------- Height for scroll offsets and sticky stacks ---------- */

useResizeObserver(nav, () => {
    if (nav.value) {
        document.documentElement.style.setProperty(
            '--nav-h',
            `${nav.value.offsetTop + nav.value.offsetHeight}px`,
        );
    }
});

/* ---------- Scroll behaviour ---------- */

let showNav: (() => void) | null = null;

useMotion(header, ({ reduce }) => {
    if (isLandingPage.value) {
        document
            .querySelectorAll<HTMLElement>('section[id]')
            .forEach((section) =>
                ScrollTrigger.create({
                    trigger: section,
                    start: 'top 45%',
                    end: 'bottom 45%',
                    onToggle: (self) => {
                        if (self.isActive) {
                            activeSection.value = section.id;
                        }
                    },
                }),
            );
    }

    if (reduce) {
        return;
    }

    // Hide while reading down the page, come back on any scroll up.
    let hidden = false;
    const setHidden = (value: boolean) => {
        if (value === hidden) {
            return;
        }

        hidden = value;
        gsap.to(header.value, {
            yPercent: value ? -130 : 0,
            duration: value ? 0.25 : 0.3,
            overwrite: true,
        });
    };

    showNav = () => setHidden(false);

    ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
            const keepVisible =
                isOpen.value ||
                self.scroll() < 120 ||
                header.value?.contains(document.activeElement);

            setHidden(!keepVisible && self.direction === 1);
        },
    });

    // Keyboard users tabbing into the bar must always see it.
    const onFocusIn = () => setHidden(false);
    header.value?.addEventListener('focusin', onFocusIn);

    return () => {
        showNav = null;
        header.value?.removeEventListener('focusin', onFocusIn);
    };
});

watch(isOpen, (open) => {
    if (open) {
        showNav?.();
    }
});

onMounted(() => {
    placePill(false);
    // Item widths change once Poppins has loaded.
    document.fonts.ready.then(() => placePill(false));
});

onBeforeUnmount(() => {
    gsap.killTweensOf(pill.value);
});

onKeyStroke('Escape', () => {
    isOpen.value = false;
});

useEventListener('resize', () => {
    if (window.innerWidth >= 768) {
        isOpen.value = false;
    }
});
</script>

<template>
    <header
        ref="header"
        class="fixed inset-x-0 top-0 z-50 px-3 pt-3 [view-transition-name:site-header] sm:px-4 sm:pt-4"
    >
        <nav
            ref="nav"
            aria-label="Main"
            class="mx-auto flex max-w-5xl items-center justify-between gap-4 rounded-full border py-2 pr-2 pl-3 transition-all duration-500 ease-out-expo sm:pl-4"
            :class="
                isScrolled ? 'glass-nav' : 'border-transparent bg-transparent'
            "
        >
            <Link
                :href="landingPage().url"
                view-transition
                class="flex items-center gap-2.5 rounded-full focus-ring"
            >
                <img :src="logo" alt="" class="h-8 w-auto sm:h-9" />
                <span
                    class="text-base font-bold tracking-tight text-foreground sm:text-lg"
                >
                    Portfolio
                </span>
            </Link>

            <div class="relative hidden md:block">
                <ul ref="list" class="flex items-center gap-1">
                    <li
                        v-for="item in mainNavItems"
                        :key="item.title"
                        :data-section="item.section"
                    >
                        <component
                            :is="isLandingPage ? 'a' : Link"
                            :href="hrefFor(item.section)"
                            :view-transition="isLandingPage ? undefined : true"
                            class="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground focus-ring transition-colors duration-300 hover:text-foreground"
                            :aria-current="
                                activeSection === item.section
                                    ? 'location'
                                    : undefined
                            "
                        >
                            <component
                                :is="item.icon"
                                class="size-4"
                                aria-hidden="true"
                            />
                            {{ item.title }}
                        </component>
                    </li>
                </ul>

                <!-- Same items in primary, clipped down to the active one -->
                <ul
                    ref="pill"
                    class="pointer-events-none absolute inset-0 flex items-center gap-1 rounded-full bg-primary text-primary-foreground opacity-0"
                    aria-hidden="true"
                >
                    <li v-for="item in mainNavItems" :key="item.title">
                        <span
                            class="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
                        >
                            <component :is="item.icon" class="size-4" />
                            {{ item.title }}
                        </span>
                    </li>
                </ul>
            </div>

            <div class="flex items-center gap-1">
                <ThemeToggle />

                <button
                    type="button"
                    class="grid size-10 place-items-center rounded-full text-foreground focus-ring transition-colors hover:bg-muted md:hidden"
                    :aria-expanded="isOpen"
                    aria-controls="mobile-menu"
                    :aria-label="isOpen ? 'Close menu' : 'Open menu'"
                    @click="isOpen = !isOpen"
                >
                    <X v-if="isOpen" class="size-5" />
                    <Menu v-else class="size-5" />
                </button>
            </div>
        </nav>

        <Transition
            enter-active-class="transition duration-200 ease-out-expo"
            enter-from-class="-translate-y-2 scale-[0.98] opacity-0"
            leave-active-class="transition duration-150 ease-out-expo"
            leave-to-class="-translate-y-2 scale-[0.98] opacity-0"
        >
            <div
                v-if="isOpen"
                id="mobile-menu"
                class="mx-auto mt-2 max-w-5xl rounded-3xl glass-nav p-2 md:hidden"
            >
                <ul class="flex flex-col gap-1">
                    <li v-for="item in mainNavItems" :key="item.title">
                        <component
                            :is="isLandingPage ? 'a' : Link"
                            :href="hrefFor(item.section)"
                            :view-transition="isLandingPage ? undefined : true"
                            class="flex items-center gap-3 rounded-full px-4 py-3 text-base font-semibold focus-ring transition-colors"
                            :class="
                                activeSection === item.section
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-foreground hover:bg-muted'
                            "
                            @click="isOpen = false"
                        >
                            <component
                                :is="item.icon"
                                class="size-5"
                                aria-hidden="true"
                            />
                            {{ item.title }}
                        </component>
                    </li>
                </ul>
            </div>
        </Transition>
    </header>
</template>
