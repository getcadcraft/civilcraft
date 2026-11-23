/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-block-menuset-drafting.js: the menu set "drafting" (UI.12), data only: the menus of the Drafting layout's menu bar, each the
 * registry's own groups (the same way the Vector set is made in app-workspace-vector.js), so no command is written twice. The engine's
 * menubar block reads `set: "drafting"` from this list (Inbox line to `ui-layouts-10`, which owns app-workspace-vector.js).
 *   MENUS = [{ id, key, groups: [registry group names, in order] }]   key = the shell words (shell.menu.<id>)
 */
export const MENUS = Object.freeze([
  { id: 'file', key: 'shell.menu.file', groups: ['File', 'Project'] },
  { id: 'edit', key: 'shell.menu.edit', groups: ['Edit', 'Select'] },
  { id: 'view', key: 'shell.menu.view', groups: ['View', 'Display', 'Navigate'] },
  { id: 'insert', key: 'shell.menu.insert', groups: ['Insert', 'Import', 'Library'] },
  { id: 'format', key: 'shell.menu.format', groups: ['Format', 'Layers', 'Styles', 'Units'] },
  { id: 'tools', key: 'shell.menu.tools', groups: ['Tools', 'Inquiry', 'Settings'] },
  { id: 'draw', key: 'shell.menu.draw', groups: ['Draw', 'Create'] },
  { id: 'dimension', key: 'shell.menu.dimension', groups: ['Dimension', 'Annotate'] },
  { id: 'modify', key: 'shell.menu.modify', groups: ['Modify', 'Transform', 'Arrange'] },
  { id: 'window', key: 'shell.menu.window', groups: ['Window', 'Layout'] },
  { id: 'help', key: 'shell.menu.help', groups: ['Help'] },
]);
