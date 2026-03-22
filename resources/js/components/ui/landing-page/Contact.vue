<script setup lang="ts">
import Button from '../button/Button.vue';
</script>
<style scoped>
@keyframes pulse-slow {
    0%,
    100% {
        opacity: 0.6;
        transform: scale(1);
    }
    50% {
        opacity: 0.9;
        transform: scale(1.05);
    }
}
.animate-pulse-slow {
    animation: pulse-slow 8s ease-in-out infinite;
}
</style>

<template>
    <section id="contact" class="py-20 md:py-32">
        <div class="mx-auto max-w-7xl px-6 lg:px-8">
            <div class="mb-16 text-center">
                <h2 class="text-4xl font-bold tracking-tight md:text-5xl">
                    Get In <span class="text-primary">Touch</span>
                </h2>
                <p class="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                    Want to collaborate, ask questions, or just say hi? Reach
                    out through social media or send a direct message below.
                </p>
            </div>

            <div class="w-full px-4">
                <div
                    class="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16"
                >
                    <div
                        class="animate-fade-up animation-delay-300 max-w-xl space-y-8"
                    >
                        <div>
                            <h3 class="mb-5 text-2xl font-semibold md:text-3xl">
                                Connect me
                            </h3>
                            <p class="text-muted-foreground">
                                Quick links to my profiles — feel free to
                                follow, DM, or connect.
                            </p>
                        </div>

                        <div class="grid grid-cols-3 gap-4">
                            <a
                                href="https://github.com/yourusername"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="group flex items-center gap-3 rounded-lg border border-white/10 bg-gradient-to-br from-gray-900/80 to-black/80 px-4 py-2 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-white/30 hover:shadow-lg hover:shadow-black/30"
                            >
                                <div
                                    class="rounded-md bg-black/60 p-2.5 text-white"
                                >
                                    <svg
                                        class="h-6 w-6 transition-transform duration-300 group-hover:scale-110"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.377.202 2.394.1 2.647.64.699 1.026 1.592 1.026 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12c0-5.523-4.478-10-10-10z"
                                        />
                                    </svg>
                                </div>

                                <h4 class="text-sm font-medium text-white">
                                    GitHub
                                </h4>
                            </a>
                        </div>
                    </div>

                    <div class="relative w-full max-w-lg justify-self-end">
                        <div
                            class="relative z-10 rounded-lg border border-gray-200 bg-white/80 p-8 shadow-xl backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 dark:border-primary/20 dark:bg-white/5 dark:shadow-primary/10"
                        >
                            <h3
                                class="mb-6 inline-block border-b border-primary/30 pb-2 text-2xl font-semibold"
                            >
                                Send a Message
                            </h3>

                            <form class="space-y-5">
                                <div>
                                    <label
                                        for="name"
                                        class="mb-2 block text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-300"
                                    >
                                        Name
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        placeholder="Your name"
                                        required
                                        class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 shadow-sm transition-all duration-300 outline-none placeholder:text-gray-400 hover:border-gray-400 focus:border-primary focus:shadow-md focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/10 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label
                                        for="email"
                                        class="mb-2 block text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-300"
                                    >
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="your@email.com"
                                        required
                                        class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 shadow-sm transition-all duration-300 outline-none placeholder:text-gray-400 hover:border-gray-400 focus:border-primary focus:shadow-md focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/10 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label
                                        for="message"
                                        class="mb-2 block text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-300"
                                    >
                                        Message
                                    </label>
                                    <textarea
                                        id="message"
                                        rows="5"
                                        placeholder="How can I help you?"
                                        required
                                        class="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 shadow-sm transition-all duration-300 outline-none placeholder:text-gray-400 hover:border-gray-400 focus:border-primary focus:shadow-md focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/10 dark:text-white"
                                    ></textarea>
                                </div>

                                <Button
                                    type="submit"
                                    variant="default"
                                    class="w-full text-white transition-all duration-300 hover:scale-[1.02] hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98]"
                                >
                                    Send Message
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
