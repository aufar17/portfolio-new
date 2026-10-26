<script setup lang="ts">
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';

/**
 * Create/edit dialog. Content goes in the default slot inside a <form>;
 * the footer's Save button submits it.
 */
const props = withDefaults(
    defineProps<{
        title: string;
        width?: string;
        processing?: boolean;
        formId?: string;
    }>(),
    {
        width: '40rem',
        processing: false,
        formId: 'crud-form',
    },
);

const visible = defineModel<boolean>('visible', { required: true });

const emit = defineEmits(['submit', 'cancel']);
</script>

<template>
    <Dialog
        v-model:visible="visible"
        :header="title"
        modal
        :draggable="false"
        :style="{ width: props.width }"
        :breakpoints="{ '1199px': '80vw', '640px': '95vw' }"
        :pt="{ mask: { class: 'backdrop-blur-sm' } }"
        @hide="emit('cancel')"
    >
        <form
            :id="formId"
            class="grid grid-cols-1 gap-5 pt-1 md:grid-cols-2"
            @submit.prevent="emit('submit')"
        >
            <slot />
        </form>

        <template #footer>
            <div class="flex w-full justify-end gap-2 pt-2">
                <Button
                    label="Cancel"
                    severity="secondary"
                    outlined
                    :disabled="processing"
                    @click="visible = false"
                />
                <Button
                    type="submit"
                    :form="formId"
                    label="Save"
                    icon="pi pi-check"
                    :loading="processing"
                />
            </div>
        </template>
    </Dialog>
</template>
