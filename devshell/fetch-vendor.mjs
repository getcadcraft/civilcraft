#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * fetch-vendor.mjs — download every library this app (and its tests) uses, by exact version, into devshell/vendor/
 * (docs/DEVSHELL.md). devshell/vendor.json lists each file with its size and sha256 (written by pack.php); a file
 * already there with the right hash is kept, anything else is fetched from getcadcraft.com and checked.
 *
 *   node devshell/fetch-vendor.mjs [--lib pdfjs] [--quiet] [--oracles]     (npm run fetch-vendor)
 *
 * "oracles" in vendor.json are copyleft libraries only the tests load, as black-box reference readers (PROVENANCE.md):
 * never part of the app, fetched only with --oracles (0.4 part 2, L.5). Tests that compare against one skip without it.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const VENDOR = path.join(HERE, 'vendor');

const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');

/** @returns {{fetched: number, kept: number, failed: string[]}} */
export async function fetchVendor({ only = null, quiet = false, oracles = false } = {}) {
  const list = JSON.parse(fs.readFileSync(path.join(HERE, 'vendor.json'), 'utf8'));
  const origin = JSON.parse(fs.readFileSync(path.join(HERE, 'app.json'), 'utf8')).origin || 'https://getcadcraft.com';
  let fetched = 0, kept = 0;
  const failed = [];
  for (const [lib, v] of Object.entries({ ...list.libs, ...(oracles ? list.oracles || {} : {}) })) {
    if (only && lib !== only) continue;
    const queue = v.files.filter(([rel, size, hash]) => {
      const f = path.join(VENDOR, lib, v.version, rel);
      if (fs.existsSync(f) && fs.statSync(f).size === size && sha(fs.readFileSync(f)) === hash) { kept++; return false; }
      return true;
    });
    if (!queue.length) continue;
    if (!quiet) console.log(`${lib} ${v.version}: fetching ${queue.length} file(s)…`);
    let i = 0;
    const worker = async () => {
      while (i < queue.length) {
        const [rel, size, hash] = queue[i++];
        const url = `${origin}/assets/vendor/${lib}/${v.version}/${rel.split('/').map(encodeURIComponent).join('/')}`;
        try {
          const r = await fetch(url);
          if (!r.ok) throw new Error('HTTP ' + r.status);
          const buf = Buffer.from(await r.arrayBuffer());
          if (buf.length !== size || sha(buf) !== hash) throw new Error('checksum mismatch');
          const f = path.join(VENDOR, lib, v.version, rel);
          fs.mkdirSync(path.dirname(f), { recursive: true });
          fs.writeFileSync(f + '.part', buf); fs.renameSync(f + '.part', f);
          fetched++;
        } catch (e) { failed.push(`${lib}/${v.version}/${rel}: ${e.message}`); }
      }
    };
    await Promise.all(Array.from({ length: 6 }, worker));
  }
  return { fetched, kept, failed };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const i = process.argv.indexOf('--lib');
  const r = await fetchVendor({ only: i > 0 ? process.argv[i + 1] : null, quiet: process.argv.includes('--quiet'), oracles: process.argv.includes('--oracles') });
  console.log(`libraries: ${r.fetched} fetched, ${r.kept} already here${r.failed.length ? ', ' + r.failed.length + ' failed' : ''}`);
  for (const f of r.failed.slice(0, 20)) console.log('  ' + f);
  process.exit(r.failed.length ? 1 : 0);
}
