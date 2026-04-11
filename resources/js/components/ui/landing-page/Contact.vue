<script setup lang="ts">
import { Link } from '@inertiajs/vue3';

defineProps<{ contacts: any[] }>();
</script>

<template>
    <section id="contact" class="py-24">
        <div class="mx-auto max-w-4xl px-6 text-center">
            <!-- TITLE -->
            <h2 class="text-4xl font-bold md:text-5xl">
                Get In <span class="text-primary">Touch</span>
            </h2>

            <p class="mt-4 text-white/60">
                Connect with me through my social platforms
            </p>

            <div class="mt-12 flex flex-wrap items-center justify-center gap-4">
                <a
                    v-for="contact in contacts"
                    :key="contact.id"
                    :href="contact.link"
                    target="_blank"
                    class="group relative flex items-center gap-4 overflow-hidden rounded-xl border border-black/10 bg-black/5 px-4 py-3 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30 dark:border-white/10 dark:bg-white/5"
                >
                    <div
                        class="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100"
                    >
                        <div
                            class="absolute inset-0 blur-2xl"
                            :style="{
                                background: `radial-gradient(circle at 50% 50%, ${contact.color}55, transparent 90%)`,
                            }"
                        ></div>

                        <div
                            class="absolute inset-0 blur-3xl"
                            :style="{
                                background: `radial-gradient(circle at 30% 30%, ${contact.color}30, transparent 90%)`,
                            }"
                        ></div>
                    </div>

                    <div
                        class="relative z-10 flex h-11 w-11 items-center justify-center rounded-lg shadow-md"
                        :style="{ backgroundColor: contact.color }"
                    >
                        <img
                            :src="contact.icon"
                            :alt="contact.name"
                            class="h-7 w-7 object-contain"
                        />
                    </div>

                    <div class="relative z-10">
                        <h4
                            class="text-sm font-semibold text-black dark:text-white"
                        >
                            {{ contact.name }}
                        </h4>
                    </div>
                </a>
            </div>
        </div>
    </section>
</template>
