<script setup lang="ts">
const now = ref(new Date())
const startDate = new Date('2026-01-08T17:00:00Z')

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
    <div class="flex flex-col items-center justify-center p-8 bg-surface-900 text-white rounded-xl shadow-2xl space-y-4 max-w-2xl mx-auto border border-surface-700">
        <h2 class="text-2xl md:text-3xl font-bold text-red-500 uppercase tracking-widest animate-pulse">
            Digital Blackout
        </h2>
        <div class="text-surface-400 text-sm">
            Started January 8th, 17:00 GMT
        </div>
        
        <div class="grid grid-cols-4 gap-4 md:gap-8 w-full mt-4">
            <div class="flex flex-col items-center">
                <span class="text-4xl md:text-6xl font-mono font-bold">{{ elapsedTime.days }}</span>
                <span class="text-xs md:text-sm uppercase text-surface-400 mt-2">Days</span>
            </div>
            <div class="flex flex-col items-center">
                <span class="text-4xl md:text-6xl font-mono font-bold">{{ String(elapsedTime.hours).padStart(2, '0') }}</span>
                <span class="text-xs md:text-sm uppercase text-surface-400 mt-2">Hours</span>
            </div>
            <div class="flex flex-col items-center">
                <span class="text-4xl md:text-6xl font-mono font-bold">{{ String(elapsedTime.minutes).padStart(2, '0') }}</span>
                <span class="text-xs md:text-sm uppercase text-surface-400 mt-2">Minutes</span>
            </div>
            <div class="flex flex-col items-center">
                <span class="text-4xl md:text-6xl font-mono font-bold text-red-500">{{ String(elapsedTime.seconds).padStart(2, '0') }}</span>
                <span class="text-xs md:text-sm uppercase text-surface-400 mt-2">Seconds</span>
            </div>
        </div>
    </div>
</template>
