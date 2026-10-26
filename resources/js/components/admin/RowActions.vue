<script setup lang="ts">
import Button from 'primevue/button';

defineProps<{
    /** Used in the accessible labels, e.g. the row title. */
    name?: string;
}>();

defineEmits(['edit', 'delete']);
</script>

<template>
    <div class="flex items-center gap-1">
        <Button
            v-tooltip.top="'Edit'"
            icon="pi pi-pencil"
            text
            rounded
            size="small"
            :aria-label="name ? `Edit ${name}` : 'Edit'"
            @click="$emit('edit')"
        />
        <Button
            v-tooltip.top="'Delete'"
            icon="pi pi-trash"
            text
            rounded
            severity="danger"
            size="small"
            :aria-label="name ? `Delete ${name}` : 'Delete'"
            @click="$emit('delete')"
        />
    </div>
</template>
