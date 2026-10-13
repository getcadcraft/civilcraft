<?php
// SPDX-License-Identifier: Apache-2.0
/**
 * Test admin for the CivilCraft 3D browser check (tools/civilcraft-test/browser-3d.mjs).
 *   sudo -u www-data php tools/civilcraft-test/admin-3d.php up     → {"email": …, "password": …} (created or re-enabled)
 *   sudo -u www-data php tools/civilcraft-test/admin-3d.php down   → disabled again (never deleted)
 * A dedicated account (civilcraft3dtest+cadcraft@projectz.xyz) so the 3D check can run beside browser.mjs without one switching the other's admin off.
 */
declare(strict_types=1);
require_once dirname(__DIR__, 2) . '/public_html/core/bootstrap.php';

const CV3_ADMIN = 'civilcraft3dtest+cadcraft@projectz.xyz';
$cmd = $argv[1] ?? '';
if ($cmd === 'up') {
    $pw = bin2hex(random_bytes(12));
    $r = Auth::upsertAdmin(CV3_ADMIN, $pw);
    $u = Auth::byEmail(CV3_ADMIN);
    if ($u && ($u['status'] ?? '') !== 'active') Auth::setStatus((int)$u['id'], 'active');
    echo json_encode(['email' => CV3_ADMIN, 'password' => $pw, 'ok' => (bool)$u]), "\n";
} elseif ($cmd === 'down') {
    $u = Auth::byEmail(CV3_ADMIN);
    if ($u) Auth::setStatus((int)$u['id'], 'disabled');
    echo json_encode(['disabled' => (bool)$u]), "\n";
} else {
    fwrite(STDERR, "usage: admin-3d.php up|down\n");
    exit(2);
}
