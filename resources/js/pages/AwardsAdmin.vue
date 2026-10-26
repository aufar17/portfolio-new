<script setup lang="ts">
import Column from 'primevue/column';
import DatePicker from 'primevue/datepicker';
import InputText from 'primevue/inputtext';
import RadioButton from 'primevue/radiobutton';
import Tag from 'primevue/tag';
import Textarea from 'primevue/textarea';
import ToggleSwitch from 'primevue/toggleswitch';
import AdminPage from '@/components/admin/AdminPage.vue';
import DialogForm from '@/components/admin/DialogForm.vue';
import FormField from '@/components/admin/FormField.vue';
import ImagePreviewDialog from '@/components/admin/ImagePreviewDialog.vue';
import ImageUploadField from '@/components/admin/ImageUploadField.vue';
import RowActions from '@/components/admin/RowActions.vue';
import BasedDataTable from '@/components/ui/table/BasedDataTable.vue';
import { storageUrl } from '@/lib/utils';
import { awardsAdmin } from '@/routes';
import { useAwardScript } from '@/script/admin/awards';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Awards', href: awardsAdmin().url },
];

const props = defineProps<{
    awards: any[];
}>();

const typeOptions = [
    { label: 'Award', value: false },
    { label: 'Certification', value: true },
];

const {
    visible,
    mode,
    selected,
    form,
    globalFields,
    photoModalVisible,
    selectedPhoto,
    openPhotoModal,
    openCreate,
    openEdit,
    closeForm,
    submit,
    confirmDelete,
    handleFile,
    toggleStatus,
} = useAwardScript(props.awards);
</script>

<template>
    <AdminPage
        title="Awards"
        description="Manage awards and certifications."
        :breadcrumbs="breadcrumbs"
    >
        <BasedDataTable
            :value="awards || []"
            :total-records="awards?.length || 0"
            :global-filter-fields="globalFields"
            create-label="New Award"
            search-placeholder="Search awards…"
            min-width="64rem"
            @create="openCreate"
        >
            <Column field="title" header="Title" sortable>
                <template #body="{ data }">
                    <span class="font-semibold text-foreground">{{
                        data.title
                    }}</span>
                </template>
            </Column>
            <Column field="type" header="Type" sortable>
                <template #body="{ data }">
                    <Tag
                        :value="data.type ? 'Certs' : 'Awards'"
                        :severity="data.type ? 'info' : 'secondary'"
                        rounded
                    />
                </template>
            </Column>
            <Column field="description" header="Description" sortable>
                <template #body="{ data }">
                    <p class="line-clamp-2 max-w-xs text-muted-foreground">
                        {{ data.description }}
                    </p>
                </template>
            </Column>
            <Column field="issuer" header="Issuer" sortable />
            <Column field="date_format" header="Date" sortable />
            <Column header="Photo">
                <template #body="{ data }">
                    <button
                        type="button"
                        class="grid size-12 place-items-center overflow-hidden rounded-lg border border-border bg-muted focus-ring"
                        :aria-label="`View photo of ${data.title}`"
                        @click="openPhotoModal(data.photo)"
                    >
                        <img
                            v-if="data.photo"
                            :src="storageUrl(data.photo)!"
                            alt=""
                            class="size-full object-cover"
                        />
                        <i
                            v-else
                            class="pi pi-image text-muted-foreground"
                            aria-hidden="true"
                        />
                    </button>
                </template>
            </Column>
            <Column field="status" header="Status">
                <template #body="{ data }">
                    <ToggleSwitch
                        :model-value="data.status"
                        :aria-label="`Publish ${data.title}`"
                        @update:model-value="(val) => toggleStatus(data, val)"
                    />
                </template>
            </Column>
            <Column header="Action" frozen align-frozen="right">
                <template #body="{ data }">
                    <RowActions
                        :name="data.title"
                        @edit="openEdit(data)"
                        @delete="confirmDelete(data)"
                    />
                </template>
            </Column>
        </BasedDataTable>

        <DialogForm
            v-model:visible="visible"
            :title="mode === 'create' ? 'New Award' : 'Edit Award'"
            :processing="form.processing"
            @submit="submit"
            @cancel="closeForm"
        >
            <FormField
                v-slot="{ id, invalid }"
                id="award-title"
                label="Title"
                :error="form.errors.title"
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

            <fieldset class="flex flex-col gap-2 md:col-span-2">
                <legend class="mb-2 text-sm font-semibold text-foreground">
                    Type
                    <span class="text-destructive" aria-hidden="true">*</span>
                </legend>
                <div class="flex flex-wrap items-center gap-6">
                    <div
                        v-for="option in typeOptions"
                        :key="option.label"
                        class="flex items-center gap-2"
                    >
                        <RadioButton
                            v-model="form.type"
                            :input-id="`award-type-${option.value}`"
                            name="type"
                            :value="option.value"
                            :invalid="!!form.errors.type"
                        />
                        <label
                            :for="`award-type-${option.value}`"
                            class="text-sm"
                        >
                            {{ option.label }}
                        </label>
                    </div>
                </div>
                <p
                    v-if="form.errors.type"
                    class="text-sm font-medium text-destructive"
                    role="alert"
                >
                    {{ form.errors.type }}
                </p>
            </fieldset>

            <FormField
                v-slot="{ id, invalid }"
                id="award-description"
                label="Description"
                :error="form.errors.description"
                required
            >
                <Textarea
                    :id="id"
                    v-model="form.description"
                    :invalid="invalid"
                    rows="3"
                    auto-resize
                    placeholder="Description"
                    required
                />
            </FormField>

            <FormField
                v-slot="{ id, invalid }"
                id="award-issuer"
                label="Issuer"
                :error="form.errors.issuer"
                :full="false"
                required
            >
                <InputText
                    :id="id"
                    v-model="form.issuer"
                    :invalid="invalid"
                    placeholder="Issuer"
                    required
                />
            </FormField>

            <FormField
                v-slot="{ id, invalid }"
                id="award-date"
                label="Date"
                :error="form.errors.date"
                :full="false"
                required
            >
                <DatePicker
                    v-model="form.date"
                    :input-id="id"
                    :invalid="invalid"
                    show-icon
                    placeholder="Date"
                    required
                />
            </FormField>

            <ImageUploadField
                id="award-photo"
                label="Photo"
                :current-src="
                    mode === 'edit' ? storageUrl(selected?.photo) : null
                "
                :error="form.errors.photo"
                @select="handleFile"
            />
        </DialogForm>

        <ImagePreviewDialog
            v-model:visible="photoModalVisible"
            :src="selectedPhoto"
            title="Award photo"
        />
    </AdminPage>
</template>
