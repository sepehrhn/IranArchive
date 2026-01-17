<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="py-12 flex flex-col items-center justify-center text-center space-y-8">
    <div class="space-y-4 max-w-2xl">
        <h1 class="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-red-600 dark:from-green-400 dark:to-red-400">
            They can't post. You can.
        </h1>
        <p class="text-xl text-surface-600 dark:text-surface-300 font-mono">
            #IranDigitalBlackout #MassacreIran
        </p>
    </div>

    <div class="w-full px-4 space-y-8">
        <BlackoutCounter />
        <DeathTollCounter />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mt-12">
        <Card class="hover:shadow-lg transition-shadow">
            <template #title>
                <div class="flex items-center gap-2">
                    <i class="pi pi-bolt text-yellow-500 text-xl" />
                    <span>{{ t('common.incidents') }}</span>
                </div>
            </template>
            <template #content>
                <p class="mb-4 text-surface-600 dark:text-surface-400">
                    Explore the timeline of verified events, reports, and incidents across the country.
                </p>
                <NuxtLink to="/incidents">
                    <Button :label="t('common.viewDetails')" icon="pi pi-arrow-right" iconPos="right" />
                </NuxtLink>
            </template>
        </Card>

        <Card class="opacity-75 relative overflow-hidden">
            <template #title>
                <div class="flex items-center gap-2">
                    <i class="pi pi-users text-blue-500 text-xl" />
                    <span>Victims (Coming Soon)</span>
                </div>
            </template>
            <template #content>
                <p class="mb-4 text-surface-600 dark:text-surface-400">
                    A memorial database dedicated to those who lost their lives.
                </p>
                <Button label="Coming Soon" disabled severity="secondary" />
            </template>
        </Card>
    </div>
  </div>
</template>
