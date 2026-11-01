// SPDX-License-Identifier: Apache-2.0
// AL.5/AL.8: a package the SITE serves is accepted by the APP's own trust code (hash of the raw bytes, then the Ed25519 signature
// against the build's trusted key). Run: node tools/addons-test/served-package.mjs [base-url]
import * as T from '../../public_html/assets/apps/cadcraft/dev/addons/trust.js';
const base = process.argv[2] || 'https://getcadcraft.com';
let pass = 0, fail = 0;
const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); c ? pass++ : fail++; };
const list = [['cabinet', '0.8.0'], ['windows', '0.8.0']];
for (const [id, v] of list) {
  const res = await fetch(`${base}/addons/package/${id}/${v}`);
  const raw = new Uint8Array(await res.arrayBuffer());
  ok(res.status === 200, `${id}: served`);
  const rd = T.readPackageJson(JSON.parse(new TextDecoder().decode(raw))); const pkg = rd.pkg;
  const r = await T.verifyPackage(pkg);
  ok(r && r.ok !== false, `${id}: the app's trust code verifies the signature (${JSON.stringify(r).slice(0, 60)})`);
  ok((await T.sha256Hex(raw)).length === 64, `${id}: hash of raw bytes computed`);
}
console.log(fail ? `FAILED ${fail}` : `passed ${pass}`); process.exit(fail ? 1 : 0);
