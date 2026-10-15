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
 * App-specific settings: a build may bring settings.inc (one or more <fieldset class="shell-set">). It gets a panel
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
 * Reads $app (Catalog app) and $__build (AppBuilds::resolve()); app-shell.inc has called Lang::use().
 */
$__own_settings = !empty($__build['dir']) && is_file($__build['dir'] . '/settings.inc') ? $__build['dir'] . '/settings.inc' : null;
$__panels = AppBuilds::panels($__build);   // [] for builds without manifest "panels": nothing below changes for them
$__an = ['app' => $app['name']];
// Languages to pick: each locale's own name ("@name" in its file: the build's, else the shell's).
$__langs = [];
foreach (Lang::locales((string)($__build['dir'] ?? '')) as $__l) {
    $__name = $__l;
    foreach ([rtrim((string)($__build['dir'] ?? ''), '/') . "/lang/$__l.json", Lang::shellDir() . "/$__l.json"] as $__f) {
        $__j = is_file($__f) ? json_decode((string)file_get_contents($__f), true) : null;
        if (is_array($__j) && is_string($__j['@name'] ?? null) && $__j['@name'] !== '') { $__name = $__j['@name']; break; }
    }
    $__langs[$__l] = $__name;
}
if (!empty($__build['is_dev'])) $__langs[Lang::PSEUDO] = Lang::t('shell.settings.lang.pseudo');
$__lang_cookie = isset($_COOKIE[Lang::COOKIE]) ? (string)$_COOKIE[Lang::COOKIE] : '';
$__lang_pick = isset($__langs[$__lang_cookie]) ? $__lang_cookie : '';
?>
<dialog class="shell-settings<?= method_exists('AppBuilds', 'wideSettings') && AppBuilds::wideSettings($__build) ? ' shell-settings-wide' : '' ?>" data-app-settings data-app="<?= e($app['slug']) ?>" data-app-name="<?= e($app['name']) ?>"<?= $__panels ? ' data-panels="' . e(implode(' ', $__panels)) . '"' : '' ?> aria-labelledby="shell-settings-h">
  <form method="dialog" class="shell-dlg">
    <div class="shell-dlg-head">
      <h2 id="shell-settings-h"><?= Lang::e('shell.settings.title', $__an) ?></h2>
      <button type="submit" class="shell-x" aria-label="<?= Lang::e('shell.settings.close') ?>"><i class="bi bi-x-lg" aria-hidden="true"></i></button>
    </div>
    <?php if ($__own_settings): ?>
      <div class="shell-tabs" role="tablist" aria-label="<?= Lang::e('shell.bar.settings') ?>" data-settings-tabs hidden>
        <button type="button" role="tab" id="shell-tab-app" aria-controls="shell-pane-app" aria-selected="true" data-settings-tab="app"><?= e($app['name']) ?></button>
        <button type="button" role="tab" id="shell-tab-general" aria-controls="shell-pane-general" aria-selected="false" tabindex="-1" data-settings-tab="general"><?= Lang::e('shell.settings.general') ?></button>
      </div>
    <?php endif; ?>
    <div class="shell-dlg-body">
      <?php if ($__own_settings): ?>
        <section class="shell-pane" id="shell-pane-app" role="tabpanel" aria-labelledby="shell-tab-app" data-settings-pane="app">
          <p class="shell-hint-text shell-pane-lede"><?= Lang::e('shell.settings.app_only', $__an) ?></p>
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
      <fieldset class="shell-set">
        <legend><?= Lang::e('shell.settings.theme') ?></legend>
        <div class="shell-seg" role="radiogroup" aria-label="<?= Lang::e('shell.settings.theme') ?>">
          <label><input type="radio" name="theme" value="paper"> <i class="bi bi-sun" aria-hidden="true"></i> <?= Lang::e('shell.settings.theme.paper') ?></label>
          <label><input type="radio" name="theme" value="model"> <i class="bi bi-moon" aria-hidden="true"></i> <?= Lang::e('shell.settings.theme.model') ?></label>
          <label><input type="radio" name="theme" value="system"> <i class="bi bi-circle-half" aria-hidden="true"></i> <?= Lang::e('shell.settings.theme.system') ?></label>
        </div>
        <p class="shell-hint-text"><?= Lang::e('shell.settings.theme.hint') ?></p>
      </fieldset>
<?php if (count($__langs) > 1): ?>

      <fieldset class="shell-set" data-lang-set>
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

      <fieldset class="shell-set">
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

      <fieldset class="shell-set" data-tb-set>
        <legend><?= Lang::e('shell.settings.tb') ?></legend>
        <div class="shell-seg" role="radiogroup" aria-label="<?= Lang::e('shell.settings.tb.buttons') ?>">
          <label><input type="radio" name="tb" value="both"> <i class="bi bi-card-text" aria-hidden="true"></i> <?= Lang::e('shell.settings.tb.both') ?></label>
          <label><input type="radio" name="tb" value="icons"> <i class="bi bi-grid-3x2-gap" aria-hidden="true"></i> <?= Lang::e('shell.settings.tb.icons') ?></label>
          <label><input type="radio" name="tb" value="labels"> <i class="bi bi-fonts" aria-hidden="true"></i> <?= Lang::e('shell.settings.tb.labels') ?></label>
        </div>
        <label class="shell-check" data-tb-groups-row><input type="checkbox" name="tbGroups"> <?= Lang::e('shell.settings.tb.groups') ?></label>
        <div data-tb-touch-row hidden>
          <p class="shell-hint-text mb-1" id="shell-tb-touch-l"><?= Lang::e('shell.settings.tb.touch') ?></p>
          <div class="shell-seg" role="radiogroup" aria-labelledby="shell-tb-touch-l">
            <label><input type="radio" name="tbTouch" value="row"> <i class="bi bi-arrow-left-right" aria-hidden="true"></i> <?= Lang::e('shell.settings.tb.touch.row') ?></label>
            <label><input type="radio" name="tbTouch" value="wrap"> <i class="bi bi-text-wrap" aria-hidden="true"></i> <?= Lang::e('shell.settings.tb.touch.wrap') ?></label>
          </div>
        </div>
        <div class="shell-btns">
          <button type="button" class="btn-line btn-sm-cc" data-tb-arrange><i class="bi bi-arrows-move" aria-hidden="true"></i> <?= Lang::e('shell.settings.tb.arrange') ?></button>
          <button type="button" class="btn-line btn-sm-cc" data-tb-order-reset><?= Lang::e('shell.settings.tb.original') ?></button>
        </div>
        <p class="shell-hint-text"><?= Lang::e('shell.settings.tb.hint') ?></p>
      </fieldset>

      <fieldset class="shell-set">
        <legend><?= Lang::e('shell.settings.panels') ?></legend>
        <div class="shell-row">
          <label for="shell-zoom"><?= Lang::e('shell.settings.zoom') ?></label>
          <select id="shell-zoom" class="select-cc" name="zoom">
            <?php foreach (['0.75' => 'tiny', '0.85' => 'small', '0.92' => 'compact', '1' => 'normal', '1.1' => 'large', '1.25' => 'larger', '1.4' => 'largest'] as $__z => $__zk): ?>
              <option value="<?= $__z ?>"><?= Lang::e('shell.settings.zoom.' . $__zk, ['pct' => (int)round((float)$__z * 100)]) ?></option>
            <?php endforeach; ?>
          </select>
        </div>
        <div class="shell-row">
          <label for="shell-left"><?= Lang::e('shell.settings.left') ?></label>
          <span class="shell-range"><input type="range" id="shell-left" name="left" min="10" max="40" step="0.5"><output for="shell-left" class="tabular" data-out="left"></output></span>
        </div>
        <div class="shell-row">
          <label for="shell-right"><?= Lang::e('shell.settings.right') ?></label>
          <span class="shell-range"><input type="range" id="shell-right" name="right" min="10" max="40" step="0.5"><output for="shell-right" class="tabular" data-out="right"></output></span>
        </div>
        <p class="shell-hint-text"><?= Lang::e('shell.settings.width.hint') ?></p>
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
        <label class="shell-check"><input type="checkbox" name="tips"> <?= Lang::e('shell.settings.tips') ?></label>
      </fieldset>

      <fieldset class="shell-set" data-addons-set hidden>
        <legend><?= Lang::e('shell.addons') ?></legend>
        <ul class="shell-addons" data-addons-list></ul>
        <p class="shell-hint-text"><?= Lang::e('shell.addons.hint', $__an) ?></p>
        <p class="shell-hint-text shell-addon-dev" data-addons-dev hidden><?= Lang::e('shell.addons.dev') ?></p>
      </fieldset>
      <p class="shell-hint-text" data-wide-only hidden><?= Lang::e('shell.settings.wide_only') ?></p>
      </section>
    </div>
    <div class="shell-dlg-foot">
      <button type="button" class="btn-line btn-sm-cc" data-settings-reset><?= Lang::e('shell.settings.reset', $__an) ?></button>
      <button type="submit" class="btn-plot btn-sm-cc"><?= Lang::e('shell.settings.done') ?></button>
    </div>
  </form>
</dialog>
