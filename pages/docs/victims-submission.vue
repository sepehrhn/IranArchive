<script setup lang="ts">
// Static documentation page
</script>

<template>
    <div class="container mx-auto px-4 py-8 max-w-4xl prose dark:prose-invert">
        <!-- Breadcrumb / Back -->
        <div class="mb-4 not-prose">
            <NuxtLink to="/victims" class="inline-flex items-center text-sm text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <i class="pi pi-arrow-left mr-2" />
                Back to Victims
            </NuxtLink>
        </div>

        <h1>Submitting a Victim Record</h1>
        <p>The Iran Archive Victims database documents those who have suffered under the regime. We strive for accuracy and welcome community submissions to help complete the record.</p>

        <h2>How to Submit</h2>

        <h3>Option 1: Tag us on 𝕏 (Twitter)</h3>
        <p>Tag our 𝕏 page <a href="https://x.com/Iran_Archive" target="_blank">@Iran_Archive</a> with details of the victim.</p>

        <h3>Option 2: Email</h3>
        <p>Identify the required details (see checklist below) and email them to <a href="mailto:contact@iranarchive.net">contact@iranarchive.net</a>.</p>

        <h2>Submission Checklist</h2>
        <p>Please ensure you provide at least:</p>
        <ul>
            <li><strong>Full Name</strong> (in English and Persian if possible)</li>
            <li><strong>Date of Incident/Arrest/Death</strong></li>
            <li><strong>Location</strong> (City, Province)</li>
            <li><strong>Description of Events</strong></li>
            <li><strong>Verification Source</strong> (Link to news report, social media post, or obituary)</li>
            <li><strong>Photo</strong> (if available)</li>
        </ul>

         <h2>Sensitivity Notice</h2>
        <p>We prioritize the safety of victims and their families. If you are submitting sensitive information, please assume a "Not Verified" status until we can independently corroborate the details.</p>
        

    </div>
</template>
