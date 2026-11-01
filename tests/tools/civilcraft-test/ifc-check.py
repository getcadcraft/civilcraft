#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""ifc-check.py — 0.7.1 71.24: IfcOpenShell as the independent reader of CivilCraft's project IFC. Opens the file, runs the schema
validator WITH the EXPRESS rules (where rules, global rules), and prints a JSON summary: schema, problems, product counts by class,
predefined types, the spatial tree, psets/quantities of the first element of each class, georeferencing, and for IFC 4.3 every
alignment's layout segments read with ifcopenshell.api.alignment plus points sampled on its geometry by IfcOpenShell's own
geometry kernel (ifcopenshell.geom: the basis curve and the gradient curve).
   tools/detailcraft-test/venv/bin/python -I tools/civilcraft-test/ifc-check.py <file.ifc> [--no-rules] [--samples 20]"""
import json, sys
import ifcopenshell, ifcopenshell.validate
import ifcopenshell.util.element as ue
import ifcopenshell.util.placement as up

path = sys.argv[1]
rules = '--no-rules' not in sys.argv
nsamp = int(sys.argv[sys.argv.index('--samples') + 1]) if '--samples' in sys.argv else 20
f = ifcopenshell.open(path)
log = ifcopenshell.validate.json_logger()
ifcopenshell.validate.validate(f, log, express_rules=rules)
out = {'schema': f.schema_identifier, 'rules': rules, 'problems': [str(s.get('message', s))[:400] for s in log.statements][:30],
       'nproblems': len(log.statements), 'counts': {}, 'predefined': {}, 'psets': {}, 'tree': {}, 'georef': None, 'alignments': []}
for e in f.by_type('IfcProduct'):
    c = e.is_a()
    out['counts'][c] = out['counts'].get(c, 0) + 1
    pt = getattr(e, 'PredefinedType', None)
    if pt:
        out['predefined'].setdefault(c, {})
        out['predefined'][c][pt] = out['predefined'][c].get(pt, 0) + 1
    if c not in out['psets']:
        out['psets'][c] = ue.get_psets(e)
        if getattr(e, 'ObjectType', None): out['psets'][c]['_ObjectType'] = e.ObjectType
for e in f.by_type('IfcProduct'):
    cont = ue.get_container(e)
    if cont:
        k = e.is_a() + ' in ' + cont.is_a()
        out['tree'][k] = out['tree'].get(k, 0) + 1
for r in f.by_type('IfcRelAggregates'):
    k = r.RelatingObject.is_a() + ' > ' + ','.join(sorted(set(o.is_a() for o in r.RelatedObjects)))
    out['tree'][k] = out['tree'].get(k, 0) + 1
if f.schema != 'IFC2X3':
    for mc in f.by_type('IfcMapConversion'):
        out['georef'] = {'crs': mc.TargetCRS.Name, 'eastings': mc.Eastings, 'northings': mc.Northings, 'height': mc.OrthogonalHeight, 'xa': mc.XAxisAbscissa, 'xo': mc.XAxisOrdinate, 'scale': mc.Scale}
else:
    site = f.by_type('IfcSite')[0]
    ps = ue.get_psets(site)
    if 'ePSet_MapConversion' in ps: out['georef'] = {'crs': ps.get('ePSet_ProjectedCRS', {}).get('Name'), 'eastings': ps['ePSet_MapConversion'].get('Eastings'), 'northings': ps['ePSet_MapConversion'].get('Northings')}
units = {u.UnitType: (u.Name if u.is_a('IfcSIUnit') else u.Name) for u in f.by_type('IfcNamedUnit')}
out['units'] = units

if f.schema.startswith('IFC4X3'):
    import ifcopenshell.geom, ifcopenshell.ifcopenshell_wrapper as W
    import ifcopenshell.api.alignment as AA
    s = ifcopenshell.geom.settings()
    for al in f.by_type('IfcAlignment'):
        a = {'name': al.Name, 'layouts': [], 'samples': {}, 'referents': []}
        for lay in AA.get_alignment_layouts(al):
            segs = []
            for rel in lay.IsNestedBy:
                for sg in rel.RelatedObjects:
                    d = sg.DesignParameters
                    segs.append({k: (getattr(d, k) if not hasattr(getattr(d, k), 'Coordinates') else list(getattr(d, k).Coordinates)) for k in d.get_info() if k not in ('id', 'type', 'StartTag', 'EndTag')})
            a['layouts'].append({'type': lay.is_a(), 'segments': segs})
        for rel in al.IsNestedBy:
            for o in rel.RelatedObjects:
                if o.is_a('IfcReferent'):
                    a['referents'].append({'name': o.Name, 'type': o.PredefinedType, 'psets': ue.get_psets(o)})
        for rep in al.Representation.Representations:
            for item in rep.Items:
                try:
                    fn = W.map_shape(s, item)
                    ev = W.function_item_evaluator(s, fn)
                    L = fn.length()
                    pts = []
                    for i in range(nsamp + 1):
                        u = L * i / nsamp
                        m = ev.evaluate(u)
                        pts.append([u, m[0][3], m[1][3], m[2][3]])
                    a['samples'][rep.RepresentationIdentifier] = {'item': item.is_a(), 'length': L, 'pts': pts}
                except Exception as ex:   # noqa: BLE001 — the report says what IfcOpenShell could not evaluate
                    a['samples'][rep.RepresentationIdentifier] = {'item': item.is_a(), 'error': str(ex)[:300]}
        # every curve's segments: does each end where the next starts, and is the written Transition the one IfcOpenShell works out?
        from ifcopenshell.api.alignment.get_curve_segment_transition_code import get_curve_segment_transition_code as tc
        a['transitions'] = []
        for rep in al.Representation.Representations:
            for item in rep.Items:
                segs = list(item.Segments)
                for i in range(len(segs) - 1):
                    try: want = tc(segs[i], segs[i + 1])
                    except Exception as ex: want = 'error: ' + str(ex)[:120]   # noqa: BLE001
                    a['transitions'].append({'curve': item.is_a(), 'i': i, 'written': segs[i].Transition, 'computed': want})
        out['alignments'].append(a)
print(json.dumps(out, default=str))
