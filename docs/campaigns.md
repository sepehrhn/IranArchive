# Campaigns Architecture

The Campaigns framework forms the core tracking system for international alignment regarding the Iranian people's demands. 

## The 6 Canonical Campaigns
1. **Repression Deterrence & Protection**: Dismantle the regime’s machinery of repression.
2. **Maximum Financial Cutoff**: Cut off the regime’s financial lifelines in full.
3. **Free Internet**: Ensure free, unfettered communications for the people of Iran.
4. **Diplomatic Isolation & Accountability**: Full diplomatic severance & prosecution of criminals (including IRGC designation).
5. **Free Political Prisoners Now**: Immediate release of political prisoners.
6. **Recognition of Transitional Authority**: Official recognition of the legitimate transitional government.

## Scoring Levels
Every campaign uses a 0-4 scale:
- **0**: Opposed or enables the regime.
- **1**: Symbolic statements only.
- **2**: Limited or conditional measures.
- **3**: Substantive action (e.g., targeted sanctions, expulsion of ambassadors).
- **4**: Full alignment and total cut-off.

## Updating Scores (Workflow)
Our policy strictly requires evidence for any score greater than `0`. You cannot change a score to 1, 2, 3, or 4 without attaching at least one valid `evidence_id`.

**To update a country or entity:**
1. **Add Evidence** to the `/data/evidences/` folder. Ensure it follows the evidence JSON schema.
2. **Update Status**: 
   - Edit the specific `{iso2}.yaml` or `ent-{slug}.yaml` data file.
   - Update the `level` of the relevant campaign.
   - Add your evidence ID to the `evidence_ids` list.
   - Add a 1-sentence English explanation to `notes`.
   - Update `last_updated`.
3. *(Optional)* **Add to Updates feed**: Create a `/data/updates/...` YAML file describing the change. This renders into the global timeline.
4. Run `npm run validate` and `npm run gen-indexes`.

## Code Example: Country YAML
```yaml
campaign_statuses:
  protect_iran:
    level: 3
    last_updated: "2026-02-15"
    evidence_ids: ["ev-1234"]
    notes: "Imposed targeted sanctions on the Morality Police."
```
