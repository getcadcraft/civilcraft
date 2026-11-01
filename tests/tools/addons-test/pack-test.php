<?php
// SPDX-License-Identifier: Apache-2.0
/**
 * pack-test.php — real first-party add-on folders packed and signed with a THROWAWAY key, for the browser run (0.8 AL.4 / AL.5 / AL.8 / AL.11; al-loader_PART_5).
 * The real signing key (cc-addons-2026-1) is never touched: this makes its own key, and the browser run trusts only that key.
 *
 *   php tools/addons-test/pack-test.php <outdir> <app>:<id>[,<app>:<id>…] [--lab-api]
 *
 * Writes <outdir>/<id>-<version>.json (the package the apps install: files base64, signature), <outdir>/<id>-<version+1patch>.json (a second signed version:
 * addon.json one patch newer, one comment line added to the entry file), and <outdir>/index.json {key:{id,pub}, items:[{id, app, v1:{version,sha256,size}, v2:{…}}]}.
 */
declare(strict_types=1);
require_once dirname(__DIR__, 2) . '/public_html/core/bootstrap.php';
[$out, $spec] = [$argv[1] ?? '', $argv[2] ?? ''];
if ($out === '' || $spec === '') { fwrite(STDERR, "usage: pack-test.php <outdir> <app>:<id>,… [--lab-api]\n"); exit(2); }
if (in_array('--lab-api', $argv, true)) AddonCatalog::$apiOverride = '1.4';
@mkdir($out, 0775, true);
$tmp = tempnam(sys_get_temp_dir(), 'ccak');
file_put_contents($tmp, base64_encode(sodium_crypto_sign_keypair()));
AddonSigning::$keyFile = $tmp; AddonSigning::$keyIdOverride = 'cc-test-throwaway';
$engineDirs = array_map('basename', glob(CC_ROOT . '/lib/*', GLOB_ONLYDIR) ?: []);
$items = [];
$collect = static function (string $dir): array {
    $o = [];
    $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS));
    foreach ($it as $f) {
        if (!$f->isFile() || $f->isLink()) continue;
        $rel = str_replace('\\', '/', substr($f->getPathname(), strlen($dir) + 1));
        if (preg_match('#(^|/)(test|help-held|node_modules)/#', $rel) || preg_match('#(^|/)\.#', $rel)) continue;
        $o[$rel] = (string)file_get_contents($f->getPathname());
    }
    ksort($o, SORT_STRING);
    return $o;
};
$write = static function (array $files) use ($out): array {
    $man = json_decode($files['addon.json'], true);
    $sig = AddonSigning::sign(AddonPackages::digest($man, $files));
    $json = AddonPackages::packageJson($files, ['alg' => 'Ed25519', 'key' => AddonSigning::keyId(), 'sig' => $sig]);
    file_put_contents($out . '/' . $man['id'] . '-' . $man['version'] . '.json', $json);
    return ['version' => $man['version'], 'sha256' => hash('sha256', $json), 'size' => strlen($json), 'permissions' => $man['permissions'] ?? []];
};
foreach (explode(',', $spec) as $pair) {
    [$app, $id] = explode(':', $pair) + [1 => ''];
    $dir = CC_ROOT . "/public_html/assets/apps/$app/dev/addons/$id";
    if (!is_file("$dir/addon.json")) { fwrite(STDERR, "no add-on folder $dir\n"); exit(1); }
    $files = $collect($dir);
    $files = AddonPackages::externalizeImports($files, "addons/$id", $engineDirs)['files'];
    $chk = AddonPackages::check($files, ['first_party' => true]);
    if (!$chk['ok']) { fwrite(STDERR, "$id refused: " . json_encode(array_values(array_filter($chk['findings'], fn($f) => $f['level'] === 'error'))) . "\n"); exit(1); }
    $v1 = $write($files);
    $man = json_decode($files['addon.json'], true);
    [$a, $b, $c] = array_map('intval', explode('.', preg_replace('/-.*/', '', $man['version'])));
    $man['version'] = "$a.$b." . ($c + 1);
    $files2 = $files;
    $files2['addon.json'] = json_encode($man, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "\n";
    $files2[preg_replace('#^\./#', '', $man['entry'])] .= "\n// second signed version (al-loader_PART_5 update run)\n";
    $v2 = $write($files2);
    $items[] = ['id' => $id, 'app' => $app, 'name' => $man['name'], 'v1' => $v1, 'v2' => $v2];
}
// a small synthetic add-on and the engine it needs: proves a DOWNLOADED engine is the one the add-on gets (the app carries no lib/demo)
$engineFiles = ['addon.json' => json_encode(['id' => 'engine.demo', 'name' => 'Demo engine', 'version' => '1.2.0', 'apps' => ['cadcraft', 'bimcraft'], 'api' => '1.0', 'license' => 'Apache-2.0', 'entry' => 'index.js'], JSON_PRETTY_PRINT) . "\n",
    'index.js' => "export const answer = () => import('./k.js').then((m) => m.k);\n", 'k.js' => "export const k = 42;\n", 'LICENSE' => "Apache-2.0\n"];
$eng = $write($engineFiles);
$demo = ['addon.json' => json_encode(['id' => 'engine-demo', 'name' => 'Engine demo', 'version' => '0.1.0', 'apps' => ['cadcraft'], 'api' => '1.0', 'license' => 'Apache-2.0', 'entry' => 'main.js', 'permissions' => [],
        'needs' => [['id' => 'engine.demo', 'range' => '^1.0']], 'imports' => ['engine' => ['demo'], 'host' => ['units.js']]], JSON_PRETTY_PRINT) . "\n",
    'main.js' => "import { answer } from 'engine:demo/index.js';\nimport * as U from 'host:units.js';\nexport async function activate() { globalThis.__engineDemo = { k: await answer(), host: Object.keys(U).length > 0 }; }\n", 'LICENSE' => "Apache-2.0\n"];
$chk = AddonPackages::check($demo, ['first_party' => true]);
if (!$chk['ok']) { fwrite(STDERR, 'demo refused: ' . json_encode($chk['findings']) . "\n"); exit(1); }
$d1 = $write($demo);
file_put_contents($out . '/index.json', json_encode(['key' => ['id' => 'cc-test-throwaway', 'pub' => AddonSigning::publicKey()], 'items' => $items, 'engine' => ['id' => 'engine.demo'] + $eng, 'demo' => ['id' => 'engine-demo'] + $d1], JSON_PRETTY_PRINT));
unlink($tmp);
echo count($items), " add-ons packed, two signed versions each, in $out\n";
