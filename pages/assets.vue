<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCountries } from '~/composables/useCountries'
import { useRoute, useRouter } from 'vue-router'
import { getMediaUrl } from '~/utils/mediaUrl'
import type { Asset } from '~/types/asset'
import AssetPreviewModal from '~/components/AssetPreviewModal.vue'

const { t, locale } = useI18n()
const { loadCountries, getAllCountries, getCountryFlagUrl } = useCountries()
const route = useRoute()
const router = useRouter()

useHead({
    title: t('assetsPage.title'),
    meta: [
        { name: 'description', content: t('assetsPage.description') }
    ]
})

const { data: fetchedAssets, status } = await useFetch<Asset[]>('/api/assets', {
    default: () => []
})

const assets = computed(() => fetchedAssets.value || [])
const loading = computed(() => status.value === 'pending')

// Filters
const selectedCountry = ref('all')
const selectedType = ref('all')

// Modal state
const showPreviewModal = ref(false)
const selectedAsset = ref<Asset | null>(null)

// Load countries (can stay client-side or be moved to useFetch too, but keeping minimal changes first)
onMounted(async () => {
    try {
        await loadCountries()

        // Handle deep linking
        const assetId = route.query.asset as string
        if (assetId) {
            const asset = assets.value.find(a => a.id === assetId)
            if (asset) {
                openPreviewModal(asset)
            }
        }
    } catch (e) {
        console.error('Failed to init page:', e)
    }
})

// Stats
const stats = computed(() => {
    const total = assets.value.length
    return { total }
})

const filteredAssets = computed(() => {
    let result = assets.value.filter(asset => {
        // Country Filter
        if (selectedCountry.value !== 'all') {
            const assetCountries = asset.countries || []
            const isGlobal = assetCountries.length === 0
            const isSpecific = assetCountries.includes(selectedCountry.value)
            if (!isGlobal && !isSpecific) return false
        }

        // Type Filter
        if (selectedType.value !== 'all') {
            if (asset.type !== selectedType.value) return false
        }
        
        return true
    })

    // Prioritize specific countries
    if (selectedCountry.value !== 'all') {
        result.sort((a, b) => {
            const aSpecific = (a.countries || []).includes(selectedCountry.value)
            const bSpecific = (b.countries || []).includes(selectedCountry.value)
            if (aSpecific && !bSpecific) return -1
            if (!aSpecific && bSpecific) return 1
            return 0
        })
    }

    return result
})

const countryOptions = computed(() => {
    const localized = getAllCountries.value.map(c => ({
        ...c,
        name: t(`countries.${c.iso2}`, c.name)
    })).sort((a, b) => a.name.localeCompare(b.name, locale.value))

    return [
        { name: t('common.allCountries'), iso2: 'all' },
        ...localized
    ]
})


const typeOptions = computed(() => [
    { label: t('assetsPage.filters.all'), value: 'all' },
    { label: t('assetsPage.filters.posters'), value: 'poster' },
    { label: t('assetsPage.filters.leaflet'), value: 'leaflet' }
])

const openPreviewModal = (asset: Asset) => {
    selectedAsset.value = asset
    showPreviewModal.value = true
    router.push({ query: { ...route.query, asset: asset.id } })
}

watch(showPreviewModal, (val) => {
    if (!val) {
        const query = { ...route.query }
        delete query.asset
        router.push({ query })
    }
})

// Helper: render source to canvas (handles both image and PDF sources)
const renderSourceToCanvas = async (sourceUrl: string, fileExt: string, colorMode: string): Promise<HTMLCanvasElement> => {
    const response = await fetch(sourceUrl)
    if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`)
    const blob = await response.blob()

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    if (fileExt === 'pdf') {
        // Use PDF.js to render PDF to canvas (no worker - runs on main thread)
        const arrayBuffer = await blob.arrayBuffer()
        const pdfjsLib = await import('pdfjs-dist')
        
        // Disable web worker - run on main thread (fine for single page rendering)
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
            'pdfjs-dist/build/pdf.worker.min.mjs',
            import.meta.url
        ).toString()
        
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) })
        const pdfDoc = await loadingTask.promise
        const page = await pdfDoc.getPage(1)
        
        // Render at 2x scale for high quality
        const scale = 2
        const viewport = page.getViewport({ scale })
        canvas.width = viewport.width
        canvas.height = viewport.height

        await page.render({ canvasContext: ctx, viewport }).promise
    } else {
        // Load image from blob
        const blobUrl = URL.createObjectURL(blob)
        const img = new Image()
        await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve()
            img.onerror = () => reject(new Error('Failed to load image'))
            img.src = blobUrl
        })
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        ctx.drawImage(img, 0, 0)
        URL.revokeObjectURL(blobUrl)
    }

    // Apply color mode filter by re-drawing with filter
    if (colorMode && colorMode !== 'original') {
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = canvas.width
        tempCanvas.height = canvas.height
        const tempCtx = tempCanvas.getContext('2d')!

        switch (colorMode) {
            case 'grayscale':
                tempCtx.filter = 'grayscale(100%)'
                break
            case 'bw':
                tempCtx.filter = 'grayscale(100%) contrast(200%)'
                break
            case 'inkSaver':
                tempCtx.filter = 'grayscale(100%) brightness(1.3) contrast(0.8)'
                break
        }

        tempCtx.drawImage(canvas, 0, 0)
        
        // Copy back
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(tempCanvas, 0, 0)
    }

    return canvas
}

const handleDownload = async (options: any) => {
    if (!selectedAsset.value) return
    
    const asset = selectedAsset.value
    const sourceUrl = getMediaUrl({ kind: 'asset', relativePath: asset.file })
    const baseName = asset.id || asset.file.split('/').pop()?.replace(/\.[^.]+$/, '') || 'asset'
    const sourceExt = (asset.file.split('.').pop() || '').toLowerCase()

    try {
        const canvas = await renderSourceToCanvas(sourceUrl, sourceExt, options.colorMode)
        const quality = 1.0

        if (options.format === 'pdf') {
            const { jsPDF } = await import('jspdf')

            const paperSizes: Record<string, [number, number]> = {
                'A4': [210, 297],
                'A3': [297, 420],
                'A2': [420, 594],
                'Letter': [215.9, 279.4],
                'Tabloid': [279.4, 431.8],
            }

            const orientation = options.paperRotation === 'landscape' ? 'landscape' : 'portrait'
            const paperKey = options.paperSize && options.paperSize !== 'original' ? options.paperSize : null

            let pdfWidth: number
            let pdfHeight: number

            if (paperKey && paperSizes[paperKey]) {
                const [w, h] = paperSizes[paperKey]
                pdfWidth = orientation === 'landscape' ? h : w
                pdfHeight = orientation === 'landscape' ? w : h
            } else {
                const imgAspect = canvas.width / canvas.height
                if (orientation === 'landscape') {
                    pdfWidth = 297
                    pdfHeight = 297 / imgAspect
                } else {
                    pdfHeight = 297
                    pdfWidth = 297 * imgAspect
                }
            }

            const pdf = new jsPDF({
                orientation,
                unit: 'mm',
                format: [pdfWidth, pdfHeight]
            })

            const margin = 10
            const availW = pdfWidth - margin * 2
            const availH = pdfHeight - margin * 2
            const aspect = canvas.width / canvas.height
            let drawW = availW
            let drawH = availW / aspect

            if (drawH > availH) {
                drawH = availH
                drawW = availH * aspect
            }

            const x = margin + (availW - drawW) / 2
            const y = margin + (availH - drawH) / 2

            // Use maximum quality (1.0) for the embedded image
            const imgData = canvas.toDataURL('image/jpeg', 1.0)
            pdf.addImage(imgData, 'JPEG', x, y, drawW, drawH, undefined, 'FAST')
            pdf.save(`${baseName}.pdf`)
        } else {
            // JPG or PNG export
            const mimeType = options.format === 'png' ? 'image/png' : 'image/jpeg'
            const ext = options.format === 'png' ? 'png' : 'jpg'

            const exportBlob = await new Promise<Blob | null>((resolve) => {
                canvas.toBlob(resolve, mimeType, 1.0)
            })

            if (exportBlob) {
                const url = URL.createObjectURL(exportBlob)
                const link = document.createElement('a')
                link.href = url
                link.download = `${baseName}.${ext}`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                URL.revokeObjectURL(url)
            }
        }
    } catch (err) {
        console.error('Download conversion failed:', err)
        // Fallback: download original file
        const response = await fetch(sourceUrl)
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = asset.file.split('/').pop() || asset.id
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }
    
    showPreviewModal.value = false
}

const getAssetThumbnail = (asset: Asset) => {
    // If it's a PDF, use the generated JPG thumbnail
    if (asset.file.toLowerCase().endsWith('.pdf')) {
        return getMediaUrl({ kind: 'asset', relativePath: asset.file.replace(/\.pdf$/i, '.jpg') })
    }
    return getMediaUrl({ kind: 'asset', relativePath: asset.file })
}

const clearFilters = () => {
    selectedCountry.value = 'all'
    selectedType.value = 'all'
}
</script>

<template>
    <div class="space-y-6">
        <div class="w-full">
            <!-- Hero Section -->
            <div class="relative bg-gradient-to-br from-surface-800 via-surface-700 to-surface-800 dark:from-surface-950 dark:via-surface-900 dark:to-surface-950 rounded-2xl overflow-hidden mb-8">
                <div class="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-5"></div>
                <div class="relative px-8 py-10 md:py-12">
                    <div class="max-w-3xl">
                        <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">
                            {{ t('assetsPage.heroTitle') }}
                        </h1>
                        <p class="text-lg text-surface-200 dark:text-surface-300 mb-6 leading-relaxed">
                            {{ t('assetsPage.heroSubtitle') }}
                        </p>
                        
                        <!-- Stats -->
                        <div class="flex flex-wrap gap-6">
                            <div class="flex items-center gap-3">
                                <div class="w-12 h-12 rounded-full bg-surface-0/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                                    <i class="pi pi-images text-white/80 text-xl"></i>
                                </div>
                                <div>
                                    <p class="text-3xl font-bold text-white">
                                        <Skeleton v-if="loading" width="2rem" height="2.5rem" class="!bg-white/20" />
                                        <span v-else>{{ $nFa(stats.total) }}</span>
                                    </p>
                                    <p class="text-sm text-surface-300 dark:text-surface-400">{{ t('assetsPage.heroTotalAssets') || 'Total Assets' }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Filter Bar (Sticky) -->
            <div class="sticky top-20 z-30 bg-surface-0/95 dark:bg-surface-900/95 backdrop-blur-md p-4 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm mb-8">
                <div class="flex justify-center gap-4 flex-wrap">
                    <!-- Type Filter -->
                    <div class="w-full sm:w-48">
                        <SelectButton 
                            v-model="selectedType" 
                            :options="typeOptions" 
                            optionLabel="label" 
                            optionValue="value"
                            class="w-full"
                            :pt="{
                                root: { class: 'bg-surface-100 dark:bg-surface-800 p-1 rounded-xl w-full' },
                                button: ({ context }) => ({
                                    class: [
                                        'flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200',
                                        context.active 
                                            ? 'bg-white dark:bg-surface-700 text-primary-600 dark:text-primary-400 shadow-sm' 
                                            : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-0'
                                    ]
                                })
                            }"
                        />
                    </div>

                    <!-- Country Filter -->
                    <div class="w-full sm:w-64">
                        <Select 
                            v-model="selectedCountry"
                            :options="countryOptions"
                            optionLabel="name"
                            optionValue="iso2"
                            class="w-full !bg-surface-50 dark:!bg-surface-800 !border-none !rounded-xl text-base shadow-sm hover:shadow-md transition-shadow"
                            :pt="{
                                root: { class: 'focus:ring-2 focus:ring-primary-500 min-h-[52px]' },
                                label: { class: 'px-6 py-4 text-surface-900 dark:text-surface-0 font-medium' },
                                dropdown: { class: 'pr-4' }
                            }"
                            filter
                            :filterPlaceholder="t('incidentsPage.searchPlaceholder')"
                        >
                            <template #value="slotProps">
                                <div v-if="slotProps.value === 'all'" class="flex items-center gap-2">
                                    <span class="text-lg">🌐</span>
                                    <span>{{ t('common.allCountries') }}</span>
                                </div>
                                <div v-else-if="slotProps.value" class="flex items-center gap-2">
                                    <img :src="getCountryFlagUrl(slotProps.value)" class="w-5 h-3.5 object-cover rounded-sm shadow-sm" />
                                    <span>{{ countryOptions.find(c => c.iso2 === slotProps.value)?.name }}</span>
                                </div>
                                <span v-else>{{ slotProps.placeholder }}</span>
                            </template>
                            <template #option="slotProps">
                                <div class="flex items-center gap-2">
                                    <span v-if="slotProps.option.iso2 === 'all'" class="text-lg">🌐</span>
                                    <img v-else :src="getCountryFlagUrl(slotProps.option.iso2)" class="w-5 h-3.5 object-cover rounded-sm shadow-sm" />
                                    <span>{{ slotProps.option.name }}</span>
                                </div>
                            </template>
                        </Select>
                    </div>


                </div>
            </div>

            <!-- Grid -->
            <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                <div v-for="i in 10" :key="i" class="animate-pulse">
                    <div class="bg-surface-200 dark:bg-surface-800 aspect-[2/3] rounded-2xl mb-3"></div>
                    <div class="h-3 bg-surface-200 dark:bg-surface-800 rounded w-3/4 mb-2"></div>
                    <div class="h-3 bg-surface-200 dark:bg-surface-800 rounded w-1/2"></div>
                </div>
            </div>

            <div v-else-if="filteredAssets.length > 0" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                <TransitionGroup name="grid">
                    <div 
                        v-for="asset in filteredAssets" 
                        :key="asset.id" 
                        class="group cursor-pointer"
                        @click="openPreviewModal(asset)"
                    >
                        <!-- Card -->
                        <div class="bg-surface-0 dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary-500/10 hover:-translate-y-1 hover:border-primary-200 dark:hover:border-primary-800">
                            <!-- Image -->
                            <div class="relative aspect-[2/3] overflow-hidden bg-surface-100 dark:bg-surface-800">
                                <img 
                                    :src="getAssetThumbnail(asset)" 
                                    :alt="asset.id"
                                    loading="lazy"
                                    class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                
                                <!-- Asset ID (Top Left) -->
                                <div class="absolute top-2 left-2 z-10">
                                    <div class="px-2 py-1 rounded-md text-[10px] font-mono font-medium bg-black/50 text-white/90 backdrop-blur-sm">
                                        {{ asset.id }}
                                    </div>
                                </div>


                                
                                <!-- Hover Overlay (Download) -->
                                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-4">
                                    <div class="flex items-center gap-2 transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300 w-full">
                                        <div class="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg shrink-0">
                                            <i class="pi pi-download text-black text-xs"></i>
                                        </div>
                                        <span class="text-white text-xs font-bold truncate">{{ t('assetsPage.download') }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TransitionGroup>
            </div>

            <!-- Empty State -->
            <div v-else class="text-center py-32 bg-surface-50/50 dark:bg-surface-900/30 rounded-3xl border-2 border-dashed border-surface-200 dark:border-surface-800">
                <div class="w-16 h-16 bg-surface-100 dark:bg-surface-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <i class="pi pi-search text-3xl text-surface-300 dark:text-surface-600"></i>
                </div>
                <h2 class="text-2xl font-bold text-surface-700 dark:text-surface-200 mb-2">{{ t('assetsPage.noAssetsFound') }}</h2>
                <p class="text-surface-500 dark:text-surface-400 text-lg max-w-sm mx-auto mb-6">
                    {{ t('eventsPage.emptyDescription') }}
                </p>
                <button @click="clearFilters" class="text-primary-500 font-medium hover:underline text-sm">
                    {{ t('common.clearFilters') }}
                </button>
            </div>

            <!-- Asset Preview Modal -->
            <AssetPreviewModal 
                :asset="selectedAsset"
                :visible="showPreviewModal"
                @update:visible="showPreviewModal = $event"
                @download="handleDownload"
            />
        </div>
    </div>
</template>

<style scoped>
.grid-move,
.grid-enter-active,
.grid-leave-active {
    transition: all 0.4s ease;
}

.grid-enter-from,
.grid-leave-to {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
}

.grid-leave-active {
    position: absolute;
}
</style>
