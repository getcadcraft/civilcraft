<?php
// SPDX-License-Identifier: Apache-2.0
/**
 * detail_PART_3 (rule 28 and 42): read or set the status of one of DetailCraft's roadmap rows, and stamp it with a checked note.
 *   sudo -u www-data php tools/detailcraft-test/roadmap-status.php show EG.5 [EG.6 …]
 *   sudo -u www-data php tools/detailcraft-test/roadmap-status.php set EG.5 partial "what landed, test counts" ["waits text"]
 * status: planned | partial | done. Release 0.8. The changes go on the left of `+` (RoadmapItems::save ignores status otherwise). Never an owner / community row.
 */
declare(strict_types=1);
require_once dirname(__DIR__, 2) . '/public_html/core/bootstrap.php';
$cmd = $argv[1] ?? '';
if ($cmd === 'show') {
    foreach (array_slice($argv, 2) as $k) {
        $it = RoadmapItems::byKey('0.8', $k);
        echo $k, ' | ', $it ? ($it['id'] . ' | ' . $it['status'] . ' | ' . mb_substr((string)$it['title'], 0, 80) . ' | ' . (is_array($it['apps']) ? implode(',', $it['apps']) : (string)$it['apps']) . ' | waits: ' . mb_substr((string)$it['waits'], 0, 80)) : 'none', "\n";
    }
    exit(0);
}
[$_, $_c, $key, $status, $note, $waits] = $argv + [null, '', '', '', '', ''];
if ($cmd !== 'set' || !preg_match('/^(EG|SU|D8)\.\d+$/', $key) || !in_array($status, ['planned', 'partial', 'done'], true)) { fwrite(STDERR, "usage: roadmap-status.php show KEY… | set KEY planned|partial|done \"note\" [\"waits\"]\n"); exit(2); }
$it = RoadmapItems::byKey('0.8', $key);
if (!$it || $it['archived_at']) { fwrite(STDERR, "no such row $key\n"); exit(1); }
if (in_array($it['status'], ['owner', 'community'], true)) { fwrite(STDERR, "$key is an owner/community row: not mine to move\n"); exit(1); }
$in = ['status' => $status] + ['item_key' => $key, 'group_name' => $it['group_name'], 'title' => $it['title'], 'description' => $it['description'], 'kind' => $it['kind'],
       'apps' => $it['apps'], 'layers' => $it['layers'], 'days' => $it['days'], 'waits' => $waits !== '' ? $waits : $it['waits'], 'source' => $it['source'],
       'requester' => $it['requester'], 'channel' => $it['channel'], 'artcraft' => $it['artcraft'] ? '1' : '', 'sort' => (string)$it['sort']];
$s = RoadmapItems::save(null, $in, $it['id']);
if (!$s['ok']) { fwrite(STDERR, "save failed: {$s['message']}\n"); exit(1); }
if ($note !== '') RoadmapItems::markChecked([$it['id']], $note, null, 'detail_PART_3 0.8');
echo "$key: {$it['status']} → $status\n";
