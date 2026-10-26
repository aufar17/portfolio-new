<script setup lang="ts">
/** Glass card listing label/value pairs in the detail sidebar. */
defineProps<{
    items: { label: string; value?: string | null }[];
}>();
</script>

<template>
    <dl class="divide-y divide-border rounded-xl surface-glass px-5 sm:px-6">
        <div
            v-for="item in items"
            :key="item.label"
            class="py-4 first:pt-5 last:pb-5"
        >
            <dt
                class="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
            >
                {{ item.label }}
            </dt>
            <dd
                class="mt-1 text-[0.9375rem] leading-relaxed text-foreground"
                :class="
                    (item.value?.length ?? 0) > 60
                        ? 'font-medium'
                        : 'font-semibold'
                "
            >
                {{ item.value || '—' }}
            </dd>
        </div>
        <slot />
    </dl>
</template>
