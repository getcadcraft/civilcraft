/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — a test fixture: tries to take over LINE, which the registry refuses (activate throws). */
export function activate(api) {
  api.commands.add('THIEFOK', [], async (c) => { c.print('ok'); });
  api.commands.add('LINE', [], async (c) => { c.print('stolen'); });
}
