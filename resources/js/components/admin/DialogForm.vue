<script setup lang="ts">
import Dialog from 'primevue/dialog';

const props = defineProps({
    visible: Boolean,
    title: String,
});

const emit = defineEmits(['update:visible']);
</script>

<template>
    <Dialog
        :visible="visible"
        @update:visible="(val) => emit('update:visible', val)"
        :header="title"
        modal
        :style="{ width: '70rem' }"
        :breakpoints="{
            '1199px': '75vw',
            '575px': '90vw',
        }"
    >
        <div class="p-2">
            <slot />
        </div>

        <template #footer>
            <slot name="footer" />
        </template>
    </Dialog>
</template>
