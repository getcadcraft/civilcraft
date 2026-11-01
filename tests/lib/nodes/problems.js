/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: the messages are keys (words.js). */
/**
 * problems.js — cc-nodes (nodes_PART_3; DC.54, rule 29): what is wrong in a node graph, in the shared problem shape (docs/0.8-PROBLEMS-SPEC.md § 1).
 *   toProblems(result, graph, t?) → [problem]    one error per node that failed on its own (a node waiting for a failed one is not repeated)
 * `about` names the node by id (ids are stable: n1, n2 …); `code` is the error code, so the same fault is the same kind of problem in every host.
 */
import { BY_ID } from './library.js';

export function toProblems(res, graph, t = null) {
  const out = [];
  for (const [id, err] of Object.entries(res.errors || {})) {
    if (!err || err.upstream || !id) continue;
    const node = graph.node(id);
    if (!node) continue;
    const label = BY_ID[node.type].en;
    const vars = {};
    for (const [k, v] of Object.entries(err.vars || {})) if (typeof v === 'number' || typeof v === 'string') vars[k] = v;
    const p = { code: err.code, severity: 'error', msg: { key: err.code, vars }, about: [{ kind: 'node', id, label }], where: { space: '2d' } };
    if (t) p.text = label + ': ' + t(err.code, vars);
    out.push(p);
  }
  return out.sort((a, b) => (a.about[0].id < b.about[0].id ? -1 : 1));
}
