/* SPDX-License-Identifier: Apache-2.0 */
/**
 * urdf.js — URDF in and out (0.8 XE.4). URDF is an open XML format (ROS wiki specification); this reader is our own, with a small XML parser that
 * refuses DOCTYPE/entity declarations, limits size and depth, and never evaluates anything.
 * Read: robot, link (inertial: origin, mass, inertia), joint (revolute, continuous, prismatic, fixed; parent, child, origin, axis, limit, dynamics damping).
 * Kept apart in `unsupported` and as Problems: floating and planar joints, mimic, transmissions, gazebo, meshes (geometry is counted, not read), xacro.
 */
import * as M from './math.js';
import { Robot } from './robot.js';

const MAX_BYTES = 8 * 1024 * 1024, MAX_DEPTH = 64;
export function parseXml(text) {
  if (typeof text !== 'string') throw new Error('XML text expected');
  if (text.length > MAX_BYTES) throw new Error('XML is too large');
  if (/<!DOCTYPE|<!ENTITY/i.test(text)) throw new Error('DOCTYPE and entity declarations are not accepted');
  const dec = (s) => s.replace(/&(lt|gt|amp|quot|apos);/g, (_, c) => ({ lt: '<', gt: '>', amp: '&', quot: '"', apos: "'" }[c]));
  const root = { tag: '#root', attrs: {}, children: [], text: '' }, stack = [root];
  const re = /<!--[\s\S]*?-->|<!\[CDATA\[([\s\S]*?)\]\]>|<\?[\s\S]*?\?>|<\/([A-Za-z_][\w:.-]*)\s*>|<([A-Za-z_][\w:.-]*)((?:\s+[A-Za-z_][\w:.-]*\s*=\s*(?:"[^"]*"|'[^']*'))*)\s*(\/?)>|([^<]+)/g;
  let m, last = 0;
  while ((m = re.exec(text))) {
    if (m.index !== last) throw new Error('Malformed XML near position ' + last);
    last = re.lastIndex;
    const top = stack[stack.length - 1];
    if (m[1] !== undefined) top.text += m[1];
    else if (m[2]) { if (stack.length < 2 || top.tag !== m[2]) throw new Error(`Closing tag </${m[2]}> does not match`); stack.pop(); }
    else if (m[3]) {
      const attrs = {}; String(m[4] || '').replace(/([A-Za-z_][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g, (_, k, a, b) => { attrs[k] = dec(a ?? b); return ''; });
      const el = { tag: m[3], attrs, children: [], text: '' }; top.children.push(el);
      if (!m[5]) { if (stack.length >= MAX_DEPTH) throw new Error('XML is nested too deeply'); stack.push(el); }
    } else if (m[6] !== undefined) top.text += dec(m[6]);
  }
  if (last !== text.length) throw new Error('Malformed XML near position ' + last);
  if (stack.length !== 1) throw new Error(`Unclosed tag <${stack[stack.length - 1].tag}>`);
  return root.children[0] || null;
}

const kids = (el, tag) => el.children.filter((c) => c.tag === tag);
function nums(s, n, what) {
  const t = String(s ?? '').trim().split(/\s+/).filter(Boolean);
  if (t.length !== n) throw new Error(`${what} needs ${n} numbers, found ${t.length}`);
  return t.map((x) => { const v = Number(x); if (!Number.isFinite(v)) throw new Error(`${what} has a bad number "${x}"`); return v; });
}
const num = (s, what, d) => { if (s === undefined) return d; const v = Number(s); if (!Number.isFinite(v)) throw new Error(`${what} is not a number ("${s}")`); return v; };
function originOf(el, what) {
  const o = el && kids(el, 'origin')[0]; if (!o) return M.T_ident();
  const p = o.attrs.xyz !== undefined ? nums(o.attrs.xyz, 3, what + ' origin xyz') : [0, 0, 0], r = o.attrs.rpy !== undefined ? nums(o.attrs.rpy, 3, what + ' origin rpy') : [0, 0, 0];
  return { R: M.rpy(r[0], r[1], r[2]), p };
}

/** readUrdf(text) → {robot, problems, unsupported[], counts} */
export function readUrdf(text) {
  const problems = [], unsupported = [], counts = { visual: 0, collision: 0 };
  let doc; try { doc = parseXml(text); } catch (e) { return { robot: null, problems: [M.problem('xml', 'error', 'The URDF could not be read: ' + e.message)], unsupported, counts }; }
  if (!doc || doc.tag !== 'robot') return { robot: null, problems: [M.problem('root', 'error', 'The file has no <robot> element.')], unsupported, counts };
  const links = [], joints = [];
  try {
    for (const el of doc.children) {
      if (el.tag === 'link') {
        const l = { name: el.attrs.name };
        if (!l.name) throw new Error('A link has no name');
        const ine = kids(el, 'inertial')[0];
        if (ine) {
          const o = originOf(ine, `link ${l.name} inertial`), mass = kids(ine, 'mass')[0], inr = kids(ine, 'inertia')[0];
          l.mass = num(mass?.attrs.value, `link ${l.name} mass`, 0); l.com = o.p;
          if (l.mass < 0) throw new Error(`link ${l.name} has a negative mass`);
          if (inr) {
            const g = (k) => num(inr.attrs[k], `link ${l.name} inertia ${k}`, 0);
            const I = [g('ixx'), g('ixy'), g('ixz'), g('ixy'), g('iyy'), g('iyz'), g('ixz'), g('iyz'), g('izz')];
            l.inertia = M.mmul(M.mmul(o.R, I), M.mT(o.R)); // tensor given in the inertial frame → link frame
          }
        }
        counts.visual += kids(el, 'visual').length; counts.collision += kids(el, 'collision').length;
        links.push(l);
      } else if (el.tag === 'joint') {
        const type = el.attrs.type, name = el.attrs.name;
        if (!name) throw new Error('A joint has no name');
        if (['floating', 'planar'].includes(type)) { unsupported.push(`joint ${name}: ${type}`); problems.push(M.problem('joint.unsupported', 'error', `Joint "${name}" is ${type}; only revolute, continuous, prismatic and fixed joints are supported.`, [{ id: name }])); continue; }
        const j = { name, type, parent: kids(el, 'parent')[0]?.attrs.link, child: kids(el, 'child')[0]?.attrs.link, origin: originOf(el, `joint ${name}`) };
        const ax = kids(el, 'axis')[0]; j.axis = ax && ax.attrs.xyz !== undefined ? nums(ax.attrs.xyz, 3, `joint ${name} axis`) : [1, 0, 0];
        if (type !== 'fixed' && !(M.norm(j.axis) > 0)) throw new Error(`joint ${name} has a zero axis`);
        const lm = kids(el, 'limit')[0];
        if (lm) j.limit = { lower: num(lm.attrs.lower, `joint ${name} lower`, 0), upper: num(lm.attrs.upper, `joint ${name} upper`, 0), effort: num(lm.attrs.effort, `joint ${name} effort`, undefined), velocity: num(lm.attrs.velocity, `joint ${name} velocity`, undefined) };
        else if (type === 'revolute' || type === 'prismatic') problems.push(M.problem('limit.missing', 'warning', `Joint "${name}" is ${type} but has no <limit>; it will be treated as unlimited.`, [{ id: name }]));
        const dy = kids(el, 'dynamics')[0]; if (dy) j.damping = num(dy.attrs.damping, `joint ${name} damping`, 0);
        if (kids(el, 'mimic').length) { unsupported.push(`joint ${name}: mimic`); problems.push(M.problem('mimic', 'warning', `Joint "${name}" mimics another joint; the mimic is ignored and it moves on its own.`, [{ id: name }])); }
        joints.push(j);
      } else if (['transmission', 'gazebo', 'material'].includes(el.tag)) { if (el.tag !== 'material') unsupported.push(el.tag); }
      else if (/^xacro:/.test(el.tag)) { unsupported.push(el.tag); problems.push(M.problem('xacro', 'error', 'This is a xacro file; expand it to plain URDF first.')); }
    }
  } catch (e) { return { robot: null, problems: [...problems, M.problem('urdf', 'error', 'The URDF is not valid: ' + e.message)], unsupported, counts }; }
  const robot = new Robot({ name: doc.attrs.name || 'robot', links, joints });
  problems.push(...robot.problems);
  if (counts.visual + counts.collision) problems.push(M.problem('geometry', 'note', `${counts.visual} visual and ${counts.collision} collision shapes were not read (geometry is not part of the motion model).`));
  return { robot: robot.ok ? robot : null, problems, unsupported, counts };
}

const f = (v) => String(+Number(v).toPrecision(15));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/** writeUrdf(robot) → URDF text. Inertia is written in the link frame with the centre of mass in the inertial origin. */
export function writeUrdf(robot) {
  const out = ['<?xml version="1.0"?>', `<robot name="${esc(robot.name)}">`];
  for (const [name, l] of robot.links) {
    out.push(`  <link name="${esc(name)}">`);
    if (l.mass || l.inertia.some((v) => v)) {
      const I = l.inertia;
      out.push('    <inertial>', `      <origin xyz="${l.com.map(f).join(' ')}" rpy="0 0 0"/>`, `      <mass value="${f(l.mass)}"/>`,
        `      <inertia ixx="${f(I[0])}" ixy="${f(I[1])}" ixz="${f(I[2])}" iyy="${f(I[4])}" iyz="${f(I[5])}" izz="${f(I[8])}"/>`, '    </inertial>');
    }
    out.push('  </link>');
  }
  for (const j of robot.joints) {
    out.push(`  <joint name="${esc(j.name)}" type="${j.type}">`, `    <parent link="${esc(j.parent)}"/>`, `    <child link="${esc(j.child)}"/>`,
      `    <origin xyz="${j.origin.p.map(f).join(' ')}" rpy="${M.toRpy(j.origin.R).map(f).join(' ')}"/>`);
    if (j.type !== 'fixed') out.push(`    <axis xyz="${j.axis.map(f).join(' ')}"/>`);
    if (j.limit && j.type !== 'fixed') out.push(`    <limit lower="${f(j.limit.lower)}" upper="${f(j.limit.upper)}"` + (j.limit.effort !== undefined ? ` effort="${f(j.limit.effort)}"` : '') + (j.limit.velocity !== undefined ? ` velocity="${f(j.limit.velocity)}"` : '') + '/>');
    if (j.damping) out.push(`    <dynamics damping="${f(j.damping)}"/>`);
    out.push('  </joint>');
  }
  out.push('</robot>');
  return out.join('\n') + '\n';
}
