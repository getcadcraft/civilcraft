<?php
// SPDX-License-Identifier: Apache-2.0
/**
 * Test admin for the CadCraft browser check (tools/cadcraft-test/browser-library.mjs).
 *   sudo -u www-data php tools/cadcraft-test/admin.php up     → {"email": …, "password": …} (created or re-enabled)
 *   sudo -u www-data php tools/cadcraft-test/admin.php session → {"cookie", "name", "value", "email"}: a signed-in session minted
 *                                                              in-process (as tools/takeoffcraft-test/admin.php), so a run
 *                                                              does not need the shared admin-login throttle (10 / 10 min)
 *   sudo -u www-data php tools/cadcraft-test/admin.php down   → disabled again (never deleted; minted sessions stop)
 * A dedicated account (cctest+cadcraft@projectz.xyz) so the lab can be opened headless. An optional tag gives a run its
 * own account (cctest+cadcraft-<tag>@projectz.xyz), so a long run (browser-tabs-sweep.mjs: "sweep") is not signed out
 * when another run sets the shared one up or down:   admin.php up|down [tag]
 */
declare(strict_types=1);
require_once dirname(__DIR__, 2) . '/public_html/core/bootstrap.php';

$tag = preg_replace('/[^a-z0-9]/', '', strtolower($argv[2] ?? ''));
define('CC_ADMIN', $tag !== '' ? 'cctest+cadcraft-' . substr($tag, 0, 20) . '@projectz.xyz' : 'cctest+cadcraft@projectz.xyz');
$cmd = $argv[1] ?? '';
if ($cmd === 'up') {
    $pw = bin2hex(random_bytes(12));
    $r = Auth::upsertAdmin(CC_ADMIN, $pw);
    $u = Auth::byEmail(CC_ADMIN);
    if ($u && ($u['status'] ?? '') !== 'active') Auth::setStatus((int)$u['id'], 'active');
    echo json_encode(['email' => CC_ADMIN, 'password' => $pw, 'ok' => (bool)$u]), "\n";
} elseif ($cmd === 'session') {
    Auth::upsertAdmin(CC_ADMIN, bin2hex(random_bytes(12)));
    $u = Auth::byEmail(CC_ADMIN);
    if ($u && ($u['status'] ?? '') !== 'active') { Auth::setStatus((int)$u['id'], 'active'); $u = Auth::byEmail(CC_ADMIN); }
    $path = CC_ROOT . '/sessions';   // the store the web server reads (bootstrap.php)
    if (is_dir($path)) session_save_path($path);
    session_name((string)env('SESSION_NAME', 'cc_session'));
    session_id(bin2hex(random_bytes(16)));
    session_start();
    $_SESSION['user_id'] = (int)$u['id'];
    $_SESSION['epoch'] = (int)($u['session_epoch'] ?? 0);
    $id = session_id();
    session_write_close();
    echo json_encode(['cookie' => session_name() . '=' . $id, 'name' => session_name(), 'value' => $id, 'email' => CC_ADMIN]), "\n";
} elseif ($cmd === 'down') {
    $u = Auth::byEmail(CC_ADMIN);
    if ($u) Auth::setStatus((int)$u['id'], 'disabled');
    echo json_encode(['disabled' => (bool)$u]), "\n";
} else {
    fwrite(STDERR, "usage: admin.php up|session|down [tag]\n");
    exit(2);
}
