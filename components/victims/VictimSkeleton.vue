<template>
    <div class="border border-surface-200 dark:border-surface-700 rounded-lg overflow-hidden bg-white dark:bg-surface-900 shadow-sm animate-pulse h-full">
        <!-- Photo Skeleton -->
        <div class="aspect-[3/4] bg-surface-100 dark:bg-surface-800 relative">
            <!-- Badge Skeleton -->
            <div class="absolute top-2 left-2 w-16 h-5 bg-surface-200 dark:bg-surface-700 rounded-full"></div>
        </div>
        
        <!-- Content Skeleton -->
        <div class="p-4 flex flex-col gap-3">
            <!-- Name -->
            <div class="h-6 bg-surface-200 dark:bg-surface-800 rounded-md w-3/4"></div>
            
            <div class="flex flex-col gap-2">
                <!-- Location -->
                <div class="flex items-center gap-2">
                    <div class="w-4 h-4 rounded-full bg-surface-100 dark:bg-surface-800"></div>
                    <div class="h-3 bg-surface-100 dark:bg-surface-800 rounded w-1/2"></div>
                </div>
                <!-- Date -->
                <div class="flex items-center gap-2">
                    <div class="w-4 h-4 rounded-full bg-surface-100 dark:bg-surface-800"></div>
                    <div class="h-3 bg-surface-100 dark:bg-surface-800 rounded w-1/3"></div>
                </div>
            </div>

            <!-- Incident Badge -->
            <div class="mt-1 h-5 bg-surface-100 dark:bg-surface-800 rounded w-24"></div>
        </div>
    </div>
</template>
