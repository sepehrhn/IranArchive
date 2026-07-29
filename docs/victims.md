# Contributing: Victims Registry

This guide explains how to add or update victim records. Accuracy, dignity, and safety take priority over completeness.

## Data Location

- Victim records live in `data/victims/*.yaml`.
- Local victim photos live in `data/victims/img/`.
- External photos may be referenced by URL when they are already hosted by a trusted source.

## File Naming

Use a stable ID-style filename:

```text
data/victims/vic-YYYY-XXXXX.yaml
```

The filename becomes the victim ID exposed by the API.

## Required Fields

At minimum, each record should include:

```yaml
name: "Full Name"
persian_name: "نام فارسی"
status: "Killed"
date_of_death: "2026-01-08"
date_of_death_precision: "Exact"
incident_province: "Tehran"
incident_city: "Tehran"
description: "Short verified narrative."
source_type: "Social Media"
source:
  - "https://example.com/source"
```

Use empty strings for unknown optional values instead of guessing.

## Photos

Use the `photo` field as an array:

```yaml
photo:
  - "vic-2026-00001.jpg"
  - "https://example.com/photo.jpg"
```

Local filenames are resolved from `data/victims/img/`. External URLs should be public, stable, and safe to display.

## Incident Links

If a victim is linked to an incident, add the victim ID to the incident YAML under `victims`, or add `incident_ids` to the victim record if the incident already exists.

## Validation

Before committing:

```bash
npm run validate
```

The validator checks YAML parsing, required app fields, source URL format, duplicate IDs, and known province names.

## Safety

- Do not publish private addresses, phone numbers, or family contact information.
- Mark uncertain details clearly in `description`.
- Prefer archived or durable source links when available.
