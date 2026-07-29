<script setup lang="ts">
const text = ref('')
const selected = ref()
const options = [
    { label: 'Option 1', value: 1 },
    { label: 'Option 2', value: 2 }
]
const date = ref()
</script>

<template>
  <div class="container mx-auto px-4 py-8 space-y-12">
    <div class="mb-8">
        <h1 class="text-4xl font-bold text-surface-900 dark:text-surface-0 mb-2">Design System</h1>
        <p class="text-surface-600 dark:text-surface-400">Regression check for tokens and components.</p>
    </div>

    <!-- Colors -->
    <section class="space-y-4">
        <h2 class="text-2xl font-bold">Colors</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="p-4 rounded-lg bg-surface-50 text-surface-900">Surface 50</div>
            <div class="p-4 rounded-lg bg-surface-100 text-surface-900">Surface 100</div>
            <div class="p-4 rounded-lg bg-surface-200 text-surface-900">Surface 200</div>
            <div class="p-4 rounded-lg bg-surface-300 text-surface-900">Surface 300</div>
            <div class="p-4 rounded-lg bg-surface-800 text-surface-0">Surface 800</div>
            <div class="p-4 rounded-lg bg-surface-900 text-surface-0">Surface 900</div>
            <div class="p-4 rounded-lg bg-primary-500 text-white">Primary 500</div>
            <div class="p-4 rounded-lg bg-primary-600 text-white">Primary 600</div>
        </div>
    </section>

    <!-- Typography -->
    <section class="space-y-4">
        <h2 class="text-2xl font-bold">Typography</h2>
        <div class="space-y-2">
            <h1 class="text-4xl font-bold text-surface-900 dark:text-surface-0">Heading 1</h1>
            <h2 class="text-3xl font-bold text-surface-900 dark:text-surface-0">Heading 2</h2>
            <h3 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">Heading 3</h3>
            <p class="text-surface-700 dark:text-surface-300">Body text should be readable and have good contrast. Use text-surface-700 for light mode and text-surface-300 for dark mode usually.</p>
            <p class="text-sm text-surface-500 dark:text-surface-400">Small text or meta information.</p>
        </div>
    </section>

    <!-- Components -->
    <section class="space-y-8">
        <h2 class="text-2xl font-bold">Components</h2>
        
        <!-- Buttons -->
        <div class="space-y-4">
            <h3 class="text-lg font-semibold">Buttons</h3>
            <div class="flex flex-wrap gap-4">
                <Button label="Primary" />
                <Button label="Secondary" severity="secondary" />
                <Button label="Success" severity="success" />
                <Button label="Danger" severity="danger" />
                <Button label="Warning" severity="warn" />
                <Button label="Info" severity="info" />
                <Button label="Contrast" severity="contrast" />
                <Button label="Outlined" variant="outlined" />
                <Button label="Text" variant="text" />
                <Button icon="pi pi-check" rounded aria-label="Filter" />
            </div>
        </div>

        <!-- Inputs -->
         <div class="space-y-4">
            <h3 class="text-lg font-semibold">Inputs</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputText v-model="text" placeholder="Standard Input" />
                <IconField>
                    <InputIcon class="pi pi-search" />
                    <InputText v-model="text" placeholder="With Icon" />
                </IconField>
                <InputText v-model="text" placeholder="Invalid" invalid />
                <Dropdown v-model="selected" :options="options" optionLabel="label" placeholder="Select City" />
                <!-- Try DatePicker if V4, otherwise Calendar. Component auto import handles it if available -->
                <DatePicker v-model="date" placeholder="Date Picker" />
            </div>
        </div>

        <!-- Cards -->
        <div class="space-y-4">
            <h3 class="text-lg font-semibold">Cards</h3>
             <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <template #title>Simple Card</template>
                    <template #content>
                        <p class="text-surface-600 dark:text-surface-300">Standard card content using base surfaces.</p>
                    </template>
                </Card>
                 <div class="bg-surface-0 dark:bg-surface-900 p-6 rounded-xl border border-surface-200 dark:border-surface-800 shadow-sm">
                    <h4 class="font-bold text-lg mb-2 text-surface-900 dark:text-surface-0">Custom Panel</h4>
                    <p class="text-surface-600 dark:text-surface-300">Using utility classes directly.</p>
                 </div>
             </div>
        </div>

        <!-- Status & Tags -->
         <div class="space-y-4">
            <h3 class="text-lg font-semibold">Tags & Badges</h3>
            <div class="flex gap-4">
                <Tag value="Primary" />
                <Tag value="Success" severity="success" />
                <Tag value="Info" severity="info" />
                <Tag value="Warning" severity="warn" />
                <Tag value="Danger" severity="danger" />
                <Tag value="Contrast" severity="contrast" />
                <Badge value="2" />
                <Badge value="10" severity="danger" />
            </div>
        </div>
    </section>
  </div>
</template>
