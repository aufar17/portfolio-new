<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DatePicker from 'primevue/datepicker';
import Dialog from 'primevue/dialog';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import DialogForm from '@/components/admin/DialogForm.vue';
import BasedDataTable from '@/components/ui/table/BasedDataTable.vue';
import AppLayout from '@/layouts/AppLayout.vue';
import { worksAdmin } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { useWorkScript } from '@/script/admin/works';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Work', href: worksAdmin().url },
];

const props = defineProps({
    works: Object,
});

const {
    visible,
    mode,
    isDelete,
    form,
    isPresent,
    globalFields,
    openCreate,
    openEdit,
    openDelete,
    closeDialogForm,
    closeDialogDelete,
    submit,
    deleteWork,
} = useWorkScript(props.works);
</script>

<template>
    <Head />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="p-4">
            <div class="rounded-xl border bg-background p-4 shadow-sm">
                <h2
                    class="m-2 text-xl font-semibold text-primary dark:text-white"
                >
                    Works Data
                </h2>
                <BasedDataTable
                    :value="works?.data || []"
                    :totalRecords="works?.total || 0"
                    :globalFilterFields="globalFields"
                >
                    <template #header="{ filters }">
                        <div class="flex justify-between gap-4">
                            <Button
                                label="New Work"
                                raised
                                icon="pi pi-plus"
                                size="small"
                                @click="openCreate"
                            />

                            <IconField class="w-72">
                                <InputIcon>
                                    <i class="pi pi-search" />
                                </InputIcon>
                                <InputText
                                    v-model="filters.global.value"
                                    placeholder="Search"
                                    class="p-inputtext-sm"
                                />
                            </IconField>
                        </div>
                    </template>

                    <Column header="No." sortable>
                        <template #body="{ index }">
                            {{ index + 1 }}
                        </template>
                    </Column>
                    <Column field="company" header="Company" sortable />
                    <Column field="role" header="Role" sortable />
                    <Column field="status" header="Status" sortable />
                    <Column field="desc" header="Description" sortable />
                    <Column field="start_month" header="Start" sortable />
                    <Column field="end_month" header="End" sortable />

                    <Column header="Action">
                        <template #body="{ data }">
                            <div class="flex">
                                <Button
                                    severity="warn"
                                    icon="pi pi-pen-to-square"
                                    raised
                                    size="small"
                                    class="mr-2"
                                    @click="openEdit(data)"
                                />
                                <Button
                                    severity="danger"
                                    raised
                                    icon="pi pi-trash"
                                    size="small"
                                    class="mr-2"
                                    @click="openDelete(data)"
                                />
                            </div>
                        </template>
                    </Column>
                </BasedDataTable>
            </div>
        </div>

        <DialogForm
            maximizable
            width="40rem"
            v-model:visible="visible"
            :title="mode === 'create' ? 'New Work' : 'Edit Work'"
        >
            <form
                @submit.prevent="submit"
                class="grid grid-cols-2 gap-6 md:grid-cols-2"
            >
                <div class="col-span-2 flex flex-col gap-2">
                    <label class="font-semibold">Company</label>
                    <InputText
                        v-model="form.company"
                        size="small"
                        placeholder="Company"
                        required
                    />
                    <small v-if="form.errors.company" class="text-red-500">
                        {{ form.errors.company }}
                    </small>
                </div>
                <div class="col-span-2 flex flex-col gap-2">
                    <label class="font-semibold">Role</label>
                    <InputText
                        v-model="form.role"
                        size="small"
                        placeholder="Role"
                        required
                    />
                    <small v-if="form.errors.role" class="text-red-500">
                        {{ form.errors.role }}
                    </small>
                </div>
                <div class="col-span-2 flex flex-col gap-2">
                    <label class="font-semibold">Status</label>
                    <InputText
                        v-model="form.status"
                        size="small"
                        placeholder="Status"
                        required
                    />
                    <small v-if="form.errors.status" class="text-red-500">
                        {{ form.errors.status }}
                    </small>
                </div>
                <div class="col-span-2 flex flex-col gap-2">
                    <label class="font-semibold">Description</label>
                    <Textarea
                        v-model="form.desc"
                        size="small"
                        placeholder="Description"
                        required
                        rows="2"
                    />
                    <small v-if="form.errors.desc" class="text-red-500">
                        {{ form.errors.desc }}
                    </small>
                </div>
                <div class="flex flex-col gap-2">
                    <label>Start</label>
                    <DatePicker
                        v-model="form.start"
                        showIcon
                        size="small"
                        placeholder="Pick month & year"
                        view="month"
                        dateFormat="mm/yy"
                    />
                </div>

                <div class="flex flex-col gap-2">
                    <label>End</label>

                    <DatePicker
                        v-model="form.end"
                        :disabled="isPresent"
                        showIcon
                        size="small"
                        placeholder="Pick month & year"
                        view="month"
                        dateFormat="mm/yy"
                    />

                    <label class="mt-2 flex items-center gap-2 text-sm">
                        <input type="checkbox" v-model="isPresent" />
                        Present
                    </label>
                </div>

                <div class="flex justify-end gap-3 md:col-span-2">
                    <Button
                        label="Cancel"
                        severity="secondary"
                        @click="closeDialogForm"
                    />
                    <Button
                        type="submit"
                        label="Save"
                        severity="success"
                        :loading="form.processing"
                        :disabled="form.processing"
                        class="!font-bold"
                    />
                </div>
            </form>
        </DialogForm>
        <Dialog v-model:visible="isDelete" header="Delete Work" modal>
            <p>Are you sure you want to delete this work?</p>

            <template #footer>
                <Button
                    label="Cancel"
                    severity="secondary"
                    @click="closeDialogDelete"
                />
                <Button
                    icon="pi pi-trash"
                    :loading="form.processing"
                    :disabled="form.processing"
                    label="Delete"
                    severity="danger"
                    @click="deleteWork"
                />
            </template>
        </Dialog>
    </AppLayout>
</template>
