<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
    
    <!-- Victims -->
    <Card>
        <template #title>Victims / Affected Individuals</template>
        <template #content>
            <div v-if="victims.length" class="flex flex-wrap gap-2">
                <NuxtLink 
                    v-for="victim in victims" 
                    :key="victim.id"
                    :to="`/victims/${victim.id}`" 
                    class="no-underline"
                >
                    <Chip :label="victim.name" class="cursor-pointer hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors" />
                </NuxtLink>
            </div>
             <p v-else class="text-sm text-gray-500 italic">No specific individuals listed yet.</p>
        </template>
    </Card>

    <!-- Related Incidents -->
    <Card>
         <template #title>Related Incidents</template>
         <template #content>
            <ul v-if="related.length" class="space-y-3">
                <li v-for="inc in related" :key="inc.id" class="flex items-center justify-between">
                    <NuxtLink :to="`/incidents/${inc.slug}`" class="text-primary-600 hover:underline text-sm font-medium">
                        {{ inc.title }}
                    </NuxtLink>
                    <Badge :value="inc.status" :severity="getStatusColor(inc.status)" size="small" />
                </li>
            </ul>
            <p v-else class="text-sm text-gray-500 italic">No related incidents linked.</p>
         </template>
    </Card>

  </div>
</template>

<script setup lang="ts">
import { type Victim, type RelatedIncident } from '~/types/incident';
import { getStatusColor } from '~/utils/formatters';

defineProps<{
  victims: Victim[];
  related: RelatedIncident[];
}>();
</script>
