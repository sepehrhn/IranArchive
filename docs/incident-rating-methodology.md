# Incident verification and rating methodology

IranArchive uses two separate 1–10 ratings:

- **Veracity** measures confidence that the incident's core factual claim occurred as described.
- **Evidence availability** measures the amount, independence, specificity, and public reviewability of supporting material.

## Maximum rating: 10/10

An incident may receive **10/10 veracity** only when the core event is established by one of these routes:

1. two or more independent, reputable investigations that reach the same core finding; or
2. an authoritative investigation that directly verifies original visual, documentary, satellite, or forensic material and corroborates its time, place, and context through additional evidence.

An incident may receive **10/10 evidence availability** only when the supporting record contains multiple reviewable evidence modes, such as verified video or photographs, geolocation, satellite imagery, medical or forensic review, official records, and independently obtained witness testimony. A single uncorroborated social-media post cannot receive 10/10.

The score applies only to the incident's **core claim**. It does not automatically validate every casualty estimate, attribution, motive, or surrounding allegation.

## Victim-linked incident generation

IranArchive also generates incident pages from its existing victim catalogue to improve discovery and connect named victims to the incident timeline. A victim record is eligible only when it has:

- a named victim;
- a valid incident date;
- a named city;
- a status of `Killed`; and
- at least one retained HTTP(S) source.

Candidates are ranked deterministically by source count, independent source domains, image references, date precision, location completeness, and recorded cause or suspected actor. Duplicate name/date/city combinations are removed.

Generated victim-linked incidents are always capped below the maximum:

- **Veracity:** 7–9
- **Evidence availability:** 6–9

A generated incident reaches `verified` status only when it has an exact date and corroboration across at least two independent source domains. Otherwise it remains `not_verified`. The generator does not replace case-by-case human review.

## Reproducibility

`npm run generate:incidents` creates:

- 20 manually reviewed maximum-rating incidents from `data/incident-batches/2026-verified-incidents.compact.json`; and
- 100 source-backed victim-linked incidents selected from `data/victims/`.

The generated YAML records are written below `data/incidents/generated/` before development, validation, build, or static generation. The process fails rather than silently producing fewer than 100 eligible victim-linked incidents.
