<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
    src?: string;
    alt: string;
    aspect?: 'square' | 'portrait';
    size?: 'sm' | 'md' | 'lg';
}>(), {
    aspect: 'portrait',
    size: 'md'
});

const placeholderSrc = '/images/victims/placeholder.png';

const aspectRatioClass = computed(() => {
    return props.aspect === 'square' ? 'aspect-square' : 'aspect-[4/5]';
});

const sizeClass = computed(() => {
    switch (props.size) {
        case 'sm': return 'w-16';
        case 'lg': return 'w-full max-w-md';
        case 'md':
        default: return 'w-full';
    }
});

const handleError = (e: Event) => {
    const img = e.target as HTMLImageElement;
    img.src = placeholderSrc;
};
</script>

<template>
    <div :class="['relative overflow-hidden rounded-lg bg-surface-100 dark:bg-surface-800', aspectRatioClass, sizeClass]">
        <img 
            :src="src || placeholderSrc" 
            :alt="alt"
            loading="lazy"
            class="w-full h-full object-cover transition-opacity duration-300"
            @error="handleError"
        />
    </div>
</template>
