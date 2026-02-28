import os
import yaml

repo_dir = "d:/FreeIran/data/events"
today_date = "2026/02/27"
today_time = "19:15"

existing_files = os.listdir(repo_dir)

past = 0
up = 0

for f in existing_files:
    if f.endswith('.yaml'):
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
                    ds = str(ds).replace('-','/')
                    if not ds: continue
                    if ds < today_date: status = "past"
                    elif ds > today_date: status = "upcoming"
                    else:
                        if ts and str(ts)[:5] < today_time: status = "past"
                        else: status = "upcoming"
                    
                    if status == "past":
                        past += 1
                    else:
                        up += 1
            except:
                pass

print(f"Final Count -> Past: {past}, Upcoming: {up}, Total: {past+up}")
