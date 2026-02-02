<script setup lang="ts">
const { locale, setLocale } = useI18n();

const toggleLanguage = () => {
    setLocale(locale.value === 'en' ? 'fa' : 'en');
};
</script>

<template>
    <button 
        @click="toggleLanguage" 
        class="flex items-center justify-center p-2 rounded-full hover:bg-surface-200/50 dark:hover:bg-surface-800/50 transition-colors text-surface-700 dark:text-surface-300 hover:text-primary-600 dark:hover:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
        :aria-label="$t('common.language')"
    >
        <span class="font-medium text-sm px-2 text-center select-none">{{ locale === 'en' ? 'فارسی' : 'English' }}</span>
    </button>
</template>
