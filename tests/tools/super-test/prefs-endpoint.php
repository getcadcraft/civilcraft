<?php
// SPDX-License-Identifier: Apache-2.0
/**
 * One call to the REAL /api/v1/prefs endpoint file, in this process, inside a database transaction that is never committed (the endpoint
 * ends the process; the connection closing rolls everything back). So nothing is ever written to a real person's row, and no test
 * account outlives the call. Run by bin/test-super-prefs.php:
 *   php tools/super-test/prefs-endpoint.php <GET|PUT|DELETE> <scope: sync|full|none|bad> [seed.json] [body.json]
 * Makes a throwaway account through the service layer (Auth::createVerifiedMember, ApiTokens::create), optionally stores `seed` through
 * Prefs::put, then includes the endpoint. Prints the endpoint's JSON, then a line "STATUS <code>".
 */
declare(strict_types=1);
if (PHP_SAPI !== 'cli') exit(1);
require_once dirname(__DIR__, 2) . '/public_html/core/bootstrap.php';
[$method, $scope] = [$argv[1] ?? 'GET', $argv[2] ?? 'sync'];
$read = static fn (?string $f): ?array => $f !== null && $f !== '' && $f !== '-' && is_file($f) ? json_decode((string)file_get_contents($f), true) : null;
db()->beginTransaction();
register_shutdown_function(static function (): void { echo "\nSTATUS ", (int)http_response_code(), "\n"; try { if (db()->inTransaction()) db()->rollBack(); } catch (Throwable) { /* the connection closing rolls it back */ } });
$uid = Auth::createVerifiedMember('prefstest+cadcraft-' . bin2hex(random_bytes(4)) . '@projectz.xyz', 'Prefs Test');
$user = Auth::byId($uid);
$seed = $read($argv[3] ?? null);
if ($seed) Prefs::put($user, $seed);
$token = $scope === 'none' ? '' : ($scope === 'bad' ? 'ccu_' . str_repeat('0', 40) : ApiTokens::create($uid, $scope === 'full' ? 'personal' : 'device', 'prefs test', null, $scope === 'full' ? 'full' : 'sync')['token']);
$_SERVER['REQUEST_METHOD'] = $method;
$_SERVER['REQUEST_URI'] = '/api/v1/prefs';
$_SERVER['REMOTE_ADDR'] = '203.0.113.' . random_int(1, 250);   // a test network: a refused key never counts against a real one
if ($token !== '') $_SERVER['HTTP_AUTHORIZATION'] = 'Bearer ' . $token;
$body = $read($argv[4] ?? null);
$_POST = $body ?? [];   // api_input() reads $_POST first; the CLI has no request body
require dirname(__DIR__, 2) . '/public_html/api/v1/prefs.php';
