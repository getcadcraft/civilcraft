# SPDX-License-Identifier: Apache-2.0
"""audit.py <file.dxf> — ezdxf's recover + audit of a DXF CadCraft saved; prints JSON for bin/test-cadcraft.mjs.

Besides the audit it reports what ezdxf (a second, independent reader) sees: entity counts in model
and paper space, each paper-space viewport's view, each dimension's type, points and overrides, and
the attributes (each INSERT's ATTRIBs, each block's ATTDEFs).
"""
import json, sys
from collections import Counter
from ezdxf import recover
from ezdxf.entities import viewport as _vp

# ezdxf 1.4 parses an R12 viewport's view (ACAD MVIEW xdata) but then loses it: it writes into a
# namespace that is replaced after loading (its own R12 files read back with view height 1).
# Keep the values it parsed, in its own order: [target, direction, twist, height, centre x, y, …].
_parse = _vp.Viewport.load_xdata_into_dxf_namespace
def _keep(self):
    try:
        self._mview = [v for c, v in self.xdata.get_xlist("ACAD", "MVIEW")][3:-2]
    except Exception:
        self._mview = None
    return _parse(self)
_vp.Viewport.load_xdata_into_dxf_namespace = _keep

doc, auditor = recover.readfile(sys.argv[1])
msp, psp = doc.modelspace(), doc.paperspace()


def pt(v):
    return [round(v[0], 6), round(v[1], 6)]


def dim(d):
    ov = d.get_acad_dstyle(d.get_dim_style())
    return {
        'type': d.dimtype & 7,
        'block': d.dxf.get('geometry', ''),
        'defpoint': pt(d.dxf.defpoint),
        'defpoint2': pt(d.dxf.get('defpoint2', (0, 0))),
        'defpoint3': pt(d.dxf.get('defpoint3', (0, 0))),
        'defpoint4': pt(d.dxf.get('defpoint4', (0, 0))),
        'text': d.dxf.get('text', ''),
        'angle': round(d.dxf.get('angle', 0), 6),
        'dimtxt': ov.get('dimtxt'),
        'dimscale': ov.get('dimscale'),
    }


print(json.dumps({
    'version': doc.dxfversion,
    'errors': len(auditor.errors),
    'fixes': len(auditor.fixes),
    'messages': [e.message for e in auditor.errors[:10]],
    'counts': dict(Counter(e.dxftype() for e in msp)),
    'paper': dict(Counter(e.dxftype() for e in psp)),
    'viewports': [{
        'id': v.dxf.id, 'center': pt(v.dxf.center), 'width': round(v.dxf.width, 6), 'height': round(v.dxf.height, 6),
        'view_center': pt(v._mview[4:6]) if getattr(v, '_mview', None) else pt(v.dxf.view_center_point),
        'view_height': round(v._mview[3], 6) if getattr(v, '_mview', None) else round(v.dxf.view_height, 6),
    } for v in psp.query('VIEWPORT')],
    'dims': [dim(d) for d in msp.query('DIMENSION')][:20],
    'blocks': sorted(b.name for b in doc.blocks if not b.name.lower().startswith(('*model', '*paper', '$model', '$paper'))),
    # attributes: each model-space INSERT's ATTRIBs (tag, value, invisible) and each block's ATTDEFs
    'attribs': [{'block': i.dxf.name, 'attribs': [[a.dxf.tag, a.dxf.text, bool(a.dxf.flags & 1)] for a in i.attribs]}
                for i in msp.query('INSERT') if i.attribs][:200],
    'attdefs': {b.name: [[a.dxf.tag, a.dxf.get('prompt', ''), a.dxf.text, a.dxf.flags] for a in b.query('ATTDEF')]
                for b in doc.blocks if len(b.query('ATTDEF'))},
}))
