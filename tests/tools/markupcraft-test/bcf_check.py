#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Validate a .bcfzip against the BCF 2.1 XML schemas (buildingSMART), independently of MarkupCraft's code.

    tools/markupcraft-test/venv/bin/python tools/markupcraft-test/bcf_check.py <file.bcfzip> [<xsd dir>]

Checks: the zip opens and every CRC is right (zipfile.testzip); bcf.version (version.xsd), project.bcfp
(project.xsd), every <guid>/markup.bcf against markup.xsd AND against the zip's own extensions.xsd (which
redefines markup.xsd's TopicType/TopicStatus), every viewpoint .bcfv (visinfo.xsd); each topic folder is
named after its Topic Guid, every Viewpoint/Snapshot file a markup names exists, and snapshots are PNGs.
Prints one JSON object {ok, topics, files, errors[]}; exit 0 when ok.
Needs lxml: python3 -m venv tools/markupcraft-test/venv && tools/markupcraft-test/venv/bin/pip install lxml
"""
import json
import os
import shutil
import sys
import tempfile
import zipfile

from lxml import etree

HERE = os.path.dirname(os.path.abspath(__file__))


def schema(path):
    return etree.XMLSchema(etree.parse(path))


def main():
    bcf = sys.argv[1]
    xsd_dir = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, 'bcf-2.1')
    errors = []
    zf = zipfile.ZipFile(bcf)
    bad = zf.testzip()
    if bad:
        errors.append('CRC error in ' + bad)
    names = zf.namelist()
    markup_xsd = schema(os.path.join(xsd_dir, 'markup.xsd'))
    visinfo_xsd = schema(os.path.join(xsd_dir, 'visinfo.xsd'))
    version_xsd = schema(os.path.join(xsd_dir, 'version.xsd'))
    project_xsd = schema(os.path.join(xsd_dir, 'project.xsd'))

    def check(name, sch, label):
        try:
            doc = etree.fromstring(zf.read(name))
        except Exception as e:  # noqa: BLE001
            errors.append(f'{name}: not well-formed XML: {e}')
            return None
        if not sch.validate(doc):
            for err in sch.error_log:
                errors.append(f'{name} ({label}) line {err.line}: {err.message}')
        return doc

    if 'bcf.version' not in names:
        errors.append('bcf.version missing')
    else:
        v = check('bcf.version', version_xsd, 'version.xsd')
        if v is not None and v.get('VersionId') != '2.1':
            errors.append('bcf.version is not 2.1')
    ext = None
    if 'project.bcfp' in names:
        p = check('project.bcfp', project_xsd, 'project.xsd')
        es = p.findtext('ExtensionSchema') if p is not None else None
        if es:
            if es not in names:
                errors.append('project.bcfp names ' + es + ' but it is not in the zip')
            else:
                # the extension schema redefines markup.xsd: validate against it, next to a copy of markup.xsd
                tmp = tempfile.mkdtemp()
                shutil.copy(os.path.join(xsd_dir, 'markup.xsd'), tmp)
                with open(os.path.join(tmp, 'extensions.xsd'), 'wb') as f:
                    f.write(zf.read(es))
                ext = schema(os.path.join(tmp, 'extensions.xsd'))
    topics = 0
    for name in names:
        if not name.endswith('/markup.bcf'):
            continue
        topics += 1
        folder = name.split('/')[0]
        doc = check(name, markup_xsd, 'markup.xsd')
        if ext is not None:
            check(name, ext, 'extensions.xsd')
        if doc is None:
            continue
        topic = doc.find('Topic')
        if topic is None or topic.get('Guid') != folder:
            errors.append(name + ': folder is not named after the Topic Guid')
        for vp in doc.findall('Viewpoints'):
            for tag in ('Viewpoint', 'Snapshot'):
                ref = vp.findtext(tag)
                if ref is None:
                    continue
                full = folder + '/' + ref
                if full not in names:
                    errors.append(name + ': ' + tag + ' ' + ref + ' missing')
                elif tag == 'Viewpoint':
                    vdoc = check(full, visinfo_xsd, 'visinfo.xsd')
                    if vdoc is not None and vdoc.get('Guid') != vp.get('Guid'):
                        errors.append(full + ': Guid differs from the markup\'s Viewpoints Guid')
                elif not zf.read(full).startswith(b'\x89PNG\r\n\x1a\n'):
                    errors.append(full + ': not a PNG')
    print(json.dumps({'ok': not errors, 'topics': topics, 'files': len(names), 'errors': errors[:50]}))
    return 0 if not errors else 1


if __name__ == '__main__':
    sys.exit(main())
