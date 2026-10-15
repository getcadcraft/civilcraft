<?php
// SPDX-License-Identifier: Apache-2.0
/**
 * render.php — the standalone dev shell's page (docs/DEVSHELL.md): one app's ui.inc inside a small app bar, with the
 * shared settings dialog, the help panel and the language catalog, as plain HTML. No site, no database.
 *
 *   php devshell/render.php                    print the page (serve.mjs runs this on every load when php exists)
 *   php devshell/render.php --out index.html   write it (pack.php ships a pre-rendered devshell/index.html, so a
 *                                              clone without PHP still runs; re-render after editing ui.inc)
 *   … --lang es-MX                             choose the language (default: English; ?lang= when serve.mjs runs it)
 *   … --edition <version>                      the browser edition's page instead (pack.php --edition browser, 0.4
 *                                              part 2 D.1): every URL relative (the edition mirrors the site's
 *                                              assets/… layout and runs from any folder), no version menu, the
 *                                              build in assets/apps/<slug>/<version>/, libraries pinned, the edition
 *                                              flags in #cc-edition (no library, cloud or handoff; D.4)
 *
 * Layout (a packed app repo):  app/ (the build)  devshell/ (this; site/ = the shell files from getcadcraft.com,
 * app.json = the app's catalog entry and pinned libraries). URLs mirror the site, so the build runs unchanged:
 * /assets/apps/<slug>/dev/… = app/, /assets/vendor/<lib>/<version>/… = pinned libraries, other /assets/… = site/.
 */

declare(strict_types=1);

$args = array_slice($argv ?? [], 1);
$out = null;
$lang = getenv('CC_LANG') ?: null;
$edition = null;
for ($i = 0; $i < count($args); $i++) {
    if ($args[$i] === '--out') $out = $args[++$i] ?? null;
    elseif ($args[$i] === '--lang') $lang = $args[++$i] ?? null;
    elseif ($args[$i] === '--edition') $edition = (string)($args[++$i] ?? '');
}
if ($edition !== null && !preg_match('/^(\d{1,3}\.\d{1,3}(\.\d{1,3})?|dev)$/', $edition)) { fwrite(STDERR, "devshell: --edition needs a version (x.y or dev)\n"); exit(1); }
/** URL root: '/' for the dev shell (serve.mjs mirrors the site), './' for the edition (relative to index.html; import
 *  map values must look like URLs, so never a bare 'assets/…'). */
$R = $edition === null ? '/' : './';

require __DIR__ . '/stubs.php';
require_once __DIR__ . '/site/core/classes/Lang.php';
Lang::$shellDir = __DIR__ . '/site/assets/lang/shell';

$__dev = devshell_app();
$app = $__dev['app'];
$__appDir = realpath(__DIR__ . '/../app') ?: (__DIR__ . '/../app');

/** /assets/vendor/<lib>/current/ → the version this app was packed with (app.json "vendor"); relative in the edition. */
function devshell_pin(mixed $v): mixed
{
    global $R;
    if (is_array($v)) return array_map('devshell_pin', $v);
    if (!is_string($v)) return $v;
    $pins = devshell_app()['vendor'] ?? [];
    $v = preg_replace_callback('#/assets/vendor/([a-z0-9._-]+)/current/#', static fn($m) =>
        '/assets/vendor/' . $m[1] . '/' . ($pins[$m[1]] ?? 'current') . '/', $v);
    return $R === './' ? preg_replace('#^/assets/#', './assets/', $v) : $v;
}

$__manifest = devshell_pin(json_decode((string)@file_get_contents("$__appDir/manifest.json"), true) ?: []);
$__area = $edition === null
    ? ['key' => 'lab', 'name' => 'Dev shell', 'label' => 'Dev shell', 'path' => '/', 'public' => false]
    : ['key' => 'edition', 'name' => 'Browser edition', 'label' => 'Browser edition', 'path' => '', 'public' => true];
$__ver = $edition ?? 'dev';
$__build = [
    'slug' => $app['slug'], 'version' => $__ver, 'label' => $__ver, 'dir' => $__appDir,
    'url' => $R . 'assets/apps/' . $app['slug'] . '/' . $__ver . '/', 'is_dev' => $__ver === 'dev', 'is_current' => $edition !== null, 'current' => $edition,
    'manifest' => $__manifest, 'release' => null,
];
Lang::use($__build, $lang !== null && Lang::validLocale($lang) ? $lang : 'en');

$imports = [];
foreach ($__manifest['imports'] ?? [] as $spec => $path) $imports[$spec] = $path;
if (is_file("$__appDir/help/help.js")) $imports['app-help'] = $__build['url'] . 'help/help.js';
$__panels = AppBuilds::panels($__build);
$__site = 'https://getcadcraft.com';
// The edition's own facts for the apps and the shell (0.4 part 2 D.4): features that live only on getcadcraft.com are off.
$__editionData = $edition === null ? null : [
    'edition' => 'browser', 'app' => $app['slug'], 'version' => $edition, 'site' => $__site,
    'library' => false, 'cloud' => false, 'accounts' => false, 'handoff' => false,
];
$__offlineData = $edition === null ? null : [
    'key' => 'edition/' . $app['slug'], 'page' => './', 'sw' => 'sw.js', 'scope' => './',
    'urls' => json_decode((string)@file_get_contents(dirname($__appDir) . '/offline.json'), true) ?: [],   // pack.php stages it beside app/
];

/** The shell's stylesheets (the edition keeps Bootstrap and its icons in assets/vendor/<lib>/<version>/). */
function devshell_shell_css(): array
{
    global $R, $edition;
    $v = devshell_app()['shell'] ?? [];
    return $edition === null
        ? ['/assets/js/bootstrap/current/bootstrap.min.css', '/assets/vendor/bootstrap-icons/current/bootstrap-icons.min.css',
           '/assets/css/tokens.css', '/assets/css/site.css', '/assets/css/app-shell.css', '/assets/css/help.css']
        : ['./assets/vendor/bootstrap/' . $v['bootstrap'] . '/bootstrap.min.css', './assets/vendor/bootstrap-icons/' . $v['bootstrap-icons'] . '/bootstrap-icons.min.css',
           './assets/css/tokens.css', './assets/css/site.css', './assets/css/app-shell.css', './assets/css/help.css'];
}
/** The shell's classic scripts, in order. */
function devshell_shell_js(array $panels, bool $offline): array
{
    global $R, $edition;
    $v = devshell_app()['shell'] ?? [];
    $out = [$edition === null ? '/assets/js/bootstrap/current/bootstrap.bundle.min.js' : './assets/vendor/bootstrap/' . $v['bootstrap'] . '/bootstrap.bundle.min.js',
        $R . 'assets/js/site.js', $R . 'assets/js/app-shell.js', $R . 'assets/js/app-settings.js'];
    if ($panels) $out[] = $R . ltrim(AppBuilds::PANELS_SCRIPT, '/');
    if ($offline) $out[] = $R . 'assets/js/app-offline.js';
    return $out;
}

ob_start();
?>
<!doctype html>
<html lang="<?= e(Lang::locale()) ?>"<?= $edition !== null ? ' data-edition="browser"' : '' ?>>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script>
    (function () {
      var d = document.documentElement, s = null;
      d.classList.add('js');
      try {
        var q = new URLSearchParams(location.search).get('space');
        if (q === 'paper' || q === 'model') { s = q; localStorage.setItem('cc-space', q); }
        else { s = localStorage.getItem('cc-space'); }
      } catch (e) {}
      if (s !== 'paper' && s !== 'model') s = (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) ? 'model' : 'paper';
      d.setAttribute('data-space', s);
    })();
  </script>
<?php if ($edition === null): ?>
  <title><?= e($app['name']) ?> — dev shell</title>
<?php else: ?>
  <title><?= e($app['name'] . ' ' . $edition) ?></title>
  <meta name="description" content="<?= e($app['short'] ?? '') ?>">
  <meta name="generator" content="CadCraft browser edition">
<?php endif; ?>
  <link rel="icon" type="image/svg+xml" href="<?= $R ?>favicon.svg">
<?php foreach (devshell_shell_css() as $__c): ?>
  <link rel="stylesheet" href="<?= e($__c) ?>">
<?php endforeach; ?>
<?php if (AppBuilds::input($__build)): /* menus, keys and mouse (0.5 track IP) */ ?>
  <link rel="stylesheet" href="<?= $R ?>assets/css/app-input.css">
<?php endif; ?>
<?php foreach ($__manifest['css'] ?? [] as $c): ?>
  <link rel="stylesheet" href="<?= e($__build['url'] . $c) ?>">
<?php endforeach; ?>
  <script type="importmap"><?= json_embed(['imports' => (object)$imports]) ?></script>
<?php if (!empty($__manifest['module'])): ?>
  <script type="module" src="<?= e($__build['url'] . $__manifest['module']) ?>"></script>
<?php endif; ?>
</head>
<body class="app-shell layer-<?= e($app['layer'] ?? 'red') ?>">
<header class="app-bar">
  <span class="app-bar-mark" aria-hidden="true"><i class="bi bi-bounding-box"></i></span>
  <div class="app-bar-name">
    <span class="layer-swatch" aria-hidden="true"></span>
    <span><?= e($app['name']) ?></span>
<?php if ($edition === null): ?>
    <span class="app-bar-area">Dev shell</span>
<?php else: ?>
    <span class="app-bar-area"><?= Lang::e('shell.bar.edition') ?></span>
    <span class="app-bar-area app-bar-version"><?= e($edition) ?></span>
<?php endif; ?>
  </div>
  <nav class="app-bar-links" aria-label="<?= e($app['name']) ?>">
    <a href="<?= e($__site) ?>/apps/<?= e($app['slug']) ?>"<?= $edition !== null ? ' target="_blank" rel="noopener"' : '' ?>><?= Lang::e('shell.bar.about', ['app' => $app['name']]) ?></a>
  </nav>
  <button type="button" class="app-bar-btn app-bar-help" data-help-open aria-expanded="false" title="Help (F1)" hidden><i class="bi bi-question-circle" aria-hidden="true"></i><span class="app-bar-btn-label">Help</span></button>
<?php if ($__offlineData !== null): ?>
  <button type="button" class="app-bar-btn app-bar-offline" data-offline aria-live="polite" hidden><i class="bi bi-cloud-arrow-down" aria-hidden="true"></i><span class="app-bar-btn-label" data-offline-label><?= Lang::e('shell.offline.save') ?></span></button>
<?php endif; ?>
  <button type="button" class="app-bar-btn app-bar-settings" data-settings-open aria-haspopup="dialog" aria-expanded="false" title="Settings (Ctrl+,)" hidden><i class="bi bi-gear" aria-hidden="true"></i><span class="app-bar-btn-label">Settings</span></button>
  <button type="button" class="app-bar-fs" data-fs-cycle aria-pressed="false" hidden><i class="bi bi-fullscreen" aria-hidden="true"></i><span class="app-bar-fs-label">Full screen</span></button>
  <form class="space-toggle" method="get" action="<?= $edition === null ? '/' : '' ?>" role="group" aria-label="Drawing space (theme)">
    <button type="submit" name="space" value="paper" aria-pressed="false" title="Paper space: light theme">Paper</button>
    <button type="submit" name="space" value="model" aria-pressed="false" title="Model space: dark theme">Model</button>
  </form>
</header>
<?php require "$__appDir/ui.inc"; ?>
<?php require __DIR__ . '/site/core/components/app-settings.inc'; ?>
<aside class="help-panel" data-help-panel role="complementary" aria-label="Help" data-os-default="windows"<?= $edition !== null ? ' data-site="' . e($__site) . '"' : '' ?> hidden></aside>
<?= Lang::bootTag() ?>
<?php if ($__editionData !== null): ?>
<script type="application/json" id="cc-edition"><?= json_embed($__editionData) ?></script>
<script type="application/json" id="cc-offline"><?= json_embed($__offlineData) ?></script>
<?php endif; ?>
<?php foreach (devshell_shell_js($__panels, $__offlineData !== null) as $__s): ?>
<script src="<?= e($__s) ?>" defer></script>
<?php endforeach; ?>
<?php if (($__phone = AppBuilds::phone($__build)) !== null): /* phones and fold phones (0.5 track PH) */ ?>
<script type="application/json" id="cc-phone"><?= json_embed(['app' => $app['slug'], 'phone' => (object)$__phone]) ?></script>
<script src="<?= $R ?>assets/js/app-phone.js" defer></script>
<?php endif; ?>
<script type="module" src="<?= $R ?>assets/js/help-panel.js"></script>
<?php if ($__input = AppBuilds::input($__build)): ?>
<script type="application/json" id="cc-input"><?= json_embed(['app' => $app['slug'], 'appName' => $app['name'], 'registry' => $__input]) ?></script>
<script type="module" src="<?= $R ?>assets/js/app-input-ui.js"></script>
<?php endif; ?>
</body>
</html>
<?php
$html = (string)ob_get_clean();
if ($out !== null) {
    if (file_put_contents($out, $html) === false) { fwrite(STDERR, "devshell: cannot write $out\n"); exit(1); }
    fwrite(STDERR, "devshell: wrote $out (" . strlen($html) . " bytes, " . Lang::locale() . ")\n");
} else {
    echo $html;
}
