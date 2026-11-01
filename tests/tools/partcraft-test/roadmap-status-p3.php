<?php
// SPDX-License-Identifier: Apache-2.0
/**
 * Round 3 (session `part_PART_3`): show or set the status of the PartCraft rows this session carries (rules 28 + 42), stamped with a note.
 *   sudo -u www-data php tools/partcraft-test/roadmap-status-p3.php show
 *   sudo -u www-data php tools/partcraft-test/roadmap-status-p3.php SU.891 partial "what landed, test counts"
 * status: planned | partial | done.  Release 0.8.  Changes go on the left of `+` (RoadmapItems::save; updateForSystem ignores status).
 */
declare(strict_types=1);
require_once dirname(__DIR__, 2) . '/public_html/core/bootstrap.php';
const KEYS = ['SU.891', 'SU.1035', 'SU.747b', 'SU.929', 'SU.934', 'EG.38', 'EG.7', 'EG.40', 'EG.26', 'EG.20', 'EG.56'];
[$_, $key, $status, $note] = $argv + [null, '', '', ''];
if ($key === 'show') {
  foreach (KEYS as $k) { $it = RoadmapItems::byKey('0.8', $k); echo $k . ': ' . ($it ? $it['status'] . ' (#' . $it['id'] . ') ' . mb_substr($it['title'], 0, 70) : 'not found') . "\n"; }
  exit(0);
}
if (!in_array($key, KEYS, true) || !in_array($status, ['planned', 'partial', 'done'], true)) { fwrite(STDERR, "usage: roadmap-status-p3.php show | <key> planned|partial|done \"note\"\n"); exit(2); }
$it = RoadmapItems::byKey('0.8', $key);
if (!$it || $it['archived_at']) { fwrite(STDERR, "no such row $key\n"); exit(1); }
$in = ['status' => $status] + ['item_key' => $key, 'group_name' => $it['group_name'], 'title' => $it['title'], 'description' => $it['description'], 'kind' => $it['kind'],
       'apps' => $it['apps'], 'layers' => $it['layers'], 'days' => $it['days'], 'waits' => $it['waits'], 'source' => $it['source'],
       'requester' => $it['requester'], 'channel' => $it['channel'], 'artcraft' => $it['artcraft'] ? '1' : '', 'sort' => (string)$it['sort']];
$s = RoadmapItems::save(null, $in, $it['id']);
if (!$s['ok']) { fwrite(STDERR, "save failed: {$s['message']}\n"); exit(1); }
if ($note !== '') RoadmapItems::markChecked([$it['id']], $note, null, 'part_PART_3 0.8');
echo "$key: {$it['status']} → $status\n";
