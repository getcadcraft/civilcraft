<?php
// SPDX-License-Identifier: Apache-2.0
/**
 * Test admin for the CivilCraft browser check (tools/civilcraft-test/browser.mjs).
 *   sudo -u www-data php tools/civilcraft-test/admin.php up     → {"email": …, "password": …} (created or re-enabled)
 *   sudo -u www-data php tools/civilcraft-test/admin.php down   → disabled again (never deleted)
 * A dedicated account (civilcrafttest+cadcraft@projectz.xyz) so the lab can be opened headless.
 * An optional tag (letters/digits, ≤ 12) gives a separate account civilcrafttest-<tag>+cadcraft@projectz.xyz, so browser
 * checks running at the same time (the GIS ones: gisa, gisb, gisc) never disable each other's sign-in.
 */
declare(strict_types=1);
require_once dirname(__DIR__, 2) . '/public_html/core/bootstrap.php';

$cmd = $argv[1] ?? '';
$tag = $argv[2] ?? '';
if ($tag !== '' && !preg_match('/^[a-z0-9]{1,12}$/', $tag)) { fwrite(STDERR, "bad tag\n"); exit(2); }
define('CV_ADMIN', $tag === '' ? 'civilcrafttest+cadcraft@projectz.xyz' : "civilcrafttest-$tag+cadcraft@projectz.xyz");
if ($cmd === 'up') {
    $pw = bin2hex(random_bytes(12));
    $r = Auth::upsertAdmin(CV_ADMIN, $pw);
    $u = Auth::byEmail(CV_ADMIN);
    if ($u && ($u['status'] ?? '') !== 'active') Auth::setStatus((int)$u['id'], 'active');
    echo json_encode(['email' => CV_ADMIN, 'password' => $pw, 'ok' => (bool)$u]), "\n";
} elseif ($cmd === 'down') {
    $u = Auth::byEmail(CV_ADMIN);
    if ($u) Auth::setStatus((int)$u['id'], 'disabled');
    echo json_encode(['disabled' => (bool)$u]), "\n";
} else {
    fwrite(STDERR, "usage: admin.php up|down [tag]\n");
    exit(2);
}
