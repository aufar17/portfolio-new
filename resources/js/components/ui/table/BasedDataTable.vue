<script setup lang="ts">
import { ref } from 'vue';
import DataTable from 'primevue/datatable';
import { FilterMatchMode } from '@primevue/core/api';

interface Props {
    value: any[];
    totalRecords?: number;
    loading?: boolean;
    globalFilterFields?: string[];
}

const props = defineProps<Props>();

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
</script>

<template>
    <DataTable
        v-model:filters="filters"
        :value="props.value"
        :globalFilterFields="props.globalFilterFields"
        paginator
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        :totalRecords="props.totalRecords"
        :loading="props.loading"
        stripedRows
        removableSort
        responsiveLayout="scroll"
        filterDisplay="menu"
        class="w-full"
        :pt="{
            root: {
                class: 'border border-border rounded-lg shadow-sm overflow-hidden bg-card text-sm',
            },
        }"
    >
        <template #header>
            <slot name="header" :filters="filters" />
        </template>

        <slot />

        <template #empty>
            <slot name="empty">
                <div class="p-6 text-center text-muted-foreground">
                    No data found.
                </div>
            </slot>
        </template>

        <template #loading>
            <slot name="loading">
                <div class="p-6 text-center">Loading...</div>
            </slot>
        </template>
    </DataTable>
</template>
