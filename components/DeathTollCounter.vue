<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
    <div class="flex flex-col items-center justify-center p-8 bg-surface-0 dark:bg-surface-900 text-surface-900 dark:text-surface-0 rounded-xl shadow-lg border border-surface-200 dark:border-surface-800 space-y-4 max-w-4xl mx-auto">
        <h2 class="text-2xl md:text-3xl font-bold text-red-600 dark:text-red-500 uppercase tracking-widest">
            Death Toll Estimate
        </h2>
        <div class="text-surface-600 dark:text-surface-400 text-sm text-center max-w-lg font-medium">
            Casualties during nationwide uprising (Jan 8-9, 2026)
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-4">
            <div class="flex flex-col items-center">
                <span class="text-3xl md:text-4xl font-mono font-bold text-red-600 dark:text-red-500">16,500+</span>
                <span class="text-xs md:text-sm uppercase text-surface-500 dark:text-surface-400 mt-2 font-semibold text-center">Confirmed Dead</span>
            </div>
            <div class="flex flex-col items-center">
                <span class="text-3xl md:text-4xl font-mono font-bold text-red-800 dark:text-red-700">50,000+</span>
                <span class="text-xs md:text-sm uppercase text-surface-500 dark:text-surface-400 mt-2 font-semibold text-center">Unconfirmed Dead</span>
            </div>
            <div class="flex flex-col items-center">
                <span class="text-3xl md:text-4xl font-mono font-bold text-orange-600 dark:text-orange-500">330,000+</span>
                <span class="text-xs md:text-sm uppercase text-surface-500 dark:text-surface-400 mt-2 font-semibold text-center">Injured</span>
            </div>
        </div>
        
        <div class="text-xs text-surface-500 dark:text-surface-500 mt-4 text-center italic max-w-lg">
            Source: The Sunday Times citing medical professionals (Jan 2026)
        </div>
    </div>
</template>
