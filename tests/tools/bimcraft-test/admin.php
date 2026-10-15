<?php
// SPDX-License-Identifier: Apache-2.0
/**
 * Test admin for BimCraft's browser checks (tools/bimcraft-test/browser-edit.mjs).
 *   sudo -u www-data php tools/bimcraft-test/admin.php up     → {"email": …, "password": …} (created or re-enabled)
 *   sudo -u www-data php tools/bimcraft-test/admin.php session → {"cookie": "cc_session=…"} — a signed-in session minted
 *                                                              in-process (the admin-login throttle is never touched)
 *   sudo -u www-data php tools/bimcraft-test/admin.php down   → disabled again (never deleted; minted sessions end)
 * A dedicated account (bimcrafttest+cadcraft@projectz.xyz), so this check never disables another app's test admin
 * while that app's check is running.
 */
declare(strict_types=1);
require_once dirname(__DIR__, 2) . '/public_html/core/bootstrap.php';

const BIM_ADMIN = 'bimcrafttest+cadcraft@projectz.xyz';
$cmd = $argv[1] ?? '';
if ($cmd === 'up') {
    $pw = bin2hex(random_bytes(12));
    Auth::upsertAdmin(BIM_ADMIN, $pw);
    $u = Auth::byEmail(BIM_ADMIN);
    if ($u && ($u['status'] ?? '') !== 'active') Auth::setStatus((int)$u['id'], 'active');
    echo json_encode(['email' => BIM_ADMIN, 'password' => $pw, 'ok' => (bool)$u]), "\n";
} elseif ($cmd === 'session') {
    Auth::upsertAdmin(BIM_ADMIN, bin2hex(random_bytes(12)));
    $u = Auth::byEmail(BIM_ADMIN);
    if ($u && ($u['status'] ?? '') !== 'active') { Auth::setStatus((int)$u['id'], 'active'); $u = Auth::byEmail(BIM_ADMIN); }
    // the same session the web server reads (bootstrap.php: CC_ROOT/sessions, SESSION_NAME)
    $path = CC_ROOT . '/sessions';
    if (is_dir($path)) session_save_path($path);
    session_name((string)env('SESSION_NAME', 'cc_session'));
    session_id(bin2hex(random_bytes(16)));
    session_start();
    $_SESSION['user_id'] = (int)$u['id'];
    $_SESSION['epoch'] = (int)($u['session_epoch'] ?? 0);
    $id = session_id();
    session_write_close();
    echo json_encode(['cookie' => session_name() . '=' . $id, 'email' => BIM_ADMIN]), "\n";
} elseif ($cmd === 'down') {
    $u = Auth::byEmail(BIM_ADMIN);
    if ($u) Auth::setStatus((int)$u['id'], 'disabled');
    echo json_encode(['disabled' => (bool)$u]), "\n";
} else {
    fwrite(STDERR, "usage: admin.php up|session|down\n");
    exit(2);
}
