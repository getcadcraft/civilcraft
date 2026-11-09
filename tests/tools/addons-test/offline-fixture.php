<?php
// SPDX-License-Identifier: Apache-2.0
/**
 * Fixture for tools/addons-test/browser-offline.mjs (0.9 OF.1–OF.4). A lab tester offline09-browser+cadcraft@projectz.xyz with Windows (a signed
 * package), Electrical (inside the apps) and Acoustic materials on the list, through the service layer.
 *   sudo -u www-data php tools/addons-test/offline-fixture.php up     → {"cookie": "cc_session=…", "who": "a…"}   (a session minted in-process)
 *   sudo -u www-data php tools/addons-test/offline-fixture.php down   → list entries soft-removed, account disabled (sessions stop working)
 */
declare(strict_types=1);
require_once dirname(__DIR__, 2) . '/public_html/core/bootstrap.php';

const OFF_FX = 'offline09-browser+cadcraft@projectz.xyz';
$cmd = $argv[1] ?? '';
if ($cmd === 'up') {
    if (!Auth::byEmail(OFF_FX)) db()->prepare("INSERT INTO users (email, name, password_hash, email_verified_at, role, status, lab_access) VALUES (?, 'Offline browser test', ?, UTC_TIMESTAMP(), 'member', 'active', 1)")
        ->execute([OFF_FX, password_hash(bin2hex(random_bytes(12)), PASSWORD_DEFAULT)]);
    $u = Auth::byEmail(OFF_FX);
    if ($u['status'] !== 'active') Auth::setStatus((int)$u['id'], 'active');
    db()->prepare('UPDATE users SET lab_access = 1 WHERE id = ?')->execute([$u['id']]);
    $u = Auth::byEmail(OFF_FX);
    foreach (['windows', 'electrical', 'acoustic.materials'] as $id) AccountAddons::add($u, $id, 'site');
    $path = CC_ROOT . '/sessions';
    if (is_dir($path)) session_save_path($path);
    session_name((string)env('SESSION_NAME', 'cc_session'));
    session_id(bin2hex(random_bytes(16)));
    session_start();
    $_SESSION['user_id'] = (int)$u['id'];
    $_SESSION['epoch'] = (int)($u['session_epoch'] ?? 0);
    $id = session_id();
    session_write_close();
    echo json_encode(['cookie' => session_name() . '=' . $id, 'who' => AddonOffline::who($u)]), "\n";
} elseif ($cmd === 'down') {
    $u = Auth::byEmail(OFF_FX);
    if ($u) {
        db()->prepare('UPDATE account_addons SET removed_at = UTC_TIMESTAMP() WHERE user_id = ? AND removed_at IS NULL')->execute([$u['id']]);
        Auth::setStatus((int)$u['id'], 'disabled');
    }
    echo json_encode(['down' => (bool)$u]), "\n";
} else {
    fwrite(STDERR, "usage: offline-fixture.php up|down\n");
    exit(2);
}
