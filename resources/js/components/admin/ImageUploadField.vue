<script setup lang="ts">
import { ImagePlus, X } from 'lucide-vue-next';
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import InputError from '@/components/InputError.vue';

/**
 * Image picker with a live preview. Shows `currentSrc` (the saved image)
 * until a new file is chosen, and enforces the 1 MB upload limit.
 */
const props = withDefaults(
    defineProps<{
        id: string;
        label: string;
        currentSrc?: string | null;
        error?: string;
        maxSize?: number;
    }>(),
    {
        currentSrc: null,
        maxSize: 1_000_000,
    },
);

const emit = defineEmits<{ select: [file: File | null] }>();

const objectUrl = ref<string | null>(null);
const sizeError = ref('');
const inputRef = ref<HTMLInputElement | null>(null);

const preview = computed(() => objectUrl.value ?? props.currentSrc);

const revoke = () => {
    if (objectUrl.value) {
        URL.revokeObjectURL(objectUrl.value);
        objectUrl.value = null;
    }
};

const onChange = (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    sizeError.value = '';

    if (!file) {
return;
}

    if (file.size > props.maxSize) {
        sizeError.value = `File is too large. Maximum size is ${props.maxSize / 1_000_000} MB.`;
        (event.target as HTMLInputElement).value = '';

        return;
    }

    revoke();
    objectUrl.value = URL.createObjectURL(file);
    emit('select', file);
};

const clear = () => {
    revoke();
    sizeError.value = '';

    if (inputRef.value) {
inputRef.value.value = '';
}

    emit('select', null);
};

// Reset the local preview whenever the dialog switches to another record.
watch(
    () => props.currentSrc,
    () => {
        revoke();
        sizeError.value = '';
    },
);

onBeforeUnmount(revoke);
</script>

<template>
    <div class="flex flex-col gap-2 md:col-span-2">
        <span class="text-sm font-semibold text-foreground">{{ label }}</span>

        <div class="flex items-center gap-4">
            <label
                :for="id"
                class="group relative grid size-24 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted/50 transition-colors focus-within:border-primary hover:border-primary"
            >
                <img
                    v-if="preview"
                    :src="preview"
                    alt="Selected image preview"
                    class="size-full object-cover"
                />
                <ImagePlus
                    v-else
                    class="size-7 text-muted-foreground transition-colors group-hover:text-primary"
                    aria-hidden="true"
                />
                <input
                    :id="id"
                    ref="inputRef"
                    type="file"
                    accept="image/*"
                    class="sr-only"
                    @change="onChange"
                />
            </label>

            <div class="flex min-w-0 flex-col gap-1">
                <label
                    :for="id"
                    class="cursor-pointer text-sm font-semibold text-primary-strong hover:underline"
                >
                    {{ preview ? 'Change image' : 'Upload image' }}
                </label>
                <p class="text-xs text-muted-foreground">
                    PNG, JPG or WEBP up to {{ maxSize / 1_000_000 }} MB
                </p>
                <button
                    v-if="objectUrl"
                    type="button"
                    class="inline-flex w-fit items-center gap-1 text-xs font-medium text-muted-foreground hover:text-destructive"
                    @click="clear"
                >
                    <X class="size-3.5" aria-hidden="true" />
                    Remove selection
                </button>
            </div>
        </div>

        <InputError :message="sizeError || error" />
    </div>
</template>
