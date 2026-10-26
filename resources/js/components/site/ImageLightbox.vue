<script setup lang="ts">
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';

defineProps<{
    src: string | null;
    alt: string;
}>();

const open = defineModel<boolean>('open', { required: true });
</script>

<template>
    <Dialog v-model:open="open">
        <DialogContent
            class="w-auto max-w-[calc(100%-2rem)] gap-0 border-0 bg-transparent p-0 shadow-none sm:max-w-[min(90vw,72rem)] [&>[data-slot=dialog-close]]:-top-10 [&>[data-slot=dialog-close]]:right-0 [&>[data-slot=dialog-close]]:rounded-full [&>[data-slot=dialog-close]]:bg-white/15 [&>[data-slot=dialog-close]]:p-2 [&>[data-slot=dialog-close]]:text-white [&>[data-slot=dialog-close]]:opacity-100 [&>[data-slot=dialog-close]]:backdrop-blur-md"
        >
            <DialogTitle class="sr-only">{{ alt }}</DialogTitle>
            <DialogDescription class="sr-only">
                Enlarged image preview
            </DialogDescription>
            <img
                v-if="src"
                :src="src"
                :alt="alt"
                class="block max-h-[80vh] w-auto rounded-xl object-contain shadow-2xl"
            />
        </DialogContent>
    </Dialog>
</template>
