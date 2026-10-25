#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Fixtures for 0.7 D7.16: small ASCII DXFs written in the code page their $DWGCODEPAGE names (what older programs write), plus one
with \\M+ escapes. Made once into fixtures/dwg/codepage/; truth.json holds the words each file must read back as.
   python3 tools/cadcraft-test/make-codepage-dxf.py"""
import json, os
OUT = os.path.join(os.path.dirname(__file__), '../../fixtures/dwg/codepage')
os.makedirs(OUT, exist_ok=True)
CASES = {
    'ru-1251': ('ANSI_1251', 'cp1251', 'AC1015', 'Щит распределения РЩ-1', 'Кухня 12 м2'),
    'ko-949': ('ANSI_949', 'cp949', 'AC1015', '배전반 한국어 텍스트', '주방 가나다'),
    'vi-1258': ('ANSI_1258', 'cp1258', 'AC1015', 'Bảng phân phối Tiếng Việt', 'Nhà bếp'),
    'zh-936': ('ANSI_936', 'cp936', 'AC1015', '配电盘图纸说明', '厨房平面'),
    'ja-932': ('ANSI_932', 'cp932', 'AC1015', '配電盤ひらがなカタカナ', '厨房平面図'),
    'zh-936-r12': ('ANSI_936', 'cp936', 'AC1009', '配电盘 R12', '厨房'),
    'ru-utf8-tag1252': ('ANSI_1252', 'utf-8', 'AC1015', 'Щит РЩ-1 в UTF-8', 'Кухня'),
    'ko-utf8-r2007': ('ANSI_949', 'utf-8', 'AC1021', '배전반 UTF-8', '주방'),
}
def dxf(cp, ver, texts):
    g = lambda c, v: f'{c:>3}\n{v}\n'
    s = g(0, 'SECTION') + g(2, 'HEADER') + g(9, '$ACADVER') + g(1, ver) + g(9, '$DWGCODEPAGE') + g(3, cp) + g(0, 'ENDSEC')
    s += g(0, 'SECTION') + g(2, 'ENTITIES')
    for i, t in enumerate(texts):
        s += g(0, 'TEXT') + g(8, '0') + g(10, '0.0') + g(20, str(i * 10.0)) + g(30, '0.0') + g(40, '2.5') + g(1, t)
    return s + g(0, 'ENDSEC') + g(0, 'EOF')
import unicodedata
def enc_text(text, enc):
    """Windows-1258 has a few precomposed letters and the rest as base + combining mark: use what it has."""
    if enc != 'cp1258': return text.encode(enc)
    out = b''
    for ch in text:
        try: out += ch.encode(enc); continue
        except UnicodeEncodeError: pass
        import itertools
        d = unicodedata.normalize('NFD', ch)
        done = False
        for marks in itertools.permutations(d[1:]):   # circumflex, breve and horn compose into the letter; the tone mark follows
            for k in range(len(marks) + 1):
                head = unicodedata.normalize('NFC', d[0] + ''.join(marks[:k]))
                if len(head) != 1: continue
                try: out += head.encode(enc) + ''.join(marks[k:]).encode(enc); done = True; break
                except UnicodeEncodeError: continue
            if done: break
        if not done: raise SystemExit('cannot encode ' + repr(ch))
    return out
truth = {}
for name, (cp, enc, ver, a, b) in CASES.items():
    open(os.path.join(OUT, name + '.dxf'), 'wb').write(enc_text(dxf(cp, ver, [a, b]).replace('\n', '\r\n'), enc))
    truth[name] = [a, b]
# \M+ escapes: 日本 in Shift-JIS = 93FA 967B; 中文 in GBK = D6D0 CEC4; 한 in EUC-KR = C7D1; 日 in Big5 = A4E9
mif = dxf('ANSI_1252', 'AC1015', ['x'])
body = '\\M+193FA\\M+1967B|\\M+5D6D0\\M+5CEC4|\\M+3C7D1|\\M+2A4E9|\\M+D6D0\\M+CEC4'
open(os.path.join(OUT, 'mif-escapes.dxf'), 'wb').write(dxf('ANSI_936', 'AC1015', [body]).replace('\n', '\r\n').encode('ascii'))
truth['mif-escapes'] = ['日本|中文|한|日|中文']
json.dump(truth, open(os.path.join(OUT, 'truth.json'), 'w'), ensure_ascii=False, indent=1)
print(sorted(truth))
