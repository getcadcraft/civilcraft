<?php
// SPDX-License-Identifier: Apache-2.0
/**
 * app-settings.inc — the Settings dialog every app's browser UI carries (app-shell.inc includes it;
 * the app bar's gear button and Ctrl+, open it). assets/js/app-settings.js wires it up and keeps the
 * choices in this browser: the theme is site-wide (the same cc-space / cc_space the Paper/Model toggle
 * uses); everything else is per app (localStorage "cc-app-settings:<slug>").
 *
 * Settings: theme (paper / model / match the system), screen mode on open, toolbar buttons (icons and
 * labels / icons only / labels only, group names, arrange by dragging), panel text size, left and right
 * panel widths (also dragged at the panel edges), full names in tooltips when text is cut off, reset.
 * App-specific settings: a build may bring settings.inc (one or more <fieldset data-sec-group="language" class="shell-set">). It gets a panel
 * of its own — the first tab, named after the app — beside "General" (the shared settings below). They exist only
 * here, inside the app. The app's own JS reads and stores its fields, and listens for "cc-settings-reset" on the
 * dialog to reset them. app-settings.js switches the tabs (without it both panels show, one after the other).
 * Builds with manifest "panels" (AppBuilds::panels) get data-panels on the dialog and, under Panels, "Reset layout"
 * and "Move panels to a new window" (wired by assets/js/app-panels.js).
 * Language (0.4 item 0.2): the locales the build has a language file for (+ the pseudo-locale en-XA in dev builds) and
 * "Automatic"; app-settings.js writes the cc_lang cookie (as i18n.js setLocale) and offers a reload. Shown only when
 * there is more than one to pick. Every word here is a shell string (assets/lang/shell, shell.settings.*).
 * Add-ons (0.4 item A.2): [data-addons-set] stays hidden until the app's add-on loader (assets/js/addons.js, the build's
 * copy) fills it with one row per add-on found.
 * Units (0.7 UNITS): [data-units-set], only for builds that carry lib/units (dev/unit-settings.js, tools/units/sync.mjs);
 * app-settings.js imports that copy and it fills [data-units-list]: one list per kind, a switch and a star per unit.
 * Sections (0.7, data-shell-07): the tabs are <App> | Global; app-settings.js lists the picked tab's fieldsets on the left
 * and shows the one picked on the right.
 * Reads $app (Catalog app) and $__build (AppBuilds::resolve()); app-shell.inc has called Lang::use().
 */
$__own_settings = !empty($__build['dir']) && is_file($__build['dir'] . '/settings.inc') ? $__build['dir'] . '/settings.inc' : null;
$__panels = AppBuilds::panels($__build);   // [] for builds without manifest "panels": nothing below changes for them
$__an = ['app' => $app['name']];
// Languages to pick: each locale's own name ("@name" in its file: the build's, else the shell's).
$__langs = [];
foreach (Lang::available((string)($__build['dir'] ?? '')) as $__l) {   // the build's files + language packs (docs/LANG-PACKS.md)
    $__name = $__l;
    foreach ([rtrim((string)($__build['dir'] ?? ''), '/') . "/lang/$__l.json", Lang::shellDir() . "/$__l.json"] as $__f) {
        $__n = Lang::nameOf($__f);   // the file's head only (0.9 FX.141): decoding every locale in full cost 150 ms per app page
        if ($__n !== null) { $__name = $__n; break; }
    }
    if ($__name === $__l && class_exists('LangPacks') && ($__pi = LangPacks::index())) $__name = (string)($__pi['locales'][$__l]['name'] ?? $__l);   // a pack-only locale: the pack's name
    $__langs[$__l] = $__name;
}
if (!empty($__build['is_dev'])) $__langs[Lang::PSEUDO] = Lang::t('shell.settings.lang.pseudo');
$__lang_cookie = isset($_COOKIE[Lang::COOKIE]) ? (string)$_COOKIE[Lang::COOKIE] : '';
$__lang_pick = isset($__langs[$__lang_cookie]) ? $__lang_cookie : '';
// 0.6 layout tools (session shell-ui: DF.8 Reset the layout + Show bars, DF.27 toolbar menu + lock + ribbon pin, DF.28 Interface
// size): dev builds and releases from 0.6 on. Worked out here, not in AppBuilds, so the browser edition / Studio page
// (devshell/render.php and its AppBuilds stub) agrees; the 0.5 releases in /use load the same shell files and see none of it.
$__ver = (string)($__build['version'] ?? '');
/* Version (owner 2026-10-28): always in Settings, because a workspace layout (its own title bar) and a too-full app bar (the "More"
   layout) can take the version chip off the screen. Reuses app-bar.inc's builds list and lab stamp when it ran (app-shell.inc). */
$__vs = ['builds' => $__builds ?? [], 'stamp' => $__stamp ?? null, 'stampTitle' => $__stampTitle ?? '', 'area' => $__area ?? null, 'older' => !empty($__older)];
$__versionSet = static function () use ($app, $__build, $__an, $__vs): void {
    $label = (string)($__build['label'] ?? $__build['version'] ?? '');
    $__shotV = shot_mode();   // ?shot=1: the release number, no "dev", no stamp, no area, no other builds
    if ($__shotV) { $label = shot_version(); $__vs['stamp'] = null; $__vs['area'] = null; $__vs['builds'] = []; }
    $note = $__shotV ? '' : (!empty($__build['is_dev']) ? Lang::t('shell.bar.ver.dev')
        : (($__build['current'] ?? '') === ($__build['version'] ?? null) ? Lang::t('shell.bar.ver.current') : ($__vs['older'] ? Lang::t('shell.settings.version.older') : '')));
    $stamp = $__vs['stamp'];
    $area = $__vs['area'];
    $areaName = $area ? (Lang::has('shell.bar.area.' . $area['key']) ? Lang::t('shell.bar.area.' . $area['key']) : (string)$area['label']) : '';
    $builds = array_values(array_filter($__vs['builds'], static fn ($b) => $b['v'] !== ($__build['version'] ?? '') && !($b['v'] === 'dev' && !empty($__build['is_dev']))));
    ?>
    <fieldset class="shell-set" data-version-set>
      <legend><?= Lang::e('shell.settings.version.legend') ?></legend>
      <p class="shell-hint-text"><?= Lang::e('shell.settings.version.hint', $__an) ?></p>
      <dl class="shell-version">
        <dt><?= Lang::e('shell.settings.version.version') ?></dt>
        <dd data-version-label><?= e($app['name'] . ' ' . $label) ?><?= $note !== '' ? ' (' . e($note) . ')' : '' ?></dd>
        <?php if (!empty($__build['is_dev']) && $stamp): ?>
        <dt><?= Lang::e('shell.settings.version.build') ?></dt>
        <dd title="<?= e($__vs['stampTitle']) ?>"><code><?= e($stamp['hash']) ?></code> <?= e(fmt_date($stamp['time'], 'M j, Y H:i T')) ?></dd>
        <?php endif; ?>
        <?php if ($areaName !== ''): ?>
        <dt><?= Lang::e('shell.settings.version.area') ?></dt>
        <dd><?= e($areaName) ?></dd>
        <?php endif; ?>
        <?php if ($builds): ?>
        <dt><?= Lang::e('shell.settings.version.others') ?></dt>
        <dd><ul class="shell-version-list"><?php foreach ($builds as $b): ?><li><a href="<?= e($b['href']) ?>"><?= e($b['v']) ?></a><?= $b['note'] !== '' ? ' <span class="shell-hint-text">' . e($b['note']) . '</span>' : '' ?></li><?php endforeach; ?></ul></dd>
        <?php endif; ?>
      </dl>
    </fieldset>
<?php };
$__shell_07 = !empty($__build['is_dev']) || (preg_match('/^\d{1,3}\.\d{1,3}(\.\d{1,3})?$/', (string)($__build['version'] ?? '')) === 1 && version_compare((string)$__build['version'], '0.7', '>='));   // 0.7 PANEL-COMPACT (session shell-07): layout density, panel title bars
$__shell_ui = !empty($__build['is_dev']) || (preg_match('/^\d{1,3}\.\d{1,3}(\.\d{1,3})?$/', $__ver) === 1 && version_compare($__ver, '0.6', '>='));
?>
<?php if ($__shell_ui): /* 0.6 DF.28: the interface size before the app's own scripts measure anything (app-settings.js keeps it after) */ ?>
<script>(function () { try { var v = JSON.parse(localStorage.getItem(<?= json_embed('cc-app-settings:' . $app['slug']) ?>) || '{}').ui; if (typeof v === 'number' && v >= 0.8 && v <= 1.4 && v !== 1) { document.documentElement.style.setProperty('--shell-ui', String(v)); document.documentElement.classList.add('shell-ui-sized'); } } catch (e) {} })();</script>
<?php endif; ?>
<?php if ($__shell_07): /* 0.7 PANEL-COMPACT: the layout density before first paint (html[data-cc-density]; Comfortable sets nothing) */ ?>
<script>(function () { try { var v = JSON.parse(localStorage.getItem(<?= json_embed('cc-app-settings:' . $app['slug']) ?>) || '{}').density; if (v === 'compact') document.documentElement.setAttribute('data-cc-density', 'compact'); } catch (e) {} })();</script>
<?php endif; ?>
<dialog class="shell-settings<?= method_exists('AppBuilds', 'wideSettings') && AppBuilds::wideSettings($__build) ? ' shell-settings-wide' : '' ?>" data-app-settings data-app="<?= e($app['slug']) ?>" data-app-name="<?= e($app['name']) ?>"<?= $__panels ? ' data-panels="' . e(implode(' ', $__panels)) . '"' : '' ?><?= $__shell_ui ? ' data-shell-ui' : '' ?><?= $__shell_07 ? ' data-shell-07' : '' ?> aria-labelledby="shell-settings-h">
  <form method="dialog" class="shell-dlg">
    <div class="shell-dlg-head">
      <h2 id="shell-settings-h"><?= Lang::e('shell.settings.title', $__an) ?></h2>
      <button type="submit" class="shell-x" aria-label="<?= Lang::e('shell.settings.close') ?>"><i class="bi bi-x-lg" aria-hidden="true"></i></button>
    </div>
    <?php if ($__own_settings): ?>
      <div class="shell-tabs" role="tablist" aria-label="<?= Lang::e('shell.bar.settings') ?>" data-settings-tabs hidden>
        <button type="button" role="tab" id="shell-tab-app" aria-controls="shell-pane-app" aria-selected="true" data-settings-tab="app"><?= e($app['name']) ?></button>
        <button type="button" role="tab" id="shell-tab-general" aria-controls="shell-pane-general" aria-selected="false" tabindex="-1" data-settings-tab="general"><?= Lang::e($__shell_07 ? 'shell.settings.global' : 'shell.settings.general') ?></button>
      </div>
    <?php endif; ?>
    <div class="shell-dlg-body">
      <?php if ($__own_settings): ?>
        <section class="shell-pane" id="shell-pane-app" role="tabpanel" aria-labelledby="shell-tab-app" data-settings-pane="app">
          <p class="shell-hint-text shell-pane-lede"><?= Lang::e('shell.settings.app_only', $__an) ?></p>
          <?php $__versionSet(); ?>
          <?php if (AppBuilds::input($__build)): /* menus, keys and mouse (0.5 track IP): assets/js/app-input-ui.js fills it */ ?>
          <fieldset class="shell-set shell-set-wide" data-input-set>
            <legend><?= Lang::e('shell.input.legend') ?></legend>
            <div data-input-settings><p class="shell-hint-text"><?= Lang::e('shell.input.loading') ?></p></div>
          </fieldset>
          <?php endif; ?>
          <?php require $__own_settings; ?>
        </section>
      <?php endif; ?>
      <section class="shell-pane" id="shell-pane-general"<?= $__own_settings ? ' role="tabpanel" aria-labelledby="shell-tab-general"' : '' ?> data-settings-pane="general">
      <?php if (!$__own_settings) $__versionSet(); ?>
<?php if ($__shell_ui): /* 0.6 DF.8: the way back when a bar, a menu or a panel went missing */ ?>
      <fieldset data-sec-group="interface" class="shell-set" data-layout-set>
        <legend><?= Lang::e('shell.layout') ?></legend>
        <?php /* 0.7 workspace layouts (owner 2026-10-24): one choice for every app (localStorage cc-workspace, app-settings.js); an app that
           has no such layout yet keeps its standard one. Names say how the workspace works, never which program it resembles. */
        $__ws = AppBuilds::workspaces($__build); ?>
        <section class="shell-group" aria-labelledby="shell-grp-pick"><h3 class="shell-group-h" id="shell-grp-pick"><?= Lang::e('shell.group.pick') ?></h3>
        <p class="shell-hint-text" id="shell-ws-h"><?= Lang::e('shell.ws.label') ?></p>
        <?php /* 0.9 FX.83: the layouts are a drop-down of two-line choices (the radios stay in the pop-up; app-settings.js shows/hides it) */ ?>
        <div class="shell-ws-pick" data-ws-pick>
        <button type="button" class="shell-ws-trigger" data-ws-trigger aria-haspopup="true" aria-expanded="false" aria-controls="shell-ws-pop" aria-labelledby="shell-ws-h shell-ws-cur"><span class="shell-ws-cur" id="shell-ws-cur" data-ws-cur></span><i class="bi bi-caret-down-fill" aria-hidden="true"></i></button>
        <div class="shell-ws-pop" id="shell-ws-pop" data-ws-pop>
        <div class="shell-seg shell-seg-col" role="radiogroup" aria-labelledby="shell-ws-h" data-ws-set>
          <label class="shell-ws-opt"><input type="radio" name="workspace" value="standard"> <i class="bi bi-layout-text-window" aria-hidden="true"></i> <span><span class="shell-ws-name"><?= Lang::e('shell.ws.standard') ?></span> <span class="shell-hint-text shell-ws-hint"><?= Lang::e('shell.ws.standard.hint') ?></span></span></label>
          <?php foreach (['docked' => 'bi-layout-sidebar-inset', 'toolbox' => 'bi-tools', 'autorev' => 'bi-layout-sidebar', 'duncan' => 'bi-layout-three-columns', 'vector' => 'bi-window-desktop', 'sketch' => 'bi-box'] as $__wk => $__wi): $__won = in_array($__wk, $__ws, true); ?>
          <label class="shell-ws-opt<?= $__won ? '' : ' is-off' ?>"><input type="radio" name="workspace" value="<?= $__wk ?>"<?= $__won ? '' : ' disabled' ?>> <i class="bi <?= $__wi ?>" aria-hidden="true"></i> <span><span class="shell-ws-name"><?= Lang::e('shell.ws.' . $__wk) ?><?php if (!$__won): ?> <span class="shell-hint-text">(<?= Lang::e($__wk === 'toolbox' ? 'shell.ws.notbuilt' : 'shell.ws.notyet', $__an) ?>)</span><?php endif; ?></span> <span class="shell-hint-text shell-ws-hint"><?= Lang::e('shell.ws.' . $__wk . '.hint') ?></span></span></label>
          <?php endforeach; ?>
        </div>
        <?php /* 0.7 WS.17: layouts from add-ons and imported files (app-settings.js fills these from the engine, assets/js/app-workspace.js;
           a page without the engine leaves them hidden) */ ?>
        <div class="shell-ws-extra" data-ws-extra hidden>
          <p class="shell-hint-text"><?= Lang::e('shell.ws.extra') ?></p>
          <div class="shell-seg shell-seg-col" role="radiogroup" aria-label="<?= Lang::e('shell.ws.extra') ?>" data-ws-extra-list></div>
        </div>
        </div>
        </div>
        <?php /* 0.9 FX.82: a layout for this app alone (cc-workspace-app); off = follows the choice above for every app */ ?>
        <label class="shell-ws-perapp"><input type="checkbox" data-ws-perapp> <span><?= Lang::e('shell.ws.perapp') ?> <strong data-ws-perapp-name></strong></span></label>
        <p class="shell-hint-text"><?= Lang::e('shell.ws.perapp.hint') ?></p>
        <p class="shell-hint-text"><?= Lang::e('shell.ws.hint') ?></p>
        </section>
        <section class="shell-group" aria-labelledby="shell-grp-files"><h3 class="shell-group-h" id="shell-grp-files"><?= Lang::e('shell.group.files') ?></h3>
        <?php /* 0.7 WS.25 (Discord 2026-10-24): build a layout of your own from the blocks; the engine's dialog (app-workspace-arrange.js) */ ?>
        <div class="shell-btns" data-ws-arrange-row hidden>
          <button type="button" class="btn-line btn-sm-cc" data-ws-arrange><i class="bi bi-grid-1x2" aria-hidden="true"></i> <?= Lang::e('shell.ws.arrange') ?></button>
        </div>
        <div class="shell-btns" data-ws-io hidden>
          <button type="button" class="btn-line btn-sm-cc" data-ws-import><i class="bi bi-box-arrow-in-down" aria-hidden="true"></i> <?= Lang::e('shell.ws.import') ?></button>
          <button type="button" class="btn-line btn-sm-cc" data-ws-export><i class="bi bi-box-arrow-up" aria-hidden="true"></i> <?= Lang::e('shell.ws.export') ?></button>
          <input type="file" accept=".json,application/json" data-ws-file hidden>
        </div>
        <p class="shell-hint-text" data-ws-io-hint hidden><?= Lang::e('shell.ws.io.hint') ?> <?= Lang::e('shell.ws.drop') ?></p>
        <p class="shell-hint-text" data-ws-io-msg role="status" aria-live="polite"></p>
        </section>
        <?php /* 0.7 WS.24 (Discord 2026-10-24): work environments — the whole setup (layout, menu style and keys, toolbar, panels, My tools)
           for every app, saved under a name, switched, exported and imported (app-settings.js § Work environments) */ ?>
        <section class="shell-group" aria-labelledby="shell-grp-env"><h3 class="shell-group-h" id="shell-grp-env"><?= Lang::e('shell.group.env') ?></h3>
        <div class="shell-env" data-env-set>
          <p class="shell-hint-text" id="shell-env-h"><strong><?= Lang::e('shell.env.label') ?></strong> <?= Lang::e('shell.env.hint') ?></p>
          <div class="shell-env-row">
            <select class="select-cc" data-env-list aria-labelledby="shell-env-h"><option value="" class="select-placeholder"><?= Lang::e('shell.env.none') ?></option></select>
            <button type="button" class="btn-line btn-sm-cc" data-env-use disabled><i class="bi bi-check2-circle" aria-hidden="true"></i> <?= Lang::e('shell.env.use') ?></button>
            <button type="button" class="btn-line btn-sm-cc" data-env-remove disabled><i class="bi bi-x-lg" aria-hidden="true"></i> <?= Lang::e('shell.env.remove') ?></button>
          </div>
          <div class="shell-env-row">
            <input type="text" class="shell-env-name" maxlength="40" data-env-name aria-label="<?= Lang::e('shell.env.name') ?>" placeholder="<?= Lang::e('shell.env.name') ?>">
            <button type="button" class="btn-line btn-sm-cc" data-env-save><i class="bi bi-save" aria-hidden="true"></i> <?= Lang::e('shell.env.save') ?></button>
          </div>
          <div class="shell-btns">
            <button type="button" class="btn-line btn-sm-cc" data-env-import><i class="bi bi-box-arrow-in-down" aria-hidden="true"></i> <?= Lang::e('shell.env.import') ?></button>
            <button type="button" class="btn-line btn-sm-cc" data-env-export disabled><i class="bi bi-box-arrow-up" aria-hidden="true"></i> <?= Lang::e('shell.env.export') ?></button>
            <input type="file" accept=".json,application/json" data-env-file hidden>
          </div>
          <p class="shell-hint-text" data-env-msg role="status" aria-live="polite"></p>
        </div>
        </section>
        <section class="shell-group" aria-labelledby="shell-grp-lost"><h3 class="shell-group-h" id="shell-grp-lost"><?= Lang::e('shell.group.lost') ?></h3>
        <p class="shell-hint-text"><?= Lang::e('shell.layout.lost') ?></p>
        <div class="shell-btns">
          <button type="button" class="btn-line btn-sm-cc" data-layout-reset><i class="bi bi-arrow-counterclockwise" aria-hidden="true"></i> <?= Lang::e('shell.layout.reset') ?></button>
        </div>
        <p class="shell-hint-text"><?= Lang::e('shell.layout.hint', $__an) ?></p>
        </section>
      </fieldset>
      <?php /* 0.9 DU.1 (owner 2026-11-05): the tool icons of layouts that use the CadCraft icon set (Duncan): full colour, or outline in a colour
         the person picks, or each app's own drawings. localStorage cc-icons {style, color}; app-settings.js; the set is assets/js/app-workspace-icons.js */ ?>
      <fieldset data-sec-group="interface" class="shell-set" data-icons-set>
        <legend><?= Lang::e('shell.icons') ?></legend>
        <section class="shell-group" aria-labelledby="shell-grp-icstyle"><h3 class="shell-group-h" id="shell-grp-icstyle"><?= Lang::e('shell.group.ic.style') ?></h3>
        <p class="shell-hint-text" id="shell-ic-h"><?= Lang::e('shell.icons.label') ?></p>
        <div class="shell-seg shell-seg-col" role="radiogroup" aria-labelledby="shell-ic-h">
          <label class="shell-ws-opt"><input type="radio" name="icons" value="full"> <i class="bi bi-palette" aria-hidden="true"></i> <span><span class="shell-ws-name"><?= Lang::e('shell.icons.full') ?></span> <span class="shell-hint-text shell-ws-hint"><?= Lang::e('shell.icons.full.hint') ?></span></span></label>
          <label class="shell-ws-opt"><input type="radio" name="icons" value="outline"> <i class="bi bi-pencil" aria-hidden="true"></i> <span><span class="shell-ws-name"><?= Lang::e('shell.icons.outline') ?></span> <span class="shell-hint-text shell-ws-hint"><?= Lang::e('shell.icons.outline.hint') ?></span></span></label>
          <label class="shell-ws-opt"><input type="radio" name="icons" value="app"> <i class="bi bi-grid-3x3-gap" aria-hidden="true"></i> <span><span class="shell-ws-name"><?= Lang::e('shell.icons.app') ?></span> <span class="shell-hint-text shell-ws-hint"><?= Lang::e('shell.icons.app.hint') ?></span></span></label>
        </div>
        </section>
        <section class="shell-group" aria-labelledby="shell-grp-iccolor"><h3 class="shell-group-h" id="shell-grp-iccolor"><?= Lang::e('shell.group.ic.color') ?></h3>
        <div class="shell-row" data-icons-color-row>
          <label for="shell-ic-color"><?= Lang::e('shell.icons.color') ?></label>
          <input type="color" id="shell-ic-color" data-icons-color value="#1b7fb5">
          <button type="button" class="btn-line btn-sm-cc" data-icons-reset><i class="bi bi-arrow-counterclockwise" aria-hidden="true"></i> <?= Lang::e('shell.icons.reset') ?></button>
        </div>
        <div class="shell-icons-preview" aria-hidden="true" data-icons-preview></div>
        <p class="shell-hint-text"><?= Lang::e('shell.icons.hint') ?></p>
        </section>
      </fieldset>
<?php endif; ?>
      <fieldset data-sec-group="display" class="shell-set">
        <legend><?= Lang::e('shell.settings.theme') ?></legend>
        <div class="shell-seg" role="radiogroup" aria-label="<?= Lang::e('shell.settings.theme') ?>">
          <label><input type="radio" name="theme" value="paper"> <i class="bi bi-sun" aria-hidden="true"></i> <?= Lang::e('shell.settings.theme.paper') ?></label>
          <label><input type="radio" name="theme" value="model"> <i class="bi bi-moon" aria-hidden="true"></i> <?= Lang::e('shell.settings.theme.model') ?></label>
          <label><input type="radio" name="theme" value="system"> <i class="bi bi-circle-half" aria-hidden="true"></i> <?= Lang::e('shell.settings.theme.system') ?></label>
        </div>
        <p class="shell-hint-text"><?= Lang::e('shell.settings.theme.hint') ?></p>
      </fieldset>
<?php if (count($__langs) > 1): ?>

      <fieldset data-sec-group="language" class="shell-set" data-lang-set>
        <legend><?= Lang::e('shell.settings.lang') ?></legend>
        <div class="shell-row">
          <label for="shell-lang"><?= Lang::e('shell.settings.lang.label') ?></label>
          <select id="shell-lang" class="select-cc" name="lang" data-lang-now="<?= e(Lang::locale()) ?>">
            <option value=""<?= $__lang_pick === '' ? ' selected' : '' ?>><?= Lang::e('shell.settings.lang.auto') ?></option>
            <?php foreach ($__langs as $__l => $__name): ?>
              <option value="<?= e($__l) ?>" lang="<?= e($__l === Lang::PSEUDO ? 'en' : $__l) ?>"<?= $__lang_pick === $__l ? ' selected' : '' ?>><?= e($__name) ?></option>
            <?php endforeach; ?>
          </select>
        </div>
        <p class="shell-hint-text" data-lang-hint><?= Lang::e('shell.settings.lang.hint') ?></p>
        <div class="shell-btns" data-lang-reload-row hidden>
          <button type="button" class="btn-plot btn-sm-cc" data-lang-reload><i class="bi bi-arrow-clockwise" aria-hidden="true"></i> <?= Lang::e('shell.settings.lang.reload') ?></button>
        </div>
      </fieldset>
<?php endif; ?>
<?php if (!empty($__build['dir']) && is_file($__build['dir'] . '/unit-settings.js')): /* 0.7 UNITS: the build's copy of lib/units fills it (app-settings.js) */ ?>

      <fieldset class="shell-set shell-set-wide" data-units-set data-units-src="<?= e(($__build['url'] ?? '') . 'unit-settings.js') ?>">
        <legend><?= Lang::e('shell.units.legend') ?></legend>
        <p class="shell-units-global"><i class="bi bi-globe2" aria-hidden="true"></i> <?= Lang::e('shell.units.global') ?></p>
        <p class="shell-hint-text"><?= Lang::e('shell.units.hint') ?></p>
        <div data-units-list><p class="shell-hint-text"><?= Lang::e('shell.units.loading') ?></p></div>
        <p class="shell-hint-text"><?= Lang::e('shell.units.files') ?></p>
      </fieldset>
<?php endif; ?>

<?php if ($__shell_07): /* 0.7: one switch for every app's first-time tour (localStorage cc-tours, site-wide like the theme); each app's own tab keeps its own */ ?>
      <?php /* Hardware specs (owner 2026-10-24): one switch for every app (localStorage cc-hw-share; app-settings.js). On the web the
         specs are shared unless this is ticked; in the desktop app they are not, unless it is unticked. The apps' compute/report.js asks. */ ?>
      <fieldset data-sec-group="other" class="shell-set" data-hw-set>
        <legend><?= Lang::e('shell.hw.legend') ?></legend>
        <label class="shell-check"><input type="checkbox" name="hwNoShare" data-hw-noshare> <?= Lang::e('shell.hw.noshare') ?></label>
        <p class="shell-hint-text"><?= Lang::e('shell.hw.why') ?></p>
        <p class="shell-hint-text" data-hw-default></p>
      </fieldset>
<?php if (!empty($__build['is_dev'])): /* 0.8 D8.14: one switch for every app's full-screen crosshair (localStorage cc-crosshair; app-crosshair.js) */ ?>
      <fieldset data-sec-group="display" class="shell-set" data-crosshair-set>
        <legend><?= Lang::e('shell.crosshair.legend') ?></legend>
        <label class="shell-check"><input type="checkbox" name="crosshairAll" data-crosshair-all> <?= Lang::e('shell.crosshair.all') ?></label>
        <p class="shell-hint-text"><?= Lang::e('shell.crosshair.hint') ?></p>
      </fieldset>
<?php endif; ?>
      <fieldset data-sec-group="other" class="shell-set" data-tours-set>
        <legend><?= Lang::e('shell.tours.legend') ?></legend>
        <label class="shell-check"><input type="checkbox" name="toursAll" data-tours-all> <?= Lang::e('shell.tours.all') ?></label>
        <p class="shell-hint-text"><?= Lang::e('shell.tours.hint') ?></p>
      </fieldset>

<?php endif; ?>
      <fieldset data-sec-group="display" class="shell-set">
        <legend><?= Lang::e('shell.settings.screen') ?></legend>
        <div class="shell-row">
          <label for="shell-screen"><?= Lang::e('shell.settings.screen.label', $__an) ?></label>
          <select id="shell-screen" class="select-cc" name="screen">
            <option value="normal"><?= Lang::e('shell.screen.now.normal') ?></option>
            <option value="full"><?= Lang::e('shell.screen.now.full') ?></option>
            <option value="autohide"><?= Lang::e('shell.screen.now.autohide') ?></option>
          </select>
        </div>
        <p class="shell-hint-text"><?= Lang::e('shell.settings.screen.hint') ?></p>
      </fieldset>

      <fieldset data-sec-group="interface" class="shell-set" data-tb-set>
        <legend><?= Lang::e('shell.settings.tb') ?></legend>
        <section class="shell-group" aria-labelledby="shell-grp-tbbtn"><h3 class="shell-group-h" id="shell-grp-tbbtn"><?= Lang::e('shell.group.tb.buttons') ?></h3>
        <div class="shell-seg" role="radiogroup" aria-label="<?= Lang::e('shell.settings.tb.buttons') ?>">
          <label><input type="radio" name="tb" value="both"> <i class="bi bi-card-text" aria-hidden="true"></i> <?= Lang::e('shell.settings.tb.both') ?></label>
          <label><input type="radio" name="tb" value="icons"> <i class="bi bi-grid-3x2-gap" aria-hidden="true"></i> <?= Lang::e('shell.settings.tb.icons') ?></label>
          <label><input type="radio" name="tb" value="labels"> <i class="bi bi-fonts" aria-hidden="true"></i> <?= Lang::e('shell.settings.tb.labels') ?></label>
        </div>
        <label class="shell-check" data-tb-groups-row><input type="checkbox" name="tbGroups"> <?= Lang::e('shell.settings.tb.groups') ?></label>
        </section>
        <section class="shell-group" aria-labelledby="shell-grp-tbrows"><h3 class="shell-group-h" id="shell-grp-tbrows"><?= Lang::e('shell.group.tb.rows') ?></h3>
        <?php if ($__shell_07): /* 0.8 CP.1(d): one rows setting for every app's toolbar (CadCraft keeps its own in its tab) */ ?>
        <div data-tb-rows-row>
          <p class="shell-hint-text mb-1" id="shell-tb-rows-l"><?= Lang::e('shell.settings.tb.rows') ?></p>
          <div class="shell-seg" role="radiogroup" aria-labelledby="shell-tb-rows-l">
            <label><input type="radio" name="tbRows" value="wrap"> <i class="bi bi-text-wrap" aria-hidden="true"></i> <?= Lang::e('shell.settings.tb.rows.wrap') ?></label>
            <label><input type="radio" name="tbRows" value="2"> <i class="bi bi-layout-split" aria-hidden="true"></i> <?= Lang::e('shell.settings.tb.rows.2') ?></label>
            <label><input type="radio" name="tbRows" value="1"> <i class="bi bi-distribute-vertical" aria-hidden="true"></i> <?= Lang::e('shell.settings.tb.rows.1') ?></label>
          </div>
          <p class="shell-hint-text"><?= Lang::e('shell.settings.tb.rows.hint') ?></p>
        </div>
        <?php endif; ?>
        <div data-tb-touch-row hidden>
          <p class="shell-hint-text mb-1" id="shell-tb-touch-l"><?= Lang::e('shell.settings.tb.touch') ?></p>
          <div class="shell-seg" role="radiogroup" aria-labelledby="shell-tb-touch-l">
            <label><input type="radio" name="tbTouch" value="row"> <i class="bi bi-arrow-left-right" aria-hidden="true"></i> <?= Lang::e('shell.settings.tb.touch.row') ?></label>
            <label><input type="radio" name="tbTouch" value="wrap"> <i class="bi bi-text-wrap" aria-hidden="true"></i> <?= Lang::e('shell.settings.tb.touch.wrap') ?></label>
          </div>
        </div>
        </section>
        <section class="shell-group" aria-labelledby="shell-grp-tbarr"><h3 class="shell-group-h" id="shell-grp-tbarr"><?= Lang::e('shell.group.tb.arrange') ?></h3>
        <div class="shell-btns">
          <button type="button" class="btn-line btn-sm-cc" data-tb-arrange><i class="bi bi-arrows-move" aria-hidden="true"></i> <?= Lang::e('shell.settings.tb.arrange') ?></button>
          <button type="button" class="btn-line btn-sm-cc" data-tb-order-reset><?= Lang::e('shell.settings.tb.original') ?></button>
        </div>
        <p class="shell-hint-text"><?= Lang::e('shell.settings.tb.hint') ?></p>
        <?php if ($__shell_ui): /* 0.6 DF.27: the lock and the right-click menu */ ?>
        <label class="shell-check"><input type="checkbox" name="tbLock" data-tb-lock> <?= Lang::e('shell.settings.tb.lock') ?></label>
        <p class="shell-hint-text"><?= Lang::e('shell.settings.tb.menu_hint') ?></p>
        <?php endif; ?>
        </section>
      </fieldset>

      <?php if ($__shell_ui): /* 0.6 DC.102: pen and touch on the drawing (app-phone.js wires it; shown with a touch screen or a pen) */ ?>
      <fieldset data-sec-group="input" class="shell-set" data-pen-set hidden>
        <legend><?= Lang::e('shell.pen.title') ?></legend>
        <label class="shell-check"><input type="checkbox" name="penPalm" data-pen="palm"> <?= Lang::e('shell.pen.palm') ?></label>
        <p class="shell-hint-text mb-1" id="shell-pen-fingers-l"><?= Lang::e('shell.pen.fingers') ?></p>
        <div class="shell-seg" role="radiogroup" aria-labelledby="shell-pen-fingers-l">
          <label><input type="radio" name="penFingers" value="draw" data-pen="fingers"> <i class="bi bi-hand-index" aria-hidden="true"></i> <?= Lang::e('shell.pen.fingers.draw') ?></label>
          <label><input type="radio" name="penFingers" value="view" data-pen="fingers"> <i class="bi bi-arrows-move" aria-hidden="true"></i> <?= Lang::e('shell.pen.fingers.view') ?></label>
        </div>
        <?php $__dev = AppBuilds::devices($__build); /* 0.8 Track ID: Input devices sets the taps and the pen's buttons (any command) */ ?>
        <div data-pen-own<?= $__dev ? ' hidden' : '' ?>>
        <label class="shell-check"><input type="checkbox" name="penTaps" data-pen="taps"> <?= Lang::e('shell.pen.taps') ?></label>
        <div class="shell-row">
          <label for="shell-pen-side"><?= Lang::e('shell.pen.side') ?></label>
          <select id="shell-pen-side" class="select-cc" name="penSide" data-pen="side">
            <option value="app"><?= Lang::e('shell.pen.app.side') ?></option>
            <option value="undo"><?= Lang::e('shell.pen.undo') ?></option>
            <option value="redo"><?= Lang::e('shell.pen.redo') ?></option>
          </select>
        </div>
        <div class="shell-row">
          <label for="shell-pen-eraser"><?= Lang::e('shell.pen.eraser') ?></label>
          <select id="shell-pen-eraser" class="select-cc" name="penEraser" data-pen="eraser">
            <option value="app"><?= Lang::e('shell.pen.app.eraser') ?></option>
            <option value="undo"><?= Lang::e('shell.pen.undo') ?></option>
            <option value="redo"><?= Lang::e('shell.pen.redo') ?></option>
          </select>
        </div>
        </div>
        <?php if ($__dev): ?><p class="shell-hint-text"><?= Lang::e('shell.dev.pen.moved') ?></p><?php endif; ?>
        <p class="shell-hint-text"><?= Lang::e('shell.pen.hint') ?></p>
      </fieldset>
      <?php endif; ?>

      <?php if (AppBuilds::devices($__build)): /* 0.8 Track ID: input devices, every app or this app (assets/js/app-devices-ui.js fills it) */ ?>
      <fieldset data-sec-group="other" class="shell-set shell-set-wide" data-dev-set>
        <legend><?= Lang::e('shell.dev.legend') ?></legend>
        <div data-dev-settings><p class="shell-hint-text"><?= Lang::e('shell.input.loading') ?></p></div>
      </fieldset>
      <?php endif; ?>

      <?php if (in_array('access', AppBuilds::extras($__build), true)): /* round 3 EG.52: drafting without sight, one switch for every app (assets/js/app-access.js fills it) */ ?>
      <fieldset data-sec-group="input" class="shell-set" data-access-set>
        <legend><?= Lang::e('shell.access.legend') ?></legend>
        <div data-access-settings><p class="shell-hint-text"><?= Lang::e('shell.input.loading') ?></p></div>
      </fieldset>
      <?php endif; ?>

      <fieldset data-sec-group="interface" class="shell-set">
        <legend><?= Lang::e($__shell_ui ? 'shell.settings.sizes' : 'shell.settings.panels') ?></legend>
        <section class="shell-group" aria-labelledby="shell-grp-szsize"><h3 class="shell-group-h" id="shell-grp-szsize"><?= Lang::e('shell.group.sz.text') ?></h3>
        <?php if ($__shell_ui): /* 0.6 DF.28: the whole app's size, beside the panel text size */ ?>
        <div class="shell-row">
          <label for="shell-ui"><?= Lang::e('shell.settings.ui') ?></label>
          <select id="shell-ui" class="select-cc" name="ui" data-ui-size>
            <?php foreach (['0.8', '0.9', '1', '1.1', '1.2', '1.3', '1.4'] as $__u): $__pct = (int)round((float)$__u * 100); ?>
              <option value="<?= $__u ?>"><?= Lang::e($__u === '1' ? 'shell.settings.ui.normal' : 'shell.settings.ui.pct', ['pct' => $__pct]) ?></option>
            <?php endforeach; ?>
          </select>
        </div>
        <p class="shell-hint-text"><?= Lang::e('shell.settings.ui.hint', $__an) ?></p>
        <?php endif; ?>
        <?php if ($__shell_07): /* 0.7 PANEL-COMPACT item 1 */ ?>
        <div class="shell-row">
          <label for="shell-density"><?= Lang::e('shell.settings.density') ?></label>
          <select id="shell-density" class="select-cc" name="density" data-density>
            <option value="comfortable"><?= Lang::e('shell.settings.density.comfortable') ?></option>
            <option value="compact"><?= Lang::e('shell.settings.density.compact') ?></option>
          </select>
        </div>
        <p class="shell-hint-text"><?= Lang::e('shell.settings.density.hint', $__an) ?></p>
        <?php endif; ?>
        <div class="shell-row">
          <label for="shell-zoom"><?= Lang::e('shell.settings.zoom') ?></label>
          <select id="shell-zoom" class="select-cc" name="zoom">
            <?php foreach (['0.75' => 'tiny', '0.85' => 'small', '0.92' => 'compact', '1' => 'normal', '1.1' => 'large', '1.25' => 'larger', '1.4' => 'largest'] as $__z => $__zk): ?>
              <option value="<?= $__z ?>"><?= Lang::e('shell.settings.zoom.' . $__zk, ['pct' => (int)round((float)$__z * 100)]) ?></option>
            <?php endforeach; ?>
          </select>
        </div>
        </section>
        <section class="shell-group" aria-labelledby="shell-grp-szpanel"><h3 class="shell-group-h" id="shell-grp-szpanel"><?= Lang::e('shell.group.sz.panels') ?></h3>
        <div class="shell-row">
          <label for="shell-left"><?= Lang::e('shell.settings.left') ?></label>
          <span class="shell-range"><input type="range" id="shell-left" name="left" min="10" max="40" step="0.5"><output for="shell-left" class="tabular" data-out="left"></output></span>
        </div>
        <div class="shell-row">
          <label for="shell-right"><?= Lang::e('shell.settings.right') ?></label>
          <span class="shell-range"><input type="range" id="shell-right" name="right" min="10" max="40" step="0.5"><output for="shell-right" class="tabular" data-out="right"></output></span>
        </div>
        <p class="shell-hint-text"><?= Lang::e('shell.settings.width.hint') ?></p>
        <?php if ($__shell_07): /* 0.7 sections: kept beside the widths it is about */ ?>
        <p class="shell-hint-text" data-wide-only hidden><?= Lang::e('shell.settings.wide_only') ?></p>
        <?php endif; ?>
        <?php if ($__panels): ?>
          <div class="shell-row" data-panels-row>
            <span><?= Lang::e('shell.settings.panels') ?></span>
            <span class="shell-btns">
              <button type="button" class="btn-line btn-sm-cc" data-panels-reset><i class="bi bi-arrow-counterclockwise" aria-hidden="true"></i> <?= Lang::e('shell.settings.panels.reset') ?></button>
              <?php if (in_array('window', $__panels, true)): ?>
                <button type="button" class="btn-line btn-sm-cc" data-panels-window><i class="bi bi-window-split" aria-hidden="true"></i> <?= Lang::e('shell.settings.panels.window') ?></button>
              <?php endif; ?>
            </span>
          </div>
          <p class="shell-hint-text"><?= Lang::e('shell.settings.panels.hint') ?></p>
        <?php endif; ?>
        </section>
        <section class="shell-group" aria-labelledby="shell-grp-szbeh"><h3 class="shell-group-h" id="shell-grp-szbeh"><?= Lang::e('shell.group.sz.behaviour') ?></h3>
        <label class="shell-check"><input type="checkbox" name="tips"> <?= Lang::e('shell.settings.tips') ?></label>
        <label class="shell-check"><input type="checkbox" name="autofocus"> <?= Lang::e('shell.settings.autofocus') ?></label>
        <p class="shell-hint-text"><?= Lang::e('shell.settings.autofocus.hint') ?></p>
        </section>
      </fieldset>

      <fieldset class="shell-set shell-set-wide" data-addons-set hidden>
        <legend><?= Lang::e('shell.addons') ?></legend>
        <ul class="shell-addons" data-addons-list></ul>
        <p class="shell-hint-text"><?= Lang::e('shell.addons.hint', $__an) ?></p>
        <p class="shell-hint-text shell-addon-dev" data-addons-dev hidden><?= Lang::e('shell.addons.dev') ?></p>
      </fieldset>
      <fieldset class="shell-set shell-set-wide" data-addons-account-set hidden></fieldset>
      <?php if (!$__shell_07): ?>
      <p class="shell-hint-text" data-wide-only hidden><?= Lang::e('shell.settings.wide_only') ?></p>
      <?php endif; ?>
      </section>
    </div>
    <div class="shell-dlg-foot">
      <button type="button" class="btn-line btn-sm-cc" data-settings-reset><?= Lang::e('shell.settings.reset', $__an) ?></button>
      <button type="submit" class="btn-plot btn-sm-cc"><?= Lang::e('shell.settings.done') ?></button>
    </div>
  </form>
</dialog>
