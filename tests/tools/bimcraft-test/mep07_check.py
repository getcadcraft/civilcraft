# SPDX-License-Identifier: Apache-2.0
"""mep07_check.py — what IfcOpenShell reads of BimCraft's MEP equipment and connected runs (0.7 LC.9, session mep-07).

    venv/bin/python -I tools/bimcraft-test/mep07_check.py file.ifc …

One JSON line per file: schema; equipment {GlobalId: {class, predefined, type, type_class, ports: [{name, flow, world (mm),
connected_to (the other port's owner GlobalId)}], systems: [names], box: {min, max} (mm, IfcOpenShell's own geometry)}};
connections; ports.
"""
import json
import sys

import ifcopenshell
import ifcopenshell.geom
import ifcopenshell.util.element
import ifcopenshell.util.placement
import ifcopenshell.util.system
import ifcopenshell.util.unit

EQUIP = ('IfcUnitaryEquipment', 'IfcFan', 'IfcPump', 'IfcBoiler', 'IfcAirTerminalBox', 'IfcAirTerminal', 'IfcTank',
         'IfcEnergyConversionDevice', 'IfcFlowMovingDevice', 'IfcFlowController', 'IfcFlowTerminal', 'IfcFlowStorageDevice')


def owner_of(port):
    for rel in getattr(port, 'Nests', None) or []:
        return rel.RelatingObject
    for rel in getattr(port, 'ContainedIn', None) or []:
        return rel.RelatedElement
    return None


def main(paths):
    for p in paths:
        f = ifcopenshell.open(p)
        scale = ifcopenshell.util.unit.calculate_unit_scale(f) * 1000.0
        other = {}
        for c in f.by_type('IfcRelConnectsPorts'):
            other[c.RelatingPort.id()] = c.RelatedPort
            other[c.RelatedPort.id()] = c.RelatingPort
        settings = ifcopenshell.geom.settings()
        settings.set(settings.USE_WORLD_COORDS, True)
        out = {}
        seen = set()
        for cls in EQUIP:
            try:
                items = f.by_type(cls)
            except RuntimeError:
                continue
            for e in items:
                if e.id() in seen:
                    continue
                psets = ifcopenshell.util.element.get_psets(e)
                if 'CadCraft_MepEquipment' not in psets:
                    continue
                seen.add(e.id())
                t = ifcopenshell.util.element.get_type(e)
                ports = []
                for q in ifcopenshell.util.system.get_ports(e):
                    m = ifcopenshell.util.placement.get_local_placement(q.ObjectPlacement)
                    o = other.get(q.id())
                    ow = owner_of(o) if o is not None else None
                    ports.append({'name': q.Name, 'flow': q.FlowDirection, 'world': [round(m[0][3] * scale, 1), round(m[1][3] * scale, 1), round(m[2][3] * scale, 1)],
                                  'facing': [round(m[0][2], 6), round(m[1][2], 6), round(m[2][2], 6)],
                                  'connected_to': ow.GlobalId if ow is not None else None, 'connected_class': ow.is_a() if ow is not None else None})
                systems = sorted({g.RelatingGroup.Name for g in (e.HasAssignments or []) if g.is_a('IfcRelAssignsToGroup') and g.RelatingGroup.is_a('IfcSystem')})
                box = None
                try:
                    shape = ifcopenshell.geom.create_shape(settings, e)
                    v = shape.geometry.verts
                    xs, ys, zs = v[0::3], v[1::3], v[2::3]
                    box = {'min': [round(min(xs) * 1000, 1), round(min(ys) * 1000, 1), round(min(zs) * 1000, 1)], 'max': [round(max(xs) * 1000, 1), round(max(ys) * 1000, 1), round(max(zs) * 1000, 1)]}
                except Exception as ex:  # noqa: BLE001 — report, don't stop
                    box = {'error': str(ex)[:100]}
                out[e.GlobalId] = {'class': e.is_a(), 'predefined': getattr(e, 'PredefinedType', None), 'object_type': e.ObjectType,
                                   'type': t.Name if t else None, 'type_class': t.is_a() if t else None, 'type_predefined': getattr(t, 'PredefinedType', None) if t else None,
                                   'ports': ports, 'systems': systems, 'box': box}
        print(json.dumps({'file': p, 'schema': f.schema, 'equipment': out, 'connections': len(f.by_type('IfcRelConnectsPorts')), 'ports': len(f.by_type('IfcDistributionPort'))}))


if __name__ == '__main__':
    main(sys.argv[1:])
