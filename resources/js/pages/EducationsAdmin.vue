<script setup lang="ts">
import Checkbox from 'primevue/checkbox';
import Column from 'primevue/column';
import DatePicker from 'primevue/datepicker';
import InputText from 'primevue/inputtext';
import AdminPage from '@/components/admin/AdminPage.vue';
import DialogForm from '@/components/admin/DialogForm.vue';
import FormField from '@/components/admin/FormField.vue';
import RowActions from '@/components/admin/RowActions.vue';
import BasedDataTable from '@/components/ui/table/BasedDataTable.vue';
import { educationsAdmin } from '@/routes';
import { useEducationScript } from '@/script/admin/educations';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Educations', href: educationsAdmin().url },
];

const props = defineProps<{
    educations: any[];
}>();

const yearOf = (value?: string | null) =>
    value ? new Date(value).getFullYear() : null;

const {
    visible,
    mode,
    form,
    globalFields,
    isPresent,
    openCreate,
    openEdit,
    closeForm,
    submit,
    confirmDelete,
} = useEducationScript(props.educations);
</script>

<template>
    <AdminPage
        title="Educations"
        description="Manage your education history."
        :breadcrumbs="breadcrumbs"
    >
        <BasedDataTable
            :value="educations || []"
            :total-records="educations?.length || 0"
            :global-filter-fields="globalFields"
            create-label="New Education"
            search-placeholder="Search educations…"
            min-width="52rem"
            @create="openCreate"
        >
            <Column field="institution" header="Institution" sortable>
                <template #body="{ data }">
                    <span class="font-semibold text-foreground">{{
                        data.institution
                    }}</span>
                </template>
            </Column>
            <Column field="major" header="Major" sortable />
            <Column field="title" header="Title" sortable />
            <Column field="start" header="Start" sortable>
                <template #body="{ data }">
                    <span class="tabular-nums">{{
                        yearOf(data.start) ?? '-'
                    }}</span>
                </template>
            </Column>
            <Column field="end" header="End" sortable>
                <template #body="{ data }">
                    <span class="tabular-nums">{{
                        yearOf(data.end) ?? 'Present'
                    }}</span>
                </template>
            </Column>
            <Column header="Action" frozen align-frozen="right">
                <template #body="{ data }">
                    <RowActions
                        :name="data.institution"
                        @edit="openEdit(data)"
                        @delete="confirmDelete(data)"
                    />
                </template>
            </Column>
        </BasedDataTable>

        <DialogForm
            v-model:visible="visible"
            :title="mode === 'create' ? 'New Education' : 'Edit Education'"
            :processing="form.processing"
            @submit="submit"
            @cancel="closeForm"
        >
            <FormField
                v-slot="{ id, invalid }"
                id="education-institution"
                label="Institution"
                :error="form.errors.institution"
                required
            >
                <InputText
                    :id="id"
                    v-model="form.institution"
                    :invalid="invalid"
                    placeholder="Institution"
                    required
                />
            </FormField>

            <FormField
                v-slot="{ id, invalid }"
                id="education-major"
                label="Major"
                :error="form.errors.major"
                :full="false"
                required
            >
                <InputText
                    :id="id"
                    v-model="form.major"
                    :invalid="invalid"
                    placeholder="Major"
                    required
                />
            </FormField>

            <FormField
                v-slot="{ id, invalid }"
                id="education-title"
                label="Title"
                :error="form.errors.title"
                :full="false"
                required
            >
                <InputText
                    :id="id"
                    v-model="form.title"
                    :invalid="invalid"
                    placeholder="Title"
                    required
                />
            </FormField>

            <FormField
                v-slot="{ id, invalid }"
                id="education-start"
                label="Start"
                :error="form.errors.start"
                :full="false"
            >
                <DatePicker
                    v-model="form.start"
                    :input-id="id"
                    :invalid="invalid"
                    show-icon
                    view="year"
                    date-format="yy"
                    placeholder="Pick a start year"
                />
            </FormField>

            <FormField
                v-slot="{ id, invalid }"
                id="education-end"
                label="End"
                :error="form.errors.end"
                :full="false"
            >
                <DatePicker
                    v-model="form.end"
                    :input-id="id"
                    :invalid="invalid"
                    :disabled="isPresent"
                    show-icon
                    view="year"
                    date-format="yy"
                    placeholder="Pick an end year"
                />
                <div class="flex items-center gap-2">
                    <Checkbox
                        v-model="isPresent"
                        input-id="education-present"
                        binary
                    />
                    <label for="education-present" class="text-sm">
                        Present
                    </label>
                </div>
            </FormField>
        </DialogForm>
    </AdminPage>
</template>
