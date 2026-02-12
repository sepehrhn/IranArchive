<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Asset } from '~/types/asset'

interface DownloadOptions {
    format: 'jpg' | 'png' | 'pdf'
    paperSize: 'original' | 'A4' | 'A3' | 'A2' | 'Letter' | 'Tabloid'
    paperRotation: 'portrait' | 'landscape'
    colorMode: 'full' | 'grayscale' | 'bw' | 'inkSaver'
    quality: number
}

const props = defineProps<{
    asset: Asset | null
    visible: boolean
}>()

const emit = defineEmits<{
    'update:visible': [value: boolean]
    'download': [options: DownloadOptions]
}>()

// Download settings
const selectedFormat = ref<DownloadOptions['format']>('jpg')
const selectedPaperSize = ref<DownloadOptions['paperSize']>('original')
const selectedPaperRotation = ref<DownloadOptions['paperRotation']>('portrait')
const selectedColorMode = ref<DownloadOptions['colorMode']>('full')

// Preview controls
const previewZoom = ref(1)
const previewRotation = ref(0)
const showCopiedTooltip = ref(false)

const assetPreviewUrl = computed(() => {
    if (!props.asset) return ''
    // Use generated JPG for PDF preview
    if (props.asset.file.toLowerCase().endsWith('.pdf')) {
        return `/media/asset/${props.asset.file.replace(/\.pdf$/i, '.jpg')}`
    }
    return `/media/asset/${props.asset.file}`
})

const isPDF = computed(() => props.asset?.format === 'PDF')

const previewFilter = computed(() => {
    switch (selectedColorMode.value) {
        case 'grayscale': return 'grayscale(100%)'
        case 'bw': return 'grayscale(100%) contrast(200%)'
        case 'inkSaver': return 'grayscale(100%) brightness(1.3) contrast(0.8)'
        default: return 'none'
    }
})

const previewOpacity = computed(() => 1)

const previewTransform = computed(() => {
    return `scale(${previewZoom.value}) rotate(${previewRotation.value}deg)`
})

// Preview orientation styles - visually reflect portrait/landscape choice
const orientationStyles = computed(() => {
    if (!showPaperOptions.value) return {}
    if (selectedPaperRotation.value === 'landscape') {
        return { maxWidth: '100%', maxHeight: '280px', aspectRatio: '1.414 / 1' }
    }
    return { maxWidth: '280px', maxHeight: '400px', aspectRatio: '1 / 1.414' }
})

const showPaperOptions = computed(() => selectedFormat.value === 'pdf')

const formatOptions = [
    { value: 'jpg', label: 'JPEG', icon: 'pi-image' },
    { value: 'png', label: 'PNG', icon: 'pi-image' },
    { value: 'pdf', label: 'PDF', icon: 'pi-file-pdf' },
]

const colorModeOptions = [
    { value: 'full', label: 'Full Color', icon: 'pi-palette' },
    { value: 'grayscale', label: 'Grayscale', icon: 'pi-circle' },
    { value: 'bw', label: 'High Contrast', icon: 'pi-circle-fill' },
    { value: 'inkSaver', label: 'Ink Saver', icon: 'pi-droplet' }
]

const closeModal = () => {
    emit('update:visible', false)
    resetPreview()
}

const handleDownload = () => {
    emit('download', {
        format: selectedFormat.value,
        paperSize: selectedPaperSize.value,
        paperRotation: selectedPaperRotation.value,
        colorMode: selectedColorMode.value,
        quality: 100
    })
}

const zoomIn = () => { previewZoom.value = Math.min(previewZoom.value + 0.25, 3) }
const zoomOut = () => { previewZoom.value = Math.max(previewZoom.value - 0.25, 0.5) }
const rotatePreview = () => { previewRotation.value = (previewRotation.value + 90) % 360 }
const resetPreview = () => { previewZoom.value = 1; previewRotation.value = 0 }

const copyAssetLink = async () => {
    if (!props.asset) return
    const link = `${window.location.origin}/assets?asset=${props.asset.id}`
    await navigator.clipboard.writeText(link)
    showCopiedTooltip.value = true
    setTimeout(() => { showCopiedTooltip.value = false }, 2000)
}
</script>

<template>
    <Dialog 
        :visible="visible" 
        @update:visible="closeModal"
        modal 
        :dismissableMask="true"
        :style="{ width: '90vw', maxWidth: '1100px' }"
        :draggable="false"
        class="asset-modal"
    >
        <!-- Custom Header -->
        <template #header>
            <div class="flex items-center justify-between w-full pr-2">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
                        <i class="pi pi-image text-primary-500"></i>
                    </div>
                    <div>
                        <h2 class="text-lg font-bold text-surface-900 dark:text-surface-0 leading-tight">{{ asset?.id || 'Asset' }}</h2>
                        <div class="flex items-center gap-2 mt-0.5">

                        </div>
                    </div>
                </div>
                <button 
                    @click="copyAssetLink"
                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                    :class="showCopiedTooltip 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900/30 dark:hover:text-primary-400'"
                >
                    <i :class="showCopiedTooltip ? 'pi pi-check' : 'pi pi-link'" class="text-xs"></i>
                    {{ showCopiedTooltip ? 'Copied!' : 'Copy Link' }}
                </button>
            </div>
        </template>

        <div v-if="asset" class="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
            <!-- LEFT: Preview Section -->
            <div class="flex flex-col gap-3">
                <!-- Preview Canvas -->
                <div class="relative bg-surface-50 dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden">
                    <div class="flex items-center justify-center p-6 min-h-[420px]">
                        <div class="transition-all duration-500 ease-out overflow-hidden rounded-lg shadow-sm"
                            :style="{ filter: previewFilter, opacity: previewOpacity, transform: previewTransform, ...orientationStyles }">
                            <img 
                                :src="assetPreviewUrl" 
                                :alt="asset.id"
                                class="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    <!-- Preview Controls Bar (sticky bottom of canvas) -->
                    <div class="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-1 px-4 py-2.5 bg-surface-0/80 dark:bg-surface-900/80 backdrop-blur-md border-t border-surface-200 dark:border-surface-800">
                        <button @click="zoomOut" class="w-8 h-8 rounded-lg flex items-center justify-center text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-0 transition-all">
                            <i class="pi pi-minus text-xs"></i>
                        </button>
                        <span class="text-xs font-bold text-surface-600 dark:text-surface-400 min-w-[40px] text-center tabular-nums">{{ Math.round(previewZoom * 100) }}%</span>
                        <button @click="zoomIn" class="w-8 h-8 rounded-lg flex items-center justify-center text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-0 transition-all">
                            <i class="pi pi-plus text-xs"></i>
                        </button>
                        <div class="w-px h-5 bg-surface-200 dark:bg-surface-700 mx-1"></div>
                        <button @click="rotatePreview" class="w-8 h-8 rounded-lg flex items-center justify-center text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-0 transition-all">
                            <i class="pi pi-replay text-xs"></i>
                        </button>
                        <button @click="resetPreview" class="w-8 h-8 rounded-lg flex items-center justify-center text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-0 transition-all" title="Reset">
                            <i class="pi pi-refresh text-xs"></i>
                        </button>
                    </div>
                </div>

            </div>

            <!-- RIGHT: Download Options -->
            <div class="flex flex-col gap-5">
                <!-- Format -->
                <div>
                    <label class="text-[10px] uppercase font-bold text-surface-500 tracking-wider mb-2 block">Format</label>
                    <div class="grid grid-cols-3 gap-2">
                        <button 
                            v-for="f in formatOptions" 
                            :key="f.value"
                            @click="selectedFormat = f.value as any"
                            class="flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer"
                            :class="selectedFormat === f.value 
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                                : 'border-surface-200 dark:border-surface-800 bg-surface-0 dark:bg-surface-900 text-surface-600 dark:text-surface-400 hover:border-primary-200 dark:hover:border-primary-800'"
                        >
                            <i :class="`pi ${f.icon}`" class="text-lg"></i>
                            <span class="text-xs font-bold">{{ f.label }}</span>
                        </button>
                    </div>
                </div>

                <!-- Paper Size (PDF only) -->
                <div v-if="showPaperOptions">
                    <label class="text-[10px] uppercase font-bold text-surface-500 tracking-wider mb-2 block">Paper Size</label>
                    <select 
                        v-model="selectedPaperSize"
                        class="w-full px-4 py-3 bg-surface-50 dark:bg-surface-800 border-none rounded-xl text-surface-900 dark:text-surface-0 text-sm focus:ring-2 focus:ring-primary-500 transition-all cursor-pointer"
                    >
                        <option value="original">Original</option>
                        <option value="A4">A4 (210 × 297mm)</option>
                        <option value="A3">A3 (297 × 420mm)</option>
                        <option value="A2">A2 (420 × 594mm)</option>
                        <option value="Letter">Letter (8.5 × 11in)</option>
                        <option value="Tabloid">Tabloid (11 × 17in)</option>
                    </select>
                </div>

                <!-- Page Orientation (PDF only) -->
                <div v-if="showPaperOptions">
                    <label class="text-[10px] uppercase font-bold text-surface-500 tracking-wider mb-2 block">Page Orientation</label>
                    <div class="grid grid-cols-2 gap-2">
                        <button 
                            @click="selectedPaperRotation = 'portrait'"
                            class="flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer"
                            :class="selectedPaperRotation === 'portrait' 
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                                : 'border-surface-200 dark:border-surface-800 bg-surface-0 dark:bg-surface-900 text-surface-600 dark:text-surface-400 hover:border-primary-200 dark:hover:border-primary-800'"
                        >
                            <i class="pi pi-mobile"></i>
                            <span class="text-xs font-bold">Portrait</span>
                        </button>
                        <button 
                            @click="selectedPaperRotation = 'landscape'"
                            class="flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer"
                            :class="selectedPaperRotation === 'landscape' 
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                                : 'border-surface-200 dark:border-surface-800 bg-surface-0 dark:bg-surface-900 text-surface-600 dark:text-surface-400 hover:border-primary-200 dark:hover:border-primary-800'"
                        >
                            <i class="pi pi-tablet"></i>
                            <span class="text-xs font-bold">Landscape</span>
                        </button>
                    </div>
                </div>

                <!-- Color Mode -->
                <div>
                    <label class="text-[10px] uppercase font-bold text-surface-500 tracking-wider mb-2 block">Color Mode</label>
                    <div class="grid grid-cols-2 gap-2">
                        <button 
                            v-for="mode in colorModeOptions" 
                            :key="mode.value"
                            @click="selectedColorMode = mode.value as any"
                            class="flex items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer"
                            :class="selectedColorMode === mode.value 
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                                : 'border-surface-200 dark:border-surface-800 bg-surface-0 dark:bg-surface-900 text-surface-600 dark:text-surface-400 hover:border-primary-200 dark:hover:border-primary-800'"
                        >
                            <i :class="`pi ${mode.icon} text-sm`"></i>
                            <span class="text-xs font-bold">{{ mode.label }}</span>
                        </button>
                    </div>
                </div>

                <!-- Action Button -->
                <div class="pt-2">
                    <Button 
                        @click="handleDownload"
                        label="Download"
                        icon="pi pi-download"
                        class="w-full"
                        size="large"
                    />
                </div>
            </div>
        </div>
    </Dialog>
</template>

<style scoped>

/* Modal overrides to match site design */
:deep(.p-dialog) {
    border-radius: 1rem;
    overflow: hidden;
    border: 1px solid var(--p-surface-200);
}

:deep(.p-dialog-header) {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--p-surface-200);
}

:deep(.p-dialog-content) {
    padding: 1.5rem;
}

@media (prefers-color-scheme: dark) {
    :deep(.p-dialog) {
        border-color: var(--p-surface-800);
    }
    :deep(.p-dialog-header) {
        border-bottom-color: var(--p-surface-800);
    }
}
</style>
