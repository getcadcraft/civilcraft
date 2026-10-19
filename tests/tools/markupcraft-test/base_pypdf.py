# SPDX-License-Identifier: Apache-2.0
"""The second PDF library for the base-content tests (DF.14): pypdf reads a page on its own.

    venv/bin/python -I tools/markupcraft-test/base_pypdf.py <file.pdf> <page index> [<form object number>]

Prints JSON: {"text": extract_text(), "paths": [[op, [numbers]], ...] (the page's own path-building operators,
m l c v y re h, in order, as pypdf parses its content streams — or those of the form XObject with that object
number), "ops": operator count, "error": null}.
Test only; never shipped.
"""
import json
import sys

from pypdf import PdfReader
from pypdf.generic import ContentStream

PATH_OPS = {b"m", b"l", b"c", b"v", b"y", b"re", b"h"}


def main():
    path, index = sys.argv[1], int(sys.argv[2])
    out = {"text": "", "paths": [], "ops": 0, "error": None}
    try:
        reader = PdfReader(path)
        page = reader.pages[index]
        out["text"] = page.extract_text() or ""
        contents = page.get_contents() if len(sys.argv) < 4 else reader.get_object(int(sys.argv[3]))
        if contents is not None:
            cs = ContentStream(contents, reader)
            ops = cs.operations
            out["ops"] = len(ops)
            for operands, op in ops:
                if op in PATH_OPS:
                    out["paths"].append([op.decode("latin-1"), [float(x) for x in operands]])
    except Exception as err:  # report, don't hide
        out["error"] = f"{type(err).__name__}: {err}"
    print(json.dumps(out))


if __name__ == "__main__":
    main()
