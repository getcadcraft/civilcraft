/* SPDX-License-Identifier: Apache-2.0 */
/**
 * calc.js — IND.5: the clause-traced engineering report kit, shared by every engine (rule 39: one library, no app name in it).
 *
 * A calculation report is plain data, checked here and rendered to Markdown or HTML:
 *   { format, version, id?, title, engine: {id, version}, inputs: [{name, symbol, value, unit}],
 *     equations: [{id, text, clause}], results: [{name, symbol, value, unit, equation, clause, limit?: {op, value}, pass?}],
 *     checks?: [..], revisions: [{rev, date, by, change}] }
 *
 * Rules that make a report a clause trace: every input has a unit ('-' when dimensionless); every equation names the clause or
 * source it comes from; every result names the equation it came from, and that equation exists; a limit is compared here (the
 * engine does not decide pass or fail alone); a result that fails its limit becomes a problem in the shared Problems shape
 * (docs/0.8-PROBLEMS-SPEC.md § 1), so the same report lists it in the panel and on the page. The revision block needs one
 * entry. The signature line is printed on every report and is left blank: the engineer of record signs it, never the tool.
 *
 * Words here are English and fixed; a host that translates the report passes its own `words` (same keys). No network, no
 * storage, no DOM.
 */
export const FORMAT = 'cadcraft-calc-report';
export const VERSION = 1;

export const ENGINEER_LINE = 'Engineer of record: ______________________________   Licence or registration no.: ____________________   Date: ____________';

export const DISCLAIMER = 'This calculation was made with a general-purpose design tool built from published textbook engineering. It is not a '
  + 'certified design and is not legal advice. The engineer of record checks every input, equation and clause against the code that applies '
  + 'to the job before relying on it, and signs above. No representation is made that the result is fit for any purpose.';

const OPS = ['<=', '>=', '<', '>'];
const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
const isStr = (v, max = 400) => typeof v === 'string' && v.trim().length > 0 && v.length <= max;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Does a value meet a limit? The only comparison a report makes. */
export function meets(value, limit) {
  if (!limit || !OPS.includes(limit.op) || !isNum(limit.value)) return null;
  if (limit.op === '<=') return value <= limit.value;
  if (limit.op === '>=') return value >= limit.value;
  if (limit.op === '<') return value < limit.value;
  return value > limit.value;
}

/** Check the shape and the trace. Returns { ok, errors[] }; errors name the item by its place in the report. */
export function validate(r) {
  const errors = [];
  const need = (ok, msg) => { if (!ok) errors.push(msg); };
  need(r && r.format === FORMAT, 'format must be ' + FORMAT);
  need(r && r.version === VERSION, 'version must be ' + VERSION);
  if (!r || typeof r !== 'object') return { ok: false, errors: ['no report'] };
  need(isStr(r.title, 160), 'title is required (160 characters at most)');
  need(r.engine && isStr(r.engine.id, 80) && isStr(r.engine.version, 40), 'engine.id and engine.version are required');
  const inputs = Array.isArray(r.inputs) ? r.inputs : null;
  need(inputs, 'inputs must be a list');
  (inputs || []).forEach((x, i) => {
    need(isStr(x && x.name, 120), `inputs[${i}].name is required`);
    need(isStr(x && x.unit, 20), `inputs[${i}].unit is required ('-' when dimensionless)`);
    need(isNum(x && x.value) || isStr(x && x.value, 80), `inputs[${i}].value must be a number or a short text`);
  });
  const eqs = Array.isArray(r.equations) ? r.equations : null;
  need(eqs, 'equations must be a list');
  const ids = new Set();
  (eqs || []).forEach((q, i) => {
    need(isStr(q && q.id, 60), `equations[${i}].id is required`);
    need(!ids.has(q && q.id), `equations[${i}].id ${q && q.id} is used twice`);
    ids.add(q && q.id);
    need(isStr(q && q.text, 400), `equations[${i}].text is required`);
    need(isStr(q && q.clause, 200), `equations[${i}] must name its clause or source`);
  });
  const results = Array.isArray(r.results) ? r.results : null;
  need(results && results.length > 0, 'results must be a non-empty list');
  (results || []).forEach((x, i) => {
    need(isStr(x && x.name, 120), `results[${i}].name is required`);
    need(isNum(x && x.value), `results[${i}].value must be a finite number`);
    need(isStr(x && x.unit, 20), `results[${i}].unit is required ('-' when dimensionless)`);
    need(isStr(x && x.equation, 60) && ids.has(x && x.equation), `results[${i}] must name an equation in the report`);
    if (x && x.limit !== undefined) need(meets(0, x.limit) !== null, `results[${i}].limit needs op (<=, >=, <, >) and a number`);
    if (x && x.pass !== undefined && x.limit) {
      const m = meets(x.value, x.limit);
      need(x.pass === m, `results[${i}].pass disagrees with its limit`);
    }
  });
  const revs = Array.isArray(r.revisions) ? r.revisions : null;
  need(revs && revs.length > 0, 'revisions needs at least one entry (the revision block)');
  (revs || []).forEach((v, i) => {
    need(isStr(v && v.rev, 20), `revisions[${i}].rev is required`);
    need(DATE.test(v && v.date), `revisions[${i}].date must be YYYY-MM-DD`);
    need(isStr(v && v.by, 120), `revisions[${i}].by is required`);
    need(isStr(v && v.change, 300), `revisions[${i}].change is required`);
  });
  return { ok: errors.length === 0, errors };
}

/** The results that fail their limit, as problems in the shared shape (Problems spec § 1). */
export function problemsOf(r) {
  const out = [];
  for (const x of r.results || []) {
    const m = x.limit ? meets(x.value, x.limit) : (x.pass === false ? false : null);
    if (m !== false) continue;
    const id = 'report:' + (r.id || r.engine.id) + ':' + x.equation + ':' + x.symbol;
    out.push({
      id, code: 'report.limit', severity: 'error',
      msg: { key: 'report.limit', vars: {} },
      text: `${x.name} (${x.symbol}) = ${x.value} ${x.unit} does not meet ${x.limit ? x.limit.op + ' ' + x.limit.value : 'the limit'} (${x.clause})`,
      about: [{ kind: 'report', id: r.id || r.engine.id, label: x.name }],
      source: { kind: 'engine', name: r.engine.id },
      req: x.limit ? { op: x.limit.op, value: x.limit.value, unit: x.unit } : null,
      found: { value: x.value, unit: x.unit },
      acceptable: true,
    });
  }
  return out;
}

const cell = (v) => String(v).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
const num = (v) => (isNum(v) ? String(Number(v.toPrecision(6))) : cell(v));

/** The report as Markdown. Assumes validate(r).ok; refuses otherwise. */
export function toMarkdown(r) {
  const v = validate(r);
  if (!v.ok) throw new Error('report is not valid: ' + v.errors.join('; '));
  const L = [];
  L.push('# ' + r.title, '');
  L.push(`Engine ${cell(r.engine.id)} ${cell(r.engine.version)}` + (r.id ? ` · report ${cell(r.id)}` : ''), '');
  L.push('## Inputs', '', '| Input | Symbol | Value | Unit |', '|---|---|---|---|');
  for (const x of r.inputs) L.push(`| ${cell(x.name)} | ${cell(x.symbol || '')} | ${num(x.value)} | ${cell(x.unit)} |`);
  L.push('', '## Equations', '');
  for (const q of r.equations) L.push(`- **${cell(q.id)}** ${cell(q.text)} — ${cell(q.clause)}`);
  L.push('', '## Results', '', '| Result | Symbol | Value | Unit | Equation | Clause | Limit | Meets |', '|---|---|---|---|---|---|---|---|');
  for (const x of r.results) {
    const lim = x.limit ? `${x.limit.op} ${num(x.limit.value)}` : '';
    const m = x.limit ? (meets(x.value, x.limit) ? 'yes' : 'no') : '';
    L.push(`| ${cell(x.name)} | ${cell(x.symbol || '')} | ${num(x.value)} | ${cell(x.unit)} | ${cell(x.equation)} | ${cell(x.clause)} | ${cell(lim)} | ${m} |`);
  }
  const probs = problemsOf(r);
  L.push('', '## Checks', '');
  L.push(probs.length ? probs.map((p) => '- Does not meet: ' + cell(p.text)).join('\n') : 'Every result with a limit meets it.');
  L.push('', '## Revisions', '', '| Rev | Date | By | Change |', '|---|---|---|---|');
  for (const x of r.revisions) L.push(`| ${cell(x.rev)} | ${cell(x.date)} | ${cell(x.by)} | ${cell(x.change)} |`);
  L.push('', '---', '', ENGINEER_LINE, '', DISCLAIMER, '');
  return L.join('\n');
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/** The report as one self-contained HTML document (every value escaped). Assumes validate(r).ok; refuses otherwise. */
export function toHtml(r) {
  const v = validate(r);
  if (!v.ok) throw new Error('report is not valid: ' + v.errors.join('; '));
  const rows = (head, body) => '<table><thead><tr>' + head.map((h) => '<th>' + esc(h) + '</th>').join('') + '</tr></thead><tbody>'
    + body.map((b) => '<tr>' + b.map((c) => '<td>' + esc(c) + '</td>').join('') + '</tr>').join('') + '</tbody></table>';
  const probs = problemsOf(r);
  return '<!doctype html><html lang="en"><meta charset="utf-8"><title>' + esc(r.title) + '</title>'
    + '<body><h1>' + esc(r.title) + '</h1><p>Engine ' + esc(r.engine.id) + ' ' + esc(r.engine.version) + (r.id ? ' · report ' + esc(r.id) : '') + '</p>'
    + '<h2>Inputs</h2>' + rows(['Input', 'Symbol', 'Value', 'Unit'], r.inputs.map((x) => [x.name, x.symbol || '', num(x.value), x.unit]))
    + '<h2>Equations</h2><ul>' + r.equations.map((q) => '<li><strong>' + esc(q.id) + '</strong> ' + esc(q.text) + ' — ' + esc(q.clause) + '</li>').join('') + '</ul>'
    + '<h2>Results</h2>' + rows(['Result', 'Symbol', 'Value', 'Unit', 'Equation', 'Clause', 'Limit', 'Meets'], r.results.map((x) => [
      x.name, x.symbol || '', num(x.value), x.unit, x.equation, x.clause, x.limit ? x.limit.op + ' ' + num(x.limit.value) : '', x.limit ? (meets(x.value, x.limit) ? 'yes' : 'no') : '']))
    + '<h2>Checks</h2>' + (probs.length ? '<ul>' + probs.map((p) => '<li>Does not meet: ' + esc(p.text) + '</li>').join('') + '</ul>' : '<p>Every result with a limit meets it.</p>')
    + '<h2>Revisions</h2>' + rows(['Rev', 'Date', 'By', 'Change'], r.revisions.map((x) => [x.rev, x.date, x.by, x.change]))
    + '<hr><p>' + esc(ENGINEER_LINE) + '</p><p>' + esc(DISCLAIMER) + '</p></body></html>\n';
}
