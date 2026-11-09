<?php
// SPDX-License-Identifier: Apache-2.0
/**
 * nurbs-s3-09 (rule 55): the one fix this session made that no row covers, as a Fixes row (kind fix, status done). Skips when the title exists.
 *   sudo -u www-data php tools/nurbs/roadmap-fx-nurbs-s3.php [--dry]
 */
declare(strict_types=1);
require_once dirname(__DIR__, 2) . '/public_html/core/bootstrap.php';
$dry = in_array('--dry', $argv, true);
$title = 'ModelCraft Surfaces solids test opens the folded Surfaces section first';
$st = db()->prepare('SELECT item_key FROM roadmap_items WHERE `release` = ? AND title = ?');
$st->execute(['0.9', $title]);
if ($k = $st->fetchColumn()) { echo "$k: exists, skipped\n"; exit(0); }
$key = RoadmapItems::nextKey('0.9', 'FX');
$in = ['release' => '0.9', 'item_key' => $key, 'group_name' => 'Fixes', 'title' => $title,
       'description' => "tools/modelcraft-test/browser-solids.mjs failed before any change of 2026-11-06: the right panel now folds its sections (app-settings.js, one open at a time), so the Surfaces button was not visible. The test now clicks the Surfaces heading when the section is folded (as a person does), and expects 9 Solids commands (+ Fillet between faces, Thicken into a solid, SU.747c); PartCraft's browser-solids.mjs the same count. Both pass (14/0, 18/0). Not fixed here: ModelCraft's browser-trim.mjs, browser-scanfit.mjs and tools/nurbs/browser-scanfit-09.mjs open the panel the same old way (listed in docs/0.9-sessions/nurbs-s3-09.md § Found).",
       'kind' => 'fix', 'status' => 'done', 'apps' => 'model part', 'layers' => '', 'days' => '0.1', 'waits' => '', 'source' => 'docs/0.9-sessions/nurbs-s3-09.md', 'requester' => '', 'channel' => 'session', 'artcraft' => ''];
$err = RoadmapItems::validate($in);
if ($err) { echo "$key invalid: " . json_encode($err) . "\n"; exit(1); }
echo "$key: add (done) $title\n";
if ($dry) exit(0);
$s = RoadmapItems::save(null, $in);
if (!$s['ok']) { echo "$key failed: {$s['message']}\n"; exit(1); }
