<script setup lang="ts">
import Button from 'primevue/button';
import Column from 'primevue/column';
import DatePicker from 'primevue/datepicker';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
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
import { projectsAdmin } from '@/routes';
import { useProjectScript } from '@/script/admin/projects';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Projects', href: projectsAdmin().url },
];

const props = defineProps<{
    projects: any[];
}>();

const {
    visible,
    mode,
    selected,
    form,
    globalFields,
    techModalVisible,
    imageModalVisible,
    selectedTech,
    selectedImage,
    openTechModal,
    openImageModal,
    openCreate,
    openEdit,
    closeForm,
    submit,
    confirmDelete,
    handleFile,
    toggleStatus,
} = useProjectScript(props.projects);
</script>

<template>
    <AdminPage
        title="Projects"
        description="Manage the projects shown on your portfolio."
        :breadcrumbs="breadcrumbs"
    >
        <BasedDataTable
            :value="projects || []"
            :total-records="projects?.length || 0"
            :global-filter-fields="globalFields"
            create-label="New Project"
            search-placeholder="Search projects…"
            min-width="72rem"
            @create="openCreate"
        >
            <Column field="title" header="Title" sortable>
                <template #body="{ data }">
                    <span class="font-semibold text-foreground">{{
                        data.title
                    }}</span>
                </template>
            </Column>
            <Column field="description" header="Description" sortable>
                <template #body="{ data }">
                    <p class="line-clamp-2 max-w-xs text-muted-foreground">
                        {{ data.description ?? '-' }}
                    </p>
                </template>
            </Column>
            <Column field="responsibility" header="Responsibility" sortable>
                <template #body="{ data }">
                    <p class="line-clamp-2 max-w-xs text-muted-foreground">
                        {{ data.responsibility ?? '-' }}
                    </p>
                </template>
            </Column>
            <Column field="associate" header="Associate" sortable />
            <Column field="link" header="Link" sortable>
                <template #body="{ data }">
                    <a
                        v-if="data.link"
                        :href="data.link"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="block max-w-[12rem] truncate font-medium text-primary-strong hover:underline"
                    >
                        {{ data.link }}
                    </a>
                    <span v-else class="text-muted-foreground">-</span>
                </template>
            </Column>
            <Column header="Tech Stack">
                <template #body="{ data }">
                    <Button
                        label="View"
                        icon="pi pi-tags"
                        size="small"
                        severity="secondary"
                        outlined
                        :aria-label="`View tech stack of ${data.title}`"
                        @click="openTechModal(data.tech_list)"
                    />
                </template>
            </Column>
            <Column header="Image">
                <template #body="{ data }">
                    <button
                        type="button"
                        class="block size-12 overflow-hidden rounded-lg border border-border bg-muted focus-ring"
                        :aria-label="`View image of ${data.title}`"
                        @click="openImageModal(data.image)"
                    >
                        <img
                            v-if="data.image"
                            :src="storageUrl(data.image)!"
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
                        :model-value="data.status === 1"
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
            :title="mode === 'create' ? 'New Project' : 'Edit Project'"
            width="48rem"
            :processing="form.processing"
            @submit="submit"
            @cancel="closeForm"
        >
            <FormField
                v-slot="{ id, invalid }"
                id="project-title"
                label="Title"
                :error="form.errors.title"
                required
            >
                <InputText
                    :id="id"
                    v-model="form.title"
                    :invalid="invalid"
                    placeholder="Project title"
                    required
                />
            </FormField>

            <FormField
                v-slot="{ id, invalid }"
                id="project-start"
                label="Start"
                :error="form.errors.start"
                :full="false"
            >
                <DatePicker
                    v-model="form.start"
                    :input-id="id"
                    :invalid="invalid"
                    show-icon
                    placeholder="Pick a start date"
                />
            </FormField>

            <FormField
                v-slot="{ id, invalid }"
                id="project-end"
                label="End"
                :error="form.errors.end"
                :full="false"
            >
                <DatePicker
                    v-model="form.end"
                    :input-id="id"
                    :invalid="invalid"
                    show-icon
                    placeholder="Pick an end date"
                />
            </FormField>

            <FormField
                v-slot="{ id, invalid }"
                id="project-tech"
                label="Tech Stack"
                hint="Separate each technology with a comma."
                :error="form.errors.tech"
            >
                <InputText
                    :id="id"
                    v-model="form.tech"
                    :invalid="invalid"
                    placeholder="Laravel, Vue, Tailwind"
                />
            </FormField>

            <FormField
                v-slot="{ id, invalid }"
                id="project-description"
                label="Description"
                :error="form.errors.description"
            >
                <Textarea
                    :id="id"
                    v-model="form.description"
                    :invalid="invalid"
                    rows="3"
                    auto-resize
                    placeholder="What is this project about?"
                />
            </FormField>

            <FormField
                v-slot="{ id, invalid }"
                id="project-responsibility"
                label="Responsibility"
                :error="form.errors.responsibility"
            >
                <Textarea
                    :id="id"
                    v-model="form.responsibility"
                    :invalid="invalid"
                    rows="2"
                    auto-resize
                    placeholder="Your role in the project"
                />
            </FormField>

            <FormField
                v-slot="{ id, invalid }"
                id="project-link"
                label="Link"
                :error="form.errors.link"
                :full="false"
            >
                <InputText
                    :id="id"
                    v-model="form.link"
                    :invalid="invalid"
                    type="url"
                    placeholder="https://github.com/…"
                />
            </FormField>

            <FormField
                v-slot="{ id, invalid }"
                id="project-associate"
                label="Associate"
                :error="form.errors.associate"
                :full="false"
            >
                <InputText
                    :id="id"
                    v-model="form.associate"
                    :invalid="invalid"
                    placeholder="Company or organisation"
                />
            </FormField>

            <ImageUploadField
                id="project-image"
                label="Image"
                :current-src="
                    mode === 'edit' ? storageUrl(selected?.image) : null
                "
                :error="form.errors.image"
                @select="handleFile"
            />
        </DialogForm>

        <Dialog
            v-model:visible="techModalVisible"
            header="Tech Stack"
            modal
            dismissable-mask
            :style="{ width: '28rem' }"
            :breakpoints="{ '640px': '95vw' }"
        >
            <ul v-if="selectedTech.length" class="flex flex-wrap gap-2">
                <li
                    v-for="tech in selectedTech"
                    :key="tech"
                    class="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary-strong"
                >
                    {{ tech }}
                </li>
            </ul>
            <p v-else class="text-sm text-muted-foreground">No tech stack</p>
        </Dialog>

        <ImagePreviewDialog
            v-model:visible="imageModalVisible"
            :src="selectedImage"
            title="Project image"
        />
    </AdminPage>
</template>
