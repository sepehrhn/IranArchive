# Campaigns Architecture

The campaign framework tracks international alignment with six concrete demands related to Iran. Countries and entities are scored against the same campaign definitions.

## Data Location

- Campaign definitions: `data/campaigns/campaigns.yaml`
- Country positions: `data/countries/*.yaml`
- Entity positions: `data/entities/ent-<slug>.yaml`
- Generated indexes: `public/index/*.json`

## The 6 Canonical Campaigns

1. Repression Deterrence and Protection
2. Maximum Financial Cutoff
3. Free Internet
4. Diplomatic Isolation and Accountability
5. Free Political Prisoners Now
6. Recognition of Transitional Authority

## Scoring Levels

- `0`: Opposed, enabling the regime, or no evidence of alignment.
- `1`: Symbolic statements only.
- `2`: Limited or conditional measures.
- `3`: Substantive action.
- `4`: Full alignment and total cutoff.

## Evidence Requirement

Any score above `0` must include at least one `evidence_id`.

Country example:

```yaml
campaign_statuses:
  protect_iran:
    level: 3
    last_updated: "2026-02-15"
    evidence_ids:
      - "ev-2026-00001"
    notes: "Imposed targeted sanctions on repression officials."
```

Entity example:

```yaml
campaign_positions:
  free_internet:
    level: 2
    last_updated: "2026-02-15"
    evidence_ids:
      - "ev-2026-00002"
    notes: "Publicly backed emergency connectivity support."
```

## Workflow

1. Add or verify the evidence record under `data/evidences/`.
2. Update the relevant country or entity YAML.
3. Add a concise `notes` sentence and update `last_updated`.
4. Run:

```bash
npm run validate
npm run validate:entities
npm run gen-indexes
```

5. Review generated index changes in `public/index/` before committing.
