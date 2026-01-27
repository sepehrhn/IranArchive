<script setup lang="ts">
import { useRoute } from 'vue-router';
import VictimDetail from '@/components/victims/VictimDetail.vue';

const route = useRoute();
const id = route.params.id as string;
</script>

<template>
    <div class="py-8 px-4">
         <div class="max-w-5xl mx-auto mb-6">
            <NuxtLink to="/victims" class="inline-flex items-center gap-2 text-surface-500 hover:text-primary-500 transition-colors">
                <i class="pi pi-arrow-left"></i>
                <span>Back to Victims List</span>
            </NuxtLink>
        </div>

        <VictimDetail :victim-id="id" />
    </div>
</template>
