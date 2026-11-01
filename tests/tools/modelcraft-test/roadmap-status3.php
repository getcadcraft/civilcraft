<?php
// SPDX-License-Identifier: Apache-2.0
/**
 * 0.8 round 3 (session model_PART_3): read or set the status of one of MY roadmap rows (rule 28 + rule 42) and stamp a checked note.
 *   sudo -u www-data php tools/modelcraft-test/roadmap-status3.php show
 *   sudo -u www-data php tools/modelcraft-test/roadmap-status3.php <KEY> planned|partial|done "checked note" ["waits text"]
 * Only the rows in MINE (the R3.10 prompt's list); every other row is refused. Changes go on the LEFT of `+`.
 */
declare(strict_types=1);
require_once dirname(__DIR__, 2) . '/public_html/core/bootstrap.php';
const MINE = ['SU.747b', 'EG.61', 'EG.62', 'EG.36', 'EG.60', 'SU.929', 'SU.858', 'EG.50'];
[$_, $key, $status, $note, $waits] = $argv + [null, '', '', '', ''];
if ($key === 'show') {
    foreach (MINE as $k) { $it = RoadmapItems::byKey('0.8', $k); echo $it ? sprintf("%-8s %-8s #%-5d %s | waits: %s | apps: %s\n", $k, $it['status'], $it['id'], mb_substr($it['title'], 0, 70), mb_substr((string)$it['waits'], 0, 90), is_array($it['apps']) ? implode(',', $it['apps']) : (string)$it['apps']) : "$k  (no row)\n"; }
    exit(0);
}
if (!in_array($key, MINE, true) || !in_array($status, ['planned', 'partial', 'done'], true)) { fwrite(STDERR, "usage: roadmap-status3.php show | <" . implode('|', MINE) . "> planned|partial|done \"note\" [\"waits\"]\n"); exit(2); }
$it = RoadmapItems::byKey('0.8', $key);
if (!$it || $it['archived_at']) { fwrite(STDERR, "no such row $key\n"); exit(1); }
$in = ['status' => $status] + ['item_key' => $key, 'group_name' => $it['group_name'], 'title' => $it['title'], 'description' => $it['description'], 'kind' => $it['kind'],
       'apps' => $it['apps'], 'layers' => $it['layers'], 'days' => $it['days'], 'waits' => $waits !== '' ? $waits : $it['waits'], 'source' => $it['source'],
       'requester' => $it['requester'], 'channel' => $it['channel'], 'artcraft' => $it['artcraft'] ? '1' : '', 'sort' => (string)$it['sort']];
$s = RoadmapItems::save(null, $in, $it['id']);
if (!$s['ok']) { fwrite(STDERR, "save failed: {$s['message']}\n"); exit(1); }
if ($note !== '') RoadmapItems::markChecked([$it['id']], $note, null, 'model_PART_3 0.8');
echo "$key: {$it['status']} → $status\n";
