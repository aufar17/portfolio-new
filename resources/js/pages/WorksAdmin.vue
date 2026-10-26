<script setup lang="ts">
import Checkbox from 'primevue/checkbox';
import Column from 'primevue/column';
import DatePicker from 'primevue/datepicker';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import AdminPage from '@/components/admin/AdminPage.vue';
import DialogForm from '@/components/admin/DialogForm.vue';
import FormField from '@/components/admin/FormField.vue';
import RowActions from '@/components/admin/RowActions.vue';
import BasedDataTable from '@/components/ui/table/BasedDataTable.vue';
import { worksAdmin } from '@/routes';
import { useWorkScript } from '@/script/admin/works';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Works', href: worksAdmin().url },
];

const props = defineProps<{
    works: any[];
}>();

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
} = useWorkScript(props.works);
</script>

<template>
    <AdminPage
        title="Works"
        description="Manage your work experience."
        :breadcrumbs="breadcrumbs"
    >
        <BasedDataTable
            :value="works || []"
            :total-records="works?.length || 0"
            :global-filter-fields="globalFields"
            create-label="New Work"
            search-placeholder="Search works…"
            min-width="64rem"
            @create="openCreate"
        >
            <Column field="company" header="Company" sortable>
                <template #body="{ data }">
                    <span class="font-semibold text-foreground">{{
                        data.company
                    }}</span>
                </template>
            </Column>
            <Column field="role" header="Role" sortable />
            <Column field="status" header="Status" sortable />
            <Column field="desc" header="Description" sortable>
                <template #body="{ data }">
                    <p class="line-clamp-2 max-w-xs text-muted-foreground">
                        {{ data.desc }}
                    </p>
                </template>
            </Column>
            <Column field="start_month" header="Start" sortable />
            <Column field="end_month" header="End" sortable />
            <Column header="Action" frozen align-frozen="right">
                <template #body="{ data }">
                    <RowActions
                        :name="data.company"
                        @edit="openEdit(data)"
                        @delete="confirmDelete(data)"
                    />
                </template>
            </Column>
        </BasedDataTable>

        <DialogForm
            v-model:visible="visible"
            :title="mode === 'create' ? 'New Work' : 'Edit Work'"
            :processing="form.processing"
            @submit="submit"
            @cancel="closeForm"
        >
            <FormField
                v-slot="{ id, invalid }"
                id="work-company"
                label="Company"
                :error="form.errors.company"
                required
            >
                <InputText
                    :id="id"
                    v-model="form.company"
                    :invalid="invalid"
                    placeholder="Company"
                    required
                />
            </FormField>

            <FormField
                v-slot="{ id, invalid }"
                id="work-role"
                label="Role"
                :error="form.errors.role"
                :full="false"
                required
            >
                <InputText
                    :id="id"
                    v-model="form.role"
                    :invalid="invalid"
                    placeholder="Role"
                    required
                />
            </FormField>

            <FormField
                v-slot="{ id, invalid }"
                id="work-status"
                label="Status"
                :error="form.errors.status"
                :full="false"
                required
            >
                <InputText
                    :id="id"
                    v-model="form.status"
                    :invalid="invalid"
                    placeholder="Full-time, Internship…"
                    required
                />
            </FormField>

            <FormField
                v-slot="{ id, invalid }"
                id="work-desc"
                label="Description"
                :error="form.errors.desc"
                required
            >
                <Textarea
                    :id="id"
                    v-model="form.desc"
                    :invalid="invalid"
                    rows="3"
                    auto-resize
                    placeholder="Description"
                    required
                />
            </FormField>

            <FormField
                v-slot="{ id, invalid }"
                id="work-start"
                label="Start"
                :error="form.errors.start"
                :full="false"
            >
                <DatePicker
                    v-model="form.start"
                    :input-id="id"
                    :invalid="invalid"
                    show-icon
                    view="month"
                    date-format="mm/yy"
                    placeholder="Pick month & year"
                />
            </FormField>

            <FormField
                v-slot="{ id, invalid }"
                id="work-end"
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
                    view="month"
                    date-format="mm/yy"
                    placeholder="Pick month & year"
                />
                <div class="flex items-center gap-2">
                    <Checkbox
                        v-model="isPresent"
                        input-id="work-present"
                        binary
                    />
                    <label for="work-present" class="text-sm">Present</label>
                </div>
            </FormField>
        </DialogForm>
    </AdminPage>
</template>
