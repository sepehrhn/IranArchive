# Contributing: Victims Registry

This guide explains how to add new victims to the registry. We prioritize accuracy, dignity, and safety.

## 1. Prerequisites
- Only add victims with confirmed reports or strong credible evidence.
- Do not include sensitive private details (home address, phone numbers) not relevant to the public record.

## 2. Directory Structure
- `data/victims/`: Stores victim profiles as JSON.
- `data/sources/`: Stores source citation metadata.
- `public/media/victims/`: Stores profile photos.

## 3. Adding a Victim
1. **Create Source Files**: First, ensure the sources you are citing exist in `data/sources/`.
   - Create `data/sources/SRC-XXXX.json`.
   - Use `archive_url` whenever possible to prevent link rot.

2. **Create Victim File**: Create a new file `data/victims/<slug>.json`.
   - Filename must match the `slug` field.
   - Example: `john-doe.json` -> `"slug": "john-doe"`.

3. **Required Fields**:
   - `id`: Unique ID (e.g., `VIC-001`).
   - `names`: Latin is required; Native is highly recommended.
   - `status`: `confirmed`, `probable`, or `unverified`.
   - `death`: Date and location details.
   - `sources`: Array of source IDs supporting the claim.

4. **Linking to Incidents**:
   If the victim was killed during a specific recorded incident, link it:
   ```json
   "incident_links": [
     {
       "incident_id": "IR-2026-01-01-TEHRAN-0001",
       "relation": "killed",
       "confidence": "high",
       "supporting_sources": ["SRC-001"]
     }
   ]
   ```

5. **Validation**:
   Run `npm run validate` locally before committing.

## 4. Safety & Ethics
- Use "unknown" for precision fields rather than guessing.
- Respect family wishes regarding photos or names if known.
