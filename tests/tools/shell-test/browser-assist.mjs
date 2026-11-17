// SPDX-License-Identifier: Apache-2.0
/**
 * browser-assist.mjs: the assistant's entry inside the app on real /lab pages (bk-r3-assistant-10; BK.124, BK.145, BK.147, BK.148, BK.168, BK.57/58).
 *   node tools/shell-test/browser-assist.mjs [--apps bimcraft,cadcraft]        run as root; one headless browser, short
 * A stand-in stands for the assistant: this script calls the page's own control channel (host.control.handle, the way Studio's hub does).
 * No AI is called. Reports are never sent: POST /api/suggest and /api/contact are intercepted and answered here.
 * Every request of the page must go to this site.
 */
import { openLab } from './lab-page.mjs';

const only = (process.argv.find((a) => a.startsWith('--apps=')) || '').slice(7) || (process.argv.includes('--apps') ? process.argv[process.argv.indexOf('--apps') + 1] : '');
const APPS = (only || 'bimcraft,cadcraft').split(',');
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d !== '' ? ' (' + (typeof d === 'string' ? d : JSON.stringify(d)).slice(0, 400) + ')' : '')); } };
const WALL = { bimcraft: 'model.wall', cadcraft: 'draw.line' };   // a drawing tool with a button in the classic layout
const NAME = { bimcraft: 'Wall', cadcraft: 'Line' };

const lab = await openLab('bkassist');
try {
  for (const slug of APPS) {
    console.log('== ' + slug);
    const store = { ['cadcraft.assistants.' + slug]: JSON.stringify({ enabled: true, groups: ['read', 'edit'] }), ...(slug === 'bimcraft' ? { 'bimcraft.settings': JSON.stringify({ assistants: { enabled: true, groups: ['read', 'edit'] } }) } : {}) };
    const { ctx, page, errors } = await lab.page(slug, { viewport: { width: 1600, height: 1000 }, storage: store });
    const hosts = new Set();
    page.on('request', (r) => { try { const u = new URL(r.url()); if (/^https?:$/.test(u.protocol)) hosts.add(u.host); } catch { /* data: */ } });
    const posts = [];
    await ctx.route('**/api/suggest', async (route) => { posts.push({ to: 'suggest', body: route.request().postData() || '' }); await route.fulfill({ status: 302, headers: { location: '/suggest-sent?t=bkassist-test' } }); });
    await ctx.route(/\/suggest-sent/, (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<html><body>sent</body></html>' }));
    await ctx.route('**/api/contact', async (route) => { posts.push({ to: 'contact', body: route.request().postData() || '' }); await route.fulfill({ status: 200, contentType: 'text/html', body: '<html><body><div class="flash flash-success"><p>Done.</p></div></body></html>' }); });
    await page.waitForFunction(() => window.ccAssist && window.ccAssist.control && window.ccAsk && window.ccAsk.state().attached, null, { timeout: 30000 }).catch(() => {});
    const call = (name, args = {}) => page.evaluate(async ([n, a]) => { const r = await window.ccAssist.control.handle({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: n, arguments: a } }, 'bkassist', { name: 'Stand-in', version: '1' }); return r.result || r; }, [name, args]);

    // ---- attached, and the filter is on before anything is asked
    const st = await page.evaluate(() => ({ assist: !!window.ccAssist, control: !!(window.ccAssist && window.ccAssist.control), enabled: window.ccAssist?.control?.enabled, tools: window.ccAssist?.control?.list().map((t) => t.name) || [], version: window.ccAssist?.version() }));
    ok(st.assist && st.control && st.enabled, 'the Ask box attached the assistant entry to the app\'s control', st);
    ok(['history_describe', 'guide_show', 'guide_close', 'problem_report', 'knowledge_info', 'knowledge_find', 'knowledge_get', 'stage_get'].every((t) => st.tools.includes(t)), 'the new tools are registered: history_describe, guide_show, guide_close, problem_report, knowledge_*, stage_get', st.tools.filter((t) => /history|guide|problem_report|knowledge|stage/.test(t)));
    ok(st.version === 'dev', 'the lab page says its version is a lab build ("dev")', st.version);

    // ---- BK.145: model data only
    await page.evaluate(() => window.ccDocInfo.info.set({ title: 'Test house', author: 'Test Author', company: 'Test Office', comments: 'Ask author@example.com' }, { by: 'Test Author' }));
    const di = await call('docinfo_get');
    const props = di.structuredContent.properties;
    ok(props.title === 'Test house' && props.author === undefined && props.company === undefined && props.modifiedBy === undefined && props.comments === 'Ask [email held back]', 'docinfo_get: the title goes to the assistant; author, company and "last saved by" do not; an email inside the comments is replaced', props);
    ok(!JSON.stringify(di).includes('Test Author') && !JSON.stringify(di).includes('Test Office') && !JSON.stringify(di).includes('author@example.com'), 'none of the three appears anywhere in what the assistant received');
    await page.evaluate(() => window.ccActivity.open());
    await page.selectOption('.cct-activity [data-k="kind"]', 'all');
    await page.waitForSelector('.cct-activity [data-k="held"]', { timeout: 5000 }).catch(() => {});
    const act = await page.evaluate(() => { const row = [...document.querySelectorAll('.cct-activity .cct-ac-row')].find((r) => /details|docinfo/i.test(r.textContent)); return { sent: row?.querySelector('[data-k="sent"]')?.textContent || '', held: row?.querySelector('[data-k="held"]')?.textContent || '', note: document.querySelector('.cct-activity [data-k="modelonly"]')?.textContent || '' }; });
    ok(/^Sent back \d+ bytes: properties, facts\./.test(act.sent), 'the activity panel shows what went back for that call: its size and field names', act.sent);
    ok(/Held back 4: properties\.author \(a person's name\), properties\.company \(account or company details\), properties\.comments \(an email address\), properties\.modifiedBy \(a person's name\)\./.test(act.held), 'and the four values that were held back, each with its reason', act.held);
    ok(/model data only/.test(act.note), 'the panel says the rule', act.note);
    await page.evaluate(() => window.ccActivity.close());

    // ---- BK.124: Help opens the assistant; the layout, the tool and the stage go with a question
    await page.evaluate(() => document.querySelector('[data-help-open]').click());
    await page.waitForSelector('[data-help-panel] [data-ask-open]:not([hidden])', { timeout: 8000 }).catch(() => {});
    const helpBtn = await page.evaluate(() => { const b = document.querySelector('[data-help-panel] [data-ask-open]'); return b ? { hidden: b.hidden, text: b.textContent.trim() } : null; });
    ok(helpBtn && !helpBtn.hidden && helpBtn.text === 'Ask the assistant', 'the Help panel has "Ask the assistant"', helpBtn);
    await page.evaluate(() => document.querySelector('[data-help-panel] [data-ask-open]').click());
    ok(await page.evaluate(() => window.ccAsk.state().open && !document.querySelector('#cct-ask').hidden), 'a click opens the Ask box');
    await page.evaluate((id) => window.ccInput.run(id), WALL[slug]);
    await page.waitForTimeout(400);
    await page.evaluate(() => window.ccDocInfo.info.set({ stage: 'concept' }));
    const cx = await page.evaluate(() => window.ccAssist.context());
    ok(typeof cx.workspace === 'string' && cx.workspace.length > 2, 'the context names the screen layout: "' + cx.workspace + '"');
    ok(cx.tool === NAME[slug], 'and the tool in use: "' + cx.tool + '" after starting ' + WALL[slug], cx);
    ok(cx.stage === 'Concept', 'and the project stage: "' + cx.stage + '"');
    ok(typeof cx.file === 'string' && !/[\\/]/.test(cx.file), 'the file is named without a folder: "' + cx.file + '"');
    await page.evaluate(() => window.ccAsk.ask('How do I change this wall?'));
    const listed = (await call('ask_list')).structuredContent.questions[0];
    ok(listed && listed.question === 'How do I change this wall?' && listed.context.workspace === cx.workspace && listed.context.tool === NAME[slug] && listed.context.stage === 'Concept' && listed.context.document === cx.file, 'the assistant reads the question with that context (ask_list)', listed);
    const sg = (await call('stage_get')).structuredContent;
    ok(sg.stage === 'concept' && sg.name === 'Concept' && sg.step === 2 && sg.of === 7, 'stage_get: concept, 2 of 7', sg);

    // ---- BK.168: the project stage in the Drawing details panel
    await page.evaluate(() => { window.ccAsk.close(); window.ccDocInfo.open(); });
    await page.selectOption('.cct-docinfo [data-k="stage"]', 'working-drawings');
    await page.click('.cct-docinfo [data-k="save"]');
    await page.waitForTimeout(500);
    const stage2 = await page.evaluate(() => ({ stage: window.ccDocInfo.info.get().stage, saved: window.ccDocInfo.info.save().stage, options: [...document.querySelectorAll('.cct-docinfo [data-k="stage"] option')].map((o) => o.textContent) }));
    ok(stage2.stage === 'working-drawings' && stage2.saved === 'working-drawings', 'choosing "Working drawings" in Drawing details and Save keeps it with the file\'s details', stage2);
    ok(JSON.stringify(stage2.options) === JSON.stringify(['Not set', 'Brief', 'Concept', 'Design development', 'Submission', 'Working drawings', 'Tender', 'Close-out']), 'the list: Not set and the seven stages in order', stage2.options);
    await page.evaluate(() => window.ccDocInfo.close());

    // ---- BK.147: why did this happen?
    await page.keyboard.press('Escape'); await page.keyboard.press('Escape'); await page.waitForTimeout(200);   // end the running command: an app in the middle of one refuses an assistant's edit ("busy")
    await call('docinfo_set', { subject: 'Changed by the stand-in' });
    await page.waitForTimeout(700);
    await page.evaluate(() => window.ccAsk.open());
    await page.click('.cct-ask [data-k="why"]');
    const why = await page.evaluate(() => [...document.querySelectorAll('.cct-ask [data-k="why-steps"] li')].map((li) => li.textContent));
    ok(why.includes('You started the command "' + NAME[slug] + '".'), '"Why did this happen?" lists the command the person started', why);
    ok(why.some((t) => /^Stand-in changed the model with "docinfo set" \(undo step "Drawing details"\)\.$/.test(t)), 'and what the assistant changed, with its undo step', why);
    ok(why.some((t) => /^The model changed: "/.test(t)) || slug !== 'bimcraft' || why.length >= 2, 'the app\'s own undo list feeds it', why);
    const hd = (await call('history_describe', { limit: 20 })).structuredContent;
    ok(hd.steps.length >= 2 && hd.steps.some((s) => s.text === 'You started the command "' + NAME[slug] + '".') && hd.steps.every((s, i) => s.n === i + 1) && !hd.steps.some((s) => /history describe/.test(s.text)), 'history_describe gives the assistant the same steps, numbered, without listing itself', hd.steps.map((s) => s.text));
    ok(await page.evaluate(() => !!document.querySelector('.cct-ask [data-k="why-ask"]')), 'with an assistant connected the box offers "Ask the assistant to explain"');

    // ---- BK.124 / BK.148: Report a problem, one step from the Ask box
    await page.fill('.cct-ask [data-k="input"]', 'The wall got thinner when I changed its type. I expected the same thickness.');
    await page.click('.cct-ask [data-k="report"]');
    await page.waitForSelector('dialog[data-about][open]', { timeout: 5000 }).catch(() => {});
    const dlg = await page.evaluate(() => { const d = document.querySelector('dialog[data-about]'); return { open: d.open, text: d.querySelector('[data-about-text]').value, box: !d.querySelector('[data-about-assist]').hidden, steps: d.querySelector('[data-about-steps]').checked, excerptBox: !!d.querySelector('[data-about-excerpt]'), excerpt: d.querySelector('[data-about-excerpt]')?.checked, view: d.querySelector('[data-about-steps-view]').textContent, ex: d.querySelector('[data-about-excerpt-view]')?.textContent || '' }; });
    ok(dlg.open && dlg.text === 'The wall got thinner when I changed its type. I expected the same thickness.', 'Report a problem opens the app\'s own About dialog with what was typed (no second dialog)', dlg.text);
    ok(dlg.box && dlg.steps === true && /^1\. /.test(dlg.view) && dlg.view.includes('You started the command "' + NAME[slug] + '".'), 'the steps are offered (ticked) and can be read before sending', dlg.view.slice(0, 200));
    ok(dlg.excerptBox && dlg.excerpt === false, 'the model excerpt is offered and NOT ticked');
    let ex = {}; try { ex = JSON.parse(dlg.ex); } catch { /* shown below */ }
    ok(ex.format === 'cadcraft-model-excerpt' && ex.app === slug && ex.stage === 'Working drawings' && !dlg.ex.includes('Test Author') && !dlg.ex.includes('Test Office') && ex.file === undefined && ex.document === undefined, 'the excerpt can be read first: counts, selection, stage, steps; no author, no company, no file name', dlg.ex.slice(0, 300));
    await page.fill('dialog[data-about] [name="name"]', 'BK Assist Test'); await page.fill('dialog[data-about] [name="email"]', 'bkassist+cadcraft@projectz.xyz');
    await page.click('dialog[data-about] [data-about-send]');
    await page.waitForFunction(() => !document.querySelector('dialog[data-about] [data-about-followed]').hidden, null, { timeout: 8000 }).catch(() => {});
    const p1 = posts.at(-1) || { to: '', body: '' };
    const field = (body, name) => { const m = new RegExp('name="' + name + '"\\r\\n\\r\\n([\\s\\S]*?)\\r\\n--').exec(body); return m ? m[1].replace(/\r\n/g, '\n') : null; };   // a form sends line breaks as CR LF
    ok(posts.length === 1 && p1.to === 'suggest', 'with the steps ticked the report goes to the one intake, POST /api/suggest (intercepted here; nothing was sent)', posts.map((p) => p.to));
    ok(field(p1.body, 'tool_name') === 'The wall got thinner when I changed its type.' && field(p1.body, 'app') === slug && field(p1.body, 'confirm_new') === '1' && field(p1.body, 'email') === 'bkassist+cadcraft@projectz.xyz' && (field(p1.body, '_csrf') || '').length > 10, 'title = the first sentence; app, email and the CSRF field go with it', [field(p1.body, 'tool_name'), field(p1.body, 'app')]);
    const body1 = field(p1.body, 'why') || '';
    ok(body1.startsWith('The wall got thinner when I changed its type. I expected the same thickness.\n\nSteps before it happened (from the app\'s own history, oldest first') && body1.includes('. You started the command "' + NAME[slug] + '".') && /\nVersion: [A-Za-z]+Craft, Web \(in the browser\), dev · [0-9a-f]{7}\n/.test(body1) && body1.includes('\nProject stage: Working drawings\n') && body1.endsWith('Model excerpt: not attached.') && body1.length <= 4000, 'details = the words, the numbered steps, the version, the stage, "Model excerpt: not attached."', body1.slice(-260));
    ok(!/name="share_file"/.test(p1.body) && !/share_agree/.test(p1.body), 'no file went with it: the excerpt was not ticked');
    const follow = await page.evaluate(() => ({ status: document.querySelector('dialog[data-about] [data-about-status]').textContent, href: document.querySelector('dialog[data-about] [data-about-follow]').getAttribute('href'), hidden: document.querySelector('dialog[data-about] [data-about-followed]').hidden }));
    ok(follow.status === 'Sent. You can follow it here:' && follow.href === '/suggest-sent?t=bkassist-test' && !follow.hidden, 'the dialog says it was sent and links the page to follow it', follow);
    // with the excerpt ticked
    await page.fill('dialog[data-about] [data-about-text]', 'Second report.');
    await page.check('dialog[data-about] [data-about-excerpt]');
    await page.click('dialog[data-about] [data-about-send]');
    await page.waitForFunction((n) => window.__n !== n && document.querySelector('dialog[data-about] [data-about-status]').textContent.startsWith('Sent'), 0, { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(300);
    const p2 = posts.at(-1);
    const fileM = /name="share_file"; filename="model-excerpt\.json"\r\nContent-Type: application\/json\r\n\r\n([\s\S]*?)\r\n--/.exec(p2.body);
    ok(posts.length === 2 && p2.to === 'suggest' && fileM && field(p2.body, 'share_agree') === '1' && field(p2.body, 'share_days') === '14', 'ticked: the excerpt goes as the intake\'s one file with the consent the box states, kept 14 days', p2.body.slice(0, 200));
    ok(fileM && JSON.parse(fileM[1]).format === 'cadcraft-model-excerpt' && !fileM[1].includes('Test Author') && /Model excerpt: attached with my consent \(model-excerpt\.json, \d+ bytes/.test(field(p2.body, 'why')), 'the file is the excerpt that was shown, and the report says it is attached with consent');
    // neither ticked: the dialog works as before
    await page.fill('dialog[data-about] [data-about-text]', 'Plain report.');
    await page.uncheck('dialog[data-about] [data-about-steps]'); await page.uncheck('dialog[data-about] [data-about-excerpt]');
    await page.click('dialog[data-about] [data-about-send]');
    await page.waitForFunction(() => document.querySelector('dialog[data-about] [data-about-status]').textContent === 'Done.', null, { timeout: 8000 }).catch(() => {});
    ok(posts.length === 3 && posts[2].to === 'contact' && /Plain report\./.test(posts[2].body) && !/Steps before it happened/.test(posts[2].body), 'with neither ticked the report goes where it went before (the support form), unchanged', posts.map((p) => p.to));
    await page.evaluate(() => window.cadcraftAbout.close());
    // an assistant drafts, the person sends
    const pr = (await call('problem_report', { what: 'The door schedule shows 0 doors after I added one.' })).structuredContent;
    const dr = await page.evaluate(() => ({ open: document.querySelector('dialog[data-about]').open, text: document.querySelector('dialog[data-about] [data-about-text]').value }));
    ok(pr.opened === true && pr.sent === false && dr.open && dr.text === 'The door schedule shows 0 doors after I added one.' && posts.length === 3, 'problem_report: the assistant\'s draft is in the dialog for the person; nothing was sent', pr);
    await page.evaluate(() => window.cadcraftAbout.close());

    // ---- BK.168: a step on screen, the ring on the real button
    await page.evaluate(() => window.ccAsk.close());
    const g1 = (await call('guide_show', { title: 'Draw a room', text: 'Click ' + NAME[slug] + ', then click two points.', step: 1, of: 3, target: { command: WALL[slug] } })).structuredContent;
    await page.waitForTimeout(300);
    const scr = await page.evaluate((id) => {
      const card = document.querySelector('[data-guide]'), ring = document.querySelector('[data-newhere-ring]');
      const esc = CSS.escape(id);
      const btn = [...document.querySelectorAll('[data-ws-command="' + esc + '"], [data-tbx-tool="' + esc + '"], [data-cmd="' + esc + '"]'), document.querySelector(window.ccInput.commands.find((c) => c.id === id).sel)].find((b) => b && b.getBoundingClientRect().width > 0);
      const r = ring.getBoundingClientRect(), b = btn ? btn.getBoundingClientRect() : null;
      return { card: card && card.matches(':popover-open'), title: card?.querySelector('[data-k="title"]').textContent, n: card?.querySelector('[data-k="n"]').textContent, text: card?.querySelector('[data-k="text"]').textContent, where: card?.querySelector('[data-k="where"]').textContent,
        ring: ring.matches(':popover-open'), around: !!b && Math.abs(r.left - (b.left - 4)) < 1.5 && Math.abs(r.top - (b.top - 4)) < 1.5 && Math.abs(r.width - (b.width + 8)) < 1.5 && Math.abs(r.height - (b.height + 8)) < 1.5, rects: b ? [r.left, r.top, r.width, r.height, b.left, b.top, b.width, b.height].map(Math.round) : null };
    }, WALL[slug]);
    ok(g1.found === true && scr.card && scr.title === 'Draw a room' && scr.n === 'Step 1 of 3' && scr.text === 'Click ' + NAME[slug] + ', then click two points.', 'guide_show: the step card shows the task, "Step 1 of 3" and the text', [g1, scr.title, scr.n]);
    ok(scr.ring && scr.around, 'the tour\'s ring sits round the real ' + NAME[slug] + ' button (4 px outside it on every side)', scr.rects);
    ok(scr.where === 'Marked on your screen: ' + NAME[slug], 'the card says what is marked: "' + scr.where + '"');
    const before = await page.evaluate(() => window.ccHistorySource ? window.ccHistorySource.steps().length : -1);
    const g2 = (await call('guide_show', { text: 'Open Help.', step: 2, of: 3, target: { panel: 'help' } })).structuredContent;
    const g3 = (await call('guide_show', { text: 'Click it.', step: 3, of: 3, target: { command: 'no.such.command' } })).structuredContent;
    await page.waitForTimeout(300);
    const miss = await page.evaluate(() => ({ where: document.querySelector('[data-guide] [data-k="where"]').textContent, ring: document.querySelector('[data-newhere-ring]').matches(':popover-open') }));
    ok(g2.found === true && g3.found === false && /no command with the id/.test(g3.why) && miss.where === 'It is not on the screen in the layout you use now.' && !miss.ring, 'a panel is found; a command the app does not have is said to be missing and nothing is ringed', [g2, g3, miss]);
    const closed = (await call('guide_close')).structuredContent;
    const after = await page.evaluate(() => ({ card: document.querySelector('[data-guide]').matches(':popover-open'), ring: document.querySelector('[data-newhere-ring]').matches(':popover-open'), steps: window.ccHistorySource ? window.ccHistorySource.steps().length : -1 }));
    ok(closed.closed === true && !after.card && !after.ring && after.steps === before, 'guide_close takes the card and the ring away; the steps changed nothing in the document (the undo list is as long as before)', after);

    // ---- BK.57 / BK.146 / BK.58: a connected knowledge pack, checked against this app
    const none = (await call('knowledge_info')).structuredContent;
    ok(none.connected === false, 'with no knowledge add-on the tool says no pack is connected', none);
    await page.evaluate(async () => {   // what the add-on does on activate (addons/knowledge-pack/main.js), with the pack the site publishes
      const list = await (await fetch('/assets/packs/knowledge/index.json')).json();
      const mk = async (v) => { const index = await (await fetch('/assets/packs/knowledge/' + v.index)).json(); return { id: 'knowledge-pack', index, read: async (p) => (await fetch('/assets/packs/knowledge/' + v.version + '/' + p)).text() }; };
      window.__packs = { lab: await mk(list.versions.find((v) => v.channel === 'lab')), release: await mk(list.versions.find((v) => v.channel === 'release')) };
      globalThis.ccKnowledge = [window.__packs.release]; window.dispatchEvent(new CustomEvent('cc-knowledge')); window.ccAsk.open();
    });
    await page.waitForSelector('.cct-ask [data-k="knowledge"]', { timeout: 5000 }).catch(() => {});
    const kn1 = await page.evaluate(() => { const p = document.querySelector('.cct-ask [data-k="knowledge"]'); return p ? { state: p.dataset.state, text: p.textContent, alert: p.getAttribute('role') } : null; });
    ok(kn1 && kn1.state === 'mismatch' && kn1.alert === 'alert' && /^Knowledge pack \d+\.\d+\.\d+ is connected\. The knowledge pack is for release \d+\.\d+\.\d+, but [A-Za-z]+ is a lab build of the next release\. Menus, commands and tools may differ/.test(kn1.text), 'a release pack with this lab build: the Ask box says the mismatch plainly', kn1);
    const ki1 = (await call('knowledge_info')).structuredContent;
    ok(ki1.connected && ki1.match.ok === false && ki1.match.state === 'mismatch', 'and so does knowledge_info for the assistant', ki1.match);
    await page.evaluate(() => { globalThis.ccKnowledge = [window.__packs.lab]; window.dispatchEvent(new CustomEvent('cc-knowledge')); });
    await page.waitForFunction(() => document.querySelector('.cct-ask [data-k="knowledge"]')?.dataset.state === 'lab', null, { timeout: 5000 }).catch(() => {});
    const kn2 = await page.evaluate(() => { const p = document.querySelector('.cct-ask [data-k="knowledge"]'); return { state: p.dataset.state, alert: p.getAttribute('role') }; });
    ok(kn2.state === 'lab' && kn2.alert === null, 'the lab pack with this lab build fits (said with the note that the lab moves)', kn2);
    const kf = (await call('knowledge_find', { query: slug === 'bimcraft' ? 'draw walls' : 'draw lines', limit: 3 })).structuredContent;
    ok(kf.total >= 1 && kf.documents[0].app === slug && kf.documents.every((d) => d.app === slug || d.app === null), 'knowledge_find looks in this app\'s documents: "' + kf.documents[0]?.title + '" first', kf.documents.map((d) => d.path));
    const kg = (await call('knowledge_get', { path: 'commands/' + slug + '.txt' })).structuredContent;
    ok(kg.text.startsWith('# ') && kg.text.includes('`' + WALL[slug] + '`: ' + NAME[slug]) && kg.text.includes('`history_describe` (read)'), 'knowledge_get reads the command list: it names ' + WALL[slug] + ' and the tools of this build');

    ok(hosts.size === 1 && hosts.has('getcadcraft.com'), 'every request of the page went to this site (' + [...hosts].join(', ') + ')');
    ok(errors.length === 0, 'no page errors', errors.slice(0, 3));
    await ctx.close();
  }
} finally { await lab.close(); }
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
