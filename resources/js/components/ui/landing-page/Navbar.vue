<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { router, usePage } from '@inertiajs/vue3';
import { useAppearance } from '@/composables/useAppearance';
import { tryOnScopeDispose } from '@vueuse/core';
import logo from '@/assets/img/logo.png';
import Button from '../button/Button.vue';
import { Link } from '@inertiajs/vue3';
import {
    ContactRound,
    FolderGit,
    House,
    Medal,
    Menu,
    Moon,
    Sun,
    User,
    X,
} from 'lucide-vue-next';
import type { NavItem } from '@/types/navigation';
import { landingPage } from '@/routes';

const activeSection = ref('home');
const isScrolled = ref(false);
const isOpen = ref(false);

const { resolvedAppearance, updateAppearance } = useAppearance();

const page = usePage();
const isLandingPage = computed(() => page.url === '/landing-page');
const mainNavItems: NavItem[] = [
    { title: 'Home', href: `home`, section: 'home', icon: House },
    { title: 'About', href: `about`, section: 'about', icon: User },
    {
        title: 'Projects',
        href: `project`,
        section: 'project',
        icon: FolderGit,
    },
    {
        title: 'Achievements',
        href: `achievement`,
        section: 'achievement',
        icon: Medal,
    },
];

let observer: IntersectionObserver | null = null;

const observeSections = () => {
    if (observer) {
        observer.disconnect();
        observer = null;
    }

    observer = new IntersectionObserver(
        (entries) => {
            const visible = entries
                .filter((e) => e.isIntersecting)
                .sort(
                    (a, b) =>
                        a.boundingClientRect.top - b.boundingClientRect.top,
                );

            if (visible.length > 0) {
                activeSection.value = visible[0].target.id;
            }
        },
        {
            root: null,
            rootMargin: '0px 0px -40% 0px',
            threshold: [0.2, 0.5, 0.8],
        },
    );

    document.querySelectorAll('section[id]').forEach((el) => {
        if (el instanceof Element) {
            observer?.observe(el);
        }
    });
};

tryOnScopeDispose(() => {
    if (observer) observer.disconnect();
});

const handleScroll = () => {
    isScrolled.value = window.scrollY > 50;
};

onMounted(() => {
    window.addEventListener('scroll', handleScroll);

    setTimeout(observeSections, 100);

    const unsubscribe = router.on('navigate', () => {
        setTimeout(observeSections, 300);
    });

    onUnmounted(() => {
        window.removeEventListener('scroll', handleScroll);
        unsubscribe();
    });
});

const toggleMenu = () => {
    isOpen.value = !isOpen.value;
};

const toggleTheme = () => {
    updateAppearance(resolvedAppearance.value === 'dark' ? 'light' : 'dark');
};
</script>

<template>
    <nav
        :class="[
            'fixed z-50 w-full transition-all duration-300',
            isScrolled
                ? 'bg-white/2 backdrop-blur-md dark:bg-white/2'
                : 'backdrop-blur-none sm:backdrop-blur-md lg:bg-transparent',
        ]"
    >
        <div
            class="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4 md:px-12"
        >
            <Link :href="landingPage().url" class="flex items-center gap-3">
                <img :src="logo" alt="logo" class="h-10 w-auto" />

                <div class="flex flex-col leading-tight">
                    <span
                        class="text-xl font-semibold tracking-wide text-gray-900 dark:text-white"
                    >
                        Portfolio
                    </span>
                </div>

                <span class="sr-only">Portfolio</span>
            </Link>

            <div class="hidden items-center gap-8 font-medium md:flex">
                <Link
                    v-for="item in mainNavItems"
                    :key="item.title"
                    :href="
                        isLandingPage ? `#${item.section}` : `/#${item.section}`
                    "
                    class="flex items-center gap-2 rounded-md px-2 py-2 font-semibold transition-colors"
                    :class="
                        activeSection === item.section
                            ? 'text-primary'
                            : 'hover:bg-primary hover:text-primary-foreground dark:hover:text-foreground'
                    "
                >
                    <component :is="item.icon" class="h-4 w-4" />
                    <span>{{ item.title }}</span>
                </Link>

                <Button
                    :variant="
                        resolvedAppearance === 'dark' ? 'secondary' : 'default'
                    "
                    @click="toggleTheme"
                    class="rounded-md p-2 transition"
                >
                    <Moon v-if="resolvedAppearance === 'dark'" />
                    <Sun v-else />
                </Button>
            </div>

            <div class="flex items-center gap-4 md:hidden">
                <Button
                    :variant="
                        resolvedAppearance === 'dark' ? 'secondary' : 'default'
                    "
                    @click="toggleTheme"
                    class="rounded-md p-2 transition"
                >
                    <Moon v-if="resolvedAppearance === 'dark'" />
                    <Sun v-else />
                </Button>

                <Button
                    variant="default"
                    @click="toggleMenu"
                    class="rounded-md p-2 transition md:hidden dark:text-foreground"
                >
                    <Menu v-if="!isOpen" />
                    <X v-else />
                </Button>
            </div>
        </div>

        <div
            v-if="isOpen"
            class="bg-white/10 backdrop-blur-md md:hidden dark:bg-black/10"
        >
            <Link
                v-for="item in mainNavItems"
                :key="item.title"
                :href="isLandingPage ? `#${item.section}` : `/#${item.section}`"
                @click="isOpen = false"
                class="flex items-center gap-3 rounded-md px-6 py-3 text-gray-900 transition-colors duration-200 hover:bg-black/10 dark:text-white dark:hover:bg-gray-700"
            >
                <component :is="item.icon" class="h-5 w-5" />
                <span class="font-semibold">{{ item.title }}</span>
            </Link>
        </div>
    </nav>
</template>
