# SPDX-License-Identifier: Apache-2.0
"""Validate IFC files against their schema with IfcOpenShell (0.5 track BM tests).

    <venv>/bin/python -I tools/bimcraft-test/ifc_validate.py file.ifc [file.ifc …]

Prints one JSON line per file: {"file", "schema", "errors": n, "first": [up to 8 messages]}. Exit code 1 when any file has
errors. Used by tools/bimcraft-test/model-test.mjs when a venv with ifcopenshell is on this machine (DetailCraft's).
"""
import json
import logging
import sys

import ifcopenshell
import ifcopenshell.validate


def main(paths):
    bad = 0
    for p in paths:
        f = ifcopenshell.open(p)
        logger = ifcopenshell.validate.json_logger()
        ifcopenshell.validate.validate(f, logger, express_rules=False)
        msgs = [s.get('message', str(s)) for s in logger.statements if s.get('level', 'ERROR') in ('ERROR', logging.ERROR)]
        if msgs:
            bad += 1
        print(json.dumps({'file': p, 'schema': f.schema, 'errors': len(msgs), 'first': [m[:300] for m in msgs[:8]]}))
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
