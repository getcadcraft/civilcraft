<?php
// SPDX-License-Identifier: Apache-2.0
// Super 0.1 test helper: what lab/supercadcraft-app.php returns for one app (mounts.inc super_mount_payload), with no sign-in.
// Usage: php render-payload.php <slug> <out.json> [lang]
declare(strict_types=1);
$_SERVER['REQUEST_METHOD'] = 'GET'; $_SERVER['HTTP_HOST'] = 'getcadcraft.com'; $_SERVER['HTTPS'] = 'on'; $_SERVER['REMOTE_ADDR'] = '127.0.0.1';
$_SERVER['HTTP_USER_AGENT'] = 'super-test'; $_SERVER['REQUEST_URI'] = '/lab/supercadcraft-app';
if (!empty($argv[3])) $_GET['lang'] = $argv[3];
define('CC_NO_SESSION', true);
require dirname(__DIR__, 2) . '/public_html/core/bootstrap.php';
$__area = Catalog::area('lab'); $__build = AppBuilds::resolve('supercadcraft', 'lab');
require_once $__build['dir'] . '/mounts.inc';
$app = ['slug' => 'supercadcraft', 'name' => 'SuperCad Studio', 'layer' => 'cyan', 'short' => '']; $__manifest = $__build['manifest'];
Lang::use($__build, super_page_locale($__build));
$p = super_mount_payload((string)$argv[1], $__build);
if (!$p) { fwrite(STDERR, "no payload for {$argv[1]}\n"); exit(1); }
file_put_contents($argv[2], json_encode($p));
echo "payload {$argv[1]} ", filesize($argv[2]), " bytes\n";
