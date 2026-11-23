<?php
// SPDX-License-Identifier: Apache-2.0
/**
 * team-templates-fixture.php: fixtures for browser-team-templates.mjs (D8.12-D, bim-core-11). Two accounts on one team (owner + member,
 * cloud sync open) and a third on no team, each with a device (sync-scope) token, printed as JSON. Fixtures ttpl+cadcraft-<n>@projectz.xyz.
 *   sudo -u www-data php tools/bimcraft-test/team-templates-fixture.php up      → {owner:{id,token,name}, member:{…}, loner:{…}, team:{uuid,name}}
 *   sudo -u www-data php tools/bimcraft-test/team-templates-fixture.php rows    → the team_shared_item rows of the fixtures (JSON)
 *   sudo -u www-data php tools/bimcraft-test/team-templates-fixture.php down    removes every fixture (users, tokens, team files, shared rows)
 * Nothing is mailed (projectz.xyz is log-only).
 */
declare(strict_types=1);
require_once dirname(__DIR__, 2) . '/public_html/core/bootstrap.php';
const LIKE = 'ttpl+cadcraft-%@projectz.xyz';
function fx(int $n): string { return "ttpl+cadcraft-{$n}@projectz.xyz"; }
function ids(): array { $st = db()->prepare('SELECT id FROM users WHERE email LIKE ?'); $st->execute([LIKE]); return array_map('intval', $st->fetchAll(PDO::FETCH_COLUMN)); }
function down(): void
{
    foreach (ids() as $id) {
        $dir = dirname(UserDb::path($id)); UserDb::close($id);
        if (is_dir($dir)) { foreach (glob("$dir/*") ?: [] as $f) @unlink($f); @rmdir($dir); @rmdir(dirname($dir)); }
        foreach (['team_shared_item' => 'owner_user_id', 'api_tokens' => 'user_id', 'user_tokens' => 'user_id', 'audit_log' => 'actor_user_id', 'organization_members' => 'user_id', 'organizations' => 'owner_user_id'] as $t => $c)
            db()->prepare("DELETE FROM $t WHERE $c = ?")->execute([$id]);
        db()->prepare('DELETE FROM users WHERE id = ?')->execute([$id]);
    }
    db()->prepare('DELETE FROM email_log WHERE to_email LIKE ?')->execute([LIKE]);
}
$mode = $argv[1] ?? '';
if ($mode === 'down') { down(); echo "{\"down\":true}\n"; exit(0); }
if ($mode === 'rows') {
    $in = implode(',', ids() ?: [0]);
    echo json_encode(db()->query("SELECT id, kind, name, owner, team_uuid, item_version, LENGTH(body) AS bytes, deleted_at FROM team_shared_item WHERE owner_user_id IN ($in)")->fetchAll()), "\n"; exit(0);
}
if ($mode !== 'up') { fwrite(STDERR, "usage: up|rows|down\n"); exit(2); }
down();
$mk = static fn(int $n, string $name): array => Auth::byId((int)Auth::createVerifiedMember(fx($n), $name));
$owner = $mk(1, 'Olive Owner'); $mem = $mk(2, 'Max Member'); $lone = $mk(3, 'Lou Loner');
db()->prepare('UPDATE users SET sync_open = 1 WHERE email LIKE ?')->execute([LIKE]);
$team = UserTeams::createTeam($owner, 'Studio North')['team'];
$p = UserTeams::savePerson($owner, fx(2), '')['person']['uuid'];
UserTeams::addMember($owner, $team['uuid'], $p, 'member');
$tok = static fn(array $u, string $n): string => ApiTokens::create((int)$u['id'], 'device', $n)['token'];
echo json_encode([
    'owner' => ['id' => (int)$owner['id'], 'name' => 'Olive Owner', 'token' => $tok($owner, 'ttpl owner')],
    'member' => ['id' => (int)$mem['id'], 'name' => 'Max Member', 'token' => $tok($mem, 'ttpl member')],
    'loner' => ['id' => (int)$lone['id'], 'name' => 'Lou Loner', 'token' => $tok($lone, 'ttpl loner')],
    'team' => ['uuid' => $team['uuid'], 'name' => 'Studio North'],
]), "\n";
