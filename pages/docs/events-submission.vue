<script setup lang="ts">
// Static documentation page
</script>

<template>
    <div class="container mx-auto px-4 py-8 max-w-4xl prose dark:prose-invert">
        <!-- Breadcrumb / Back -->
        <div class="mb-4 not-prose">
            <NuxtLink to="/events" class="inline-flex items-center text-sm text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <i class="pi pi-arrow-left mr-2" />
                Back to Events
            </NuxtLink>
        </div>

        <h1>Submitting an Event</h1>
        <p>The Iran Archive Events calendar is a community-driven effort to track global solidarity events. We welcome submissions from organizers and the community.</p>

        <h2>How to Submit</h2>


        <h3>Option 1: Tag us on 𝕏 (Twitter)</h3>
        <p>Tag our 𝕏 page <a href="https://x.com/Iran_Archive" target="_blank">@Iran_Archive</a> on your event announcement on 𝕏.</p>

        <h3>Option 2: Email</h3>
        <p>Identify the required details (see checklist below) and email them to <a href="mailto:contact@iranarchive.net">contact@iranarchive.net</a>.</p>

        <h2>Submission Checklist</h2>
        <p>Please ensure you provide at least:</p>
        <ul>
            <li><strong>Event Title</strong> and <strong>Summary</strong></li>
            <li><strong>Date & Time</strong> (with Timezone)</li>
            <li><strong>Format</strong> (In-person, Online, or Hybrid)</li>
            <li><strong>Type</strong> (Rally, Webinar, etc.)</li>
            <li><strong>Location</strong> (Country, City, Venue for in-person)</li>
            <li><strong>Organizer Name</strong> and Link</li>
            <li><strong>Verification Source</strong> (Link to a public post, tweet, or website announcing the event)</li>
        </ul>

        <h2>Verification Policy</h2>
        <p>All events are reviewed. We assign a verification status:</p>
        <ul>
            <li><strong>Verified</strong>: Confirmed by reliable sources or known organizers.</li>
            <li><strong>Not Verified</strong>: Source is unclear.</li>
        </ul>
        <p>We prioritize the safety of attendees. If an event location is sensitive, set <code>location_visibility</code> to <code>approximate</code> or <code>withheld</code>.</p>
        

    </div>
</template>
