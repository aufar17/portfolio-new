<script setup lang="ts">
import logo from '@/assets/img/logo.png';
import { useSplash } from '@/composables/useSplash';
import {
    ArrowRight,
    CodeXml,
    Mail,
    MailOpen,
    MonitorCheck,
    Smartphone,
} from 'lucide-vue-next';
import Badge from '../badge/Badge.vue';
import Button from '../button/Button.vue';
import { ref, watch } from 'vue';

const skills = [
    {
        name: 'Web Developer',
        icon: CodeXml,
        color: 'text-red-500',
    },
    {
        name: 'Mobile Developer',
        icon: Smartphone,
        color: 'text-green-500',
    },
    {
        name: 'Software Engineer',
        icon: MonitorCheck,
        color: 'text-yellow-500',
    },
];

const { splashDone } = useSplash(2500);
const startTyping = ref(false);

watch(splashDone, (val) => {
    if (val) startTyping.value = true;
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
        class="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center text-center"
    >
        <div class="flex w-full max-w-7xl flex-col items-center">
            <h1
                :class="['typing', { start: startTyping }]"
                class="typing text-6xl leading-tight font-bold tracking-tight md:text-5xl lg:text-6xl"
            >
                Hi, I'm
                <span class="text-primary">Muammar Aufar Prasetya</span>
            </h1>

            <div class="mt-5 flex flex-wrap justify-center gap-2">
                <Badge
                    v-for="skill in skills"
                    :key="skill.name"
                    variant="default"
                    class="text-md flex cursor-default items-center gap-2 rounded-2xl px-3 py-1 font-medium transition-all duration-200"
                    :class="[
                        skill.color,
                        'border border-black/10 bg-white/5 shadow-md hover:-translate-y-0.5 hover:scale-105 hover:shadow-lg dark:border-white/10',
                    ]"
                >
                    <span v-if="skill.icon">
                        <component :is="skill.icon" class="h-4 w-4" />
                    </span>
                    {{ skill.name }}
                </Badge>
            </div>

            <p
                class="mt-10 max-w-2xl leading-relaxed text-muted-foreground md:text-lg"
            >
                A professional web & mobile developer focused on modern,
                responsive, and scalable applications.
            </p>

            <div class="mt-15 flex items-center justify-center gap-4">
                <Button
                    variant="default"
                    class="group inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                >
                    View Projects
                    <ArrowRight
                        class="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                    />
                </Button>
                <Button
                    variant="outline"
                    class="group inline-flex items-center gap-2 rounded-md border border-gray-300 px-6 py-2.5 text-sm font-semibold text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-secondary"
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
