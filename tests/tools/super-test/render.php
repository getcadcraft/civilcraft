<?php
// SPDX-License-Identifier: Apache-2.0
// Super 0.1 SC.2 test helper: render /lab/supercadcraft's page (app-shell.inc, as lab/supercadcraft.php does) to a file, with no
// sign-in and no database writes. Usage: php render.php <out.html>
declare(strict_types=1);
$_SERVER['REQUEST_METHOD'] = 'GET'; $_SERVER['HTTP_HOST'] = 'getcadcraft.com'; $_SERVER['HTTPS'] = 'on'; $_SERVER['REMOTE_ADDR'] = '127.0.0.1';
$_SERVER['HTTP_USER_AGENT'] = 'super-test'; $_SERVER['REQUEST_URI'] = '/lab/supercadcraft';
if (!empty($argv[2])) $_GET['lang'] = $argv[2];   // the page in another language (Lang negotiates ?lang=)
define('CC_NO_SESSION', true);
require dirname(__DIR__, 2) . '/public_html/core/bootstrap.php';
$__area = Catalog::area('lab');
$__build = AppBuilds::resolve('supercadcraft', 'lab');
if (!$__area || !$__build) { fwrite(STDERR, "no dev build\n"); exit(1); }
require_once $__build['dir'] . '/mounts.inc';
super_mount_imports($__build);
$app = ['slug' => 'supercadcraft', 'name' => 'SuperCad Studio', 'layer' => 'cyan', 'short' => 'The eight apps in one window. An early lab build.'];
ob_start();
require dirname(__DIR__, 2) . '/public_html/core/components/app-shell.inc';
file_put_contents($argv[1], ob_get_clean());
echo "rendered ", filesize($argv[1]), " bytes\n";
