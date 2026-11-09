<?php
// SPDX-License-Identifier: Apache-2.0
/**
 * packed-imports-urls.php — the shared shell files each app's dev build names through its manifest keys (rule 56, FX.26).
 * Prints JSON {slug: ["/assets/js/x.js", ...]}: the import map, the build's offline list and the app page's own tags,
 * limited to /assets/js and /assets/css. Used by test-packed-imports.mjs. Read-only.
 */
declare(strict_types=1);
require_once dirname(__DIR__, 2) . '/public_html/core/bootstrap.php';
require_once CC_ROOT . '/tools/shell/offline-size.php';
$out = [];
foreach (Catalog::apps() as $a) {
    $b = AppBuilds::resolve($a['slug'], 'lab');
    if (!$b) continue;
    $urls = [];
    if (preg_match('#<script type="importmap">(.*?)</script>#s', AppBuilds::headTags($b), $m)) {
        $j = json_decode(html_entity_decode($m[1]), true);
        foreach ($j['imports'] ?? [] as $k => $v) { $urls[] = $k; $urls[] = $v; }
    }
    foreach (AppBuilds::offlineFiles($b) as $u) $urls[] = $u;
    foreach (offline_page_urls($b) as $u) $urls[] = $u;
    $keep = [];
    foreach ($urls as $u) {
        $p = strtok((string)$u, '?');
        if (preg_match('#^/assets/(js|css)/[^/]+(/[^/]+)*\.(js|css)$#', $p) && !str_contains($p, '/vendor/') && !str_contains($p, '/assets/apps/')) $keep[$p] = true;
    }
    $out[$a['slug']] = array_keys($keep);
}
echo json_encode($out, JSON_UNESCAPED_SLASHES), "\n";
