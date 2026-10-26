import { ref } from 'vue';
import { useCrudResource } from '@/composables/useCrudResource';
import { storageUrl } from '@/lib/utils';

export function useAwardScript(awards: any[]) {
    const crud = useCrudResource({
        entity: 'Award',
        items: () => awards,
        routes: {
            create: 'create-award',
            update: 'update-award',
            delete: 'delete-award',
        },
        initial: {
            title: '',
            description: '',
            type: '' as string | boolean,
            status: null as boolean | null,
            issuer: '',
            photo: null as File | null,
            date: null as Date | null,
        },
        fill: (data) => ({
            title: data.title,
            photo: null,
            type: data.type,
            status: data.status,
            issuer: data.issuer,
            date: data.date ? new Date(data.date) : null,
            description: data.description,
        }),
        transform: (data) => ({
            ...data,
            date: data.date
                ? new Date(data.date).toISOString().split('T')[0]
                : null,
        }),
    });

    const photoModalVisible = ref(false);
    const selectedPhoto = ref<string | null>(null);

    const openPhotoModal = (photo: string | null) => {
        selectedPhoto.value = storageUrl(photo);
        photoModalVisible.value = true;
    };

    const handleFile = (file: File | null) => {
        crud.form.photo = file;
    };

    const toggleStatus = (data: any, val: boolean) => {
        crud.updateStatus('update-status-award', data, val, () => {
            data.status = val;
        });
    };

    return {
        ...crud,
        photoModalVisible,
        selectedPhoto,
        openPhotoModal,
        handleFile,
        toggleStatus,
    };
}
