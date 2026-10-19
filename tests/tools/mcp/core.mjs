/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — protocol and developer messages; what a person reads in an app goes through the app's own words. */
// >>> mcp-core (docs/AGENTS-SPEC.md §1, §6; canonical: tools/mcp/core.mjs — host.js carries this block byte for byte: node tools/mcp/sync-core.mjs)
/**
 * The tool dispatcher every surface shares: the headless MCP server (stdio), the CLI, and the app windows (host.control).
 * DOM-free, no imports. JSON-RPC 2.0; MCP methods + the JSON control channel's (§6.1).
 *
 *   const d = createDispatcher({ server: {name, title, version}, instructions, allowed: () => ['read'], info: () => ({…}),
 *                                log: (entry) => …, now: () => Date.now(), listChanged: true });
 *   (listChanged false: a transport that cannot push notifications, e.g. Streamable HTTP without a GET stream)
 *   d.tool({ name, group, title, description, inputSchema, run: async (args, ctx) => result });   → unregister()
 *   await d.handle(message, session)   → a JSON-RPC response, or null for a notification
 *   await d.call(name, args, session)  → an MCP CallToolResult (permissions, schema, log)
 *   d.list()                           → the tool definitions the permissions allow
 *   d.onNotify(fn)                     → fn(notification) for notifications/tools/list_changed (call d.changed())
 *
 * A tool's run() returns plain JSON (sent as structuredContent and as text) or toolResult(content, structured) for images.
 * Throwing → a tool result with isError and the error's message; arguments are checked against inputSchema first.
 */
export const MCP_PROTOCOLS = ['2025-11-25', '2025-06-18', '2025-03-26', '2024-11-05'];
export const TOOL_GROUPS = ['read', 'edit', 'save', 'export'];
const RAW = '__ccToolResult';

/** A tool result with its own content list (images) and optional structured data. */
export function toolResult(content, structured) { return { [RAW]: true, content, structured }; }

/** Annotations an MCP client shows, from the tool's group. */
export function groupHints(group) {
  return {
    read: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    edit: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    save: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
    export: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  }[group];
}

const typeOf = (v) => (v === null ? 'null' : Array.isArray(v) ? 'array' : Number.isInteger(v) ? 'integer' : typeof v);
const fits = (t, v) => { const k = typeOf(v); return t === k || (t === 'number' && k === 'integer'); };

/**
 * Check a value against the JSON Schema subset tools use (type, enum, const, minimum, maximum, minLength, maxLength,
 * pattern, items, minItems, maxItems, properties, required, additionalProperties: false, anyOf / oneOf) and fill in
 * defaults of object properties. → list of problems ([] = fine).
 */
export function checkSchema(schema, value, where = 'arguments', out = []) {
  if (!schema || typeof schema !== 'object') return out;
  if (schema.anyOf || schema.oneOf) {
    const alts = schema.anyOf || schema.oneOf;
    if (!alts.some((s) => checkSchema(s, value, where).length === 0)) out.push(where + ' does not match any of the allowed shapes.');
    return out;
  }
  if (schema.type) {
    const ts = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!ts.some((t) => fits(t, value))) { out.push(where + ' must be ' + ts.join(' or ') + '.'); return out; }
  }
  if (schema.const !== undefined && value !== schema.const) out.push(where + ' must be ' + JSON.stringify(schema.const) + '.');
  if (schema.enum && !schema.enum.includes(value)) out.push(where + ' must be one of ' + schema.enum.map((x) => JSON.stringify(x)).join(', ') + '.');
  if (typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) out.push(where + ' must be at least ' + schema.minimum + '.');
    if (schema.maximum !== undefined && value > schema.maximum) out.push(where + ' must be at most ' + schema.maximum + '.');
  }
  if (typeof value === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) out.push(where + ' must have at least ' + schema.minLength + ' characters.');
    if (schema.maxLength !== undefined && value.length > schema.maxLength) out.push(where + ' must have at most ' + schema.maxLength + ' characters.');
    if (schema.pattern && !new RegExp(schema.pattern, 'u').test(value)) out.push(where + ' is not in the expected form.');
  }
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) out.push(where + ' must have at least ' + schema.minItems + ' items.');
    if (schema.maxItems !== undefined && value.length > schema.maxItems) out.push(where + ' must have at most ' + schema.maxItems + ' items.');
    if (schema.items) value.forEach((x, i) => checkSchema(schema.items, x, where + '[' + i + ']', out));
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const props = schema.properties || {};
    for (const r of schema.required || []) if (value[r] === undefined) out.push(where + '.' + r + ' is required.');
    for (const [k, v] of Object.entries(value)) {
      if (props[k]) checkSchema(props[k], v, where + '.' + k, out);
      else if (schema.additionalProperties === false) out.push(where + '.' + k + ' is not a known argument.');
      else if (schema.additionalProperties && typeof schema.additionalProperties === 'object') checkSchema(schema.additionalProperties, v, where + '.' + k, out);
    }
    for (const [k, p] of Object.entries(props)) if (value[k] === undefined && p && p.default !== undefined) value[k] = JSON.parse(JSON.stringify(p.default));
  }
  return out;
}

/** Arguments for the log: strings over 200 characters cut, at most 20 keys, nested once. */
export function logArgs(args, depth = 0) {
  if (typeof args === 'string') return args.length > 200 ? args.slice(0, 200) + '…' : args;
  if (Array.isArray(args)) return depth > 1 ? '[' + args.length + ' items]' : args.slice(0, 20).map((x) => logArgs(x, depth + 1));
  if (args && typeof args === 'object') {
    if (depth > 1) return '{…}';
    const o = {};
    for (const [k, v] of Object.entries(args).slice(0, 20)) o[k] = logArgs(v, depth + 1);
    return o;
  }
  return args;
}

class RpcError extends Error { constructor(code, message, data) { super(message); this.code = code; this.data = data; } }

export function createDispatcher(opts = {}) {
  const server = { name: 'cadcraft', title: 'CadCraft', version: '0.0.0', ...(opts.server || {}) };
  const now = opts.now || (() => Date.now());
  const tools = new Map();
  const notifiers = new Set();
  const methods = new Map();
  const allowed = () => { const a = opts.allowed ? opts.allowed() : ['read']; return new Set(Array.isArray(a) || a instanceof Set ? a : []); };

  const def = (t) => {
    if (!t || !/^[a-z][a-z0-9_]{0,63}$/.test(t.name)) throw new Error('A tool name is lower case letters, digits and _: ' + (t && t.name));
    if (!TOOL_GROUPS.includes(t.group)) throw new Error('Tool ' + t.name + ': group must be one of ' + TOOL_GROUPS.join(', '));
    if (typeof t.run !== 'function') throw new Error('Tool ' + t.name + ' has no run().');
    return { name: t.name, title: t.title || t.name, description: t.description || '', group: t.group, inputSchema: t.inputSchema || { type: 'object', properties: {}, additionalProperties: false }, run: t.run, outputSchema: t.outputSchema };
  };
  const definition = (t) => ({ name: t.name, title: t.title, description: t.description + ' (Permission: ' + t.group + '.)', inputSchema: t.inputSchema, annotations: { title: t.title, ...groupHints(t.group) }, ...(t.outputSchema ? { outputSchema: t.outputSchema } : {}) });

  const d = {
    server,
    tool(t) { const x = def(t); tools.set(x.name, x); d.changed(); return () => { if (tools.get(x.name) === x) { tools.delete(x.name); d.changed(); } }; },
    has: (name) => tools.has(name),
    get: (name) => tools.get(name) || null,
    all: () => [...tools.values()],
    list() { const a = allowed(); return [...tools.values()].filter((t) => a.has(t.group)).map(definition); },
    onNotify(fn) { notifiers.add(fn); return () => notifiers.delete(fn); },
    changed() { for (const fn of notifiers) { try { fn({ jsonrpc: '2.0', method: 'notifications/tools/list_changed' }); } catch { /* a transport */ } } },
    method(name, fn) { methods.set(name, fn); return () => methods.delete(name); },

    log(entry) { try { opts.log && opts.log(entry); } catch { /* the log never breaks a call */ } },

    /** Run a tool: permission, schema, the tool, the log. Always resolves to a CallToolResult. */
    async call(name, args, session = {}) {
      const t0 = now();
      const t = tools.get(name);
      const client = (session.client && session.client.name) || session.clientName || null;
      const entry = { time: new Date(t0).toISOString(), client, tool: String(name), group: t ? t.group : null, args: logArgs(args || {}), outcome: 'ok', undo: null, ms: 0 };
      const finish = (res, outcome, message) => { entry.outcome = outcome; entry.ms = now() - t0; if (message) entry.message = String(message).slice(0, 300); d.log(entry); return res; };
      const fail = (msg, outcome = 'error') => finish({ content: [{ type: 'text', text: msg }], isError: true }, outcome, msg);
      if (!t) throw new RpcError(-32602, 'Unknown tool: ' + name);
      if (!allowed().has(t.group)) return fail(t.name + ' needs the ' + t.group + ' permission, which is not allowed. ' + (opts.howToAllow ? opts.howToAllow(t.group) : ''), 'refused');
      const a = args === undefined || args === null ? {} : args;
      if (typeof a !== 'object' || Array.isArray(a)) return fail('arguments must be an object.', 'refused');
      const copy = JSON.parse(JSON.stringify(a));
      const problems = checkSchema(t.inputSchema, copy);
      if (problems.length) return fail('Invalid arguments: ' + problems.slice(0, 8).join(' '), 'refused');
      try {
        const ctx = { group: t.group, client, session, tool: t.name, log: entry };
        const r = await t.run(copy, ctx);
        if (r && r[RAW]) {
          const res = { content: r.content || [] };
          if (r.structured !== undefined) res.structuredContent = r.structured;
          if (r.structured && r.structured.undo) entry.undo = r.structured.undo;
          return finish(res, 'ok');
        }
        const structured = r === undefined || r === null ? { ok: true } : typeof r === 'object' && !Array.isArray(r) ? r : { result: r };
        if (structured.undo) entry.undo = structured.undo;
        const res = { content: [{ type: 'text', text: JSON.stringify(structured, null, 1) }], structuredContent: structured };
        if (structured.error && structured.isError) { res.isError = true; return finish(res, 'error', structured.error); }
        return finish(res, 'ok');
      } catch (err) {
        return fail(err && err.message ? err.message : String(err), err && err.refused ? 'refused' : 'error');
      }
    },

    /** One JSON-RPC message → a response (or null for a notification). Never throws. */
    async handle(msg, session = {}) {
      const isNote = msg && typeof msg === 'object' && msg.id === undefined;
      const reply = (result) => (isNote ? null : { jsonrpc: '2.0', id: msg.id, result });
      const error = (code, message, data) => (isNote ? null : { jsonrpc: '2.0', id: msg && msg.id !== undefined ? msg.id : null, error: { code, message, ...(data !== undefined ? { data } : {}) } });
      if (!msg || typeof msg !== 'object' || Array.isArray(msg) || msg.jsonrpc !== '2.0' || typeof msg.method !== 'string') {
        if (msg && typeof msg === 'object' && !Array.isArray(msg) && msg.jsonrpc === '2.0' && msg.method === undefined && (msg.result !== undefined || msg.error !== undefined)) return null;   // a response to us: nothing asked
        return { jsonrpc: '2.0', id: msg && (typeof msg.id === 'string' || typeof msg.id === 'number') ? msg.id : null, error: { code: -32600, message: 'Invalid request' } };
      }
      const p = msg.params && typeof msg.params === 'object' ? msg.params : {};
      try {
        switch (msg.method) {
          case 'initialize': {
            const v = MCP_PROTOCOLS.includes(p.protocolVersion) ? p.protocolVersion : MCP_PROTOCOLS[0];
            session.protocolVersion = v;
            session.client = p.clientInfo && typeof p.clientInfo === 'object' ? { name: String(p.clientInfo.name || '').slice(0, 100), version: String(p.clientInfo.version || '').slice(0, 40) } : { name: 'unknown', version: '' };
            session.initializedAt = now();
            if (opts.onEvent) opts.onEvent('connect', session);
            return reply({ protocolVersion: v, capabilities: { tools: { listChanged: opts.listChanged !== false }, logging: {} }, serverInfo: { name: server.name, title: server.title, version: server.version }, ...(opts.instructions ? { instructions: typeof opts.instructions === 'function' ? opts.instructions() : opts.instructions } : {}) });
          }
          case 'notifications/initialized': session.ready = true; return null;
          case 'notifications/cancelled': case 'notifications/progress': case 'notifications/roots/list_changed': return null;
          case 'ping': return reply({});
          case 'logging/setLevel': session.logLevel = String(p.level || 'info'); return reply({});
          case 'tools/list': return reply({ tools: d.list() });
          case 'tools/call': {
            if (typeof p.name !== 'string') throw new RpcError(-32602, 'tools/call needs a tool name.');
            return reply(await d.call(p.name, p.arguments, session));
          }
          // the JSON control channel (§6.1)
          case 'control.hello':
            session.client = p.client && typeof p.client === 'object' ? { name: String(p.client.name || '').slice(0, 100), version: String(p.client.version || '').slice(0, 40) } : { name: 'script', version: '' };
            if (opts.onEvent) opts.onEvent('connect', session);
            return reply({ app: server.name, title: server.title, version: server.version, protocol: 1, tools: d.list().length });
          case 'tools.list': return reply({ tools: d.list() });
          case 'tools.call': {
            if (typeof p.name !== 'string') throw new RpcError(-32602, 'tools.call needs a tool name.');
            return reply(await d.call(p.name, p.arguments, session));
          }
          case 'app.info': return reply(opts.info ? await opts.info() : { app: server.name, version: server.version });
          default: {
            const fn = methods.get(msg.method);
            if (fn) return reply(await fn(p, session));
            if (isNote) return null;
            throw new RpcError(-32601, 'Method not found: ' + msg.method);
          }
        }
      } catch (err) {
        if (err instanceof RpcError) return error(err.code, err.message, err.data);
        return error(-32603, 'Internal error: ' + (err && err.message ? err.message : String(err)));
      }
    },
  };
  return d;
}
// <<< mcp-core
