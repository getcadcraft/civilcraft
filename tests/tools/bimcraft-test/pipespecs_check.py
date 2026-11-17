# SPDX-License-Identifier: Apache-2.0
"""pipespecs_check.py — what IfcOpenShell reads of BimCraft's pipe specs, in-line components and equipment (0.9.1).

    venv/bin/python -I tools/bimcraft-test/pipespecs_check.py file.ifc
prints one JSON line: element counts by class, "Class:PredefinedType" of the MEP occurrences and of their types, the schema
validation's error count, the first pipe segment that carries CadCraft_PipeSpec (its dimensions in mm on the occurrence and on
its type, its material), and whether every valve / damper / filter has two connected ports.
"""
import json
import logging
import sys

import ifcopenshell
import ifcopenshell.util.element
import ifcopenshell.util.unit
import ifcopenshell.validate

CLASSES = ['IfcValve', 'IfcFilter', 'IfcDamper', 'IfcSpaceHeater', 'IfcAirTerminal', 'IfcUnitaryEquipment', 'IfcPump', 'IfcPipeSegment', 'IfcPipeFitting', 'IfcDuctSegment',
           'IfcFlowController', 'IfcFlowTreatmentDevice', 'IfcEnergyConversionDevice', 'IfcFlowTerminal', 'IfcFlowMovingDevice', 'IfcFlowSegment']
TYPES = ['IfcValveType', 'IfcFilterType', 'IfcDamperType', 'IfcSpaceHeaterType', 'IfcAirTerminalType', 'IfcUnitaryEquipmentType', 'IfcPumpType', 'IfcPipeSegmentType']


def ports_of(f, el):
    out = []
    for rel in getattr(el, 'IsNestedBy', []) or []:
        out += [o for o in rel.RelatedObjects if o.is_a('IfcDistributionPort')]
    for rel in getattr(el, 'HasPorts', []) or []:
        out.append(rel.RelatingPort)
    return out


def main(p):
    f = ifcopenshell.open(p)
    scale = ifcopenshell.util.unit.calculate_unit_scale(f) * 1000.0
    classes, pre, types = {}, [], []
    for c in CLASSES:
        try:
            els = f.by_type(c, include_subtypes=False)
        except RuntimeError:
            continue
        if els:
            classes[c] = len(els)
        for e in els:
            v = getattr(e, 'PredefinedType', None)
            if v:
                pre.append(c + ':' + str(v))
    for c in TYPES:
        try:
            for t in f.by_type(c):
                types.append(c + ':' + str(getattr(t, 'PredefinedType', '')))
        except RuntimeError:
            pass
    logger = ifcopenshell.validate.json_logger()
    ifcopenshell.validate.validate(f, logger, express_rules=False)
    msgs = [s.get('message', str(s)) for s in logger.statements if s.get('level', 'ERROR') in ('ERROR', logging.ERROR)]
    seg = None
    for e in f.by_type('IfcFlowSegment'):
        ps = ifcopenshell.util.element.get_psets(e, should_inherit=False)
        if 'CadCraft_PipeSpec' not in ps:
            continue
        common = ps.get('Pset_PipeSegmentTypeCommon', {})
        t = ifcopenshell.util.element.get_type(e)
        tps = ifcopenshell.util.element.get_psets(t) if t else {}
        mat = ifcopenshell.util.element.get_material(e)
        seg = {'OuterDiameter': (common.get('OuterDiameter') or 0) * scale, 'InnerDiameter': (common.get('InnerDiameter') or 0) * scale, 'spec': ps['CadCraft_PipeSpec'].get('Spec'),
               'type_name': t.Name if t else None, 'type_OuterDiameter': (tps.get('Pset_PipeSegmentTypeCommon', {}).get('OuterDiameter') or 0) * scale,
               'type_spec': tps.get('CadCraft_PipeSpec', {}).get('Spec'), 'material': getattr(mat, 'Name', None)}
        break
    joined = set()
    for c in f.by_type('IfcRelConnectsPorts'):
        joined.add(c.RelatingPort.id())
        joined.add(c.RelatedPort.id())
    two, open_ports = True, 0
    for e in f.by_type('IfcDistributionFlowElement'):
        ps = ifcopenshell.util.element.get_psets(e, should_inherit=False)
        if 'CadCraft_Valve' not in ps:
            continue
        pts = ports_of(f, e)
        if len(pts) != 2:
            two = False
        open_ports += sum(1 for q in pts if q.id() not in joined)
    print(json.dumps({'schema': f.schema, 'classes': classes, 'predefined': sorted(set(pre)), 'types': sorted(set(types)), 'schema_errors': len(msgs), 'first_errors': [m[:300] for m in msgs[:6]],
                      'spec_segment': seg, 'valve_ports_connected': two and open_ports == 0, 'open_valve_ports': open_ports}))


if __name__ == '__main__':
    main(sys.argv[1])
