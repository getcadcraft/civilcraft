<?php
// SPDX-License-Identifier: Apache-2.0
/**
 * build-help.php — compile this app's help in a clone (docs/DEVSHELL.md): app/help/*.md + the shared topics in
 * devshell/site/assets/help/common → app/help/help.js, and app/help/<locale>/ → help.<locale>.js. The same compiler
 * and lint as getcadcraft.com (devshell/site/core/classes/Help.php). PHP 8.1+.
 *
 *   php devshell/build-help.php [--check]
 */

declare(strict_types=1);

require __DIR__ . '/stubs.php';
require __DIR__ . '/site/core/classes/Help.php';
require __DIR__ . '/site/tools/lang/help-locales.php';

$check = in_array('--check', $argv, true);
$slug = devshell_app()['app']['slug'];
$dir = dirname(__DIR__) . '/app/help';
if (!is_dir($dir)) { fwrite(STDERR, "no app/help folder\n"); exit(1); }

$r = Help::compileApp($slug, $dir);
foreach ($r['warnings'] as $w) echo "  warning  $w\n";
foreach ($r['errors'] as $e) echo "  error    $e\n";
if ($r['errors']) { echo count($r['errors']) . " error(s), nothing written.\n"; exit(1); }
if (!$check) file_put_contents("$dir/help.js", Help::moduleText($r['data']));
echo ($check ? 'ok' : 'wrote app/help/help.js') . ' (' . count($r['data']['topics']) . " topics)\n";

$failed = false;
foreach (HelpLocales::buildAll($slug, $dir, !$check) as $l => $lr) {
    foreach ($lr['warnings'] as $w) echo "  warning  $w\n";
    foreach ($lr['errors'] as $e) echo "  error    $e\n";
    if ($lr['errors']) { $failed = true; continue; }
    echo "$l: {$lr['translated']} of {$lr['total']} topics translated\n";
}
exit($failed ? 1 : 0);
