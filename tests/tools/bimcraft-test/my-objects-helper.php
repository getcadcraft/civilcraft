<?php
// SPDX-License-Identifier: Apache-2.0
/**
 * Helper for tools/bimcraft-test/browser-my-objects.mjs (PO.1). Run as www-data.
 *   php my-objects-helper.php token   → {"token": "ccu_…", "id": N}  a personal Library token for the test admin (one hour)
 *   php my-objects-helper.php clean <token id> [name]  → revokes it and removes the private objects the test left whose name holds [name] (default "Wall shelf"; soft)
 */
declare(strict_types=1);
require_once dirname(__DIR__, 2) . '/public_html/core/bootstrap.php';
$u = Auth::byEmail('mctest+cadcraft@projectz.xyz');
if (!$u) { fwrite(STDERR, "no test admin\n"); exit(1); }
if (($argv[1] ?? '') === 'token') {
    $t = ApiTokens::create((int)$u['id'], 'personal', 'PO.1 browser test', gmdate('Y-m-d H:i:s', time() + 3600));
    echo json_encode(['token' => $t['token'], 'id' => $t['id']]), "\n";
} elseif (($argv[1] ?? '') === 'clean') {
    if ((int)($argv[2] ?? 0) > 0) ApiTokens::revoke($u, (int)$argv[2]);
    $n = 0;
    foreach (LibraryPrivate::mine($u, ['q' => (string)($argv[3] ?? 'Wall shelf')], 1, 100)['items'] as $i) { if (LibraryPrivate::remove($u, (string)$i['uuid'])['ok']) $n++; }
    echo json_encode(['removed' => $n]), "\n";
}
