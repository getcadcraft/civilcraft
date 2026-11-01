/* SPDX-License-Identifier: Apache-2.0 */
/**
 * words.js — the `proc.env.*` words for CH.19 to CH.27 (0.8 Track CH, CH.32): English plus es-MX and id DRAFTS. They live in the library, not in an app's lang file,
 * because no host mounts this folder yet (rule 41); a host copies them into its own language files with its sync script when it mounts the panels (rule 10: only these
 * keys, never the whole file). es-MX and id are machine-drafted for a native reader to review (`draft: true`).
 */
export const EN = {
  'proc.env.air.title': 'Air dispersion', 'proc.env.air.screen': 'Screening run', 'proc.env.air.hourly': 'Hourly run', 'proc.env.air.worst': 'Worst case: {c} ug/m3 at {x} m (class {stab}, {u} m/s)',
  'proc.env.air.limits': 'Limits pack', 'proc.env.air.notpermit': 'A screening aid. It is not a permit model and not an engineering approval.',
  'proc.env.water.title': 'Water treatment', 'proc.env.water.plant': 'Activated sludge plant', 'proc.env.water.capture': 'Clarifier capture of solids (0 to 1)', 'proc.env.water.notapproval': 'A study aid. It is not a process design approval.',
  'proc.env.chem.title': 'Structures', 'proc.env.chem.smiles': 'SMILES', 'proc.env.chem.estimate': 'Estimate properties (group contribution)', 'proc.env.chem.add': 'Add as a component', 'proc.env.chem.estimated': 'Estimated, not measured',
  'proc.env.md.title': 'Molecular dynamics', 'proc.env.md.run': 'Run', 'proc.env.md.density': 'Density', 'proc.env.md.diffusion': 'Diffusion coefficient', 'proc.env.md.simulated': 'Simulated, not confirmed',
  'proc.env.lims.title': 'Lab notebook and LIMS', 'proc.env.lims.connect': 'Connect to your system', 'proc.env.lims.proposal': 'Proposed stream from sample {id}', 'proc.env.lims.accept': 'Accept', 'proc.env.lims.reject': 'Reject',
  'proc.env.plant.title': 'Plant data', 'proc.env.plant.connect': 'Connect to a historian', 'proc.env.plant.opcua': 'OPC UA needs CadCraft Studio', 'proc.env.plant.readonly': 'Read only. Nothing is sent to the plant.',
  'proc.env.notconfirmed': 'Not confirmed until a person checks it', 'proc.env.disclaimer': 'Drafting and study aid, not an engineering approval. No representation.',
};
export const ES_MX = {
  'proc.env.air.title': 'Dispersion de aire', 'proc.env.air.screen': 'Corrida de tamizado', 'proc.env.air.hourly': 'Corrida horaria', 'proc.env.air.worst': 'Peor caso: {c} ug/m3 a {x} m (clase {stab}, {u} m/s)',
  'proc.env.air.limits': 'Paquete de limites', 'proc.env.air.notpermit': 'Una ayuda de tamizado. No es un modelo para permisos ni una aprobacion de ingenieria.',
  'proc.env.water.title': 'Tratamiento de agua', 'proc.env.water.plant': 'Planta de lodos activados', 'proc.env.water.capture': 'Captura de solidos en el clarificador (0 a 1)', 'proc.env.water.notapproval': 'Una ayuda de estudio. No es una aprobacion de diseno de proceso.',
  'proc.env.chem.title': 'Estructuras', 'proc.env.chem.smiles': 'SMILES', 'proc.env.chem.estimate': 'Estimar propiedades (contribucion de grupos)', 'proc.env.chem.add': 'Agregar como componente', 'proc.env.chem.estimated': 'Estimado, no medido',
  'proc.env.md.title': 'Dinamica molecular', 'proc.env.md.run': 'Ejecutar', 'proc.env.md.density': 'Densidad', 'proc.env.md.diffusion': 'Coeficiente de difusion', 'proc.env.md.simulated': 'Simulado, sin confirmar',
  'proc.env.lims.title': 'Cuaderno de laboratorio y LIMS', 'proc.env.lims.connect': 'Conectar con su sistema', 'proc.env.lims.proposal': 'Corriente propuesta de la muestra {id}', 'proc.env.lims.accept': 'Aceptar', 'proc.env.lims.reject': 'Rechazar',
  'proc.env.plant.title': 'Datos de planta', 'proc.env.plant.connect': 'Conectar con un historiador', 'proc.env.plant.opcua': 'OPC UA requiere CadCraft Studio', 'proc.env.plant.readonly': 'Solo lectura. No se envia nada a la planta.',
  'proc.env.notconfirmed': 'Sin confirmar hasta que una persona lo revise', 'proc.env.disclaimer': 'Ayuda de dibujo y estudio, no una aprobacion de ingenieria. Sin representacion.',
};
export const ID = {
  'proc.env.air.title': 'Dispersi udara', 'proc.env.air.screen': 'Uji penapisan', 'proc.env.air.hourly': 'Uji per jam', 'proc.env.air.worst': 'Kasus terburuk: {c} ug/m3 pada {x} m (kelas {stab}, {u} m/s)',
  'proc.env.air.limits': 'Paket batas', 'proc.env.air.notpermit': 'Alat bantu penapisan. Bukan model untuk izin dan bukan persetujuan teknik.',
  'proc.env.water.title': 'Pengolahan air', 'proc.env.water.plant': 'Instalasi lumpur aktif', 'proc.env.water.capture': 'Penangkapan padatan oleh klarifier (0 sampai 1)', 'proc.env.water.notapproval': 'Alat bantu belajar. Bukan persetujuan desain proses.',
  'proc.env.chem.title': 'Struktur', 'proc.env.chem.smiles': 'SMILES', 'proc.env.chem.estimate': 'Perkirakan sifat (kontribusi gugus)', 'proc.env.chem.add': 'Tambahkan sebagai komponen', 'proc.env.chem.estimated': 'Perkiraan, bukan hasil ukur',
  'proc.env.md.title': 'Dinamika molekul', 'proc.env.md.run': 'Jalankan', 'proc.env.md.density': 'Massa jenis', 'proc.env.md.diffusion': 'Koefisien difusi', 'proc.env.md.simulated': 'Hasil simulasi, belum dikonfirmasi',
  'proc.env.lims.title': 'Buku catatan lab dan LIMS', 'proc.env.lims.connect': 'Hubungkan ke sistem Anda', 'proc.env.lims.proposal': 'Aliran usulan dari sampel {id}', 'proc.env.lims.accept': 'Terima', 'proc.env.lims.reject': 'Tolak',
  'proc.env.plant.title': 'Data pabrik', 'proc.env.plant.connect': 'Hubungkan ke historian', 'proc.env.plant.opcua': 'OPC UA memerlukan CadCraft Studio', 'proc.env.plant.readonly': 'Hanya baca. Tidak ada yang dikirim ke pabrik.',
  'proc.env.notconfirmed': 'Belum dikonfirmasi sampai seseorang memeriksanya', 'proc.env.disclaimer': 'Alat bantu gambar dan belajar, bukan persetujuan teknik. Tanpa representasi.',
};
export const LANGS = { en: EN, 'es-MX': { draft: true, words: ES_MX }, id: { draft: true, words: ID } };
export const text = (lang, key, vars = {}) => String(((lang === 'en' ? EN : LANGS[lang]?.words)?.[key]) ?? EN[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : '{' + k + '}'));
