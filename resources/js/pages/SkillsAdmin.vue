<script setup lang="ts">
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import RadioButton from 'primevue/radiobutton';
import Tag from 'primevue/tag';
import AdminPage from '@/components/admin/AdminPage.vue';
import DialogForm from '@/components/admin/DialogForm.vue';
import FormField from '@/components/admin/FormField.vue';
import ImageUploadField from '@/components/admin/ImageUploadField.vue';
import RowActions from '@/components/admin/RowActions.vue';
import BasedDataTable from '@/components/ui/table/BasedDataTable.vue';
import { storageUrl } from '@/lib/utils';
import { skillsAdmin } from '@/routes';
import { useSkillScript } from '@/script/admin/skill';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Skills', href: skillsAdmin().url },
];

const props = defineProps<{
    skills: any[];
}>();

const typeOptions = [
    { label: 'Hard Skill', value: 1 },
    { label: 'Soft Skill', value: 2 },
];

const {
    visible,
    mode,
    selected,
    form,
    globalFields,
    openCreate,
    openEdit,
    closeForm,
    submit,
    confirmDelete,
    handleFile,
} = useSkillScript(props.skills);
</script>

<template>
    <AdminPage
        title="Skills"
        description="Manage hard and soft skills."
        :breadcrumbs="breadcrumbs"
    >
        <BasedDataTable
            :value="skills || []"
            :total-records="skills?.length || 0"
            :global-filter-fields="globalFields"
            create-label="New Skill"
            search-placeholder="Search skills…"
            min-width="36rem"
            @create="openCreate"
        >
            <Column header="Icon">
                <template #body="{ data }">
                    <span
                        class="grid size-11 place-items-center rounded-lg border border-border bg-muted p-1.5"
                    >
                        <img
                            v-if="data.icon"
                            :src="storageUrl(data.icon)!"
                            :alt="`${data.name} icon`"
                            class="size-full object-contain"
                        />
                        <span v-else class="text-muted-foreground">-</span>
                    </span>
                </template>
            </Column>
            <Column field="name" header="Name" sortable>
                <template #body="{ data }">
                    <span class="font-semibold text-foreground">{{
                        data.name
                    }}</span>
                </template>
            </Column>
            <Column field="type" header="Type" sortable>
                <template #body="{ data }">
                    <Tag
                        :value="data.type == 1 ? 'Hard Skill' : 'Soft Skill'"
                        :severity="data.type == 1 ? 'info' : 'secondary'"
                        rounded
                    />
                </template>
            </Column>
            <Column header="Action" frozen align-frozen="right">
                <template #body="{ data }">
                    <RowActions
                        :name="data.name"
                        @edit="openEdit(data)"
                        @delete="confirmDelete(data)"
                    />
                </template>
            </Column>
        </BasedDataTable>

        <DialogForm
            v-model:visible="visible"
            :title="mode === 'create' ? 'New Skill' : 'Edit Skill'"
            :processing="form.processing"
            @submit="submit"
            @cancel="closeForm"
        >
            <FormField
                v-slot="{ id, invalid }"
                id="skill-name"
                label="Name"
                :error="form.errors.name"
                required
            >
                <InputText
                    :id="id"
                    v-model="form.name"
                    :invalid="invalid"
                    placeholder="Skill name"
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
                        :key="option.value"
                        class="flex items-center gap-2"
                    >
                        <RadioButton
                            v-model="form.type"
                            :input-id="`skill-type-${option.value}`"
                            name="type"
                            :value="option.value"
                            :invalid="!!form.errors.type"
                        />
                        <label
                            :for="`skill-type-${option.value}`"
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

            <ImageUploadField
                id="skill-icon"
                label="Icon"
                :current-src="
                    mode === 'edit' ? storageUrl(selected?.icon) : null
                "
                :error="form.errors.icon"
                @select="handleFile"
            />
        </DialogForm>
    </AdminPage>
</template>
