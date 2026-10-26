<script setup lang="ts">
import { ImageOff } from 'lucide-vue-next';
import Dialog from 'primevue/dialog';

defineProps<{
    src: string | null;
    title: string;
}>();

const visible = defineModel<boolean>('visible', { required: true });
</script>

<template>
    <Dialog
        v-model:visible="visible"
        modal
        dismissable-mask
        :header="title"
        :style="{ width: 'auto', maxWidth: '90vw' }"
        :pt="{ mask: { class: 'backdrop-blur-sm' } }"
    >
        <img
            v-if="src"
            :src="src"
            :alt="title"
            class="block max-h-[70vh] max-w-full rounded-lg object-contain"
        />
        <div
            v-else
            class="flex flex-col items-center gap-2 px-10 py-8 text-sm text-muted-foreground"
        >
            <ImageOff class="size-8" aria-hidden="true" />
            No image
        </div>
    </Dialog>
</template>
