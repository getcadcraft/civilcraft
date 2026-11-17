<?php
// SPDX-License-Identifier: Apache-2.0
// Super 0.1 test helper: render /lab/<slug>?embed=1 (app-shell.inc, as the lab renders it, no sign-in, no DB writes) to a file.
// Usage: php render-app.php <slug> <out.html> [lang]
declare(strict_types=1);
$slug = (string)($argv[1] ?? '');
$_SERVER['REQUEST_METHOD'] = 'GET'; $_SERVER['HTTP_HOST'] = 'getcadcraft.com'; $_SERVER['HTTPS'] = 'on'; $_SERVER['REMOTE_ADDR'] = '127.0.0.1';
$_SERVER['HTTP_USER_AGENT'] = 'super-test'; $_SERVER['REQUEST_URI'] = '/lab/' . $slug . '?embed=1';
$_GET['slug'] = $slug; $_GET['embed'] = '1'; if (!empty($argv[3])) $_GET['lang'] = $argv[3];
define('CC_NO_SESSION', true);
require dirname(__DIR__, 2) . '/public_html/core/bootstrap.php';
$app = Catalog::app($slug); $__area = Catalog::area('lab'); $__build = AppBuilds::resolve($slug, 'lab');
if (!$app || !$__area || !$__build) { fwrite(STDERR, "no dev build for $slug\n"); exit(1); }
ob_start();
require dirname(__DIR__, 2) . '/public_html/core/components/app-shell.inc';
file_put_contents($argv[2], ob_get_clean());
echo "rendered $slug ", filesize($argv[2]), " bytes\n";
