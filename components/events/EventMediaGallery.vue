<script setup lang="ts">
const props = defineProps<{
    media: string[]
}>();

const getUrl = (filename: string) => `/events-media/${filename}`;

const getType = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return 'image';
    if (['mp4', 'webm', 'mov'].includes(ext || '')) return 'video';
    return 'file';
};
</script>

<template>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div v-for="(filename, idx) in media" :key="idx" class="border rounded-lg overflow-hidden bg-surface-0 dark:bg-surface-900 group">
            <template v-if="getType(filename) === 'image'">
                <div class="aspect-video relative overflow-hidden">
                    <img 
                        :src="getUrl(filename)" 
                        :alt="filename" 
                        loading="lazy"
                        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                    <a :href="getUrl(filename)" target="_blank" class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <i class="pi pi-search text-white text-2xl drop-shadow-md"></i>
                    </a>
                </div>
            </template>
            
            <template v-else-if="getType(filename) === 'video'">
                <div class="aspect-video bg-black flex items-center justify-center text-white relative group-hover:bg-slate-900 transition-colors">
                    <i class="pi pi-video text-4xl opacity-80"></i>
                    <a :href="getUrl(filename)" target="_blank" class="absolute inset-0 flex items-center justify-center">
                        <span class="sr-only">Play Video</span>
                    </a>
                </div>
            </template>

            <template v-else>
                <a :href="getUrl(filename)" target="_blank" class="aspect-video flex flex-col items-center justify-center bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors text-surface-600 dark:text-surface-300 p-4">
                    <i class="pi pi-file text-4xl mb-2"></i>
                    <span class="text-xs truncate max-w-full px-2">{{ filename }}</span>
                </a>
            </template>
        </div>
    </div>
</template>
