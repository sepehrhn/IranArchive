<script setup lang="ts">
const now = ref(new Date())
const startDate = new Date('2026-01-08T17:00:00Z')
const blackoutEndDate = new Date('2026-01-27T12:00:00Z')

const elapsedTime = computed(() => {
    const diff = now.value.getTime() - startDate.getTime()
    
    // Ensure we don't show negative if for some reason date is future (unlikely given context)
    const totalSeconds = Math.max(0, Math.floor(diff / 1000))
    
    const days = Math.floor(totalSeconds / (3600 * 24))
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    
    return { days, hours, minutes, seconds }
})

const blackoutDuration = computed(() => {
    const diff = blackoutEndDate.getTime() - startDate.getTime()
    const totalSeconds = Math.floor(diff / 1000)
    
    const days = Math.floor(totalSeconds / (3600 * 24))
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    
    return { days, hours, minutes }
})

let timer: NodeJS.Timeout

onMounted(() => {
    timer = setInterval(() => {
        now.value = new Date()
    }, 1000)
})

onUnmounted(() => {
    clearInterval(timer)
})
</script>

<template>
    <div class="flex flex-col items-center justify-center p-8 bg-surface-0 dark:bg-surface-900 text-surface-900 dark:text-surface-0 rounded-xl shadow-lg border border-surface-200 dark:border-surface-800 space-y-4 max-w-2xl mx-auto">
        <div class="flex flex-col items-center space-y-1">
            <h2 class="text-2xl md:text-3xl font-bold text-amber-500 dark:text-amber-500 uppercase tracking-widest animate-pulse">
                Whitelist Filtering
            </h2>
            <div class="px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20">
                <span class="text-[10px] md:text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-tighter">
                    Phase 2: Managed Network
                </span>
            </div>
        </div>

        <div class="text-surface-600 dark:text-surface-400 text-sm font-medium">
            Restrictions started January 8th, 17:00 GMT
        </div>
        
        <div class="grid grid-cols-4 gap-4 md:gap-8 w-full mt-4">
            <div class="flex flex-col items-center">
                <span class="text-4xl md:text-6xl font-mono font-bold text-surface-900 dark:text-surface-0">{{ elapsedTime.days }}</span>
                <span class="text-xs md:text-sm uppercase text-surface-500 dark:text-surface-400 mt-2 font-semibold">Days</span>
            </div>
            <div class="flex flex-col items-center">
                <span class="text-4xl md:text-6xl font-mono font-bold text-surface-900 dark:text-surface-0">{{ String(elapsedTime.hours).padStart(2, '0') }}</span>
                <span class="text-xs md:text-sm uppercase text-surface-500 dark:text-surface-400 mt-2 font-semibold">Hours</span>
            </div>
            <div class="flex flex-col items-center">
                <span class="text-4xl md:text-6xl font-mono font-bold text-surface-900 dark:text-surface-0">{{ String(elapsedTime.minutes).padStart(2, '0') }}</span>
                <span class="text-xs md:text-sm uppercase text-surface-500 dark:text-surface-400 mt-2 font-semibold">Minutes</span>
            </div>
            <div class="flex flex-col items-center">
                <span class="text-4xl md:text-6xl font-mono font-bold text-red-600 dark:text-red-500">{{ String(elapsedTime.seconds).padStart(2, '0') }}</span>
                <span class="text-xs md:text-sm uppercase text-surface-500 dark:text-surface-400 mt-2 font-semibold">Seconds</span>
            </div>
        </div>

        <div class="w-full mt-6 py-3 px-4 bg-surface-50 dark:bg-surface-800/50 rounded-xl border border-surface-200 dark:border-surface-700 flex flex-col md:flex-row items-center justify-between gap-2">
            <div class="flex items-center gap-2 text-surface-600 dark:text-surface-400">
                <i class="pi pi-clock text-xs"></i>
                <span class="text-xs font-bold uppercase tracking-tight">Total Blackout Duration</span>
            </div>
            <div class="flex items-center gap-1.5 font-mono text-sm">
                <span class="text-surface-900 dark:text-surface-100 font-bold">{{ blackoutDuration.days }}d</span>
                <span class="text-surface-400">:</span>
                <span class="text-surface-900 dark:text-surface-100 font-bold">{{ blackoutDuration.hours }}h</span>
                <span class="text-surface-400">:</span>
                <span class="text-surface-900 dark:text-surface-100 font-bold">{{ blackoutDuration.minutes }}m</span>
            </div>
        </div>

        <div class="w-full mt-8 border-t border-surface-200 dark:border-surface-800 pt-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div class="flex flex-col items-center space-y-2 p-3 bg-surface-50 dark:bg-surface-800 rounded-xl border border-surface-100 dark:border-surface-700">
                    <i class="pi pi-exclamation-circle text-amber-600 dark:text-amber-500 text-2xl"></i>
                    <span class="font-bold text-amber-700 dark:text-amber-500 text-sm uppercase tracking-wide">Internal SMS</span>
                    <span class="text-xs text-surface-600 dark:text-surface-400 font-medium">Restored (No Int'l)</span>
                </div>
                <div class="flex flex-col items-center space-y-2 p-3 bg-surface-50 dark:bg-surface-800 rounded-xl border border-surface-100 dark:border-surface-700">
                    <i class="pi pi-exclamation-circle text-amber-600 dark:text-amber-500 text-2xl"></i>
                    <span class="font-bold text-amber-700 dark:text-amber-500 text-sm uppercase tracking-wide">Internal Voice</span>
                    <span class="text-xs text-surface-600 dark:text-surface-400 font-medium">Restored (No Int'l)</span>
                </div>
                <div class="flex flex-col items-center space-y-2 p-3 bg-surface-50 dark:bg-surface-800 rounded-xl border border-surface-100 dark:border-surface-700">
                    <i class="pi pi-exclamation-circle text-amber-600 dark:text-amber-500 text-2xl"></i>
                    <span class="font-bold text-amber-700 dark:text-amber-500 text-sm uppercase tracking-wide">Internet</span>
                    <span class="text-xs text-surface-600 dark:text-surface-400 font-medium">Whitelist Only</span>
                </div>
            </div>
        </div>

        <div class="mt-4 text-xs text-surface-600 dark:text-surface-400 text-center max-w-lg leading-relaxed bg-surface-50 dark:bg-surface-800 p-4 rounded-lg border border-surface-200 dark:border-surface-700 space-y-3 shadow-inner">
            <div>
                <span class="block mb-1 font-bold text-surface-700 dark:text-surface-300">Phase Update (Jan 27, 12:00):</span>
                Total digital blackout transitioned to <span class="text-amber-600 dark:text-amber-400 font-bold">Whitelist Filtering</span>. International traffic remains blocked; only government-approved domestic services and select IPs are reachable.
            </div>
            <div class="pt-2 border-t border-surface-200 dark:border-surface-700/50">
                <a href="https://x.com/netblocks/status/2016150516154147216?s=20" target="_blank" class="text-primary-600 dark:text-primary-400 hover:underline flex items-center justify-center gap-1">
                    <i class="pi pi-external-link text-[10px]"></i>
                    NetBlocks: Network visibility increasing
                </a>
            </div>
        </div>
    </div>
</template>

