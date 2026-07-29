<script setup lang="ts">
// Static documentation page
</script>

<template>
    <div>
        <ArchivePageHero
            eyebrow="Contributor guide"
            title="Submitting an Incident"
            description="How to contribute a documented incident for review and preservation."
            index="IRANARCHIVE / SUBMISSION GUIDE"
        />
        <article class="mx-auto max-w-4xl prose dark:prose-invert">
        <!-- Breadcrumb / Back -->
        <div class="mb-4 not-prose">
            <NuxtLink to="/incidents" class="inline-flex items-center text-sm text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <i class="pi pi-arrow-left mr-2" />
                Back to Incidents
            </NuxtLink>
        </div>

        <p>The Iran Archive Incidents database tracks human rights violations and other significant events. Submissions are rigorously reviewed.</p>

        <h2>How to Submit</h2>

        <h3>Option 1: Tag us on 𝕏 (Twitter)</h3>
        <p>Tag our 𝕏 page <a href="https://x.com/Iran_Archive" target="_blank">@Iran_Archive</a> with details of the incident.</p>

        <h3>Option 2: Email</h3>
        <p>Identify the required details (see checklist below) and email them to <a href="mailto:contact@iranarchive.net">contact@iranarchive.net</a>.</p>

        <h2>Submission Checklist</h2>
        <p>Please ensure you provide at least:</p>
        <ul>
            <li><strong>Date & Time</strong> of the incident</li>
            <li><strong>Location</strong> (Coordinates, Street, City)</li>
            <li><strong>Description</strong> of what happened</li>
            <li><strong>Evidence</strong> (Photos, Videos, Links to reports)</li>
            <li><strong>Source</strong> (Who is reporting this?)</li>
        </ul>

         <h2>Verification Policy</h2>
         <p>We employ a strict verification process. Incidents are classified as:</p>
         <ul>
             <li><strong>Verified</strong>: Confirmed by multiple independent sources or trusted partners.</li>
             <li><strong>Not Verified</strong>: Included in the database but lacks independent confirmation.</li>
         </ul>
         <p>All disputed or unverified claims should be clearly marked.</p>
        
        </article>
    </div>
</template>
