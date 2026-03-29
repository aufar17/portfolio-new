<script setup lang="ts">
import { Head, useForm } from '@inertiajs/vue3';
import AppLayout from '@/layouts/AppLayout.vue';
import { educationsAdmin, skillsAdmin } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import Column from 'primevue/column';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import BasedDataTable from '@/components/ui/table/BasedDataTable.vue';
import DialogForm from '@/components/admin/DialogForm.vue';
import Dialog from 'primevue/dialog';
import { useSkillScript } from '@/script/admin/skill';
import RadioButton from 'primevue/radiobutton';
import FileUpload from 'primevue/fileupload';
import { useEducationScript } from '@/script/admin/educations';
import DatePicker from 'primevue/datepicker';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Educations', href: educationsAdmin().url },
];

const props = defineProps({
    educations: Object,
});

const {
    visible,
    mode,
    isDelete,
    form,
    globalFields,
    openCreate,
    openEdit,
    openDelete,
    closeDialogForm,
    closeDialogDelete,
    submit,
    deleteEducation,
} = useEducationScript(props.educations);
</script>

<template>
    <Head />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="p-4">
            <div class="rounded-xl border bg-background p-4 shadow-sm">
                <h2
                    class="m-2 text-xl font-semibold text-primary dark:text-white"
                >
                    Skills Data
                </h2>
                <BasedDataTable
                    :value="educations?.data || []"
                    :totalRecords="educations?.total || 0"
                    :globalFilterFields="globalFields"
                >
                    <template #header="{ filters }">
                        <div class="flex justify-between gap-4">
                            <Button
                                label="New Education"
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
                    <Column field="institution" header="Institution" sortable />
                    <Column field="major" header="Major" sortable />
                    <Column field="title" header="Title" sortable />
                    <Column field="start" header="Start" sortable />
                    <Column field="end" header="End" sortable />

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
            :title="mode === 'create' ? 'New Education' : 'Edit Education'"
        >
            <form
                @submit.prevent="submit"
                class="grid grid-cols-2 gap-6 md:grid-cols-2"
            >
                <div class="col-span-2 flex flex-col gap-2">
                    <label class="font-semibold">Institution</label>
                    <InputText
                        v-model="form.institution"
                        size="small"
                        placeholder="Institution"
                        required
                    />
                    <small v-if="form.errors.institution" class="text-red-500">
                        {{ form.errors.institution }}
                    </small>
                </div>
                <div class="col-span-2 flex flex-col gap-2">
                    <label class="font-semibold">Major</label>
                    <InputText
                        v-model="form.major"
                        size="small"
                        placeholder="Major"
                        required
                    />
                    <small v-if="form.errors.major" class="text-red-500">
                        {{ form.errors.major }}
                    </small>
                </div>
                <div class="col-span-2 flex flex-col gap-2">
                    <label class="font-semibold">Title</label>
                    <InputText
                        v-model="form.title"
                        size="small"
                        placeholder="Title"
                        required
                    />
                    <small v-if="form.errors.title" class="text-red-500">
                        {{ form.errors.title }}
                    </small>
                </div>
                <div class="flex flex-col gap-2">
                    <label>Start</label>
                    <DatePicker
                        v-model="form.start"
                        showIcon
                        size="small"
                        placeholder="Pick a start year"
                        :view="'year'"
                        :yearNavigator="true"
                        :monthNavigator="false"
                        dateFormat="yy"
                    />
                </div>

                <div class="flex flex-col gap-2">
                    <label>End</label>
                    <DatePicker
                        v-model="form.end"
                        showIcon
                        size="small"
                        placeholder="Pick a end year"
                        :view="'year'"
                        :yearNavigator="true"
                        :monthNavigator="false"
                        dateFormat="yy"
                    />
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
        <Dialog v-model:visible="isDelete" header="Delete Education" modal>
            <p>Are you sure you want to delete this education?</p>

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
                    @click="deleteEducation"
                />
            </template>
        </Dialog>
    </AppLayout>
</template>
