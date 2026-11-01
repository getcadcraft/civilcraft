# normalize.py — turn an agent's research batch (stdin JSON) into research/states-<x>.json: amendment names → the checker's rule ids,
# an amendments list that could not be checked → [] + "amendments_unconfirmed": true. Usage: python3 normalize.py <x> < batch.json
import json, sys, re
MAP = [(r'riser', 'stair.riser.max'), (r'tread', 'stair.tread.min'), (r'width', 'stair.width.min'), (r'headroom', 'stair.headroom.min'),
       (r'handrail', 'stair.rail.height'), (r'ceiling', 'room.ceiling.min'), (r'light|glaz', 'room.light.min'), (r'vent|openable', 'room.vent.min')]
rows = json.load(sys.stdin)
for r in rows:
    a = r.get('amendments')
    if not isinstance(a, list):
        r['amendments'] = []; r['amendments_unconfirmed'] = True; continue
    out = []
    for x in a:
        if 'rule' in x and x['rule'].count('.') >= 2: out.append(x); continue
        lim = str(x.get('limit') or x.get('rule') or '').lower()
        rid = next((rid for pat, rid in MAP if re.search(pat, lim)), None)
        if rid: out.append({'rule': rid, 'value': x.get('value') or x.get('amended_value'), 'section': x.get('section'), 'source': x.get('source', '')})
    r['amendments'] = out
json.dump(rows, open(f'research/states-{sys.argv[1]}.json', 'w'), indent=1, ensure_ascii=False)
print(len(rows), 'rows →', f'research/states-{sys.argv[1]}.json')
