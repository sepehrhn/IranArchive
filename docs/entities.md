# Entity System Documentation

The Entities Directory (`/entities`) is an evidence-backed directory of public figures, organizations, media outlets, companies, and other entities and their documented stance toward Iran.

## Data Location

Entity records live in:

```text
data/entities/ent-<slug>.yaml
```

The filename provides the stable ID and slug used by generated indexes and route links.

## Required Fields

```yaml
type: "politician"
names:
  primary: "Example Name"
  native: ""
country:
  iso2: "US"
visibility:
  show_in: "both"
stance:
  label: "pro_people"
  confidence: 80
  summary: "Short evidence-backed summary."
  last_updated: "2026-01-15"
evidence_refs:
  - evidence_id: "ev_example_001"
    direction: "supports_people"
    date: "2026-01-15"
    importance: 3
review:
  status: "draft"
  review_history:
    - at: "2026-01-15"
      by: "reviewer"
      note: "Initial draft."
```

## Stance Taxonomy

- `pro_people`: Supports Iranian people's democratic aspirations.
- `pro_regime`: Supports or defends the Islamic Republic government.
- `neutral`: No clear position or deliberately neutral.
- `both_sides`: Has expressed support for both sides.
- `unclear`: Insufficient evidence to determine stance.

## Evidence Directions

- `supports_people`
- `supports_regime`
- `neutral`
- `disputed`
- `context_needed`

## Contribution Workflow

1. Create or edit `data/entities/ent-<slug>.yaml`.
2. Add evidence references with dates and importance.
3. Update `stance.last_updated` when the assessment changes.
4. Add a `review.review_history` entry.
5. Run:

```bash
npm run validate:entities
npm run gen-indexes
```

Generated indexes are written to `public/index/` and are used by the `/entities`, `/countries`, and `/campaigns` pages.
