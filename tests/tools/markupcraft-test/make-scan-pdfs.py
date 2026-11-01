#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""
Scanned-page test PDFs for MarkupCraft (0.7.1 71.5 / 71.10): pages that are only a picture, one image filter each.

    python3 tools/markupcraft-test/make-scan-pdfs.py            # fixtures/pdf/scan-filters.pdf (+ .json, the text on each page)
    python3 tools/markupcraft-test/make-scan-pdfs.py --big      # also testfiles/generated/markup/scan-sheet-36x48-400dpi.pdf (once)
    python3 tools/markupcraft-test/make-scan-pdfs.py --hard [<jbig2enc binary>]
        # testfiles/generated/markup/scan-hard-cases.pdf (+ -broken-xref.pdf, .json) once: JBIG2 with JBIG2Globals and generic
        # arithmetic (jbig2enc, built from https://github.com/agl/jbig2enc; skipped without it), JPX 8/16-bit and RGB, CCITT G3
        # 1-D / byte-aligned / 2-D and G4 BlackIs1, /Decode [1 0], an inverted /ImageMask, Indexed, an Adobe (inverted) CMYK JPEG with /Decode [1 0 …], an
        # image two forms deep, and 10200 x 13200 G4 and JPEG pictures; the -broken-xref copy has a destroyed xref table

scan-filters.pdf (US letter at 150 dpi unless noted; the same "building code" page each time, no text layer):
  1 DCTDecode (JPEG, gray)              2 CCITTFaxDecode G4 image (K -1)        3 CCITTFaxDecode G4 as an /ImageMask
  4 JBIG2Decode (generic region, MMR)   5 JPXDecode (JPEG 2000, gray)           6 FlateDecode, 1 bit per pixel
  7 a 200 x 200 in page (the largest PDF page) holding a G4 picture             8 JPEG 300 dpi, turned 1.2 degrees (a real scan)
The JBIG2 stream is written by hand (page information + immediate lossless generic region with MMR = the same G4 code +
end of page), since no JBIG2 encoder is installed; symbol-dictionary JBIG2 (jbig2enc -s) is not covered.
The PDF is written byte by byte here (no PDF library), so nothing re-encodes the pictures. Needs Pillow (with libtiff and
OpenJPEG) and the Liberation/DejaVu fonts.
"""
import io, json, os, re, sys, zlib, hashlib
from PIL import Image, ImageDraw, ImageFont, ImageOps, TiffImagePlugin

Image.MAX_IMAGE_PIXELS = None   # our own pictures (the 400 dpi sheet is 276 MP)
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
FIX = os.path.join(ROOT, 'fixtures', 'pdf')
BIG = os.path.join(ROOT, '..', 'testfiles', 'generated', 'markup')

FONT = next((f for f in ['/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf'] if os.path.exists(f)), None)
FONTB = next((f for f in ['/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf'] if os.path.exists(f)), None)

LINES = [
    ('h', 'SECTION R311'),
    ('h', 'MEANS OF EGRESS'),
    ('p', 'R311.1 Means of egress. Dwellings shall be provided'),
    ('p', 'with a means of egress in accordance with this'),
    ('p', 'section. The means of egress shall provide a'),
    ('p', 'continuous and unobstructed path of vertical and'),
    ('p', 'horizontal egress travel from all portions of the'),
    ('p', 'dwelling to the required egress door without'),
    ('p', 'requiring travel through a garage.'),
    ('p', 'R311.2 Egress door. Not less than one egress door'),
    ('p', 'shall be provided for each dwelling unit. The egress'),
    ('p', 'door shall be side-hinged, and shall provide a clear'),
    ('p', 'width of not less than 32 inches where measured'),
    ('p', 'between the face of the door and the stop, with the'),
    ('p', 'door open 90 degrees. The clear height of the door'),
    ('p', 'opening shall be not less than 78 inches in height.'),
    ('p', 'R311.7.5.1 Risers. The riser height shall be not'),
    ('p', 'more than 7 3/4 inches (196 mm). The riser shall be'),
    ('p', 'measured vertically between leading edges of the'),
    ('p', 'adjacent treads.'),
]


def page_image(dpi, mode='L'):
    """The book page at dpi: white paper, black text. Returns (image, [{text, box (px)}])."""
    w, h = int(8.5 * dpi), int(11 * dpi)
    im = Image.new('L', (w, h), 255)
    d = ImageDraw.Draw(im)
    fh = ImageFont.truetype(FONTB, int(dpi * 16 / 72))
    fp = ImageFont.truetype(FONT, int(dpi * 11 / 72))
    y = int(dpi * 1.0)
    truth = []
    for kind, text in LINES:
        f = fh if kind == 'h' else fp
        x = int(dpi * 1.0) if kind == 'p' else (w - d.textlength(text, font=f)) // 2
        d.text((x, y), text, fill=0, font=f)
        bb = d.textbbox((x, y), text, font=f)
        truth.append({'text': text, 'box': list(bb)})
        y += int((f.size) * (1.6 if kind == 'h' else 1.35))
    d.text((w // 2 - int(dpi * 0.1), h - int(dpi * 0.8)), '48', fill=0, font=fp)
    truth.append({'text': '48', 'box': list(d.textbbox((w // 2 - int(dpi * 0.1), h - int(dpi * 0.8)), '48', font=fp))})
    return (im if mode == 'L' else im.point(lambda v: 255 if v > 128 else 0, '1')), truth


def g4(im1):
    """CCITT G4 bytes of a mode-1 image, as libtiff codes it (one strip)."""
    b = io.BytesIO()
    TiffImagePlugin.STRIP_SIZE = 1 << 30   # one strip (Pillow 9; newer Pillow takes strip_size=)
    im1.save(b, 'TIFF', compression='group4')
    t = Image.open(io.BytesIO(b.getvalue()))
    offs, counts = t.tag_v2[273], t.tag_v2[279]
    offs = offs if isinstance(offs, tuple) else (offs,)
    counts = counts if isinstance(counts, tuple) else (counts,)
    assert len(offs) == 1, 'one strip expected'
    return b.getvalue()[offs[0]:offs[0] + counts[0]]


def g4_black(im1):
    """G4 bytes coding the text as BLACK runs, as scanners write it. Pillow saves mode 1 as BlackIsZero and libtiff then
    codes the 1 (white) pixels as the black runs, so the picture is inverted first."""
    return g4(ImageOps.invert(im1.convert('L')).convert('1'))


def jbig2_mmr(im1, code):
    """An embedded JBIG2 stream: page information, an immediate lossless generic region coded with MMR (G4), end of page."""
    def seg(num, typ, data):
        return num.to_bytes(4, 'big') + bytes([typ & 0x3f, 0x00, 0x01]) + len(data).to_bytes(4, 'big') + data
    w, h = im1.size
    page = w.to_bytes(4, 'big') + h.to_bytes(4, 'big') + (0).to_bytes(4, 'big') * 2 + bytes([0]) + (0).to_bytes(2, 'big')
    region = w.to_bytes(4, 'big') + h.to_bytes(4, 'big') + (0).to_bytes(4, 'big') * 2 + bytes([0]) + bytes([0x01])   # flags: MMR
    # EOFB (two EOLs) after the code: poppler's MMR reader runs on into the next segment without it
    return seg(0, 48, page) + seg(1, 39, region + code + b'\x00\x10\x01') + seg(2, 49, b'')


class Pdf:
    def __init__(self):
        self.objs = []

    def add(self, body):
        self.objs.append(body)
        return len(self.objs)

    def stream(self, dict_src, data):
        return self.add(('<< ' + dict_src + ' /Length %d >>\nstream\n' % len(data)).encode() + data + b'\nendstream')

    def save(self, path, pages_id, root_id):
        out = bytearray(b'%PDF-1.7\n%\xe2\xe3\xcf\xd3\n')
        offs = []
        for i, o in enumerate(self.objs, 1):
            offs.append(len(out))
            out += b'%d 0 obj\n' % i + (o if isinstance(o, bytes) else o.encode()) + b'\nendobj\n'
        x = len(out)
        out += b'xref\n0 %d\n0000000000 65535 f \n' % (len(self.objs) + 1)
        for o in offs: out += b'%010d 00000 n \n' % o
        out += b'trailer\n<< /Size %d /Root %d 0 R >>\nstartxref\n%d\n%%%%EOF\n' % (len(self.objs) + 1, root_id, x)
        with open(path, 'wb') as f: f.write(out)
        return bytes(out)


def build(path, pages):
    """pages: [(label, w_pt, h_pt, image dict src, data, draw ops or None)] → a PDF of picture-only pages."""
    pdf = Pdf()
    pdf.add('')  # 1: catalog (filled below)
    pdf.add('')  # 2: pages
    kids = []
    for label, wpt, hpt, dsrc, data, ops in pages:
        img = pdf.stream('/Type /XObject /Subtype /Image ' + dsrc, data)
        ops = ops or ('q %g 0 0 %g 0 0 cm /Im0 Do Q' % (wpt, hpt))
        cs = pdf.stream('', ops.encode())
        kids.append(pdf.add('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 %g %g] /Resources << /XObject << /Im0 %d 0 R >> >> /Contents %d 0 R >>' % (wpt, hpt, img, cs)))
    pdf.objs[1] = '<< /Type /Pages /Kids [%s] /Count %d >>' % (' '.join('%d 0 R' % k for k in kids), len(kids))
    labels = ' '.join('%d << /P (%s) >>' % (i, p[0]) for i, p in enumerate(pages))
    pdf.objs[0] = '<< /Type /Catalog /Pages 2 0 R /PageLabels << /Nums [%s] >> >>' % labels
    return pdf.save(path, 2, 1)


def main():
    os.makedirs(FIX, exist_ok=True)
    L, truth = page_image(150, 'L')
    one = L.point(lambda v: 255 if v > 128 else 0, '1')
    w, h = one.size
    code = g4_black(one)
    blackIs1 = ''
    jpg = io.BytesIO(); L.save(jpg, 'JPEG', quality=80)
    jpx = io.BytesIO(); L.save(jpx, 'JPEG2000', quality_mode='rates', quality_layers=[20])
    flate = zlib.compress(one.tobytes())
    L300, truth300 = page_image(300, 'L')
    turned = L300.rotate(1.2, resample=Image.BICUBIC, expand=False, fillcolor=255)
    jpg300 = io.BytesIO(); turned.save(jpg300, 'JPEG', quality=75)
    big_side = 14400   # 200 in, the largest page PDF allows
    pages = [
        ('DCT', 612, 792, '/Width %d /Height %d /ColorSpace /DeviceGray /BitsPerComponent 8 /Filter /DCTDecode' % (w, h), jpg.getvalue(), None),
        ('CCITT', 612, 792, '/Width %d /Height %d /ColorSpace /DeviceGray /BitsPerComponent 1 /Filter /CCITTFaxDecode /DecodeParms << /K -1 /Columns %d /Rows %d%s >>' % (w, h, w, h, blackIs1), code, None),
        ('CCITT mask', 612, 792, '/Width %d /Height %d /ImageMask true /BitsPerComponent 1 /Filter /CCITTFaxDecode /DecodeParms << /K -1 /Columns %d /Rows %d%s >>' % (w, h, w, h, blackIs1), code,
         '0 0 0 rg q 612 0 0 792 0 0 cm /Im0 Do Q'),
        ('JBIG2', 612, 792, '/Width %d /Height %d /ColorSpace /DeviceGray /BitsPerComponent 1 /Filter /JBIG2Decode' % (w, h), jbig2_mmr(one, code), None),
        ('JPX', 612, 792, '/Width %d /Height %d /ColorSpace /DeviceGray /BitsPerComponent 8 /Filter /JPXDecode' % (w, h), jpx.getvalue(), None),
        ('Flate 1-bit', 612, 792, '/Width %d /Height %d /ColorSpace /DeviceGray /BitsPerComponent 1 /Filter /FlateDecode' % (w, h), flate, None),
        ('Huge page', big_side, big_side, '/Width %d /Height %d /ColorSpace /DeviceGray /BitsPerComponent 1 /Filter /CCITTFaxDecode /DecodeParms << /K -1 /Columns %d /Rows %d%s >>' % (w, h, w, h, blackIs1), code,
         'q %g 0 0 %g %g %g cm /Im0 Do Q' % (big_side * 0.6, big_side * 0.6 * h / w, big_side * 0.2, big_side * 0.2 * h / w)),
        ('Turned 300 dpi', 612, 792, '/Width %d /Height %d /ColorSpace /DeviceGray /BitsPerComponent 8 /Filter /DCTDecode' % turned.size, jpg300.getvalue(), None),
    ]
    out = os.path.join(FIX, 'scan-filters.pdf')
    data = build(out, pages)
    meta = {'file': 'scan-filters.pdf', 'made_by': 'tools/markupcraft-test/make-scan-pdfs.py', 'dpi': 150,
            'pages': [p[0] for p in pages], 'image_px': [w, h], 'lines': truth, 'lines_300': truth300,
            'note': 'every page is only a picture of the same text (no text layer); boxes are pixels in the 150 dpi picture (lines_300: the 300 dpi page before it was turned 1.2 degrees)'}
    with open(os.path.join(FIX, 'scan-filters.json'), 'w') as f: json.dump(meta, f, indent=1)
    print('%s  %d bytes  %s' % (os.path.relpath(out, ROOT), len(data), hashlib.sha256(data).hexdigest()[:16]))

    if '--big' in sys.argv:
        big = os.path.join(BIG, 'scan-sheet-36x48-400dpi.pdf')
        if os.path.exists(big):
            print('already there: ' + big); return
        os.makedirs(BIG, exist_ok=True)
        W, H = 36 * 400, 48 * 400   # ARCH E1-ish sheet at 400 dpi: 14400 x 19200 px
        im = Image.new('1', (W, H), 1)
        d = ImageDraw.Draw(im)
        for x in range(400, W - 399, 800): d.line([(x, 400), (x, H - 400)], fill=0, width=6)
        for y in range(400, H - 399, 800): d.line([(400, y), (W - 400, y)], fill=0, width=6)
        d.rectangle([200, 200, W - 200, H - 200], outline=0, width=24)
        fb = ImageFont.truetype(FONTB, 160)
        for i in range(0, 20):
            d.text((600, 600 + i * 900), 'SCANNED SHEET LINE %02d  DOOR 3070 HM' % i, fill=0, font=fb)
        code_b = g4_black(im)
        bi1 = ''
        pages = [
            ('G4 400 dpi', 36 * 72, 48 * 72, '/Width %d /Height %d /ColorSpace /DeviceGray /BitsPerComponent 1 /Filter /CCITTFaxDecode /DecodeParms << /K -1 /Columns %d /Rows %d%s >>' % (W, H, W, H, bi1), code_b, None),
            ('JBIG2 400 dpi', 36 * 72, 48 * 72, '/Width %d /Height %d /ColorSpace /DeviceGray /BitsPerComponent 1 /Filter /JBIG2Decode' % (W, H), jbig2_mmr(im, code_b), None),
        ]
        data = build(big, pages)
        print('%s  %d bytes  %s' % (big, len(data), hashlib.sha256(data).hexdigest()[:16]))


def g3(im1, opts):
    """CCITT Group 3 bytes from libtiff (T4Options = opts: 0 = 1-D, 1 = 2-D, +4 = EOLs byte-aligned), text as black runs."""
    b = io.BytesIO()
    TiffImagePlugin.STRIP_SIZE = 1 << 30
    ImageOps.invert(im1.convert('L')).convert('1').save(b, 'TIFF', compression='group3', tiffinfo={292: opts})
    t = Image.open(io.BytesIO(b.getvalue()))
    offs, counts = t.tag_v2[273], t.tag_v2[279]
    offs = offs if isinstance(offs, tuple) else (offs,)
    counts = counts if isinstance(counts, tuple) else (counts,)
    assert len(offs) == 1, 'one strip expected'
    return b.getvalue()[offs[0]:offs[0] + counts[0]]


def hard(jbig2_bin):
    """testfiles/generated/markup/scan-hard-cases.pdf (+ -broken-xref.pdf): the image kinds a scanned book can use that
    pages went blank on elsewhere (0.7.1, second report). One page each, the 300 dpi book page unless named."""
    import subprocess, tempfile
    out = os.path.join(BIG, 'scan-hard-cases.pdf')
    if os.path.exists(out):
        print('already there: ' + out); return
    os.makedirs(BIG, exist_ok=True)
    L, _ = page_image(300, 'L')
    one = L.point(lambda v: 255 if v > 128 else 0, '1')
    w, h = one.size
    pdf = Pdf()
    pdf.add(''); pdf.add('')
    kids, labels = [], []
    def page(label, content, xobjects, W=612, H=792):
        cs = pdf.stream('', content.encode())
        res = ' '.join('/%s %d 0 R' % (k, v) for k, v in xobjects.items())
        kids.append(pdf.add('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 %g %g] /Resources << /XObject << %s >> >> /Contents %d 0 R >>' % (W, H, res, cs)))
        labels.append(label)
    def img(dsrc, data):
        return pdf.stream('/Type /XObject /Subtype /Image ' + dsrc, data)
    full = 'q 612 0 0 792 0 0 cm /Im0 Do Q'
    gray = '/Width %d /Height %d /ColorSpace /DeviceGray /BitsPerComponent ' % (w, h)
    tmp = tempfile.mkdtemp()
    png = os.path.join(tmp, 'page.png'); one.save(png)
    if jbig2_bin:
        base = os.path.join(tmp, 'sym')
        subprocess.run([jbig2_bin, '-s', '-p', '-b', base, png], check=True, capture_output=True)
        glob_ = pdf.stream('', open(base + '.sym', 'rb').read())
        page('JBIG2 symbols + JBIG2Globals', full, {'Im0': img(gray + '1 /Filter /JBIG2Decode /DecodeParms << /JBIG2Globals %d 0 R >>' % glob_, open(base + '.0000', 'rb').read())})
        gen = subprocess.run([jbig2_bin, '-p', png], check=True, capture_output=True).stdout
        page('JBIG2 generic (arithmetic)', full, {'Im0': img(gray + '1 /Filter /JBIG2Decode', gen)})
    jpx = io.BytesIO(); L.save(jpx, 'JPEG2000', quality_mode='rates', quality_layers=[20])
    page('JPX 8-bit, no /ColorSpace', full, {'Im0': img('/Width %d /Height %d /Filter /JPXDecode' % (w, h), jpx.getvalue())})
    import array
    a16 = array.array('H', (v * 257 for v in L.tobytes()))   # full 16-bit range (convert('I;16') would clip at 32767)
    if sys.byteorder != 'little': a16.byteswap()
    j16 = io.BytesIO(); Image.frombytes('I;16', L.size, a16.tobytes()).save(j16, 'JPEG2000', quality_mode='rates', quality_layers=[20])
    page('JPX 16-bit, no /ColorSpace', full, {'Im0': img('/Width %d /Height %d /Filter /JPXDecode' % (w, h), j16.getvalue())})
    jrgb = io.BytesIO(); L.convert('RGB').save(jrgb, 'JPEG2000', quality_mode='rates', quality_layers=[20])
    page('JPX RGB, /DeviceRGB', full, {'Im0': img('/Width %d /Height %d /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /JPXDecode' % (w, h), jrgb.getvalue())})
    for label, opts, k, align in [('CCITT G3 1-D', 0, 0, False), ('CCITT G3 1-D, EncodedByteAlign', 4, 0, True), ('CCITT G3 2-D (K 4)', 1, 4, False)]:
        page(label, full, {'Im0': img(gray + '1 /Filter /CCITTFaxDecode /DecodeParms << /K %d /Columns %d /Rows %d /EndOfLine true%s >>' % (k, w, h, ' /EncodedByteAlign true' if align else ''), g3(one, opts))})
    page('CCITT G4, BlackIs1 true', full, {'Im0': img(gray + '1 /Filter /CCITTFaxDecode /DecodeParms << /K -1 /Columns %d /Rows %d /BlackIs1 true >>' % (w, h), g4(one))})
    page('1-bit with /Decode [1 0]', full, {'Im0': img(gray + '1 /Decode [1 0] /Filter /FlateDecode', zlib.compress(ImageOps.invert(one.convert('L')).convert('1').tobytes()))})
    page('/ImageMask with /Decode [1 0]', '0 0 0 rg ' + full, {'Im0': img('/Width %d /Height %d /ImageMask true /BitsPerComponent 1 /Decode [1 0] /Filter /FlateDecode' % (w, h), zlib.compress(ImageOps.invert(one.convert('L')).convert('1').tobytes()))})
    pal = ''.join('%02x%02x%02x' % (v, v, v) for v in range(256))
    page('Indexed 8-bit', full, {'Im0': img('/Width %d /Height %d /ColorSpace [/Indexed /DeviceRGB 255 <%s>] /BitsPerComponent 8 /Filter /FlateDecode' % (w, h, pal), zlib.compress(L.tobytes()))})
    cmyk = io.BytesIO(); L.convert('CMYK').save(cmyk, 'JPEG', quality=80)   # Pillow writes Adobe (inverted) CMYK with an APP14 marker
    page('CMYK JPEG, /Decode [1 0 1 0 1 0 1 0]', full, {'Im0': img('/Width %d /Height %d /ColorSpace /DeviceCMYK /BitsPerComponent 8 /Decode [1 0 1 0 1 0 1 0] /Filter /DCTDecode' % (w, h), cmyk.getvalue())})
    jpg = io.BytesIO(); L.save(jpg, 'JPEG', quality=80)
    im0 = img(gray + '8 /Filter /DCTDecode', jpg.getvalue())
    fm1 = pdf.stream('/Type /XObject /Subtype /Form /BBox [0 0 612 792] /Resources << /XObject << /Im0 %d 0 R >> >>' % im0, full.encode())
    fm0 = pdf.stream('/Type /XObject /Subtype /Form /BBox [0 0 612 792] /Resources << /XObject << /Fm1 %d 0 R >> >>' % fm1, b'/Fm1 Do')
    page('Image in a form in a form', '/Fm0 Do', {'Fm0': fm0})
    # very large single pictures: the letter page at 1200 dpi (10200 x 13200)
    Lb, _ = page_image(1200, 'L')
    oneb = Lb.point(lambda v: 255 if v > 128 else 0, '1')
    W, H = oneb.size
    page('10200 x 13200 G4 (1200 dpi)', full, {'Im0': img('/Width %d /Height %d /ColorSpace /DeviceGray /BitsPerComponent 1 /Filter /CCITTFaxDecode /DecodeParms << /K -1 /Columns %d /Rows %d >>' % (W, H, W, H), g4_black(oneb))})
    jb = io.BytesIO(); Lb.save(jb, 'JPEG', quality=40)
    page('10200 x 13200 gray JPEG (1200 dpi)', full, {'Im0': img('/Width %d /Height %d /ColorSpace /DeviceGray /BitsPerComponent 8 /Filter /DCTDecode' % (W, H), jb.getvalue())})
    pdf.objs[1] = '<< /Type /Pages /Kids [%s] /Count %d >>' % (' '.join('%d 0 R' % k for k in kids), len(kids))
    pdf.objs[0] = '<< /Type /Catalog /Pages 2 0 R /PageLabels << /Nums [%s] >> >>' % ' '.join('%d << /P (%s) >>' % (i, l) for i, l in enumerate(labels))
    data = pdf.save(out, 2, 1)
    print('%s  %d bytes  %s  %d pages' % (out, len(data), hashlib.sha256(data).hexdigest()[:16], len(kids)))
    # the same file with its cross-reference table broken (offsets zeroed, startxref wrong): readers must rebuild it
    x = data.rfind(b'xref\n')
    head, tail = data[:x], data[x:]
    tail = re.sub(rb'\d{10} 00000 n', b'0000000000 00000 n', tail)
    tail = re.sub(rb'startxref\n\d+', b'startxref\n123', tail)
    broken = os.path.join(BIG, 'scan-hard-cases-broken-xref.pdf')
    with open(broken, 'wb') as f: f.write(head + tail)
    print('%s  %d bytes' % (broken, len(head + tail)))
    with open(os.path.join(BIG, 'scan-hard-cases.json'), 'w') as f: json.dump({'pages': labels, 'made_by': 'tools/markupcraft-test/make-scan-pdfs.py --hard <jbig2enc>'}, f, indent=1)


if __name__ == '__main__':
    if '--hard' in sys.argv:
        i = sys.argv.index('--hard')
        hard(sys.argv[i + 1] if i + 1 < len(sys.argv) and not sys.argv[i + 1].startswith('-') else None)
    else:
        main()
