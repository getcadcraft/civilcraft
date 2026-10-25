<?php
// SPDX-License-Identifier: Apache-2.0
/**
 * A published fixture add-on for the browser checks (tools/addons-test/browser-directory.mjs; 0.4 part 2, session addons).
 *   sudo -u www-data php tools/addons-test/directory-fixture.php up    → {"id", "version", "key", "public"} — zz-test.pipes 1.0.0
 *        uploaded by the add-ons test admin and approved, signed with a THROWAWAY key (never the production one)
 *   sudo -u www-data php tools/addons-test/directory-fixture.php down  → the fixture add-on's rows and stored package removed
 */
declare(strict_types=1);
require_once dirname(__DIR__, 2) . '/public_html/core/bootstrap.php';

$cmd = $argv[1] ?? '';
$clean = function (): void {
    $pdo = db();
    $ids = $pdo->query("SELECT id FROM addons WHERE addon_id LIKE 'zz-test.%'")->fetchAll(PDO::FETCH_COLUMN);
    if (!$ids) return;
    $in = implode(',', array_fill(0, count($ids), '?'));
    $st = $pdo->prepare("SELECT storage_path FROM addon_versions WHERE addon_pk IN ($in)");
    $st->execute($ids);
    $paths = $st->fetchAll(PDO::FETCH_COLUMN);
    $pdo->prepare("DELETE FROM addon_versions WHERE addon_pk IN ($in)")->execute($ids);
    $pdo->prepare("DELETE FROM addons WHERE id IN ($in)")->execute($ids);
    foreach ($paths as $p) if (is_file(AddonPackages::root() . '/' . $p)) @unlink(AddonPackages::root() . '/' . $p);
};
if ($cmd === 'down') { $clean(); echo json_encode(['down' => true]), "\n"; exit(0); }
if ($cmd !== 'up') { fwrite(STDERR, "usage: directory-fixture.php up|down\n"); exit(2); }
$clean();
$staff = Auth::byEmail('addonstest+cadcraft@projectz.xyz');
if (!$staff) { Auth::upsertAdmin('addonstest+cadcraft@projectz.xyz', bin2hex(random_bytes(12))); $staff = Auth::byEmail('addonstest+cadcraft@projectz.xyz'); }
if ($staff['status'] !== 'active') { Auth::setStatus((int)$staff['id'], 'active'); $staff = Auth::byEmail('addonstest+cadcraft@projectz.xyz'); }
$tmp = CC_ROOT . '/tmp/addons-fixture-' . bin2hex(random_bytes(4));
mkdir($tmp, 0770, true);
$kp = sodium_crypto_sign_keypair();
file_put_contents($tmp . '/k', base64_encode($kp));
AddonSigning::$keyFile = $tmp . '/k';
AddonSigning::$keyIdOverride = 'zz-test-key';
$fix = dirname(__DIR__) . '/addons-test/cadcraft/pipes';
$man = json_decode((string)file_get_contents($fix . '/addon.json'), true);
$man['id'] = 'zz-test.pipes';
$man['version'] = '1.0.0';
$man['description'] = 'Pipes and pipe runs for CadCraft: a test add-on used by the directory checks.';
$z = new ZipArchive();
$z->open($tmp . '/p.zip', ZipArchive::CREATE);
$z->addFromString('addon.json', json_encode($man, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
$z->addFromString('main.js', (string)file_get_contents($fix . '/main.js'));
$z->addFromString('lang/en.json', (string)file_get_contents($fix . '/lang/en.json'));
$z->addFromString('LICENSE', "Apache License\nVersion 2.0, January 2004\n(test fixture)\n");
$z->close();
$r = Addons::submit($staff, $tmp . '/p.zip', ['first_party' => false]);
if (!$r['ok']) { fwrite(STDERR, json_encode($r) . "\n"); exit(1); }
$a = Addons::review($staff, (int)$r['version_id'], 'approve', 'Fixture.');
if (!$a['ok']) { fwrite(STDERR, json_encode($a) . "\n"); exit(1); }
echo json_encode(['id' => 'zz-test.pipes', 'version' => '1.0.0', 'key' => 'zz-test-key', 'public' => base64_encode(sodium_crypto_sign_publickey($kp))]), "\n";
@unlink($tmp . '/k'); @unlink($tmp . '/p.zip'); @rmdir($tmp);
