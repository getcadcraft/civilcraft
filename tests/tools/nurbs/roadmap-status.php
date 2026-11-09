<?php
// SPDX-License-Identifier: Apache-2.0
/**
 * SU.747b (session `nurbs`): set the status of one of my own roadmap rows (rule 28) and stamp it with a note.
 *   sudo -u www-data php tools/nurbs/roadmap-status.php SU.747b partial "what landed, test counts" ["waits text"]
 * status: planned | partial | done.  Release 0.8.  Changes go on the left of `+` (RoadmapItems::save ignores nothing that way).
 */
declare(strict_types=1);
require_once dirname(__DIR__, 2) . '/public_html/core/bootstrap.php';
[$_, $key, $status, $note, $waits] = $argv + [null, '', '', '', ''];
if (!preg_match('/^SU\.747b$/', $key) || !in_array($status, ['planned', 'partial', 'done'], true)) { fwrite(STDERR, "usage: roadmap-status.php SU.747b planned|partial|done \"note\"\n"); exit(2); }
$it = RoadmapItems::byKey('0.8', $key);
if (!$it || $it['archived_at']) { fwrite(STDERR, "no such row $key\n"); exit(1); }
$in = ['status' => $status] + ['item_key' => $key, 'group_name' => $it['group_name'], 'title' => $it['title'], 'description' => $it['description'], 'kind' => $it['kind'],
       'apps' => $it['apps'], 'layers' => $it['layers'], 'days' => $it['days'], 'waits' => $waits !== '' ? $waits : $it['waits'], 'source' => $it['source'],
       'requester' => $it['requester'], 'channel' => $it['channel'], 'artcraft' => $it['artcraft'] ? '1' : '', 'sort' => (string)$it['sort']];
$s = RoadmapItems::save(null, $in, $it['id']);
if (!$s['ok']) { fwrite(STDERR, "save failed: {$s['message']}\n"); exit(1); }
if ($note !== '') RoadmapItems::markChecked([$it['id']], $note, null, 'nurbs 0.8');
echo "$key: {$it['status']} → $status\n";
