import os
import yaml
import json
import re
from datetime import datetime
import string

repo_dir = "d:/FreeIran/data/events"

with open('C:/tmp/scraper3/perfect_events.json', 'r', encoding='utf-8') as f:
    scraped = json.load(f)
    
# Convert scraped to robust model
today_date = "2026/02/27"
today_time = "19:15"

def parse_date(txt):
    m1 = re.search(r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d+)', txt, re.IGNORECASE)
    if m1:
        mon, day = m1.groups()
    else:
        m2 = re.search(r'(\d+)\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)', txt, re.IGNORECASE)
        if m2:
            day, mon = m2.groups()
        else:
            return None
    months = {"Jan":"01","Feb":"02","Mar":"03","Apr":"04","May":"05","Jun":"06","Jul":"07","Aug":"08","Sep":"09","Oct":"10","Nov":"11","Dec":"12"}
    return f"2026/{months[mon.capitalize()[:3]]}/{day.zfill(2)}"

def parse_time(txt):
    m = re.search(r'\d{1,2}:\d{2}', txt)
    if m:
        t = m.group(0)
        if len(t) == 4: t = "0" + t
        return t
    return ""

def get_flag_iso2(txt):
    m = re.search(r'[\U0001F1E6-\U0001F1FF]{2}', txt)
    if m:
        f = m.group(0)
        return chr(ord(f[0])-0x1F1E6+ord('A')) + chr(ord(f[1])-0x1F1E6+ord('A'))
    return None

import unicodedata
def normalize(s):
    return s.lower().translate(str.maketrans('', '', string.punctuation)).replace(' ', '') if s else ""

# Load all repo files
repo_events = []
for f in os.listdir(repo_dir):
    if f.endswith('.yaml'):
        path = os.path.join(repo_dir, f)
        with open(path, 'r', encoding='utf-8') as file:
            content = file.read()
            try:
                docs = list(yaml.safe_load_all(content))
                if docs:
                    data = docs[1] if len(docs)>1 else docs[0]
                    if not data: continue
                    # Compute repo status strictly
                    ds = data.get('date',{}).get('start','')
                    if not ds: continue
                    ts = data.get('date',{}).get('start_time','')
                    ds = ds.replace('-','/')
                    if not ds: continue
                    if ds < today_date: status = "past"
                    elif ds > today_date: status = "upcoming"
                    else:
                        if ts and ts[:5] < today_time: status = "past"
                        else: status = "upcoming"
                    
                    repo_events.append({
                        "id": f[:-5],
                        "title": data.get('title',''),
                        "date": ds,
                        "city": data.get('location',{}).get('city',''),
                        "country": data.get('location',{}).get('country',''),
                        "status": status,
                        "source": data.get('source',[]),
                        "file": path,
                        "content": content
                    })
            except Exception as e:
                print(f"Skipping {f} due to yaml err")

# Build scraped normalized list
scraped_norm = []
for ev in scraped:
    txt = ' '.join(ev['parts'])
    date = parse_date(txt)
    time = parse_time(txt)
    if not date: continue
    
    if date < today_date: status = "past"
    elif date > today_date: status = "upcoming"
    else:
        status = "past" if (time and time < today_time) else "upcoming"
        
    title = ""
    for p in ev['parts']:
        if len(p) > 5 and not re.search(r'^\d{1,2}:\d{2}', p) and not re.search(r'(Jan|Feb|Mar|Apr|May|Jun|Jul)', p):
            title = p
            break
            
    iso2 = get_flag_iso2(txt) or get_flag_iso2(ev.get('city_context',''))
    city = ev.get('city_context','')
    
    scraped_norm.append({
        "raw": ev,
        "date": date,
        "time": time,
        "status": status,
        "title": title,
        "country": iso2 or "UNKNOWN",
        "city": city,
        "parts": ev['parts']
    })

# Match scraped to repo
unmatched = []
matched_repo = set()
for sc in scraped_norm:
    best_score = 0
    best_rp = None
    for rp in repo_events:
        if rp['date'] == sc['date']:
            # city/country match
            sc_c = normalize(sc['city'])
            rp_c = normalize(rp['city'])
            if sc_c and rp_c and (sc_c in rp_c or rp_c in sc_c):
                score = 0.8
                if normalize(sc['title']) == normalize(rp['title']): score = 1.0
                if score > best_score:
                    best_score = score
                    best_rp = rp
            # if no city but same title
            elif normalize(sc['title']) == normalize(rp['title']) and len(sc['title'])>5:
                if 0.9 > best_score:
                    best_score = 0.9
                    best_rp = rp
                    
    if best_rp:
        matched_repo.add(best_rp['id'])
    else:
        unmatched.append(sc)

# Determine final counts if we just add unmatched
repo_past = sum(1 for rp in repo_events if rp['status'] == 'past')
repo_up = sum(1 for rp in repo_events if rp['status'] == 'upcoming')

un_past = sum(1 for sc in unmatched if sc['status'] == 'past')
un_up = sum(1 for sc in unmatched if sc['status'] == 'upcoming')

print(f"Repo: Past={repo_past} Up={repo_up}")
print(f"New : Past={un_past} Up={un_up}")
print(f"Tot : Past={repo_past+un_past} Up={repo_up+un_up}")

# Deduplicate Repo?
# If we have 2 files with exact same title, date, city, delete one.
repo_dedupe_keys = {}
duplicates_to_delete = []
for rp in repo_events:
    key = rp['date'] + "|" + normalize(rp['title']) + "|" + normalize(rp['city'])
    if key in repo_dedupe_keys:
        # duplicate
        duplicates_to_delete.append(rp)
    else:
        repo_dedupe_keys[key] = rp

print(f"Found {len(duplicates_to_delete)} duplicates in repo to delete.")

past_final = repo_past + un_past - sum(1 for d in duplicates_to_delete if d['status'] == 'past')
up_final = repo_up + un_up - sum(1 for d in duplicates_to_delete if d['status'] == 'upcoming')

print(f"Post dedupe projected: Past={past_final} Up={up_final}")

# We need exactly 348 past, 93 upcoming
past_diff = 348 - past_final
up_diff = 93 - up_final
print(f"Diffs: Past={past_diff} Up={up_diff}")

# Save plan
plan = {
   "unmatched": unmatched,
   "to_delete": [d['id'] for d in duplicates_to_delete],
   "diffs": {"past": past_diff, "upcoming": up_diff}
}
with open('C:/tmp/scraper2/sync_plan.json', 'w', encoding='utf-8') as f:
    json.dump(plan, f, indent=2)
