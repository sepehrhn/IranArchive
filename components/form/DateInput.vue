<template>
  <div class="date-input-wrapper relative" ref="containerRef">
    <!-- English / Gregorian Calendar (PrimeVue) -->
    <Calendar
      v-if="locale !== 'fa'"
      v-bind="$attrs"
      :model-value="modelValue"
      dateFormat="yy/mm/dd"
      showIcon
      :class="['w-full', { 'p-invalid': !!error }]"
      variant="filled"
      placeholder=" "
      @update:model-value="updateValue"
    />

    <!-- Persian / Jalaali Calendar (Custom) -->
    <ClientOnly v-else>
      <div class="relative w-full">
        <!-- Trigger Input Group -->
        <div 
            class="flex items-stretch w-full relative cursor-pointer" 
            @click="toggleOpen"
        >
          <input
            type="text"
            :value="displayPersianValue"
            readonly
            class="p-inputtext p-component p-variant-filled flex-1 rounded-r-none border-r-0 font-fa cursor-pointer"
            :class="{ 'p-invalid': !!error }"
            placeholder=" "
          />
          <button 
            type="button"
            class="p-button p-component p-button-icon-only rounded-l-none border border-l-0 !border-surface-300 dark:!border-surface-600 !bg-surface-100 dark:!bg-surface-800 !text-surface-600 dark:!text-surface-400 hover:!bg-surface-200 dark:hover:!bg-surface-700 transition-colors" 
            tabindex="-1"
          >
             <span class="p-button-icon pi pi-calendar"></span>
          </button>
        </div>

        <!-- Custom Popup -->
        <div 
            v-if="isOpen" 
            class="absolute z-50 end-0 shadow-lg rounded-lg overflow-hidden bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 w-full min-w-[300px]"
            :class="dropdownDirection === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'"
        >
            <PersianCalendar 
                :model-value="modelValue" 
                @update:model-value="onPersianSelect" 
            />
        </div>
      </div>
      <template #fallback>
        <div class="relative w-full">
           <input type="text" class="p-inputtext p-component p-variant-filled w-full" disabled placeholder="Loading..." />
        </div>
      </template>
    </ClientOnly>

    <small v-if="error" class="p-error">{{ error }}</small>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import jalaali from 'jalaali-js';
import PersianCalendar from './PersianCalendar.vue';

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<{
  modelValue?: Date | null;
  label?: string;
  error?: string | boolean;
}>();

const emit = defineEmits(['update:modelValue']);
const { locale } = useI18n();

// State
const isOpen = ref(false);
const dropdownDirection = ref<'up' | 'down'>('down');
const containerRef = ref<HTMLElement | null>(null);

// Methods
const updateValue = (val: Date | null) => {
  emit('update:modelValue', val);
};

const onPersianSelect = (date: Date) => {
    emit('update:modelValue', date);
    isOpen.value = false;
};

const toggleOpen = async () => {
    if (isOpen.value) {
        isOpen.value = false;
        return;
    }
    
    // Default to down initially
    dropdownDirection.value = 'down';
    isOpen.value = true;
    
    // Check available space
    await nextTick();
    if (containerRef.value) {
        const rect = containerRef.value.getBoundingClientRect();
        const popupHeight = 350; // Approximate height of calendar
        const spaceBelow = window.innerHeight - rect.bottom;
        
        // If not enough space below AND enough space above, flip up
        if (spaceBelow < popupHeight && rect.top > popupHeight) {
            dropdownDirection.value = 'up';
        }
    }
};

// Utils: Click Outside
const handleClickOutside = (event: MouseEvent) => {
    if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
        isOpen.value = false;
    }
};

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});

// Format Display Value (Persian)
const displayPersianValue = computed(() => {
    if (!props.modelValue) return '';
    
    // Convert to Jalaali
    const j = jalaali.toJalaali(props.modelValue);
    
    // Shahanshahi Offset: +1180
    const shYear = j.jy + 1180;
    
    const persianMap = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const toFa = (n: number | string) => n.toString().replace(/\d/g, d => persianMap[parseInt(d)]);
    const pad = (n: number) => n < 10 ? '0' + n : n;

    // Format: YYYY/MM/DD (Persian Digits)
    return `${toFa(shYear)}/${toFa(pad(j.jm))}/${toFa(pad(j.jd))}`;
});

</script>

<style scoped>
/* Ensure button corners align in RTL/LTR mixed contexts if needed */
/* Since we forced flex layout, standard Tailwind classes work. */
</style>
