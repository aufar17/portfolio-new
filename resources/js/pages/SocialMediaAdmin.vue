<script setup lang="ts">
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import AdminPage from '@/components/admin/AdminPage.vue';
import DialogForm from '@/components/admin/DialogForm.vue';
import FormField from '@/components/admin/FormField.vue';
import RowActions from '@/components/admin/RowActions.vue';
import BasedDataTable from '@/components/ui/table/BasedDataTable.vue';
import { socialAdmin } from '@/routes';
import { useSocialScript } from '@/script/admin/socialMedia';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Social Media', href: socialAdmin().url },
];

const props = defineProps<{
    social: any[];
}>();

const {
    visible,
    mode,
    form,
    globalFields,
    openCreate,
    openEdit,
    closeForm,
    submit,
    confirmDelete,
} = useSocialScript(props.social);
</script>

<template>
    <AdminPage
        title="Social Media"
        description="Manage the contact links shown in the contact modal."
        :breadcrumbs="breadcrumbs"
    >
        <BasedDataTable
            :value="social || []"
            :total-records="social?.length || 0"
            :global-filter-fields="globalFields"
            create-label="New Social Media"
            search-placeholder="Search social media…"
            min-width="40rem"
            @create="openCreate"
        >
            <Column header="Icon">
                <template #body="{ data }">
                    <span
                        class="grid size-10 place-items-center rounded-lg border border-border bg-muted p-1.5"
                        :style="{ boxShadow: `inset 0 -2px 0 ${data.color}` }"
                    >
                        <img
                            :src="data.icon"
                            :alt="`${data.name} icon`"
                            class="size-full object-contain"
                        />
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
            <Column field="link" header="Link" sortable>
                <template #body="{ data }">
                    <a
                        :href="data.link"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="block max-w-[18rem] truncate font-medium text-primary-strong hover:underline"
                    >
                        {{ data.link }}
                    </a>
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
            :title="
                mode === 'create' ? 'New Social Media' : 'Edit Social Media'
            "
            :processing="form.processing"
            @submit="submit"
            @cancel="closeForm"
        >
            <FormField
                v-slot="{ id, invalid }"
                id="social-name"
                label="Name"
                :error="form.errors.name"
                required
            >
                <InputText
                    :id="id"
                    v-model="form.name"
                    :invalid="invalid"
                    placeholder="LinkedIn"
                    required
                />
            </FormField>

            <FormField
                v-slot="{ id, invalid }"
                id="social-link"
                label="Link"
                :error="form.errors.link"
                required
            >
                <Textarea
                    :id="id"
                    v-model="form.link"
                    :invalid="invalid"
                    rows="2"
                    auto-resize
                    placeholder="https://…"
                    required
                />
            </FormField>

            <FormField
                v-slot="{ id, invalid }"
                id="social-icon"
                label="Icon URL"
                :error="form.errors.icon"
                required
            >
                <div class="flex items-center gap-3">
                    <span
                        class="grid size-10 shrink-0 place-items-center rounded-lg border border-border bg-muted p-1.5"
                    >
                        <img
                            v-if="form.icon"
                            :src="form.icon"
                            alt="Icon preview"
                            class="size-full object-contain"
                        />
                        <i
                            v-else
                            class="pi pi-image text-muted-foreground"
                            aria-hidden="true"
                        />
                    </span>
                    <InputText
                        :id="id"
                        v-model="form.icon"
                        :invalid="invalid"
                        placeholder="https://…/icon.png"
                        class="flex-1"
                        required
                    />
                </div>
            </FormField>

            <FormField
                v-slot="{ id, invalid }"
                id="social-color"
                label="Color"
                hint="Hex color used for the hover glow, e.g. #0A66C2."
                :error="form.errors.color"
                required
            >
                <div class="flex items-center gap-3">
                    <input
                        v-model="form.color"
                        type="color"
                        class="size-10 shrink-0 cursor-pointer rounded-lg border border-border bg-transparent p-1"
                        aria-label="Pick color"
                    />
                    <InputText
                        :id="id"
                        v-model="form.color"
                        :invalid="invalid"
                        placeholder="#0A66C2"
                        class="flex-1"
                        required
                    />
                </div>
            </FormField>
        </DialogForm>
    </AdminPage>
</template>
