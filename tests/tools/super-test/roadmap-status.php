<?php
// SPDX-License-Identifier: Apache-2.0
/**
 * Session `super_PART_3`: set the status of one of my own roadmap rows (rule 28) and stamp it with a checked note (rule 42).
 *   sudo -u www-data php tools/super-test/roadmap-status.php <release> <key> planned|partial|done "note"
 *   (release super-0.1 for SC.*, 0.8 for DC.1). The changes go on the left of `+`.
 */
declare(strict_types=1);
require_once dirname(__DIR__, 2) . '/public_html/core/bootstrap.php';
const MINE = ['super-0.1' => ['SC.1','SC.2','SC.3','SC.4','SC.5','SC.6','SC.7','SC.8'], '0.8' => ['DC.1']];
[$_, $rel, $key, $status, $note] = $argv + [null, '', '', '', ''];
if (!in_array($key, MINE[$rel] ?? [], true) || !in_array($status, ['planned', 'partial', 'done'], true)) { fwrite(STDERR, "usage: roadmap-status.php <release> <key> planned|partial|done \"note\"\n"); exit(2); }
$it = RoadmapItems::byKey($rel, $key);
if (!$it || $it['archived_at']) { fwrite(STDERR, "no such row $key\n"); exit(1); }
$in = ['status' => $status] + ['item_key' => $key, 'group_name' => $it['group_name'], 'title' => $it['title'], 'description' => $it['description'], 'kind' => $it['kind'],
       'apps' => $it['apps'], 'layers' => $it['layers'], 'days' => $it['days'], 'waits' => $it['waits'], 'source' => $it['source'],
       'requester' => $it['requester'], 'channel' => $it['channel'], 'artcraft' => $it['artcraft'] ? '1' : '', 'sort' => (string)$it['sort']];
$s = RoadmapItems::save(null, $in, $it['id']);
if (!$s['ok']) { fwrite(STDERR, "save failed: {$s['message']}\n"); exit(1); }
if ($note !== '') RoadmapItems::markChecked([$it['id']], $note, null, 'super_PART_3 0.8');
echo "$key: {$it['status']} → $status\n";
