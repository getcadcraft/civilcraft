<?php
// SPDX-License-Identifier: Apache-2.0
/**
 * Test admin for the MarkupCraft browser check (tools/markupcraft-test/browser.mjs).
 *   sudo -u www-data php tools/markupcraft-test/admin.php up     → {"email": …, "password": …} (created or re-enabled)
 *   sudo -u www-data php tools/markupcraft-test/admin.php session → {"cookie": "cc_session=…"}: a signed-in session minted in-process
 *                                                                (the admin-login throttle is never touched; browser-field.mjs uses it)
 *   sudo -u www-data php tools/markupcraft-test/admin.php down   → disabled again (never deleted)
 * A dedicated account (mctest+cadcraft@projectz.xyz) so the lab can be opened headless.
 */
declare(strict_types=1);
require_once dirname(__DIR__, 2) . '/public_html/core/bootstrap.php';

const MC_ADMIN = 'mctest+cadcraft@projectz.xyz';
$cmd = $argv[1] ?? '';
if ($cmd === 'up') {
    $pw = bin2hex(random_bytes(12));
    $r = Auth::upsertAdmin(MC_ADMIN, $pw);
    $u = Auth::byEmail(MC_ADMIN);
    if ($u && ($u['status'] ?? '') !== 'active') Auth::setStatus((int)$u['id'], 'active');
    echo json_encode(['email' => MC_ADMIN, 'password' => $pw, 'ok' => (bool)$u]), "\n";
} elseif ($cmd === 'session') {
    Auth::upsertAdmin(MC_ADMIN, bin2hex(random_bytes(12)));
    $u = Auth::byEmail(MC_ADMIN);
    if ($u && ($u['status'] ?? '') !== 'active') { Auth::setStatus((int)$u['id'], 'active'); $u = Auth::byEmail(MC_ADMIN); }
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
    echo json_encode(['cookie' => session_name() . '=' . $id, 'email' => MC_ADMIN]), "\n";
} elseif ($cmd === 'down') {
    $u = Auth::byEmail(MC_ADMIN);
    if ($u) Auth::setStatus((int)$u['id'], 'disabled');
    echo json_encode(['disabled' => (bool)$u]), "\n";
} else {
    fwrite(STDERR, "usage: admin.php up|session|down\n");
    exit(2);
}
