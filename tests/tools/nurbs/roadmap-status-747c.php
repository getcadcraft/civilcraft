<?php
// SPDX-License-Identifier: Apache-2.0
/**
 * SU.747c (session `nurbs-s3-09`): set the status of this session's roadmap row (rules 28, 45) with what was built, measured and not claimed.
 *   sudo -u www-data php tools/nurbs/roadmap-status-747c.php partial "description line" "waits text" "checked note"
 * status: planned | partial | done.  Release 0.9.  The description line is appended once (the description stays under 2000 characters).
 */
declare(strict_types=1);
require_once dirname(__DIR__, 2) . '/public_html/core/bootstrap.php';
[$_, $status, $line, $waits, $note] = $argv + [null, '', '', '', ''];
if (!in_array($status, ['planned', 'partial', 'done'], true)) { fwrite(STDERR, "usage: roadmap-status-747c.php planned|partial|done \"line\" \"waits\" \"note\"\n"); exit(2); }
$key = 'SU.747c';
$it = RoadmapItems::byKey('0.9', $key);
if (!$it || $it['archived_at']) { fwrite(STDERR, "no such row $key\n"); exit(1); }
$desc = (string)$it['description'];
if ($line !== '' && strpos($desc, $line) === false) $desc = rtrim($desc) . "\n\n" . $line;
if (mb_strlen($desc) > 2000) { fwrite(STDERR, 'description would be ' . mb_strlen($desc) . " characters (max 2000)\n"); exit(1); }
$in = ['status' => $status] + ['item_key' => $key, 'group_name' => $it['group_name'], 'title' => $it['title'], 'description' => $desc, 'kind' => $it['kind'],
       'apps' => $it['apps'], 'layers' => $it['layers'], 'days' => $it['days'], 'waits' => $waits !== '' ? $waits : $it['waits'], 'source' => $it['source'],
       'requester' => $it['requester'], 'channel' => $it['channel'], 'artcraft' => $it['artcraft'] ? '1' : '', 'sort' => (string)$it['sort']];
$s = RoadmapItems::save(null, $in, $it['id']);
if (!$s['ok']) { fwrite(STDERR, "save failed: {$s['message']}\n"); exit(1); }
if ($note !== '') RoadmapItems::markChecked([$it['id']], $note, null, 'nurbs-s3-09');
$after = RoadmapItems::byKey('0.9', $key);
echo "$key: {$it['status']} → {$after['status']} (" . mb_strlen((string)$after['description']) . " characters)\n";
