<script setup lang="ts">
import { UserHeroScript } from '@/script/landingPage/hero';
import Badge from '../badge/Badge.vue';
import Button from '../button/Button.vue';
import { Link } from '@inertiajs/vue3';
import { onMounted } from 'vue';
import { Medal } from 'lucide-vue-next';

const props = defineProps<{
    personal: any;
}>();

const { roles, startTyping, ArrowRight, Mail, MailOpen } = UserHeroScript(
    props.personal,
);
onMounted(() => {
    setTimeout(() => {
        startTyping.value = true;
    }, 300);
});
</script>

<style scoped>
.typing {
    margin: 0 auto;
    display: inline-block;
    overflow: hidden;
    white-space: nowrap;
    border-right: 3px solid currentColor;
    width: 0;
    animation:
        typing 3s steps(45) forwards,
        blink-caret 0.9s step-end infinite;
}

.typing,
.typing::selection,
.typing::-moz-selection {
    caret-color: transparent;
}

@keyframes typing {
    from {
        width: 0;
    }
    to {
        width: 100%;
    }
}

@keyframes blink-caret {
    from,
    to {
        border-color: transparent;
    }
    50% {
        border-color: currentColor;
    }
}

@media (max-width: 640px) {
    .typing {
        font-size: 2.25rem;
        line-height: 1.1;
    }
}
</style>
<template>
    <section
        id="home"
        class="mx-auto flex min-h-[70dvh] max-w-7xl flex-col items-center justify-center px-4 py-12 text-center sm:min-h-[80dvh] sm:px-6 sm:py-16 md:min-h-[85dvh] lg:min-h-screen"
    >
        <div class="flex w-full flex-col items-center">
            <h1
                class="text-3xl leading-snug font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl"
            >
                Hi, I'm
                <br />
                <span
                    :class="['text-primary', { typing: startTyping }]"
                    class="block sm:inline"
                >
                    Muammar Aufar Prasetya
                </span>
            </h1>

            <div
                class="mt-3 flex flex-wrap justify-center gap-2 sm:mt-4 sm:gap-3"
            >
                <Badge
                    v-for="(role, index) in roles"
                    :key="index"
                    class="flex items-center gap-1 rounded-2xl px-2 py-1 text-sm font-medium transition-all duration-200 sm:px-3 sm:py-1 sm:text-base"
                    :class="[
                        role.color,
                        'border border-black/10 bg-white/5 shadow-md hover:-translate-y-0.5 hover:scale-105 hover:shadow-lg dark:border-white/10',
                    ]"
                >
                    <component
                        v-if="role.icon"
                        :is="role.icon"
                        class="h-3 w-3 sm:h-4 sm:w-4"
                    />
                    {{ role.name }}
                </Badge>
            </div>

            <p
                class="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:mt-8 sm:text-base md:text-lg"
            >
                {{ personal.desc }}
            </p>

            <div
                class="mt-6 flex flex-col items-center gap-3 sm:mt-10 sm:flex-row sm:gap-4"
            >
                <a
                    href="#project"
                    class="group inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:px-6 sm:py-2.5"
                >
                    View Projects
                    <ArrowRight
                        class="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                    />
                </a>
                <a
                    href="#achievement"
                    class="group inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:px-6 sm:py-2.5 dark:border-secondary"
                >
                    <Medal class="h-4 w-4 transition-all duration-200" />

                    Achievement
                </a>
            </div>
        </div>
    </section>
</template>
