<script setup lang="ts">
import { Head, useForm } from '@inertiajs/vue3';
import AppLayout from '@/layouts/AppLayout.vue';
import { projectsAdmin } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import Column from 'primevue/column';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import DatePicker from 'primevue/datepicker';
import FileUpload from 'primevue/fileupload';
import BasedDataTable from '@/components/ui/table/BasedDataTable.vue';
import DialogForm from '@/components/admin/DialogForm.vue';
import { useProjectScript } from '@/script/admin/projects';
import Toast from 'primevue/toast';
import ToggleSwitch from 'primevue/toggleswitch';
import Dialog from 'primevue/dialog';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Projects', href: projectsAdmin().url },
];

const props = defineProps({
    projects: Object,
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
    deleteProject,
    handleFile,
} = useProjectScript(props.projects);
</script>

<template>
    <Head />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="p-4">
            <div class="rounded-xl border bg-background p-4 shadow-sm">
                <h2
                    class="m-2 text-xl font-semibold text-primary dark:text-white"
                >
                    Projects Data
                </h2>
                <BasedDataTable
                    :value="projects?.data || []"
                    :totalRecords="projects?.total || 0"
                    :globalFilterFields="globalFields"
                >
                    <template #header="{ filters }">
                        <div class="flex justify-between gap-4">
                            <Button
                                label="New Project"
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
                    <Column field="title" header="Title" sortable />

                    <Column field="description" header="Description" sortable>
                        <template #body="{ data }">
                            <div class="line-clamp-2">
                                {{ data.description ?? '-' }}
                            </div>
                        </template>
                    </Column>
                    <Column
                        field="responsibility"
                        header="Responsibility"
                        sortable
                    >
                        <template #body="{ data }">
                            <div class="line-clamp-2">
                                {{ data.responsibility ?? '-' }}
                            </div>
                        </template>
                    </Column>

                    <Column field="associate" header="Associate" sortable />
                    <Column field="link" header="Link" sortable />

                    <Column header="Tech Stack">
                        <template #body="{ data }">
                            <div class="flex flex-wrap gap-2">
                                <span
                                    v-for="tech in data.tech_list"
                                    :key="tech"
                                    class="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary dark:bg-white/70"
                                >
                                    {{ tech ?? '-' }}
                                </span>
                            </div>
                        </template>
                    </Column>
                    <Column field="status" header="Status">
                        <template #body="{ data }">
                            <ToggleSwitch
                                :modelValue="data.status === 1"
                                @update:modelValue="
                                    (val) => (data.status = val ? 1 : 0)
                                "
                            />
                        </template>
                    </Column>
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
            v-model:visible="visible"
            :title="mode === 'create' ? 'New Project' : 'Edit Project'"
        >
            <form
                @submit.prevent="submit"
                class="grid grid-cols-2 gap-6 md:grid-cols-2"
            >
                <div class="col-span-2 flex flex-col gap-2">
                    <label class="font-semibold">Title</label>
                    <InputText
                        v-model="form.title"
                        size="small"
                        placeholder="Title Project"
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
                        placeholder="Pick a start date"
                    />
                </div>

                <div class="flex flex-col gap-2">
                    <label>End</label>
                    <DatePicker
                        v-model="form.end"
                        showIcon
                        size="small"
                        placeholder="Pick a end date"
                    />
                </div>

                <div class="flex flex-col gap-2 md:col-span-2">
                    <label>Tech Stack</label>
                    <InputText
                        v-model="form.tech"
                        size="small"
                        placeholder="Tech Stack"
                    />
                </div>

                <div class="flex flex-col gap-2 md:col-span-2">
                    <label>Description</label>
                    <Textarea
                        v-model="form.description"
                        rows="2"
                        placeholder="Description"
                        size="small"
                    />
                </div>

                <div class="flex flex-col gap-2 md:col-span-2">
                    <label>Responsibility</label>
                    <Textarea
                        v-model="form.responsibility"
                        rows="2"
                        size="small"
                        placeholder="Responsibility"
                    />
                </div>

                <div class="flex flex-col gap-2 md:col-span-2">
                    <label>Link</label>
                    <InputText
                        v-model="form.link"
                        size="small"
                        placeholder="Link"
                    />
                </div>

                <div class="flex flex-col gap-2 md:col-span-2">
                    <label>Associate</label>
                    <InputText
                        v-model="form.associate"
                        size="small"
                        placeholder="Associate"
                    />
                </div>

                <div class="flex flex-col gap-2 md:col-span-2">
                    <FileUpload
                        mode="advanced"
                        accept="image/*"
                        :maxFileSize="1000000"
                        chooseLabel="Upload Image"
                        cancelLabel="Cancel"
                        cancelIcon="pi pi-times"
                        @select="handleFile"
                        :customUpload="true"
                        :auto="false"
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
        <Dialog v-model:visible="isDelete" header="Delete Project" modal>
            <p>Are you sure you want to delete this project?</p>

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
                    @click="deleteProject"
                />
            </template>
        </Dialog>
    </AppLayout>
</template>
