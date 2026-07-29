<script setup lang="ts">
useSeoMeta({
    title: 'Submission Safety and Takedowns | IranArchive',
    description: 'How IranArchive handles public submissions, sensitive information, and removal requests.',
});
</script>

<template>
    <main class="container mx-auto max-w-4xl px-4 py-8 prose dark:prose-invert">
        <div class="mb-4 not-prose">
            <NuxtLink to="/submit" class="inline-flex items-center text-sm text-surface-600 dark:text-surface-400 hover:text-primary-600">
                <i class="pi pi-arrow-left mr-2" /> Back to submissions
            </NuxtLink>
        </div>

        <h1>Submission Safety and Takedowns</h1>
        <p>Do not submit private addresses, phone numbers, identity documents, live locations, or information that could put a person at risk.</p>

        <h2>Review and publication</h2>
        <p>Submissions are held for human review. Sending a submission does not guarantee publication. We may redact, delay, or decline material to reduce safety risks and to protect people named in it.</p>

        <h2>Retention</h2>
        <p>Unpublished submissions and their uploads are retained only for the time needed to review and process them. We aim to remove rejected or abandoned submissions within 30 days. Published material is retained as part of the archive unless a justified correction or takedown request is accepted.</p>

        <h2>Corrections and takedowns</h2>
        <p>For urgent safety concerns, corrections, or removal requests, email <a href="mailto:contact@iranarchive.net">contact@iranarchive.net</a> with the relevant page URL, a way to verify your connection to the material where appropriate, and a concise explanation. Safety-related requests are prioritized.</p>

        <h2>Upload limits</h2>
        <p>Each submission may include up to 10 files, totaling 75 MB. Individual files may not exceed 50 MB. Accepted formats are limited to common images, videos, and PDFs.</p>
    </main>
</template>
