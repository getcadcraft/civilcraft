#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * make-cuix.mjs — writes tools/cadcraft-test/fixtures/my-tools.cuix, a CUIx made by hand for 0.5 DR.9's import test: a ZIP
 * (one part stored, the rest deflated) with MenuGroup.cui (macros, a toolbar, shortcut keys), RibbonRoot.cui (one panel),
 * a 16 × 16 PNG and a 16 × 16 24-bit BMP button picture, and an acad.pgp. Built from the format as it is published, never
 * from a file out of a product install.   node tools/cadcraft-test/make-cuix.mjs [--check]
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures/my-tools.cuix');

const crcT = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc = (b) => { let c = 0xffffffff; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };

function png16(r, g, b) {
  const raw = Buffer.alloc(16 * (16 * 4 + 1));
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const o = y * 65 + 1 + x * 4; raw[o] = r; raw[o + 1] = g; raw[o + 2] = b; raw[o + 3] = 255; }
  const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(16, 0); ihdr.writeUInt32BE(16, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}
function bmp16(r, g, b) {
  const stride = 48, size = 54 + stride * 16, d = Buffer.alloc(size);
  d.write('BM', 0); d.writeUInt32LE(size, 2); d.writeUInt32LE(54, 10); d.writeUInt32LE(40, 14); d.writeInt32LE(16, 18); d.writeInt32LE(16, 22);
  d.writeUInt16LE(1, 26); d.writeUInt16LE(24, 28);
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const o = 54 + y * stride + x * 3; d[o] = b; d[o + 1] = g; d[o + 2] = r; }
  return d;
}

const MENUGROUP = `<?xml version="1.0" encoding="utf-8"?>
<CustSection xml:lang="en-US">
  <Header><WorkspaceRoot/></Header>
  <MenuGroup Name="TESTMENU">
    <MacroGroup Name="TestMacros">
      <MenuMacro UID="MM_Line"><Macro><Name>Line</Name><Command>^C^C_line</Command><SmallImage Name="MM_Line_16.png"/><LargeImage Name="MM_Line_32.png"/></Macro></MenuMacro>
      <MenuMacro UID="MM_Box"><Macro><Name>Box 100 &amp; 50</Name><Command>^C^C_rectang;0,0;@100,50;</Command><SmallImage Name="MM_Box_16.bmp"/></Macro></MenuMacro>
      <MenuMacro UID="MM_Circle"><Macro><Name>Circle here</Name><Command>^C^C_circle;\\25;</Command></Macro></MenuMacro>
      <MenuMacro UID="MM_Turn"><Macro><Name>Turn right</Name><Command>^C^C_turnright</Command></Macro></MenuMacro>
      <MenuMacro UID="MM_Diesel"><Macro><Name>Line or circle</Name><Command>$M=$(if,$(getvar,ORTHOMODE),^C^C_line,^C^C_circle)</Command></Macro></MenuMacro>
      <MenuMacro UID="MM_Strlen"><Macro><Name>Unsupported DIESEL</Name><Command>$M=$(strlen,abc)</Command></Macro></MenuMacro>
      <MenuMacro UID="MM_Super"><Macro><Name>Super hatch</Name><Command>^C^C_superhatch</Command></Macro></MenuMacro>
    </MacroGroup>
    <MenuRoot>
      <AcceleratorRoot>
        <MenuAccelerator UID="ACC_1"><Name>Line key</Name><AcceleratorShortcutKey>CTRL+SHIFT+L</AcceleratorShortcutKey><MenuItem><MacroRef MenuMacroID="MM_Line"/></MenuItem></MenuAccelerator>
        <MenuAccelerator UID="ACC_2"><Name>Taken key</Name><AcceleratorShortcutKey>CTRL+S</AcceleratorShortcutKey><MenuItem><MacroRef MenuMacroID="MM_Box"/></MenuItem></MenuAccelerator>
      </AcceleratorRoot>
      <PopMenuRoot/>
      <ToolbarRoot>
        <Toolbar ToolbarOrient="floating" ToolbarVisible="show" UID="TB_Mine" rows="1" xval="0" yval="0">
          <Alias>TB_Mine</Alias><Name>My drafting</Name>
          <ToolbarButton><Name>Line</Name><MenuItem><MacroRef MenuMacroID="MM_Line"/></MenuItem></ToolbarButton>
          <ToolbarButton IsSeparator="true"/>
          <ToolbarButton><Name>Box</Name><MenuItem><MacroRef MenuMacroID="MM_Box"/></MenuItem></ToolbarButton>
          <ToolbarButton><Name>Circle</Name><MenuItem><MacroRef MenuMacroID="MM_Circle"/></MenuItem></ToolbarButton>
          <ToolbarButton><Name>Turn</Name><MenuItem><MacroRef MenuMacroID="MM_Turn"/></MenuItem></ToolbarButton>
          <ToolbarButton><Name>Either</Name><MenuItem><MacroRef MenuMacroID="MM_Diesel"/></MenuItem></ToolbarButton>
          <ToolbarButton><Name>Strlen</Name><MenuItem><MacroRef MenuMacroID="MM_Strlen"/></MenuItem></ToolbarButton>
          <ToolbarButton><Name>Super</Name><MenuItem><MacroRef MenuMacroID="MM_Super"/></MenuItem></ToolbarButton>
          <ToolbarButton><Name>Gone</Name><MenuItem><MacroRef MenuMacroID="MM_Nowhere"/></MenuItem></ToolbarButton>
        </Toolbar>
      </ToolbarRoot>
    </MenuRoot>
  </MenuGroup>
</CustSection>
`;
const RIBBON = `<?xml version="1.0" encoding="utf-8"?>
<CustSection><MenuGroup Name="TESTMENU"><MenuRoot><RibbonRoot><RibbonPanelSourceCollection>
  <RibbonPanelSource UID="RP_1" Text="Quick shapes"><RibbonRow><RibbonCommandButton Text="Ribbon box" MenuMacroID="MM_Box"/><RibbonCommandButton Text="Ribbon line" MenuMacroID="MM_Line"/></RibbonRow></RibbonPanelSource>
</RibbonPanelSourceCollection></RibbonRoot></MenuRoot></MenuGroup></CustSection>
`;
const PGP = '; aliases\nZZ,  *ZOOM\nSH, *SUPERHATCH\n';

function zip(entries) {
  const locals = [], centrals = [];
  let off = 0;
  for (const [name, data, deflate] of entries) {
    const body = deflate ? zlib.deflateRawSync(data) : data, n = Buffer.from(name);
    const lh = Buffer.alloc(30); lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(deflate ? 8 : 0, 8);
    lh.writeUInt32LE(crc(data), 14); lh.writeUInt32LE(body.length, 18); lh.writeUInt32LE(data.length, 22); lh.writeUInt16LE(n.length, 26);
    const ch = Buffer.alloc(46); ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(deflate ? 8 : 0, 10);
    ch.writeUInt32LE(crc(data), 16); ch.writeUInt32LE(body.length, 20); ch.writeUInt32LE(data.length, 24); ch.writeUInt16LE(n.length, 28); ch.writeUInt32LE(off, 42);
    locals.push(lh, n, body); centrals.push(ch, n);
    off += 30 + n.length + body.length;
  }
  const cd = Buffer.concat(centrals), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10); end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(off, 16);
  return Buffer.concat([...locals, cd, end]);
}

const bytes = zip([
  ['[Content_Types].xml', Buffer.from('<?xml version="1.0"?><Types/>'), false],
  ['MenuGroup.cui', Buffer.from(MENUGROUP), true],
  ['RibbonRoot.cui', Buffer.from(RIBBON), true],
  ['Images/MM_Line_16.png', png16(30, 72, 200), false],
  ['Images/MM_Box_16.bmp', bmp16(200, 40, 40), true],
  ['acad.pgp', Buffer.from(PGP), true],
]);
if (process.argv.includes('--check')) {
  const same = fs.existsSync(OUT) && fs.readFileSync(OUT).equals(bytes);
  console.log(same ? 'my-tools.cuix is current' : 'my-tools.cuix differs: run without --check');
  process.exit(same ? 0 : 1);
}
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, bytes);
console.log('wrote ' + path.relative(process.cwd(), OUT) + ' (' + bytes.length + ' bytes)');
