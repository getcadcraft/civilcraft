# SPDX-License-Identifier: Apache-2.0
"""mep_check.py — what IfcOpenShell reads of BimCraft's pipe and duct runs (0.6 DF.29, session bim-draw).

    venv/bin/python -I tools/bimcraft-test/mep_check.py file.ifc …
prints one JSON line per file: systems {name: elements assigned}, the port connections, ports, the ports no other port
touches, MEP elements by class, and for each segment its world start and end (mm) from IfcOpenShell's own geometry.
"""
import json
import sys

import ifcopenshell
import ifcopenshell.geom
import ifcopenshell.util.unit


def main(paths):
    for p in paths:
        f = ifcopenshell.open(p)
        scale = ifcopenshell.util.unit.calculate_unit_scale(f) * 1000.0  # file units → mm
        systems = {}
        for s in f.by_type('IfcSystem'):
            n = 0
            for rel in getattr(s, 'IsGroupedBy', []) or []:
                n += len(rel.RelatedObjects)
            systems[s.Name] = n
        conns = f.by_type('IfcRelConnectsPorts')
        ports = f.by_type('IfcDistributionPort')
        joined = set()
        for c in conns:
            joined.add(c.RelatingPort.id())
            joined.add(c.RelatedPort.id())
        classes = {}
        for cls in ('IfcPipeSegment', 'IfcPipeFitting', 'IfcDuctSegment', 'IfcDuctFitting', 'IfcValve', 'IfcFlowSegment', 'IfcFlowFitting', 'IfcFlowController', 'IfcElementAssembly'):
            try:
                n = len([e for e in f.by_type(cls) if e.is_a() == cls])
            except RuntimeError:
                n = 0
            if n:
                classes[cls] = n
        settings = ifcopenshell.geom.settings()
        settings.set(settings.USE_WORLD_COORDS, True)
        boxes = []
        for e in f.by_type('IfcFlowSegment'):  # IFC4's pipe and duct segments are subtypes of it
            try:
                shape = ifcopenshell.geom.create_shape(settings, e)
            except Exception as ex:  # noqa: BLE001 — report, don't stop
                boxes.append({'id': e.id(), 'error': str(ex)[:80]})
                continue
            v = shape.geometry.verts
            xs, ys, zs = v[0::3], v[1::3], v[2::3]
            # geometry comes back in metres
            boxes.append({'id': e.id(), 'min': [round(min(xs) * 1000, 1), round(min(ys) * 1000, 1), round(min(zs) * 1000, 1)],
                          'max': [round(max(xs) * 1000, 1), round(max(ys) * 1000, 1), round(max(zs) * 1000, 1)]})
        print(json.dumps({'file': p, 'schema': f.schema, 'systems': systems, 'connections': len(conns), 'ports': len(ports),
                          'open_ports': len([q for q in ports if q.id() not in joined]), 'classes': classes, 'segments': boxes,
                          'unit_mm': scale}))


if __name__ == '__main__':
    main(sys.argv[1:])
