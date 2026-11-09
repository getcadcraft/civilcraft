<?php
// SPDX-License-Identifier: Apache-2.0
// Router for the child `php -S` of tools/addons-test/browser-offline.mjs (0.9 OF.2/OF.3): the one .htaccess rule the visitor pages need
// (/addons/package/<id>/<version> → addons/package.php); everything else is served as the file it names.
$p = (string)parse_url((string)($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH);
if (preg_match('#^/addons/package/([a-z][a-z0-9.-]{1,63})/([0-9][0-9A-Za-z.+-]{4,60})$#', $p, $m)) {
    $_GET['id'] = $m[1]; $_GET['v'] = $m[2];
    require dirname(__DIR__, 2) . '/public_html/addons/package.php';
    return true;
}
return false;
