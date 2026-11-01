<?php
// SPDX-License-Identifier: Apache-2.0
/**
 * Test admin of the hub-mode eval runner (tools/mcp/evals/run-hub.mjs; ai_PART_3): its OWN account, because tools/mcp/test/admin.php is shared by other sessions
 * (its `up` resets the password and its `down` disables the account in the middle of someone else's run), and a signed-in session is MINTED here in-process,
 * as tools/shell-test/admin.php does, so the admin sign-in limit (10 tries / 10 min per network, shared with every session on this machine) is never touched.
 *   sudo -u www-data php tools/mcp/evals/hub-admin.php session   → {"cookie": "cc_session=…", "email": …}   (account created or re-enabled)
 *   sudo -u www-data php tools/mcp/evals/hub-admin.php down      → account disabled again (never deleted); its sessions stop working
 */
declare(strict_types=1);
require_once dirname(__DIR__, 3) . '/public_html/core/bootstrap.php';

const HUB_ADMIN = 'aihubtest+cadcraft@projectz.xyz';
$cmd = $argv[1] ?? '';
if ($cmd === 'session') {
    $pw = bin2hex(random_bytes(12));
    Auth::upsertAdmin(HUB_ADMIN, $pw);
    $u = Auth::byEmail(HUB_ADMIN);
    if ($u && ($u['status'] ?? '') !== 'active') { Auth::setStatus((int)$u['id'], 'active'); $u = Auth::byEmail(HUB_ADMIN); }
    $path = CC_ROOT . '/sessions';   // the same store the web server reads (bootstrap.php: CC_ROOT/sessions, SESSION_NAME)
    if (is_dir($path)) session_save_path($path);
    session_name((string)env('SESSION_NAME', 'cc_session'));
    session_id(bin2hex(random_bytes(16)));
    session_start();
    $_SESSION['user_id'] = (int)$u['id'];
    $_SESSION['epoch'] = (int)($u['session_epoch'] ?? 0);
    $id = session_id();
    session_write_close();
    echo json_encode(['cookie' => session_name() . '=' . $id, 'email' => HUB_ADMIN]), "\n";
} elseif ($cmd === 'down') {
    $u = Auth::byEmail(HUB_ADMIN);
    if ($u) Auth::setStatus((int)$u['id'], 'disabled');
    echo json_encode(['disabled' => (bool)$u]), "\n";
} else {
    fwrite(STDERR, "usage: hub-admin.php session|down\n");
    exit(2);
}
