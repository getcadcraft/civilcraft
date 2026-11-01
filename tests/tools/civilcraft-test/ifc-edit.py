#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""ifc-edit.py — 0.7.1 71.27: another program editing CivilCraft's IFC (IfcOpenShell as that program), for the native-save tests.
   tools/detailcraft-test/venv/bin/python -I tools/civilcraft-test/ifc-edit.py <in.ifc> <out.ifc> [--delete NAME]… [--set NAME PSET PROP VALUE]… [--resave]
--delete removes the product named NAME (ifcopenshell.api.root.remove_product), --set changes one property, --resave only writes the
file again (IfcOpenShell's own formatting and line order: nothing changed in content). Prints a JSON line of what it did."""
import json, sys
import ifcopenshell, ifcopenshell.api.root, ifcopenshell.api.pset
import ifcopenshell.util.element as ue
src, dst, args = sys.argv[1], sys.argv[2], sys.argv[3:]
f = ifcopenshell.open(src)
done = []
i = 0
byname = lambda n: [p for p in f.by_type('IfcProduct') if p.Name == n]
while i < len(args):
    if args[i] == '--delete':
        for p in byname(args[i + 1]): ifcopenshell.api.root.remove_product(f, product=p); done.append(['deleted', args[i + 1]])
        i += 2
    elif args[i] == '--set':
        name, pset, prop, val = args[i + 1:i + 5]
        for p in byname(name):
            ps = ue.get_psets(p).get(pset)
            if ps: ifcopenshell.api.pset.edit_pset(f, pset=f.by_id(ps['id']), properties={prop: float(val)}); done.append(['set', name, pset, prop, val])
        i += 5
    else: i += 1
f.write(dst)
print(json.dumps(done))
