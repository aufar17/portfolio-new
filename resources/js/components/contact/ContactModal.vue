<script setup lang="ts">
import { ArrowUpRight, X } from 'lucide-vue-next';
import {
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogOverlay,
    DialogPortal,
    DialogRoot,
    DialogTitle,
} from 'reka-ui';
import { computed } from 'vue';

const props = defineProps<{
    open: boolean;
    contacts: any[];
}>();

const emit = defineEmits(['close']);

const isOpen = computed({
    get: () => props.open,
    set: (value) => {
        if (!value) {
            emit('close');
        }
    },
});
</script>

<template>
    <!-- Built from reka-ui primitives (not ui/dialog, which admin shares) so
         open/close can run through Vue <Transition>. -->
    <DialogRoot v-model:open="isOpen">
        <DialogPortal>
            <Transition
                enter-active-class="transition-opacity duration-200 ease-out-expo"
                enter-from-class="opacity-0"
                leave-active-class="transition-opacity duration-150 ease-out-expo"
                leave-to-class="opacity-0"
            >
                <DialogOverlay class="fixed inset-0 z-50 bg-black/80" />
            </Transition>
            <Transition
                enter-active-class="transition duration-250 ease-out-expo"
                enter-from-class="scale-95 opacity-0"
                leave-active-class="transition duration-150 ease-out-expo"
                leave-to-class="scale-95 opacity-0"
            >
                <DialogContent
                    class="fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-6 rounded-xl surface-glass bg-background/85 p-6 sm:max-w-md sm:p-7"
                >
                    <div class="flex flex-col gap-2 text-left">
                        <DialogTitle class="text-2xl font-bold tracking-tight">
                            Get in Touch
                        </DialogTitle>
                        <DialogDescription
                            class="text-sm text-muted-foreground"
                        >
                            Feel free to reach out through any platform
                        </DialogDescription>
                    </div>

                    <ul class="flex flex-col gap-2.5">
                        <li v-for="contact in contacts" :key="contact.id">
                            <a
                                :href="contact.link"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="group relative flex items-center gap-4 overflow-hidden rounded-xl border border-border bg-card/60 px-4 py-3 focus-ring transition-[border-color,box-shadow] duration-300 ease-out-expo hover:border-primary/40 hover:shadow-soft"
                            >
                                <span
                                    class="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                    :style="{
                                        background: `linear-gradient(120deg, transparent, ${contact.color}1f, transparent)`,
                                    }"
                                    aria-hidden="true"
                                />
                                <span
                                    class="relative grid size-11 shrink-0 place-items-center rounded-lg border border-border bg-background transition-transform duration-300 ease-out-expo group-hover:scale-110"
                                >
                                    <img
                                        :src="contact.icon"
                                        alt=""
                                        class="size-6 object-contain"
                                    />
                                </span>
                                <span class="relative flex-1 font-semibold">
                                    {{ contact.name }}
                                    <span class="sr-only"
                                        >(opens in new tab)</span
                                    >
                                </span>
                                <ArrowUpRight
                                    class="relative size-4 text-muted-foreground transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary-strong"
                                    aria-hidden="true"
                                />
                            </a>
                        </li>
                    </ul>

                    <p
                        class="border-t border-border pt-4 text-center text-xs text-muted-foreground"
                    >
                        Let’s collaborate and build something great together
                    </p>

                    <DialogClose
                        class="absolute top-5 right-5 rounded-full p-2 text-muted-foreground focus-ring transition-colors hover:bg-muted hover:text-foreground"
                    >
                        <X class="size-4" aria-hidden="true" />
                        <span class="sr-only">Close</span>
                    </DialogClose>
                </DialogContent>
            </Transition>
        </DialogPortal>
    </DialogRoot>
</template>
