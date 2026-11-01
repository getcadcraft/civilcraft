/* SPDX-License-Identifier: Apache-2.0 */
/**
 * hoststyle.js — the little stylesheet the panel needs in an app that is not PartCraft (the panel's buttons and fields carry PartCraft's class names, pc-btn / pc-input /
 * pc-select; BimCraft, CadCraft and ModelCraft have their own). It takes the app's text colour and background, so it follows light and dark. Only inside [data-cabinetcraft].
 */
export const HOST_CSS = `
[data-cabinetcraft]{font-size:.85rem;color:inherit;box-sizing:border-box;max-width:100%}
[data-cabinetcraft] *{box-sizing:border-box}
[data-cabinetcraft] .pc-btn{font:inherit;font-size:.78rem;padding:3px 9px;border:1px solid color-mix(in srgb,currentColor 38%,transparent);border-radius:5px;background:transparent;color:inherit;cursor:pointer}
[data-cabinetcraft] .pc-btn:hover:not(:disabled){background:color-mix(in srgb,currentColor 10%,transparent)}
[data-cabinetcraft] .pc-btn.is-primary{background:color-mix(in srgb,currentColor 16%,transparent);font-weight:600}
[data-cabinetcraft] .pc-btn:disabled{opacity:.45;cursor:default}
[data-cabinetcraft] .pc-input,[data-cabinetcraft] .pc-select,[data-cabinetcraft] textarea{font:inherit;font-size:.8rem;padding:3px 6px;border:1px solid color-mix(in srgb,currentColor 38%,transparent);border-radius:4px;background:transparent;color:inherit;width:100%}
[data-cabinetcraft] select option{color:#111;background:#fff}
[data-cabinetcraft] fieldset{min-width:0}
[data-cabinetcraft] table{border-collapse:collapse;font-size:.78rem}
[data-cabinetcraft] td,[data-cabinetcraft] th{padding:2px 6px;border-bottom:1px solid color-mix(in srgb,currentColor 18%,transparent);text-align:left}
`;
