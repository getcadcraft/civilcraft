# SPDX-License-Identifier: Apache-2.0
"""hvac_check.py — what IfcOpenShell reads of BimCraft's split / VRF / fan-coil equipment (0.8 SU.888, session sx-mep).

    venv/bin/python -I tools/bimcraft-test/hvac_check.py file.ifc

One JSON line: schema; equipment {Tag: {class, predefined, object_type, type_class, type_predefined, kind, ports: [{name, flow,
system_type, system (CadCraft_Port), connected}]}} for every element with CadCraft_MepEquipment; systems {name: object_type or
PredefinedType}.
"""
import json
import sys

import ifcopenshell
import ifcopenshell.util.element


def main(path):
    f = ifcopenshell.open(path)
    other = set()
    for c in f.by_type('IfcRelConnectsPorts'):
        other.add(c.RelatingPort.id())
        other.add(c.RelatedPort.id())
    out = {}
    for e in f.by_type('IfcElement'):
        ps = ifcopenshell.util.element.get_psets(e)
        eq = ps.get('CadCraft_MepEquipment')
        if not eq:
            continue
        t = ifcopenshell.util.element.get_type(e)
        ports = []
        for rel in getattr(e, 'IsNestedBy', None) or []:
            ports += [p for p in rel.RelatedObjects if p.is_a('IfcDistributionPort')]
        for rel in getattr(e, 'HasPorts', None) or []:
            ports.append(rel.RelatingPort)
        rows = []
        for p in ports:
            pp = ifcopenshell.util.element.get_psets(p).get('CadCraft_Port', {})
            rows.append({'name': p.Name, 'flow': p.FlowDirection, 'system_type': getattr(p, 'SystemType', None),
                         'system': pp.get('System'), 'nominal': pp.get('NominalSize'), 'connected': p.id() in other})
        tag = e.Tag
        if tag is not None and not isinstance(tag, str):  # written as a typed IFCLABEL(...) by mep/equipment.js (see the sx-mep log, Found)
            tag = tag.wrappedValue
        out[tag or e.GlobalId] = {
            'tag_typed': not isinstance(e.Tag, str) and e.Tag is not None,
            'class': e.is_a(), 'predefined': getattr(e, 'PredefinedType', None), 'object_type': e.ObjectType,
            'type_class': t.is_a() if t else None, 'type_predefined': getattr(t, 'PredefinedType', None) if t else None,
            'kind': eq.get('Kind'), 'ports': rows}
    systems = {}
    for s in f.by_type('IfcSystem'):
        systems[s.Name] = getattr(s, 'PredefinedType', None) or s.ObjectType
    print(json.dumps({'schema': f.schema, 'equipment': out, 'systems': systems}))


if __name__ == '__main__':
    main(sys.argv[1])
