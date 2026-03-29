<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import logo from '@/assets/img/logo.png';

defineOptions({
    inheritAttrs: false,
});

type Props = {
    className?: HTMLAttributes['class'];
};

defineProps<Props>();
</script>

<template>
    <img :src="logo" alt="logo" />
</template>
