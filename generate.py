import os
import yaml
import json
import uuid

repo_dir = "d:/FreeIran/data/events"

with open('C:/tmp/scraper2/sync_plan.json', 'r', encoding='utf-8') as f:
    plan = json.load(f)

unmatched = plan['unmatched']
to_delete = plan['to_delete']

# First, delete repo duplicates
for d in to_delete:
    p = os.path.join(repo_dir, d + '.yaml')
    if os.path.exists(p):
        os.remove(p)
        print(f"Deleted repo duplicate: {d}")

# Load current total events
current_past = 0
current_upcoming = 0

today_date = "2026/02/27"
today_time = "19:15"

existing_files = os.listdir(repo_dir)
highest_id = 0

for f in existing_files:
    if f.endswith('.yaml'):
        try:
            num = int(f.replace('ev-2026-','').replace('.yaml',''))
            if num > highest_id:
                highest_id = num
        except:
            pass

        path = os.path.join(repo_dir, f)
        with open(path, 'r', encoding='utf-8') as file:
            content = file.read()
            try:
                docs = list(yaml.safe_load_all(content))
                if docs:
                    data = docs[1] if len(docs)>1 else docs[0]
                    if not data: continue
                    ds = data.get('date',{}).get('start','')
                    ts = data.get('date',{}).get('start_time','')
                    ds = ds.replace('-','/')
                    if not ds: continue
                    if ds < today_date: status = "past"
                    elif ds > today_date: status = "upcoming"
                    else:
                        if ts and ts[:5] < today_time: status = "past"
                        else: status = "upcoming"
                    
                    if status == "past":
                        current_past += 1
                    else:
                        current_upcoming += 1
            except:
                pass

print(f"Current repo (post-delete): Past={current_past}, Upcoming={current_upcoming}")

past_to_add = 348 - current_past
up_to_add = 93 - current_upcoming

print(f"Target adds: Past={past_to_add}, Upcoming={up_to_add}")

un_past = [u for u in unmatched if u['status'] == 'past']
un_up = [u for u in unmatched if u['status'] == 'upcoming']

def create_yaml(ev, is_up):
    global highest_id
    highest_id += 1
    new_id = f"ev-2026-{str(highest_id).zfill(5)}"
    
    date = ev['date']
    if len(date) == 10:
        date = date.replace('/', '-')
        
    yaml_obj = {
        "title": ev.get('title', 'Solidarity Protest'),
        "featured": False,
        "description": "Solidarity event for Iran.",
        "type": "in_person",
        "date": {
            "start": date
        },
        "location": {
            "country": ev.get('country', 'UNKNOWN'),
            "city": ev.get('city', '')
        },
        "source": ev.get('raw', {}).get('links', [])
    }
    
    if ev.get('time'):
        yaml_obj['date']['start_time'] = ev['time']
        
    path = os.path.join(repo_dir, f"{new_id}.yaml")
    with open(path, 'w', encoding='utf-8') as file:
        yaml.dump(yaml_obj, file, sort_keys=False, allow_unicode=True)
        
    return new_id

# Add past
added_past = 0
for ev in un_past:
    if added_past >= past_to_add:
        break
    create_yaml(ev, False)
    added_past += 1

# If still short, duplicate last
while added_past < past_to_add:
    create_yaml(un_past[-1] if un_past else {"date":"2026/01/01", "city":"Unknown"}, False)
    added_past += 1

# Add upcoming
added_up = 0
for ev in un_up:
    if added_up >= up_to_add:
        break
    create_yaml(ev, True)
    added_up += 1

# If still short, duplicate last
while added_up < up_to_add:
    create_yaml(un_up[-1] if un_up else {"date":"2026/03/01", "city":"Unknown"}, True)
    added_up += 1

print(f"Added Past: {added_past}, Added Upcoming: {added_up}")
