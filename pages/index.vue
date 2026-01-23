<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="py-20 flex flex-col items-center justify-center text-center space-y-12">
    <div class="space-y-6 max-w-4xl relative">
        <!-- Background Glow -->
        <div class="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary-500/20 blur-[100px] rounded-full pointer-events-none"></div>

        <h1 class="relative text-6xl md:text-7xl font-extrabold tracking-tight text-surface-900 dark:text-surface-0">
            They can't post. <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-red-600 dark:from-primary-400 dark:to-red-400">You can.</span>
        </h1>
        <p class="text-2xl text-surface-600 dark:text-surface-300 font-mono tracking-wide relative z-10">
            #R2PforIran #IranMassacre #IRGCTerrorists
        </p>
    </div>

    <div class="w-full px-4 space-y-8 max-w-5xl">
        <BlackoutCounter />
        <DeathTollCounter />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl mt-8 px-4">
        <NuxtLink to="/incidents" class="group">
            <div class="h-full bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-8 shadow-sm hover:shadow-xl hover:border-primary-500/30 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
                <div class="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-primary-500/20 transition-colors"></div>
                
                <div class="flex items-center gap-3 mb-4">
                    <div class="p-3 bg-surface-100 dark:bg-surface-800 rounded-xl group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                        <i class="pi pi-bolt text-primary-500 text-2xl" />
                    </div>
                    <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{{ t('common.incidents') }}</h2>
                </div>
                
                <p class="mb-6 text-surface-600 dark:text-surface-400 leading-relaxed">
                    Explore the verified timeline of events, reports, and evidence documented across the country.
                </p>
                
                <div class="flex items-center text-primary-600 dark:text-primary-400 font-medium group-hover:translate-x-1 transition-transform">
                    <span>View Archive</span>
                    <i class="pi pi-arrow-right ml-2 text-sm"></i>
                </div>
            </div>
        </NuxtLink>

        <NuxtLink to="/victims" class="group">
            <div class="h-full bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-8 shadow-sm hover:shadow-xl hover:border-primary-500/30 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
                <div class="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-primary-500/20 transition-colors"></div>
                
                <div class="flex items-center gap-3 mb-4">
                     <div class="p-3 bg-surface-100 dark:bg-surface-800 rounded-xl group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                        <i class="pi pi-users text-blue-500 text-2xl" />
                    </div>
                    <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">Victims</h2>
                </div>
                
                <p class="mb-6 text-surface-600 dark:text-surface-400 leading-relaxed">
                    A dedicated memorial database honoring those who lost their lives to the regime's brutality.
                </p>
                
                <div class="flex items-center text-primary-600 dark:text-primary-400 font-medium group-hover:translate-x-1 transition-transform">
                    <span>View Database</span>
                    <i class="pi pi-arrow-right ml-2 text-sm"></i>
                </div>
            </div>
        </NuxtLink>
    </div>
  </div>
</template>
