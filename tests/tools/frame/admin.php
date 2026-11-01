<?php
// SPDX-License-Identifier: Apache-2.0
/**
 * Test admin for the frame analysis browser check (tools/frame/browser.mjs; 0.6 LC.4).
 *   sudo -u www-data php tools/frame/admin.php session → {"cookie": "cc_session=…", "name", "value", "email"}: a signed-in
 *                                                      session minted in-process (the admin-login throttle is never touched)
 *   sudo -u www-data php tools/frame/admin.php down    → the account disabled again (minted sessions stop; never deleted)
 * Account: frametest+cadcraft@projectz.xyz. Same pattern as tools/takeoffcraft-test/admin.php.
 */
declare(strict_types=1);
require_once dirname(__DIR__, 2) . '/public_html/core/bootstrap.php';

$email = 'frametest+cadcraft@projectz.xyz';
$cmd = $argv[1] ?? '';
if ($cmd === 'session') {
    Auth::upsertAdmin($email, bin2hex(random_bytes(12)));
    $u = Auth::byEmail($email);
    if ($u && ($u['status'] ?? '') !== 'active') { Auth::setStatus((int)$u['id'], 'active'); $u = Auth::byEmail($email); }
    $path = CC_ROOT . '/sessions';
    if (is_dir($path)) session_save_path($path);
    session_name((string)env('SESSION_NAME', 'cc_session'));
    session_id(bin2hex(random_bytes(16)));
    session_start();
    $_SESSION['user_id'] = (int)$u['id'];
    $_SESSION['epoch'] = (int)($u['session_epoch'] ?? 0);
    $id = session_id();
    session_write_close();
    echo json_encode(['cookie' => session_name() . '=' . $id, 'name' => session_name(), 'value' => $id, 'email' => $email]), "\n";
} elseif ($cmd === 'down') {
    $u = Auth::byEmail($email);
    if ($u) Auth::setStatus((int)$u['id'], 'disabled');
    echo json_encode(['disabled' => (bool)$u]), "\n";
} else {
    fwrite(STDERR, "usage: admin.php session|down\n");
    exit(2);
}
