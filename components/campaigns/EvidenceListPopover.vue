<template>
  <div class="inline-flex items-center">
    <Button 
      v-if="evidenceIds && evidenceIds.length > 0"
      :label="evidenceIds.length.toString()"
      icon="pi pi-file"
      size="small"
      severity="secondary"
      outlined
      class="p-0 px-2 py-1! text-xs h-6 max-h-6"
      @click="togglePopover"
    />
    <span v-else class="text-xs text-surface-400 italic">{{ countOnly ? '-' : $t('No evidence') || 'No evidence' }}</span>

    <Popover ref="op">
      <div class="p-3 w-64 max-w-sm">
        <h4 class="text-sm font-bold mb-2">{{ $t('Supporting Evidence') || 'Supporting Evidence' }}</h4>
        <ul class="flex flex-col gap-2 m-0 p-0 list-none">
          <li v-for="id in evidenceIds" :key="id" class="text-xs border-b border-surface-200 dark:border-surface-700 pb-2 last:border-0 last:pb-0">
            <!-- Once evidence search/details API exists, we can show real titles instead of IDs -->
            <!-- For now we show the ID and link to its conceptual route -->
            <NuxtLink :to="`/evidence/${id}`" class="text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
              <i class="pi pi-external-link text-[0.6rem]"></i> {{ id }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </Popover>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  evidenceIds: {
    type: Array,
    default: () => []
  },
  countOnly: {
    type: Boolean,
    default: false
  }
});

const op = ref(null);

const togglePopover = (event) => {
  op.value.toggle(event);
};
</script>
