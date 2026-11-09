/* SPDX-License-Identifier: Apache-2.0 */
/** AST → Structured Text text. Every nested operator is parenthesised, so the text always parses back to the same tree. */
export function exprText(e) {
  switch (e.k) {
    case 'num': return e.type ? e.type + '#' + e.v : e.int ? String(e.v) : (Number.isInteger(e.v) ? e.v + '.0' : String(e.v));
    case 'bool': return e.v ? 'TRUE' : 'FALSE';
    case 'time': return 'T#' + (e.v < 0 ? '-' : '') + Math.abs(e.v) + 'ms';
    case 'str': return "'" + String(e.v).replace(/\$/g, '$$$$').replace(/'/g, "$'").replace(/\n/g, '$N').replace(/\r/g, '$R').replace(/\t/g, '$T') + "'";
    case 'addr': return e.v;
    case 'var': return e.raw;
    case 'mem': return exprText(e.obj) + '.' + e.raw;
    case 'un': return e.op === 'NOT' ? 'NOT ' + wrap(e.a) : '-' + wrap(e.a);
    case 'bin': return wrap(e.a) + ' ' + e.op + ' ' + wrap(e.b);
    case 'call': return e.raw + '(' + e.args.map((a) => (a.name ? a.name + (a.out ? ' => ' : ' := ') : '') + exprText(a.value)).join(', ') + ')';
    default: return '0';
  }
}
const wrap = (e) => (e.k === 'bin' || e.k === 'un' ? '(' + exprText(e) + ')' : exprText(e));
export function stmtsText(list, ind = '') {
  const out = [];
  for (const s of list) {
    switch (s.k) {
      case 'assign': out.push(ind + exprText(s.target) + ' := ' + exprText(s.value) + ';'); break;
      case 'callstmt': out.push(ind + exprText(s.call) + ';'); break;
      case 'if': s.arms.forEach((a, i) => { out.push(ind + (i ? 'ELSIF ' : 'IF ') + exprText(a.cond) + ' THEN'); out.push(stmtsText(a.body, ind + '  ')); }); if (s.els) { out.push(ind + 'ELSE'); out.push(stmtsText(s.els, ind + '  ')); } out.push(ind + 'END_IF;'); break;
      case 'case': out.push(ind + 'CASE ' + exprText(s.sel) + ' OF'); for (const a of s.arms) { out.push(ind + '  ' + a.labels.map((l) => exprText(l.from) + (l.to ? '..' + exprText(l.to) : '')).join(', ') + ':'); out.push(stmtsText(a.body, ind + '    ')); } if (s.els) { out.push(ind + 'ELSE'); out.push(stmtsText(s.els, ind + '  ')); } out.push(ind + 'END_CASE;'); break;
      case 'for': out.push(ind + 'FOR ' + s.v + ' := ' + exprText(s.from) + ' TO ' + exprText(s.to) + (s.by ? ' BY ' + exprText(s.by) : '') + ' DO'); out.push(stmtsText(s.body, ind + '  ')); out.push(ind + 'END_FOR;'); break;
      case 'while': out.push(ind + 'WHILE ' + exprText(s.cond) + ' DO'); out.push(stmtsText(s.body, ind + '  ')); out.push(ind + 'END_WHILE;'); break;
      case 'repeat': out.push(ind + 'REPEAT'); out.push(stmtsText(s.body, ind + '  ')); out.push(ind + 'UNTIL ' + exprText(s.cond) + ' END_REPEAT;'); break;
      case 'exit': out.push(ind + 'EXIT;'); break;
      case 'return': out.push(ind + 'RETURN;'); break;
      default: break;
    }
  }
  return out.filter((x) => x !== '').join('\n');
}
const KIND_KW = { local: 'VAR', input: 'VAR_INPUT', output: 'VAR_OUTPUT', inout: 'VAR_IN_OUT', global: 'VAR_GLOBAL', temp: 'VAR_TEMP', external: 'VAR_EXTERNAL' };
export function varsText(vars) {
  const out = [];
  for (const kind of ['input', 'output', 'inout', 'local', 'temp', 'external', 'global']) {
    const vs = vars.filter((v) => v.kind === kind); if (!vs.length) continue;
    out.push(KIND_KW[kind] + (vs.some((v) => v.constant) ? ' CONSTANT' : '')); for (const v of vs) out.push('  ' + v.name + (v.addr ? ' AT ' + v.addr : '') + ' : ' + v.type + (v.init ? ' := ' + exprText(v.init) : '') + ';'); out.push('END_VAR');
  }
  return out.join('\n');
}
export function pouText(p) {
  const kw = { program: 'PROGRAM', functionBlock: 'FUNCTION_BLOCK', function: 'FUNCTION' }[p.type];
  return kw + ' ' + p.name + (p.type === 'function' ? ' : ' + p.ret : '') + '\n' + varsText(p.vars) + '\n' + (p.body.kind === 'ST' ? stmtsText(p.body.stmts) : '') + '\nEND_' + kw + '\n';
}
