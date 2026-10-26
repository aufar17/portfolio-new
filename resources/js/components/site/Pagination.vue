<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

const props = defineProps<{
    page: number;
    totalPages: number;
}>();

const emit = defineEmits<{ change: [page: number] }>();

const go = (page: number) => {
    if (page >= 1 && page <= props.totalPages && page !== props.page) {
        emit('change', page);
    }
};

const base =
    'grid h-10 min-w-10 place-items-center rounded-lg px-3 text-sm font-semibold transition-all duration-300 ease-out-expo focus-ring disabled:pointer-events-none disabled:opacity-40';
</script>

<template>
    <nav
        v-if="totalPages > 1"
        aria-label="Pagination"
        class="mt-12 flex flex-wrap items-center justify-center gap-2"
    >
        <button
            type="button"
            :class="[base, 'gap-1 surface-glass hover:text-primary-strong']"
            :disabled="page === 1"
            @click="go(page - 1)"
        >
            <span class="flex items-center gap-1">
                <ChevronLeft class="size-4" aria-hidden="true" />
                <span class="hidden sm:inline">Previous</span>
                <span class="sr-only sm:hidden">Previous page</span>
            </span>
        </button>

        <button
            v-for="n in totalPages"
            :key="n"
            type="button"
            :class="[
                base,
                n === page
                    ? 'bg-primary text-primary-foreground shadow-glow'
                    : 'surface-glass text-muted-foreground hover:text-foreground',
            ]"
            :aria-current="n === page ? 'page' : undefined"
            :aria-label="`Page ${n}`"
            @click="go(n)"
        >
            {{ n }}
        </button>

        <button
            type="button"
            :class="[base, 'gap-1 surface-glass hover:text-primary-strong']"
            :disabled="page === totalPages"
            @click="go(page + 1)"
        >
            <span class="flex items-center gap-1">
                <span class="hidden sm:inline">Next</span>
                <span class="sr-only sm:hidden">Next page</span>
                <ChevronRight class="size-4" aria-hidden="true" />
            </span>
        </button>
    </nav>
</template>
