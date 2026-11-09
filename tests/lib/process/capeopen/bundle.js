/* SPDX-License-Identifier: Apache-2.0 */
/**
 * bundle.js — the "CAPE-OPEN package" file (0.9 IND.3): what CadCraft exports from a process model for the COM shim to offer to a simulator.
 * DOM-free. The file is data (rule 44): the shim and the engine are installed with Studio; this file only says which property packages
 * (the model's thermo: components, model, kij, activity parameters) and which unit types to offer, and how the classes are registered.
 *
 *   makeCapeOpenPackage(model | flowsheet, { name, version, made }) → the package object
 *   checkCapeOpenPackage(obj)  → { ok, problems: [text] }   (the shim's engine refuses a file that fails it)
 *   registryLines(pkg, dllPath) → the HKCU\Software\Classes keys the shim writes for each class (shown in help; tests check them)
 *
 * Class ids are ours, fixed for every package file, so a saved simulation finds the same class after an update. The property package
 * manager lists one package per exported model (the file's `packages`), named "CadCraft — <model name>".
 */
import { COMPONENTS } from '../data.js';
import { CATIDS, CO_VERSION, CAS } from './names.js';
import { UNIT_SPECS, UNIT_TYPES_OFFERED } from './unit.js';
import { PROTOCOL } from './protocol.js';

export const FORMAT = 'cadcraft-capeopen-package';
export const CLASSES = {
  propertyPackageManager: { clsid: '{BFF50070-E3DA-4CBA-A0C0-60D4BAA1B493}', progId: 'CadCraft.CapeOpen.PropertyPackageManager.1', catids: ['CAPEOPEN_COMPONENT', 'PROPERTY_PACKAGE_MANAGER_11'] },
  heater: { clsid: '{1F4F9B04-154A-4766-8ABB-D32D865C6F7D}' }, valve: { clsid: '{EDC40F0F-9359-4FF0-8CEC-53B434F149B0}' }, pump: { clsid: '{20A5B6BB-2A0E-479D-A0CB-F1658BEB7617}' },
  compressor: { clsid: '{E955C4A6-B741-4B66-865D-73FAF4F43B5F}' }, flash: { clsid: '{3516788E-7DC6-4D4B-AC90-AEE9EADF76F1}' }, mixer: { clsid: '{72720582-6A5F-4EA3-A2FF-F4FE0EE7EE7B}' },
  splitter: { clsid: '{E66A127E-9CA2-470A-8C91-EBE323880202}' }, hx: { clsid: '{FC9297F4-43F7-47CE-B655-FF482D55851C}' },
};
const UNIT_CATIDS = ['CAPEOPEN_COMPONENT', 'UNIT_OPERATION', 'CONSUMES_THERMO', 'SUPPORTS_THERMO_11'];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export function makeCapeOpenPackage(modelOrFlowsheet, opts = {}) {
  const fs = modelOrFlowsheet && modelOrFlowsheet.flowsheet ? modelOrFlowsheet.flowsheet : modelOrFlowsheet;
  const name = String(opts.name || modelOrFlowsheet?.name || 'Process model').slice(0, 80);
  const th = fs && fs.thermo ? JSON.parse(JSON.stringify(fs.thermo)) : null;
  const components = (th?.components || []).map((c) => (typeof c === 'string' ? c : c.id));
  const own = (th?.components || []).filter((c) => typeof c !== 'string');       // a person's own components travel with their data
  return {
    format: FORMAT, version: 1, name, made: opts.made || null, engineProtocol: PROTOCOL, capeOpen: CO_VERSION,
    packages: th ? [{ name: 'CadCraft — ' + name, description: `${(th.model || 'pr').toUpperCase()} with ${components.length} compounds, from the CadCraft process model "${name}"`, thermo: th,
      compounds: components.map((id) => ({ id, name: (COMPONENTS[id] || own.find((c) => c.id === id) || {}).name || id, cas: CAS[id] || (own.find((c) => c.id === id) || {}).cas || null })) }] : [],
    units: UNIT_TYPES_OFFERED.map((type) => ({ type, title: UNIT_SPECS[type].title, clsid: CLASSES[type].clsid, progId: 'CadCraft.CapeOpen.' + cap(type) + '.1', catids: UNIT_CATIDS.slice() })),
    propertyPackageManager: { ...CLASSES.propertyPackageManager },
    capeDescription: { Name: 'CadCraft', Description: 'CadCraft process engine: property packages and unit operations', CapeVersion: CO_VERSION, ComponentVersion: opts.version || '0.9', VendorURL: 'https://getcadcraft.com', About: 'Apache-2.0. A study aid, not an engineering approval.' },
    status: 'untested in a simulator: the COM shim is source only (docs/spikes/cape-open-11.md)',
  };
}

export function checkCapeOpenPackage(o) {
  const P = [];
  if (!o || o.format !== FORMAT) P.push('not a CadCraft CAPE-OPEN package file');
  else {
    if (o.version !== 1) P.push('package file version ' + o.version + ' is not known');
    if (!Array.isArray(o.packages) || !o.packages.length) P.push('the file has no property package (the process model has no thermo)');
    for (const p of o.packages || []) {
      if (!p.thermo || !Array.isArray(p.thermo.components) || !p.thermo.components.length) P.push(p.name + ': no compounds');
      for (const c of p.thermo?.components || []) { const id = typeof c === 'string' ? c : c?.id; if (typeof c === 'string' && !COMPONENTS[c]) P.push(p.name + ': compound ' + id + ' is not in CadCraft\'s data'); }
      for (const c of p.compounds || []) if (!c.cas) P.push(p.name + ': compound ' + c.id + ' has no CAS number (simulators match compounds by it)');
    }
    for (const u of o.units || []) if (!UNIT_SPECS[u.type]) P.push('unit type ' + u.type + ' is not offered');
  }
  return { ok: !P.some((x) => !x.includes('no CAS number')), problems: P };
}

/** The registry keys of every class: [{ key, values: { name: data } }] under HKCU\Software\Classes (no admin rights needed). */
export function registryLines(pkg, dllPath = '%STUDIO%\\capeopen\\cadcraft-capeopen.dll') {
  const out = [], cls = [{ clsid: pkg.propertyPackageManager.clsid, progId: pkg.propertyPackageManager.progId, name: 'CadCraft property packages', catids: pkg.propertyPackageManager.catids },
    ...pkg.units.map((u) => ({ clsid: u.clsid, progId: u.progId, name: 'CadCraft ' + u.title, catids: u.catids }))];
  for (const c of cls) {
    const base = 'HKCU\\Software\\Classes\\CLSID\\' + c.clsid;
    out.push({ key: base, values: { '': c.name } });
    out.push({ key: base + '\\InprocServer32', values: { '': dllPath, ThreadingModel: 'Both' } });
    out.push({ key: base + '\\ProgID', values: { '': c.progId } });
    for (const k of c.catids) out.push({ key: base + '\\Implemented Categories\\' + CATIDS[k].guid, values: {} });
    out.push({ key: base + '\\CapeDescription', values: { ...pkg.capeDescription, Name: c.name } });
    out.push({ key: 'HKCU\\Software\\Classes\\' + c.progId, values: { '': c.name } });
    out.push({ key: 'HKCU\\Software\\Classes\\' + c.progId + '\\CLSID', values: { '': c.clsid } });
  }
  return out;
}
