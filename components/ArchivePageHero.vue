<script setup lang="ts">
withDefaults(defineProps<{
    eyebrow: string
    title: string
    description?: string
    index?: string
}>(), {
    description: '',
    index: 'IRANARCHIVE / PUBLIC RECORD',
})
</script>

<template>
    <section class="archive-page-hero" aria-labelledby="archive-page-title">
        <div class="archive-page-hero__grid" aria-hidden="true"></div>
        <div class="archive-page-hero__copy">
            <p class="archive-kicker">{{ eyebrow }}</p>
            <h1 id="archive-page-title" dir="auto">{{ title }}</h1>
            <p v-if="description" class="archive-page-hero__description" dir="auto">
                {{ description }}
            </p>
            <slot name="meta" />
        </div>
        <div v-if="$slots.aside || $slots.actions" class="archive-page-hero__aside">
            <slot name="aside" />
            <div v-if="$slots.actions" class="archive-page-hero__actions">
                <slot name="actions" />
            </div>
        </div>
        <div class="archive-page-hero__rule" aria-hidden="true">
            <span>{{ index }}</span>
        </div>
    </section>
</template>
