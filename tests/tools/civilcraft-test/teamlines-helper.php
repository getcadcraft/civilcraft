<?php
// SPDX-License-Identifier: Apache-2.0
/**
 * Fixtures for bin/test-civilcraft-teamlines.mjs (0.8 WL.26, app side): a team with a project, three cloud files and three people (owner and editor
 * with a seat, a project viewer), each with a sync token. Accounts tlinetest+cadcraft-<n>@projectz.xyz (log-only domain). Nothing hard-deleted
 * in the product; the fixture rows are removed by `down`, like bin/test-teamwork.php does.
 *   sudo -u www-data php tools/civilcraft-test/teamlines-helper.php up    → JSON { tokens {own, ed, vw}, projects, drawings }
 *   sudo -u www-data php tools/civilcraft-test/teamlines-helper.php down
 */
declare(strict_types=1);
require_once dirname(__DIR__, 2) . '/public_html/core/bootstrap.php';
const LIKE = 'tlinetest+cadcraft%@projectz.xyz';
$fx = static fn (string $n): string => "tlinetest+cadcraft-{$n}@projectz.xyz";
$ids = static fn (array $a): string => implode(',', array_fill(0, count($a), '?'));
$col = static function (string $sql, array $a): array { $s = db()->prepare($sql); $s->execute($a); return array_map('intval', $s->fetchAll(PDO::FETCH_COLUMN)); };
$del = static function (string $sql, array $a) use ($ids): void { if (!$a) return; $s = db()->prepare(str_replace('IN (?)', 'IN (' . $ids($a) . ')', $sql)); $s->execute(array_values($a)); };
$down = static function () use ($ids, $col, $del): void {
    $users = $col('SELECT id FROM users WHERE email LIKE ?', [LIKE]);
    if (!$users) return;
    $orgs = $col('SELECT id FROM organizations WHERE owner_user_id IN (' . $ids($users) . ')', $users);
    $projects = $orgs ? $col('SELECT id FROM projects WHERE organization_id IN (' . $ids($orgs) . ')', $orgs) : [];
    $drawings = $orgs ? $col('SELECT id FROM drawings WHERE organization_id IN (' . $ids($orgs) . ')', $orgs) : [];
    $licenses = $orgs ? $col('SELECT id FROM licenses WHERE organization_id IN (' . $ids($orgs) . ')', $orgs) : [];
    $lines = $projects ? $col('SELECT id FROM shared_lines WHERE project_id IN (' . $ids($projects) . ')', $projects) : [];
    $del('DELETE FROM shared_line_uses WHERE line_id IN (?)', $lines);
    $del('DELETE FROM shared_lines WHERE id IN (?)', $lines);
    $del('DELETE FROM team_notifications WHERE user_id IN (?)', $users);
    $del('DELETE FROM drawings WHERE id IN (?)', $drawings);
    $del('DELETE FROM project_members WHERE project_id IN (?)', $projects);
    $del('DELETE FROM projects WHERE id IN (?)', $projects);
    $del('DELETE FROM license_apps WHERE license_id IN (?)', $licenses);
    $del('DELETE FROM licenses WHERE organization_id IN (?)', $orgs);
    $del('DELETE FROM subscriptions WHERE organization_id IN (?)', $orgs);
    $del('DELETE FROM organization_members WHERE organization_id IN (?)', $orgs);
    $del('DELETE FROM organization_members WHERE user_id IN (?)', $users);
    $del('DELETE FROM audit_log WHERE organization_id IN (?)', $orgs);
    $del('DELETE FROM audit_log WHERE actor_user_id IN (?)', $users);
    $del('DELETE FROM api_tokens WHERE user_id IN (?)', $users);
    $del('DELETE FROM organizations WHERE id IN (?)', $orgs);
    foreach ([str_replace('~', '', 'mec~_license_queue'), str_replace('~', '', 'mec~_fastdata_queue'), 'mecentral_links', 'user_tokens'] as $t) $del("DELETE FROM $t WHERE user_id IN (?)", $users);
    $st = db()->prepare('DELETE FROM email_log WHERE to_email LIKE ?'); $st->execute([LIKE]);
    $del('DELETE FROM users WHERE id IN (?)', $users);
};
$mode = $argv[1] ?? '';
if ($mode === 'down') { $down(); echo "removed\n"; exit(0); }
if ($mode !== 'up') { fwrite(STDERR, "usage: teamlines-helper.php up|down\n"); exit(2); }
$down();
$staff = Auth::upsertAdmin($fx('staff'), bin2hex(random_bytes(12)));
$mk = static fn (string $n, string $name): array => Auth::byId(Auth::createVerifiedMember($GLOBALS['fx']($n), $name));
$own = $mk('own', 'Olive Owner'); $ed = $mk('ed', 'Ed Editor'); $vw = $mk('vw', 'Vi Viewer');
$team = Organizations::createTeam((int)$own['id'], 'TL Test Team');
$oid = (int)$team['org']['id'];
foreach ([$ed, $vw] as $m) Organizations::addMember($oid, (int)$m['id'], 'member', (int)$own['id']);
$g = Licenses::grant((int)$staff['id'], $oid, 3, ['cadcraft', 'civilcraft'], 'month', null, 'tlinetest');
foreach ([$own, $ed, $vw] as $i => $m) Licenses::assign($own, $g['license_ids'][$i], (int)$m['id']);
db()->prepare('UPDATE users SET sync_open = 1 WHERE id IN (?,?,?)')->execute([$own['id'], $ed['id'], $vw['id']]);
foreach (['own', 'ed', 'vw'] as $v) $$v = Auth::byId((int)$$v['id']);
$p1 = Projects::create($own, $oid, 'Site', 'restricted')['project'];
$p2 = Projects::create($own, $oid, 'Roads', 'restricted')['project'];
Projects::addMember($own, (int)$p1['id'], (int)$vw['id'], 'viewer'); Projects::addMember($own, (int)$p1['id'], (int)$ed['id'], 'editor');
Projects::addMember($own, (int)$p2['id'], (int)$ed['id'], 'editor');
$dA = Drawings::create($own, (int)$p1['id'], 'civilcraft', 'Grading A')['drawing'];
$dB = Drawings::create($own, (int)$p1['id'], 'civilcraft', 'Grading B')['drawing'];
$dC = Drawings::create($own, (int)$p2['id'], 'civilcraft', 'Roads grading')['drawing'];
$tok = static fn (array $u): string => ApiTokens::create((int)$u['id'], 'device', 'tlinetest')['token'];
echo json_encode(['tokens' => ['own' => $tok($own), 'ed' => $tok($ed), 'vw' => $tok($vw)], 'projects' => ['p1' => $p1['uuid'], 'p2' => $p2['uuid']], 'drawings' => ['a' => $dA['uuid'], 'b' => $dB['uuid'], 'c' => $dC['uuid']]]) . "\n";
