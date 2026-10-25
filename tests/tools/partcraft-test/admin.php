<?php
// SPDX-License-Identifier: Apache-2.0
/**
 * Test admin for the PartCraft browser check (tools/partcraft-test/browser.mjs).
 *   sudo -u www-data php tools/partcraft-test/admin.php up     → {"email": …, "password": …} (created or re-enabled)
 *   sudo -u www-data php tools/partcraft-test/admin.php down   → disabled again (never deleted)
 * A dedicated account (partcrafttest+cadcraft@projectz.xyz) so the lab can be opened headless.
 */
declare(strict_types=1);
require_once dirname(__DIR__, 2) . '/public_html/core/bootstrap.php';

const PC_ADMIN = 'partcrafttest+cadcraft@projectz.xyz';
$cmd = $argv[1] ?? '';
if ($cmd === 'up') {
    $pw = bin2hex(random_bytes(12));
    $r = Auth::upsertAdmin(PC_ADMIN, $pw);
    $u = Auth::byEmail(PC_ADMIN);
    if ($u && ($u['status'] ?? '') !== 'active') Auth::setStatus((int)$u['id'], 'active');
    echo json_encode(['email' => PC_ADMIN, 'password' => $pw, 'ok' => (bool)$u]), "\n";
} elseif ($cmd === 'down') {
    $u = Auth::byEmail(PC_ADMIN);
    if ($u) Auth::setStatus((int)$u['id'], 'disabled');
    echo json_encode(['disabled' => (bool)$u]), "\n";
} else {
    fwrite(STDERR, "usage: admin.php up|down\n");
    exit(2);
}
