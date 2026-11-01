/* SPDX-License-Identifier: Apache-2.0 */
/** zip.js — the CRC-32 of the zip format (ISO 3309 / RFC 1952: polynomial 0xEDB88320, table driven). */
const TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; TABLE[n] = c >>> 0; }
export function crc32(bytes) { let c = 0xffffffff; for (let i = 0; i < bytes.length; i++) c = TABLE[(c ^ bytes[i]) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
