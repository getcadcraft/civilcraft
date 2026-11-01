<?php
// SPDX-License-Identifier: Apache-2.0
// Router for `php -S` in bin/test-civilcraft-teamlines.mjs: the two extensionless API routes the test uses (Apache's .htaccess does this on the live site).
$p = (string)parse_url((string)($_SERVER['REQUEST_URI'] ?? ''), PHP_URL_PATH);
$f = dirname(__DIR__, 2) . '/public_html' . $p . '.php';
if (preg_match('#^/api/v1/(team|sync)/[a-z]+$#', $p) && is_file($f)) {
    $_SERVER['SCRIPT_FILENAME'] = $f;
    chdir(dirname($f));
    require $f;
    return true;
}
http_response_code(404);
echo '{"status":"error","message":"not routed"}';
