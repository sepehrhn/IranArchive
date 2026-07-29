<template>
    <div class="relative border border-surface-200 dark:border-surface-800 rounded-2xl bg-surface-0 dark:bg-surface-900 overflow-hidden h-full flex flex-col animate-pulse">
        
        <!-- Update Button Skeleton -->
        <div class="absolute top-6 right-6 w-20 h-7 rounded-lg bg-surface-100 dark:bg-surface-800"></div>

        <!-- Inner Content (Matching EventCard padding) -->
        <div class="p-5 md:p-6 pb-2">
            <!-- Header (Matching EventCard spacing) -->
            <div class="flex flex-wrap items-start gap-3 mb-6 pr-24">
                <!-- Status Dot -->
                <div class="h-[28px] flex items-center justify-center">
                    <div class="w-2.5 h-2.5 rounded-full bg-surface-200 dark:bg-surface-700"></div>
                </div>

                <!-- Title & ID -->
                <div class="flex flex-col flex-1 min-w-[200px]">
                    <!-- Title matching leading-[28px] -->
                    <div class="h-7 bg-surface-200 dark:bg-surface-800 rounded-md w-3/4"></div>
                    <!-- ID matching mt-0.5 -->
                    <div class="mt-1 h-3 bg-surface-100 dark:bg-surface-800 rounded-sm w-16"></div>
                </div>
            </div>

            <!-- Date & Location Blocks -->
            <div class="grid grid-cols-1 gap-3 mb-4">
                <!-- Date Skeleton -->
                <div class="flex items-center gap-3 p-3 rounded-xl border border-surface-100 dark:border-surface-800">
                    <div class="w-10 h-10 rounded-lg bg-surface-100 dark:bg-surface-800"></div>
                    <div class="flex-1 space-y-2">
                        <div class="h-4 bg-surface-200 dark:bg-surface-800 rounded w-1/3"></div>
                        <div class="h-3 bg-surface-100 dark:bg-surface-800 rounded w-1/4"></div>
                    </div>
                </div>
                
                <!-- Location Skeleton -->
                <div class="flex items-center gap-3 p-3 rounded-xl border border-surface-100 dark:border-surface-800">
                    <div class="w-10 h-10 rounded-lg bg-surface-100 dark:bg-surface-800"></div>
                    <div class="flex-1 space-y-2">
                        <div class="h-4 bg-surface-200 dark:bg-surface-800 rounded w-1/2"></div>
                        <div class="h-3 bg-surface-100 dark:bg-surface-800 rounded w-1/3"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
