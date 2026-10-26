import type { Ref } from 'vue';
import { computed, ref, watch } from 'vue';

/**
 * Client-side search + pagination for listing pages.
 * `fields` returns the searchable strings of an item.
 */
export function useListing<T>(
    items: Ref<T[]>,
    fields: (item: T) => Array<string | null | undefined>,
    perPage = 6,
) {
    const search = ref('');
    const page = ref(1);

    const filtered = computed(() => {
        const keyword = search.value.trim().toLowerCase();

        if (!keyword) {
            return items.value;
        }

        return items.value.filter((item) =>
            fields(item).some((value) =>
                value?.toLowerCase().includes(keyword),
            ),
        );
    });

    const totalPages = computed(() =>
        Math.max(1, Math.ceil(filtered.value.length / perPage)),
    );

    const paginated = computed(() => {
        const start = (page.value - 1) * perPage;

        return filtered.value.slice(start, start + perPage);
    });

    watch(search, () => {
        page.value = 1;
    });

    return { search, page, filtered, totalPages, paginated };
}
