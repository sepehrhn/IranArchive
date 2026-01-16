<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
    <div class="flex flex-col items-center justify-center p-8 bg-surface-900 text-white rounded-xl shadow-2xl space-y-4 max-w-2xl mx-auto border border-surface-700">
        <h2 class="text-2xl md:text-3xl font-bold text-red-500 uppercase tracking-widest">
            Death Toll Estimate
        </h2>
        <div class="text-surface-400 text-sm text-center max-w-lg">
            Casualties during nationwide protests (Jan 8-9, 2026)
        </div>
        
        <div class="grid grid-cols-2 gap-8 w-full mt-4">
            <div class="flex flex-col items-center">
                <span class="text-4xl md:text-5xl font-mono font-bold text-red-400">12,000+</span>
                <span class="text-xs md:text-sm uppercase text-surface-400 mt-2">Confirmed</span>
            </div>
            <div class="flex flex-col items-center">
                <span class="text-4xl md:text-5xl font-mono font-bold text-red-600">~20,000</span>
                <span class="text-xs md:text-sm uppercase text-surface-400 mt-2">Unconfirmed</span>
            </div>
        </div>
        
        <div class="text-xs text-surface-500 mt-4 text-center italic max-w-lg">
            Source: CBS News citing internal sources and Iran International reports.
        </div>
    </div>
</template>
