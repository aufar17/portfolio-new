<script setup lang="ts">
import { Head, useForm } from '@inertiajs/vue3';
import AppLayout from '@/layouts/AppLayout.vue';
import { awardsAdmin } from '@/routes';
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
import { useAwardScript } from '@/script/admin/awards';
import Textarea from 'primevue/textarea';
import DatePicker from 'primevue/datepicker';
import RadioButton from 'primevue/radiobutton';
import ToggleSwitch from 'primevue/toggleswitch';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Awards', href: awardsAdmin().url },
];

const props = defineProps({
    awards: Object,
});

const {
    visible,
    photoModalVisible,
    mode,
    selectedPhoto,
    isDelete,
    form,
    globalFields,
    handleFile,
    openCreate,
    openEdit,
    openDelete,
    openPhotoModal,
    closeDialogForm,
    closeDialogDelete,
    submit,
    deleteAward,
    toggleStatus,
} = useAwardScript(props.awards);
</script>

<template>
    <Head />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="p-4">
            <div class="rounded-xl border bg-background p-4 shadow-sm">
                <h2
                    class="m-2 text-xl font-semibold text-primary dark:text-white"
                >
                    Awards Data
                </h2>
                <BasedDataTable
                    :value="awards?.data || []"
                    :totalRecords="awards?.total || 0"
                    :globalFilterFields="globalFields"
                >
                    <template #header="{ filters }">
                        <div class="flex justify-between gap-4">
                            <Button
                                label="New Award"
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
                    <Column field="title" header="Title" sortable>
                        <template> </template
                    ></Column>
                    <Column field="type" header="Type" sortable>
                        <template #body="{ data }">
                            <span
                                class="rounded-full bg-black px-2 py-1 text-xs font-semibold text-white dark:bg-white dark:text-black"
                                >{{
                                    data.type === 1 ? 'Awards' : 'Certs'
                                }}</span
                            >
                        </template>
                    </Column>
                    <Column field="description" header="Description" sortable>
                    </Column>
                    <Column field="issuer" header="Issuer" sortable> </Column>

                    <Column field="date_format" header="Date" sortable>
                    </Column>
                    <Column field="photo" header="Photo" sortable>
                        <template #body="{ data }">
                            <Button
                                @click="openPhotoModal(data.photo)"
                                label="Photo"
                                icon="pi pi-eye"
                                size="small" /></template
                    ></Column>
                    <Column field="status" header="Status">
                        <template #body="{ data }">
                            <ToggleSwitch
                                :modelValue="data.status === 1"
                                @update:modelValue="
                                    (val) => toggleStatus(data, val)
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
            width="40rem"
            v-model:visible="visible"
            :title="mode === 'create' ? 'New Award' : 'Edit Award'"
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
                        placeholder="Title"
                        required
                    />
                    <small v-if="form.errors.title" class="text-red-500">
                        {{ form.errors.title }}
                    </small>
                </div>
                <div class="col-span-2 flex flex-col gap-3">
                    <label class="font-semibold">Type</label>
                    <div class="flex items-center gap-6">
                        <div
                            v-for="option in [
                                { label: 'Award', value: 1 },
                                { label: 'Certification', value: 2 },
                            ]"
                            :key="option.value"
                            class="flex items-center gap-2"
                        >
                            <RadioButton
                                v-model="form.type"
                                :inputId="'type' + option.value"
                                name="type"
                                :value="option.value"
                            />
                            <label :for="'type' + option.value">
                                {{ option.label }}
                            </label>
                        </div>
                    </div>
                    <small v-if="form.errors.type" class="text-red-500">
                        {{ form.errors.type }}
                    </small>
                </div>
                <div class="col-span-2 flex flex-col gap-2">
                    <label class="font-semibold">Description</label>
                    <Textarea
                        v-model="form.description"
                        size="small"
                        rows="2"
                        placeholder="Description"
                        required
                    />
                    <small v-if="form.errors.description" class="text-red-500">
                        {{ form.errors.description }}
                    </small>
                </div>
                <div class="col-span-2 flex flex-col gap-2">
                    <label class="font-semibold">Issuer</label>
                    <InputText
                        v-model="form.issuer"
                        size="small"
                        placeholder="Issuer"
                        required
                    />
                    <small v-if="form.errors.issuer" class="text-red-500">
                        {{ form.errors.issuer }}
                    </small>
                </div>
                <div class="col-span-2 flex flex-col gap-2">
                    <label class="font-semibold">Date</label>
                    <DatePicker
                        v-model="form.date"
                        showIcon
                        size="small"
                        placeholder="Date"
                        required
                    />
                    <small v-if="form.errors.date" class="text-red-500">
                        {{ form.errors.date }}
                    </small>
                </div>

                <div class="col-span-2 flex flex-col gap-2">
                    <label class="font-semibold">Photo</label>
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
                    <small v-if="form.errors.photo" class="text-red-500">
                        {{ form.errors.photo }}
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
                    @click="deleteAward"
                />
            </template>
        </Dialog>
        <Dialog
            v-model:visible="photoModalVisible"
            modal
            :closable="true"
            header="Image"
            contentClass="p-0 bg-transparent shadow-none"
            :pt="{
                mask: { class: 'bg-black/80 backdrop-blur-sm' },
            }"
        >
            <img
                v-if="selectedPhoto"
                :src="`/storage/${selectedPhoto}`"
                alt="image"
                class="block max-h-[70vh] max-w-[70vw] rounded-lg object-contain shadow-2xl"
            />

            <span v-else class="text-white">No image</span>
        </Dialog>
    </AppLayout>
</template>
