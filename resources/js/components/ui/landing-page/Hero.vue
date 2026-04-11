<script setup lang="ts">
import { UserHeroScript } from '@/script/landingPage/hero';
import Badge from '../badge/Badge.vue';
import Button from '../button/Button.vue';

const props = defineProps<{
    personal: any;
}>();

const { roles, startTyping, ArrowRight, Mail, MailOpen } = UserHeroScript(
    props.personal,
);
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
        class="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-4 text-center sm:px-6"
    >
        <div class="flex w-full flex-col items-center">
            <h1
                :class="['typing', { start: startTyping }]"
                class="typing text-4xl leading-snug font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-6xl"
            >
                Hi, I'm
                <span class="text-primary">Muammar Aufar Prasetya</span>
            </h1>

            <div
                class="mt-4 flex flex-wrap justify-center gap-2 sm:mt-5 sm:gap-3"
            >
                <Badge
                    v-for="(role, index) in roles"
                    :key="index"
                    class="sm:text-md text-md flex items-center gap-1 rounded-2xl px-2 py-1 font-medium transition-all duration-200 sm:px-3 sm:py-1"
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
                class="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground sm:mt-10 sm:text-base md:text-lg"
            >
                {{ personal.desc }}
            </p>

            <div
                class="mt-8 flex flex-col items-center gap-3 sm:mt-15 sm:flex-row sm:gap-4"
            >
                <Button
                    variant="default"
                    class="group inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:px-6 sm:py-2.5"
                >
                    View Projects
                    <ArrowRight
                        class="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                    />
                </Button>
                <Button
                    variant="outline"
                    class="group inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:px-6 sm:py-2.5 dark:border-secondary"
                >
                    <Mail
                        class="h-4 w-4 transition-all duration-200 group-hover:hidden"
                    />
                    <MailOpen
                        class="hidden h-4 w-4 transition-all duration-200 group-hover:block"
                    />
                    Contact Me
                </Button>
            </div>
        </div>
    </section>
</template>
