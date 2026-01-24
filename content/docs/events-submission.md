# Submitting an Event

The Iran Archive Events calendar is a community-driven effort to track global solidarity events. We welcome submissions from organizers and the community.

## How to Submit

### Option 1: GitHub Pull Request (Preferred)

1.  Fork the [Iran Archive repository](https://github.com/sepehrhn/IranArchive).
2.  Navigate to `data/events/`.
3.  Create a new file named `ev-YYYY-XXXXX.yaml` (increment the last number available).
4.  Copy the content from `events.yaml.example` and fill in your event details.
5.  Submit a Pull Request.

### Option 2: Email

Identify the required details (see checklist below) and email them to `contact@iranarchive.net`.

## Submission Checklist

Please ensure you provide at least:
-   **Event Title** and **Summary**
-   **Date & Time** (with Timezone)
-   **Format** (In-person, Online, or Hybrid)
-   **Type** (Rally, Webinar, etc.)
-   **Location** (Country, City, Venue for in-person)
-   **Organizer Name** and Link
-   **Verification Source** (Link to a public post, tweet, or website announcing the event)

## Verification Policy

All events are reviewed. We assign a verification status:
-   **Verified**: Confirmed by reliable sources or known organizers.
-   **Disputed**: Conflicting reports about time/location.
-   **Not Verified**: Source is unclear.

We prioritize the safety of attendees. If an event location is sensitive, set `location_visibility` to `approximate` or `withheld`.
