<script setup lang="ts">
const colorMode = useColorMode()

const isDark = computed({
  get: () => colorMode.value === 'dark',
  set: (val) => colorMode.preference = val ? 'dark' : 'light'
})

const toggleDark = () => {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
    <Button 
        @click="toggleDark" 
        :icon="isDark ? 'pi pi-moon' : 'pi pi-sun'" 
        severity="secondary" 
        rounded 
        text 
        aria-label="Toggle Dark Mode"
        v-bind="$attrs"
        class="transition-transform hover:rotate-12"
    />
</template>
