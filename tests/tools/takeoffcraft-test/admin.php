<?php
// SPDX-License-Identifier: Apache-2.0
/**
 * Test admins for TakeoffCraft's browser checks (bin/test-takeoffcraft.mjs --browser, tools/takeoffcraft-test/browser-3d.mjs).
 *   sudo -u www-data php tools/takeoffcraft-test/admin.php session [main|3d] → {"cookie": "cc_session=…", "email"} — a signed-in
 *                                                                           session minted in-process: the shared admin-login
 *                                                                           throttle (10 / 10 min for 127.0.0.1) is never touched
 *   sudo -u www-data php tools/takeoffcraft-test/admin.php down [main|3d]    → account disabled (minted sessions stop; never deleted)
 * Accounts: takeofftest+cadcraft@projectz.xyz (main), takeoff3dtest+cadcraft@projectz.xyz (3d).
 */
declare(strict_types=1);
require_once dirname(__DIR__, 2) . '/public_html/core/bootstrap.php';

$cmd = $argv[1] ?? '';
$email = ($argv[2] ?? 'main') === '3d' ? 'takeoff3dtest+cadcraft@projectz.xyz' : 'takeofftest+cadcraft@projectz.xyz';
if ($cmd === 'session') {
    Auth::upsertAdmin($email, bin2hex(random_bytes(12)));
    $u = Auth::byEmail($email);
    if ($u && ($u['status'] ?? '') !== 'active') { Auth::setStatus((int)$u['id'], 'active'); $u = Auth::byEmail($email); }
    // the same session store the web server reads (bootstrap.php: CC_ROOT/sessions, SESSION_NAME)
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
    if ($u) Auth::setStatus((int)$u['id'], 'disabled');   // disabling bumps the epoch: minted sessions stop working
    echo json_encode(['disabled' => (bool)$u]), "\n";
} else {
    fwrite(STDERR, "usage: admin.php session|down [main|3d]\n");
    exit(2);
}
