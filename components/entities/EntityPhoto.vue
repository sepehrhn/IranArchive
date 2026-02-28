<script setup lang="ts">
import { computed } from 'vue';
import { getMediaUrl } from '~/utils/mediaUrl';

const props = withDefaults(defineProps<{
    src?: string | string[];
    alt: string;
    aspect?: 'square' | 'portrait' | 'circle';
    size?: 'sm' | 'md' | 'lg';
}>(), {
    aspect: 'square',
    size: 'md'
});

const placeholderSrc = '/placeholder-entity.svg';

const config = useRuntimeConfig();

const photoUrl = computed(() => {
    if (!props.src) return placeholderSrc;

    const rawSrc = Array.isArray(props.src) ? props.src[0] : props.src;

    if (!rawSrc || typeof rawSrc !== 'string') return placeholderSrc;

    // If src is already a full URL, use it
    if (rawSrc.startsWith('http')) return rawSrc;
    // Otherwise, generate GitHub raw URL
    return getMediaUrl({ kind: 'entity_photo', relativePath: rawSrc }, config);
});

const aspectClass = computed(() => {
    switch (props.aspect) {
        case 'circle': return 'aspect-square rounded-full';
        case 'portrait': return 'aspect-[4/5] rounded-lg';
        default: return 'aspect-square rounded-lg';
    }
});

const sizeClass = computed(() => {
    switch (props.size) {
        case 'sm': return 'w-12';
        case 'lg': return 'w-full max-w-xs';
        default: return 'w-20';
    }
});

const handleError = (e: Event) => {
    const img = e.target as HTMLImageElement;
    img.src = placeholderSrc;
};
</script>

<template>
    <div :class="['relative overflow-hidden bg-surface-100 dark:bg-surface-800 flex-shrink-0', aspectClass, sizeClass]">
        <img
            v-if="photoUrl !== placeholderSrc"
            :src="photoUrl"
            :alt="alt"
            loading="lazy"
            class="w-full h-full object-cover transition-opacity duration-300"
            @error="handleError"
        />
        <div v-else class="w-full h-full flex items-center justify-center">
            <i class="pi pi-user text-surface-300 dark:text-surface-600" :class="size === 'sm' ? 'text-lg' : 'text-3xl'"></i>
        </div>
    </div>
</template>
