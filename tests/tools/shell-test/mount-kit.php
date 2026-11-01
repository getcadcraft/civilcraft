<?php
// SPDX-License-Identifier: Apache-2.0
/**
 * The server half of the mount kit's proof (round 3, session shell_PART_3; docs/apps/shell-modules.md § Mounting), on an in-memory scratch copy of an
 * app's lab build: the real dev manifest with the seven keys switched on, never written back, so no app folder is touched.
 *   php tools/shell-test/mount-kit.php <slug> [keys]   → (keys: comma list, default the seven of the mount kit) JSON { extras, tags, importmap, offline, missing }
 *     tags      what app-shell.inc prints for the keys (the same loop)    importmap  the build's cache-busted import entries
 *     offline   the files the offline list names                          missing    any of those that is not on disk
 */
declare(strict_types=1);
require_once dirname(__DIR__, 2) . '/public_html/core/bootstrap.php';

$slug = $argv[1] ?? 'partcraft';
$app = Catalog::app($slug);
$build = AppBuilds::resolve($slug, 'lab');
if (!$app || !$build) { fwrite(STDERR, "no lab build for $slug\n"); exit(1); }
$keys = $argv[2] ?? 'calc,reasons,totals,lessons,ai-suggest,ai-activity,ai-ask';   // `access` is proved on its own (tools/shell-test/browser-access.mjs passes it)
$keys = explode(',', $keys);
foreach ($keys as $k) $build['manifest'][$k] = true;           // the scratch copy: in memory only

$tags = '';
foreach (AppBuilds::extras($build) as $x) {                       // the loop of core/components/app-shell.inc
    $tags .= '<script type="application/json" id="cc-' . e($x) . '">' . json_embed(['app' => $app['slug'], 'appName' => $app['name']]) . '</script>'
           . '<script type="module" src="' . e(asset(ltrim(AppBuilds::extraScript($x), '/'))) . '"></script>' . "\n";
}
$head = AppBuilds::headTags($build);
preg_match('#<script type="importmap">(.*?)</script>#s', $head, $m);
$imports = json_decode(html_entity_decode($m[1] ?? '{}'), true)['imports'] ?? [];
$offline = AppBuilds::offlineFiles($build);
$need = in_array('access', $keys, true) ? ['app-access.js'] : ['ai-suggest.js', 'ai-activity.js', 'ai-ask.js', 'assist-perms.js', 'app-ai-ui.js', 'app-ai-suggest.js', 'app-ai-activity.js', 'app-ai-ask.js', 'app-tools-ui.js'];
$missing = [];
foreach ($need as $f) {
    $u = '/assets/js/' . $f;
    if (!is_file(CC_PUBLIC . $u)) $missing[] = "file $u";
    if (!isset($imports[$u])) $missing[] = "importmap $u";
    if (!preg_grep('#^' . preg_quote($u, '#') . '(\?|$)#', $offline)) $missing[] = "offline $u";
}
if (in_array('ai-ask', $keys, true) && !preg_grep('#^/assets/css/app-ai\.css(\?|$)#', $offline)) $missing[] = 'offline /assets/css/app-ai.css';
echo json_encode(['extras' => AppBuilds::extras($build), 'tags' => $tags, 'importmap' => array_keys($imports), 'offline' => count($offline), 'missing' => $missing], JSON_UNESCAPED_SLASHES), "\n";
