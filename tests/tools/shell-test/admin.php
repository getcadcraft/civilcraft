<?php
// SPDX-License-Identifier: Apache-2.0
/**
 * Test admin for the shared shell's checks (bin/test-shell-*.mjs; 0.4 session shell).
 *   sudo -u www-data php tools/shell-test/admin.php up        → {"email", "password"} (created or re-enabled)
 *   sudo -u www-data php tools/shell-test/admin.php session   → {"cookie": "cc_session=…"} — a signed-in session minted
 *                                                              in-process, so the admin-login throttle is never touched
 *   sudo -u www-data php tools/shell-test/admin.php down      → every session of it signed out, account disabled (never deleted)
 * A dedicated account (shelltest+cadcraft@projectz.xyz) so /lab can be opened headless.
 */
declare(strict_types=1);
require_once dirname(__DIR__, 2) . '/public_html/core/bootstrap.php';

const SHELL_ADMIN = 'shelltest+cadcraft@projectz.xyz';
$cmd = $argv[1] ?? '';
if ($cmd === 'up' || $cmd === 'session') {
    $pw = bin2hex(random_bytes(12));
    Auth::upsertAdmin(SHELL_ADMIN, $pw);
    $u = Auth::byEmail(SHELL_ADMIN);
    if ($u && ($u['status'] ?? '') !== 'active') { Auth::setStatus((int)$u['id'], 'active'); $u = Auth::byEmail(SHELL_ADMIN); }
    if ($cmd === 'up') { echo json_encode(['email' => SHELL_ADMIN, 'password' => $pw, 'ok' => (bool)$u]), "\n"; exit(0); }
    // The same session the web server reads (bootstrap.php: CC_ROOT/sessions, SESSION_NAME).
    $path = CC_ROOT . '/sessions';
    if (is_dir($path)) session_save_path($path);
    session_name((string)env('SESSION_NAME', 'cc_session'));
    session_id(bin2hex(random_bytes(16)));
    session_start();
    $_SESSION['user_id'] = (int)$u['id'];
    $_SESSION['epoch'] = (int)($u['session_epoch'] ?? 0);
    $id = session_id();
    session_write_close();
    echo json_encode(['cookie' => session_name() . '=' . $id, 'email' => SHELL_ADMIN]), "\n";
} elseif ($cmd === 'down') {
    $u = Auth::byEmail(SHELL_ADMIN);
    if ($u) Auth::setStatus((int)$u['id'], 'disabled');   // disabling bumps the epoch: minted sessions stop working
    echo json_encode(['disabled' => (bool)$u]), "\n";
} else {
    fwrite(STDERR, "usage: admin.php up|session|down\n");
    exit(2);
}
