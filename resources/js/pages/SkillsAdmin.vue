<script setup lang="ts">
import { Head, useForm } from '@inertiajs/vue3';
import Button from 'primevue/button';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import FileUpload from 'primevue/fileupload';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import RadioButton from 'primevue/radiobutton';
import DialogForm from '@/components/admin/DialogForm.vue';
import BasedDataTable from '@/components/ui/table/BasedDataTable.vue';
import AppLayout from '@/layouts/AppLayout.vue';
import { skillsAdmin } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { useSkillScript } from '@/script/admin/skill';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Skills', href: skillsAdmin().url },
];

const props = defineProps<{
    skills: any[];
}>();

const {
    visible,
    mode,
    isDelete,
    form,
    globalFields,
    handleFile,
    openCreate,
    openEdit,
    openDelete,
    closeDialogForm,
    closeDialogDelete,
    submit,
    deleteSkill,
} = useSkillScript(props.skills);
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
                    :value="skills || []"
                    :totalRecords="skills?.length || 0"
                    :globalFilterFields="globalFields"
                >
                    <template #header="{ filters }">
                        <div class="flex justify-between gap-4">
                            <Button
                                label="New Skill"
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

                    <Column field="type" header="Type" sortable>
                        <template #body="{ data }">
                            <div class="line-clamp-2">
                                {{
                                    data.type == 1 ? 'Hard Skill' : 'Soft Skill'
                                }}
                            </div>
                        </template>
                    </Column>
                    <Column field="icon" header="Icon" sortable>
                        <template #body="{ data }">
                            <img
                                v-if="data.icon"
                                :src="`/storage/${data.icon}`"
                                alt="icon"
                                class="h-10 w-10 object-contain"
                            />
                            <span v-else>-</span>
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
            :title="mode === 'create' ? 'New Skill' : 'Edit Skill'"
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
                        placeholder="Skill Name"
                        required
                    />
                    <small v-if="form.errors.name" class="text-red-500">
                        {{ form.errors.name }}
                    </small>
                </div>
                <div class="col-span-2 flex flex-col gap-3">
                    <label class="font-semibold">Type</label>
                    <div class="flex items-center gap-6">
                        <div
                            v-for="option in [
                                { label: 'Hard Skill', value: 1 },
                                { label: 'Soft Skill', value: 2 },
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
                    <label class="font-semibold">Icon</label>
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
                    <small v-if="form.errors.icon" class="text-red-500">
                        {{ form.errors.icon }}
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
        <Dialog v-model:visible="isDelete" header="Delete Skill" modal>
            <p>Are you sure you want to delete this skill?</p>

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
                    @click="deleteSkill"
                />
            </template>
        </Dialog>
    </AppLayout>
</template>
