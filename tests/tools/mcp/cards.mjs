#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — developer and set-up messages. */
/**
 * cards.mjs — AC.4: the copy-paste set-up cards and the per-platform help topics, GENERATED from clients.mjs so they cannot drift
 * (docs/AI-CONNECT-SPEC.md § 7).
 *
 *   node tools/mcp/cards.mjs --json            every card for every platform (the site renders these: site_PART_2)
 *   node tools/mcp/cards.mjs --write-help      writes public_html/assets/help/common/connect-ai-<platform>.md
 *   node tools/mcp/cards.mjs --check           exits 1 when the written topics are not what the generator makes
 *   cardsFor(platform), helpTopic(platform)    for a caller that wants them in-process
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CLIENTS, card, TEST_PROMPT } from './clients.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const PLATFORMS = {
  windows: { title: 'Connect your AI on Windows', env: { platform: 'win32', home: '%USERPROFILE%', appdata: '%APPDATA%', xdgConfig: '%USERPROFILE%\\.config' }, order: 63 },
  macos: { title: 'Connect your AI on a Mac', env: { platform: 'darwin', home: '~', appdata: '~/Library/Application Support', xdgConfig: '~/.config' }, order: 64 },
  linux: { title: 'Connect your AI on Linux', env: { platform: 'linux', home: '~', appdata: '~/.config', xdgConfig: '~/.config' }, order: 65 },
  mobile: { title: 'Connect your AI on a phone or tablet', env: null, order: 66 },   // Android / iPad: no settings file to write
};
/** The hosted connector's addresses (ai-remote_PART_2, AC.3). Not in any public text while `open` is false: the switch (.env CONNECT_HOSTED) stays off until AC.6 and the owner say otherwise. */
export const HOSTED = Object.freeze({ universal: 'https://getcadcraft.com/connect/mcp', perPerson: 'https://getcadcraft.com/connect/<handle>/mcp', open: false });

const OS_OF = { win32: 'windows', darwin: 'macos', linux: 'linux' };

export function cardsFor(platform) {
  const P = PLATFORMS[platform];
  if (!P) throw new Error('unknown platform ' + platform);
  if (!P.env) return [];
  return CLIENTS.filter((c) => !c.os || c.os.includes(P.env.platform)).map((c) => ({ ...card(c, P.env), name: c.name, kind: c.kind, install: c.install || null, unverified: !!c.unverified }));
}

const fence = (s, lang) => '```' + (lang || '') + '\n' + s.replace(/\n$/, '') + '\n```';

export function helpTopic(platform) {
  const P = PLATFORMS[platform];
  const cards = cardsFor(platform);
  const out = [];
  if (!P.env) return mobileTopic(P);
  out.push('---', 'title: ' + P.title, 'summary: Let your own AI app work with the CadCraft apps: one click in CadCraft Studio, or a short paste for each AI app. Includes the one-line test that proves it works.',
    'section: start', 'order: ' + P.order, 'keywords: ai, assistant, connect, mcp, claude, cursor, vs code, windsurf, codex, gemini, set up, test, ' + platform, '---', '');
  out.push('## What you will learn', '', 'How to let the AI app you already use (Claude, Cursor, Visual Studio Code, Windsurf, Codex, Gemini…) reach your CadCraft apps, how to check that it works in under a minute, and how to take it out again. The apps contain no AI; your AI app asks them to do things, and you decide what it may do. (For those who search for it: this uses the Model Context Protocol, "MCP".)', '');
  out.push('## The easy way', '', 'Open **CadCraft Studio › Connect your AI**. Studio looks for the AI apps on this computer, shows you in plain words what it would add to each one\'s settings, and writes it only after you press **Yes**. **Disconnect** takes it out again. Nothing secret is written into the AI app\'s settings.', '');
  out.push('## Prove it works', '', 'In your AI app, paste this:', '', fence(TEST_PROMPT), '', 'It should list the CadCraft apps it can reach and then give you a count by layer. It only reads, so it needs no extra permission beyond the **Read** that is on to begin with. In Studio, **Check the connection** tests each step without the AI and says which one failed.', '');
  out.push('## Or paste it yourself', '', 'One card for each AI app. Each one adds a single entry named `cadcraft` and nothing else.', '');
  for (const c of cards) {
    out.push('### ' + c.name, '');
    c.steps.forEach((s, i) => out.push((i + 1) + '. ' + s));
    out.push('', fence(c.paste, c.paste.startsWith('[') ? 'toml' : c.paste.startsWith('{') ? 'json' : 'sh'), '', '**Undo:** ' + c.undo, '');
    if (c.unverified) out.push(':::tip', 'This path comes from the AI app\'s public guides. If it does not match your install, use Studio\'s Connect, which looks first.', ':::', '');
  }
  out.push('## Browser AI and phones', '', 'AI apps in a web browser, and on phones and tablets, cannot read a settings file on your computer. They use the **hosted connector** instead (needs CadCraft Studio open on a computer). Studio › Connect your AI shows the link.', '');
  out.push('## If it does not work', '', '- **The AI app does not list CadCraft:** restart it fully (quit, not just close the window), then check the entry is in its settings.', '- **"Could not reach CadCraft Studio":** open Studio and the app you want; each app has Settings › Assistants to turn on.', '- **It can look but not change:** Edit, Save and Export are separate permissions you turn on per app in Studio.', '');
  return out.join('\n');
}

function mobileTopic(P) {
  return ['---', 'title: ' + P.title, 'summary: How your own AI app reaches the CadCraft apps from a phone or tablet: through the hosted connector, with CadCraft Studio open on a computer. Includes the one-line test.',
    'section: start', 'order: ' + P.order, 'keywords: ai, assistant, connect, android, ipad, phone, tablet, hosted connector, test', '---', '',
    '## What you will learn', '', 'An AI app on a phone or tablet cannot read a settings file on your computer, so it does not use the paste cards. It connects to a **hosted connector** instead, and CadCraft Studio must be open on a computer you own to answer.', '',
    '## How', '', '1. On the computer, open **CadCraft Studio › Connect your AI** and choose **Hosted connector**. Studio shows the address to add' + (HOSTED.open ? ' (the same address for everyone: ' + HOSTED.universal + ')' : '') + ' and asks you to sign in.', '2. In your AI app, add a connector (a "remote" or "custom" connector) with that address and sign in when asked.', '3. Keep Studio open. When it is closed the AI app says CadCraft is not reachable.', '',
    '## Prove it works', '', 'In your AI app, paste this:', '', fence(TEST_PROMPT), '',
    '## What it can and cannot do', '', 'The hosted connector carries only the tool calls and their answers for the apps and permissions you allowed. It never holds your files, and the answers are marked as data from your files, not as instructions. You can disconnect it in Studio at any time.', ''].join('\n');
}

const helpPath = (p) => path.join(ROOT, 'public_html/assets/help/common/connect-ai-' + p + '.md');
const argv = process.argv.slice(2);
if (import.meta.url === 'file://' + process.argv[1]) {
  if (argv.includes('--json')) console.log(JSON.stringify({ testPrompt: TEST_PROMPT, hosted: HOSTED, platforms: Object.fromEntries(Object.keys(PLATFORMS).map((p) => [p, cardsFor(p)])) }, null, 1));
  else if (argv.includes('--write-help')) for (const p of Object.keys(PLATFORMS)) { fs.writeFileSync(helpPath(p), helpTopic(p)); console.log('wrote ' + helpPath(p)); }
  else if (argv.includes('--check')) { const bad = Object.keys(PLATFORMS).filter((p) => !fs.existsSync(helpPath(p)) || fs.readFileSync(helpPath(p), 'utf8') !== helpTopic(p)); if (bad.length) { console.log('stale: ' + bad.join(', ')); process.exit(1); } console.log('help topics are current'); }
  else console.log('usage: cards.mjs --json | --write-help | --check');
}
export { OS_OF };
