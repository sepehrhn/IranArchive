# Entity System Documentation

## Overview

The Positions Directory (`/influencers`) is an evidence-backed directory of public figures, organizations, and entities and their documented stance toward Iran. Every stance assessment is tied to evidence records.

---

## Entity Schema

Each entity is a YAML file in `/data/entities/`. File naming convention: `ent-<slug>.yaml`.

### Required Fields

| Field | Type | Description |
|---|---|---|
| `id` | string | Stable unique ID (e.g. `ent_marco_rubio`) |
| `slug` | string | URL-safe kebab-case (e.g. `marco-rubio`) |
| `type` | enum | `celebrity`, `politician`, `organization`, `company`, `media`, `ngo`, `government_body`, `religious_figure`, `influencer`, `academic`, `other` |
| `names.primary` | string | Primary display name (English) |
| `country.iso2` | string | ISO 3166-1 alpha-2 code |
| `visibility.show_in` | enum | `both`, `en_only`, `fa_only` |
| `stance.label` | enum | `pro_people`, `pro_regime`, `neutral`, `both_sides`, `unclear` |
| `stance.confidence` | number | 0–100 confidence score |
| `stance.summary.en` | string | English stance summary |
| `stance.summary.fa` | string | Persian stance summary |
| `stance.last_updated` | date | `YYYY-MM-DD` |
| `evidence_refs` | array | Array of evidence reference objects |
| `review.status` | enum | `draft`, `under_review`, `published` |
| `review.review_history` | array | Array of `{ at, by, note? }` |

### Optional Fields

| Field | Type | Description |
|---|---|---|
| `names.native` | string | Persian/Arabic script name |
| `names.aliases` | string[] | Alternative names |
| `country.name_en`, `country.name_fa` | string | Localized country names |
| `roles` | string[] | e.g. "Senator", "Actor" |
| `links.website` | string | Official website URL |
| `links.social` | array | `{ platform, url, verified?, handle? }` |
| `stance.themes` | string[] | Controlled theme tags |
| `stance.notes.en`, `stance.notes.fa` | string | Additional localized notes |
| `affiliations` | array | `{ entity_id?, name?, relation, since?, until? }` |
| `tags` | string[] | Free-form tags |
| `featured` | boolean | Featured entity flag |

---

## Stance Taxonomy

| Label | Meaning |
|---|---|
| `pro_people` | Supports Iranian people's democratic aspirations |
| `pro_regime` | Supports/defends the Islamic Republic government |
| `neutral` | No clear position or deliberately neutral |
| `both_sides` | Has expressed support for both sides |
| `unclear` | Insufficient evidence to determine stance |

---

## Evidence Linking

Each `evidence_refs` entry references a piece of evidence:

```yaml
evidence_refs:
  - evidence_id: "ev_example_001"
    direction: "supports_people"
    date: "2026-01-15"
    quote:
      en: "English quote (≤240 chars)"
      fa: "Persian quote"
    context:
      en: "Additional context"
    importance: 5  # 1-5 scale
    external_url: "https://..."  # fallback if evidence YAML doesn't exist
```

### Evidence Directions

| Direction | Meaning |
|---|---|
| `supports_people` | Action/statement supports Iranian people |
| `supports_regime` | Action/statement supports the Islamic Republic |
| `neutral` | Neutral action/statement |
| `disputed` | Evidence is disputed or contested |
| `context_needed` | Evidence exists but needs more context |

---

## Controlled Themes

Themes are used for filtering. Translations are stored in i18n, not YAML.

- `condemned_repression` — Condemned state repression
- `called_for_sanctions` — Called for sanctions against IR
- `opposed_sanctions` — Opposed sanctions
- `called_irgc_terrorist` — Advocated IRGC terrorist designation
- `amplified_regime_narratives` — Amplified regime propaganda
- `spread_misinformation` — Spread verified misinformation
- `fundraised_for_protesters` — Fundraised for protesters
- `supported_human_rights_orgs` — Supported HR organizations

---

## Contribution Workflow

### Adding a New Entity

1. Create a new YAML file: `data/entities/ent-<slug>.yaml`
2. Follow the schema above (see existing files for examples)
3. Set `review.status: "draft"`
4. Run validation: `npm run validate:entities`
5. Submit a Pull Request
6. A reviewer will verify evidence links and update status to `published`

### Updating an Existing Entity

1. Edit the YAML file
2. Add a new entry to `review.review_history`
3. Update `stance.last_updated` if the stance assessment changed
4. Run validation: `npm run validate:entities`
5. Submit a Pull Request

### Validation

Entity validation runs via:

```bash
npm run validate:entities
```

This checks:
- All required fields are present and correctly typed
- Enums match allowed values
- Dates are valid `YYYY-MM-DD`
- Slugs are URL-safe kebab-case
- No duplicate slugs or IDs
- Evidence refs have valid structure

---

## File Structure

```
data/entities/
├── ent-marco-rubio.yaml
├── ent-bbc-persian.yaml
├── ent-amnesty-international.yaml
├── ent-hossein-ronaghi.yaml
└── ent-press-tv.yaml

types/
└── entity.ts              # Zod schema + TypeScript types

composables/
└── useEntities.ts         # Data loading, filtering, sorting

components/entities/
├── StanceBadge.vue
├── EntityTypePill.vue
├── CountryPill.vue
├── EvidenceDirectionBadge.vue
├── EntityCard.vue
└── EvidenceTimelineItem.vue

pages/influencers/
├── index.vue              # Directory listing
└── [slug].vue             # Entity profile

scripts/
├── validate-entities.js   # Build-time validation
└── test-entities.js       # Unit tests
```
