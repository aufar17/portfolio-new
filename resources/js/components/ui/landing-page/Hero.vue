<script setup lang="ts">
import logo from '@/assets/img/logo.png';
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

const skills = [
    {
        name: 'Web Developer',
        icon: CodeXml,
        color: 'bg-red-100 text-red-700',
    },
    {
        name: 'Mobile Developer',
        icon: Smartphone,
        color: 'bg-green-100 text-green-700',
    },
    {
        name: 'Software Engineer',
        icon: MonitorCheck,
        color: 'bg-yellow-100 text-yellow-700',
    },
];
</script>

<template>
    <section
        id="home"
        class="mx-auto flex min-h-screen max-w-7xl flex-col items-center px-6 pt-35 md:flex-row md:justify-between md:pt-0"
    >
        <div
            class="flex w-full flex-col-reverse items-center gap-20 md:flex-row md:justify-between"
        >
            <div class="md:pr-12">
                <h1
                    class="typing text-4xl leading-tight font-bold tracking-tight md:text-5xl"
                >
                    Hi, I'm
                    <span class="text-primary">Muammar Aufar Prasetya</span>
                </h1>

                <div class="mt-5 flex flex-wrap gap-2">
                    <Badge
                        v-for="skill in skills"
                        :key="skill.name"
                        variant="default"
                        class="flex cursor-default items-center gap-2 rounded-lg px-3 py-1 text-sm font-semibold transition-all duration-200"
                        :class="[
                            skill.color,
                            'shadow-md hover:-translate-y-0.5 hover:scale-105 hover:shadow-lg',
                        ]"
                    >
                        <span v-if="skill.icon">
                            <component :is="skill.icon" class="h-4 w-4" />
                        </span>
                        {{ skill.name }}
                    </Badge>
                </div>

                <p
                    class="mt-10 max-w-xl leading-relaxed text-muted-foreground md:text-lg"
                >
                    A professional web & mobile developer focused on modern,
                    responsive, and scalable applications.
                </p>

                <div class="mt-15 flex items-center gap-4">
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

            <div class="relative flex justify-center md:pl-12">
                <div
                    class="absolute -top-10 h-[420px] w-[320px] rounded-full bg-primary/20 blur-3xl"
                ></div>

                <div
                    class="relative rounded-3xl border bg-background p-3 shadow-2xl transition duration-300 hover:-translate-y-2"
                >
                    <img
                        :src="logo"
                        alt="profile"
                        class="h-[420px] w-[320px] rounded-2xl object-contain"
                    />
                </div>

                <div
                    class="absolute top-6 -right-6 h-16 w-16 rounded-full bg-primary/30 blur-xl"
                ></div>
            </div>
        </div>
    </section>
</template>
<style scoped>
.typing {
    display: inline-block;
    overflow: hidden;
    white-space: nowrap;
    border-right: 3px solid currentColor;
    width: 0;
    animation:
        typing 3s steps(38) forwards,
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
</style>
