<script setup lang="ts">
import { Head, useForm } from '@inertiajs/vue3';
import AppLayout from '@/layouts/AppLayout.vue';
import { socialAdmin } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import Column from 'primevue/column';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import BasedDataTable from '@/components/ui/table/BasedDataTable.vue';
import DialogForm from '@/components/admin/DialogForm.vue';
import Dialog from 'primevue/dialog';
import FileUpload from 'primevue/fileupload';
import Textarea from 'primevue/textarea';
import DatePicker from 'primevue/datepicker';
import { useSocialScript } from '@/script/admin/socialMedia';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Social Media', href: socialAdmin().url },
];

const props = defineProps({
    social: Object,
});

const {
    visible,
    mode,
    isDelete,
    globalFields,
    form,
    openCreate,
    openEdit,
    openDelete,
    closeDialogForm,
    closeDialogDelete,
    submit,
    deleteSocial,
} = useSocialScript(props.social);
</script>

<template>
    <Head />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="p-4">
            <div class="rounded-xl border bg-background p-4 shadow-sm">
                <h2
                    class="m-2 text-xl font-semibold text-primary dark:text-white"
                >
                    Social Media Data
                </h2>
                <BasedDataTable
                    :value="social?.data || []"
                    :totalRecords="social?.total || 0"
                    :globalFilterFields="globalFields"
                >
                    <template #header="{ filters }">
                        <div class="flex justify-between gap-4">
                            <Button
                                label="New Social Media"
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
                    <Column field="name" header="Name" sortable />

                    <Column field="link" header="Link" sortable> </Column>
                    <Column field="icon" header="Icon" sortable>
                        <template #body="{ data }">
                            <img
                                :src="data.icon"
                                alt="No icon"
                                class="h-8 w-8 object-contain"
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
            width="40rem"
            v-model:visible="visible"
            :title="
                mode === 'create' ? 'New Social Media' : 'Edit Social Media'
            "
        >
            <form
                @submit.prevent="submit"
                class="grid grid-cols-2 gap-6 md:grid-cols-2"
            >
                <div class="col-span-2 flex flex-col gap-2">
                    <label class="font-semibold">Name</label>
                    <InputText
                        v-model="form.name"
                        size="small"
                        placeholder="Name"
                        required
                    />
                    <small v-if="form.errors.name" class="text-red-500">
                        {{ form.errors.name }}
                    </small>
                </div>
                <div class="col-span-2 flex flex-col gap-2">
                    <label class="font-semibold">Link</label>
                    <Textarea
                        v-model="form.link"
                        size="small"
                        rows="2"
                        placeholder="Link"
                        required
                    />
                    <small v-if="form.errors.link" class="text-red-500">
                        {{ form.errors.link }}
                    </small>
                </div>
                <div class="col-span-2 flex flex-col gap-2">
                    <label class="font-semibold">Icon</label>
                    <InputText
                        v-model="form.icon"
                        size="small"
                        placeholder="Icon"
                        required
                    />
                    <small v-if="form.errors.icon" class="text-red-500">
                        {{ form.errors.icon }}
                    </small>
                </div>
                <div class="col-span-2 flex flex-col gap-2">
                    <label class="font-semibold">Color</label>
                    <InputText
                        v-model="form.color"
                        size="small"
                        placeholder="Color"
                        required
                    />
                    <small v-if="form.errors.color" class="text-red-500">
                        {{ form.errors.color }}
                    </small>
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
        <Dialog v-model:visible="isDelete" header="Delete Award" modal>
            <p>Are you sure you want to delete this award?</p>

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
                    @click="deleteSocial"
                />
            </template>
        </Dialog>
    </AppLayout>
</template>
