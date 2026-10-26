import { ref } from 'vue';
import { useCrudResource } from '@/composables/useCrudResource';
import { storageUrl } from '@/lib/utils';

const toDateString = (value: Date | string | null) =>
    value ? new Date(value).toISOString().split('T')[0] : null;

export function useProjectScript(projects: any[]) {
    const crud = useCrudResource({
        entity: 'Project',
        items: () => projects,
        routes: {
            create: 'create-project',
            update: 'update-project',
            delete: 'delete-project',
        },
        initial: {
            title: '',
            description: '',
            responsibility: '',
            start: null as Date | null,
            end: null as Date | null,
            status: null as string | null,
            tech: '',
            link: '',
            associate: '',
            image: null as File | null,
        },
        fill: (data) => ({
            title: data.title,
            description: data.description,
            responsibility: data.responsibility,
            start: data.start ? new Date(data.start) : null,
            end: data.end ? new Date(data.end) : null,
            tech: data.tech,
            link: data.link,
            associate: data.associate,
            image: null,
        }),
        transform: (data) => ({
            ...data,
            start: toDateString(data.start),
            end: toDateString(data.end),
        }),
    });

    const techModalVisible = ref(false);
    const imageModalVisible = ref(false);
    const selectedTech = ref<string[]>([]);
    const selectedImage = ref<string | null>(null);

    const openTechModal = (tech: string[]) => {
        selectedTech.value = tech || [];
        techModalVisible.value = true;
    };

    const openImageModal = (image: string | null) => {
        selectedImage.value = storageUrl(image);
        imageModalVisible.value = true;
    };

    const handleFile = (file: File | null) => {
        crud.form.image = file;
    };

    const toggleStatus = (data: any, val: boolean) => {
        const newStatus = val ? 1 : 0;
        crud.updateStatus('update-status-project', data, newStatus, () => {
            data.status = newStatus;
        });
    };

    return {
        ...crud,
        techModalVisible,
        imageModalVisible,
        selectedTech,
        selectedImage,
        openTechModal,
        openImageModal,
        handleFile,
        toggleStatus,
    };
}
