<script setup lang="ts">
import { FilterMatchMode } from '@primevue/core/api';
import { Inbox } from 'lucide-vue-next';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import { ref, useId } from 'vue';

interface Props {
    value: any[];
    totalRecords?: number;
    loading?: boolean;
    globalFilterFields?: string[];
    /** Shows the "New …" button in the toolbar when set. */
    createLabel?: string;
    searchPlaceholder?: string;
    showIndex?: boolean;
    minWidth?: string;
}

const props = withDefaults(defineProps<Props>(), {
    searchPlaceholder: 'Search…',
    showIndex: true,
    minWidth: '48rem',
});

defineEmits(['create']);

const searchId = useId();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
</script>

<template>
    <div
        class="overflow-hidden rounded-xl border border-border bg-card shadow-soft"
    >
        <DataTable
            v-model:filters="filters"
            :value="props.value"
            :global-filter-fields="props.globalFilterFields"
            data-key="id"
            paginator
            :rows="10"
            :rows-per-page-options="[5, 10, 20, 50]"
            :total-records="props.totalRecords"
            :loading="props.loading"
            scrollable
            row-hover
            removable-sort
            :table-style="{ minWidth: props.minWidth }"
            paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            class="text-sm"
        >
            <template #header>
                <slot name="header" :filters="filters">
                    <div
                        class="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                        <IconField class="w-full sm:w-72">
                            <InputIcon class="pi pi-search" />
                            <label :for="searchId" class="sr-only"
                                >Search</label
                            >
                            <InputText
                                :id="searchId"
                                v-model="filters.global.value"
                                :placeholder="searchPlaceholder"
                                size="small"
                                class="w-full"
                            />
                        </IconField>
                        <Button
                            v-if="createLabel"
                            :label="createLabel"
                            icon="pi pi-plus"
                            size="small"
                            class="w-full sm:w-auto"
                            @click="$emit('create')"
                        />
                    </div>
                </slot>
            </template>

            <Column
                v-if="showIndex"
                header="No."
                header-class="w-14"
                body-class="tabular-nums text-muted-foreground"
            >
                <template #body="{ index }">{{ index + 1 }}</template>
            </Column>

            <slot />

            <template #empty>
                <slot name="empty">
                    <div
                        class="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground"
                    >
                        <Inbox class="size-8" aria-hidden="true" />
                        <p class="font-medium">No data found.</p>
                    </div>
                </slot>
            </template>

            <template #loading>
                <slot name="loading">
                    <div class="p-6 text-center">Loading...</div>
                </slot>
            </template>
        </DataTable>
    </div>
</template>
