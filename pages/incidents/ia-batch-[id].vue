<script setup lang="ts">
import MarkdownIt from 'markdown-it'
import { verifiedHistoricalIncidentBatch } from '~/data/incidents/verifiedHistoricalIncidentBatch'

const route = useRoute()
const suffix = String(route.params.id || '')
const incidentId = suffix.startsWith('ia-batch-') ? suffix : `ia-batch-${suffix}`
const incident = computed(() => verifiedHistoricalIncidentBatch.find(item => item.id === incidentId))

const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
})

const renderMarkdown = (text: string) => md.render(text || '')

const pageTitle = computed(() => incident.value ? `${incident.value.title} — IranArchive` : 'Incident Not Found')
const pageDescription = computed(() => incident.value?.summary || 'Incident details on IranArchive.')

useSeoMeta({
  title: pageTitle,
  ogTitle: pageTitle,
  description: pageDescription,
  ogDescription: pageDescription,
  ogImage: 'https://iranarchive.com/og-image-incidents.jpg',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <div class="min-h-screen bg-surface-50/50 dark:bg-surface-950">
    <div v-if="incident" class="px-4 py-8 max-w-7xl mx-auto">
      <IncidentsIncidentHeader :incident="incident" />

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-12 items-start">
        <main class="lg:col-span-8 space-y-10">
          <section>
            <div class="flex items-center justify-between mb-8 border-b border-surface-200 dark:border-surface-800 pb-4">
              <h2 class="text-2xl font-black text-surface-900 dark:text-surface-0 tracking-tight">The Narrative</h2>
            </div>

            <div class="prose dark:prose-invert max-w-none mb-10 text-surface-700 dark:text-surface-300 leading-relaxed">
              <div class="mb-6 text-surface-900 dark:text-surface-100" v-html="renderMarkdown(incident.narrative)"></div>
            </div>

            <div class="bg-surface-0 dark:bg-surface-900 rounded-2xl p-8 border border-surface-200 dark:border-surface-800 shadow-sm relative overflow-hidden">
              <div class="absolute top-0 left-0 w-2 h-full bg-primary-500"></div>
              <h2 class="text-2xl font-black mb-8 flex items-center gap-2 text-surface-900 dark:text-surface-0 tracking-tight">
                <i class="pi pi-verified text-primary-500"></i> Key Claims
              </h2>
              <ul class="space-y-4">
                <li v-for="(claim, index) in incident.key_claims" :key="index" class="flex gap-4 items-start">
                  <span class="font-bold text-primary-500 mt-0.5">•</span>
                  <span class="text-surface-800 dark:text-surface-200 leading-relaxed">{{ claim }}</span>
                </li>
              </ul>
            </div>

            <div v-if="incident.limitations.length" class="mt-8 bg-surface-0 dark:bg-surface-900 rounded-2xl p-8 border border-surface-200 dark:border-surface-800">
              <h2 class="text-xl font-bold mb-4 text-surface-900 dark:text-surface-0">Limitations</h2>
              <ul class="list-disc list-inside space-y-2 text-surface-600 dark:text-surface-400">
                <li v-for="(limitation, index) in incident.limitations" :key="index">{{ limitation }}</li>
              </ul>
            </div>
          </section>

          <section id="sources" class="scroll-mt-20">
            <h2 class="text-2xl font-black text-surface-900 dark:text-surface-0 tracking-tight mb-8 border-b border-surface-200 dark:border-surface-800 pb-4">Sources</h2>
            <IncidentsSourcesBlock :sources="incident.sources" />
          </section>
        </main>

        <aside class="lg:col-span-4 space-y-8 lg:sticky lg:top-8">
          <section>
            <IncidentsVerificationBlock :incident="incident" mode="status" />
          </section>

          <section>
            <div class="flex items-center gap-2 mb-6">
              <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0">Timeline</h2>
            </div>
            <IncidentsTimelineBlock :events="incident.timeline" :sources="incident.sources" />
          </section>

          <section>
            <IncidentsVerificationBlock :incident="incident" mode="history" />
          </section>
        </aside>
      </div>
    </div>

    <div v-else class="text-center py-40">
      <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-surface-100 dark:bg-surface-800 mb-6">
        <i class="pi pi-search text-4xl text-surface-400"></i>
      </div>
      <h1 class="text-3xl font-bold mb-4 text-surface-900 dark:text-surface-0">Incident Not Found</h1>
      <p class="text-surface-500 mb-8 max-w-md mx-auto">The incident record you are looking for does not exist or has been removed.</p>
      <NuxtLink to="/incidents">
        <Button label="Return to Incidents" severity="secondary" />
      </NuxtLink>
    </div>
  </div>
</template>
