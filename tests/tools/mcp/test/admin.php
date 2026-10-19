<?php
// SPDX-License-Identifier: Apache-2.0
/**
 * Test admin for the live assistants check (tools/mcp/test/browser-live.mjs; session agents).
 *   sudo -u www-data php tools/mcp/test/admin.php up     → {"email": …, "password": …} (created or re-enabled)
 *   sudo -u www-data php tools/mcp/test/admin.php down   → disabled again (never deleted)
 */
declare(strict_types=1);
require_once dirname(__DIR__, 3) . '/public_html/core/bootstrap.php';

const AGENTS_ADMIN = 'agentstest+cadcraft@projectz.xyz';
$cmd = $argv[1] ?? '';
if ($cmd === 'up') {
    $pw = bin2hex(random_bytes(12));
    Auth::upsertAdmin(AGENTS_ADMIN, $pw);
    $u = Auth::byEmail(AGENTS_ADMIN);
    if ($u && ($u['status'] ?? '') !== 'active') Auth::setStatus((int)$u['id'], 'active');
    echo json_encode(['email' => AGENTS_ADMIN, 'password' => $pw, 'ok' => (bool)$u]), "\n";
} elseif ($cmd === 'down') {
    $u = Auth::byEmail(AGENTS_ADMIN);
    if ($u) Auth::setStatus((int)$u['id'], 'disabled');
    echo json_encode(['disabled' => (bool)$u]), "\n";
} else {
    fwrite(STDERR, "usage: admin.php up|down\n");
    exit(2);
}
