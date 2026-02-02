<script setup lang="ts">
const head = useLocaleHead({
    addDirAttribute: true,
    identifierAttribute: 'id',
    addSeoAttributes: true
})
</script>

<template>
    <Html :lang="head.htmlAttrs.lang" :dir="head.htmlAttrs.dir">
        <Body class="min-h-screen bg-surface-50 dark:bg-surface-950 font-sans text-surface-900 dark:text-surface-0 transition-colors duration-300 antialiased">
            <NuxtLayout>
                <NuxtPage />
            </NuxtLayout>
            <Toast />
        </Body>
    </Html>
</template>
