/* SPDX-License-Identifier: Apache-2.0 */
/**
 * index.js — cc-usd's front door: OpenUSD read and write for every app that exports or opens USD (0.7 XF.2).
 * DOM-free, synchronous, no dependencies; runs on pages, in workers and in Node. Conventions for what we write:
 * docs/USD-CONVENTIONS.md. Map: README.md.
 *
 *   readLayer(bytes, opts) → Layer                 .usda, .usdc, or a .usdz's root layer (format by the first bytes)
 *   writeLayer(layer, 'usda' | 'usdc') → string | Uint8Array
 *   openStage(rootName, { read }) / stageFromLayer(layer) → Stage (composed)
 *   readUsdz / writeUsdz · geometry helpers (geom.js) · Layer, V (sdf.js)
 *   new UsdBuilder(…) — write a scene by the conventions (build.js) · sceneOf(stage) — a stage as a plain scene (scene.js)
 */
import { readUsda, isUsda } from './usda-read.js';
import { writeUsda, formatValue } from './usda-write.js';
import { readUsdc, isUsdc } from './usdc-read.js';
import { writeUsdc } from './usdc-write.js';
import { readUsdz, writeUsdz, isZip, crc32 } from './usdz.js';
import { openStage, stageFromLayer, parseLayer, resolveName } from './stage.js';
import { Layer, V, TYPES, ROLES, typeInfo, path, identifier, isIdentifier, isPropertyName, listOpItems, applyListOp } from './sdf.js';
import { valueAt, localMatrix, worldMatrix, stageFrame, meshOf, shapeMesh, visibleOf, purposeOf, mul, invert, IDENTITY, transformPoint, quatMatrix } from './geom.js';
import { UsdError, LIMITS, halfToFloat, floatToHalf } from './util.js';
import { UsdBuilder, OPENPBR_TYPES, OPENPBR_DEFAULTS, hexToLinear, linearToHex, valueOf, frameLookingAlong } from './build.js';
import { sceneOf } from './scene.js';
import { msg, MESSAGES } from './messages.js';

export {
  readUsda, isUsda, writeUsda, formatValue, readUsdc, isUsdc, writeUsdc, readUsdz, writeUsdz, isZip, crc32, openStage, stageFromLayer,
  parseLayer, resolveName, Layer, V, TYPES, ROLES, typeInfo, path, identifier, isIdentifier, isPropertyName, listOpItems, applyListOp,
  valueAt, localMatrix, worldMatrix, stageFrame, meshOf, shapeMesh, visibleOf, purposeOf, mul, invert, IDENTITY, transformPoint, quatMatrix,
  UsdError, LIMITS, halfToFloat, floatToHalf, msg, MESSAGES, UsdBuilder, OPENPBR_TYPES, OPENPBR_DEFAULTS, hexToLinear, linearToHex, valueOf,
  frameLookingAlong, sceneOf,
};

export function readLayer(bytes, opts = {}) { return parseLayer(bytes, opts).layer; }
export function writeLayer(layer, format = 'usda') { return format === 'usdc' ? writeUsdc(layer) : writeUsda(layer); }
/** Which USD form the bytes are: 'usdc' | 'usda' | 'usdz' | null. */
export function sniffUsd(b) { return isUsdc(b) ? 'usdc' : isZip(b) ? 'usdz' : isUsda(b) ? 'usda' : null; }
