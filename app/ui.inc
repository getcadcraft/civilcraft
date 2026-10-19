<?php
// SPDX-License-Identifier: Apache-2.0
/**
 * CivilCraft site design UI (rendered inside app-shell.inc; $app, $__area, $__build and $__manifest are set).
 * Toolbar: File · Export · Surface · Design · Edit (Undo, Redo, Copy, Paste + More: cut, paste in place, duplicate,
 * delete, select all / none) · GIS (Coordinates, Import, Export, Map — docs/GIS-SPEC.md) · View (Select, Fit, 3D — site-view3d.js, loaded on first use). Settings › CivilCraft is settings.inc.
 * Server-rendered: toolbar, panels, plan and profile canvases, status bar, dialogs. civilcraft.js runs it.
 * Files open on this computer and save as downloads; nothing here posts anywhere.
 *
 *   top     toolbar (role=toolbar, a direct child of <main> so the screen modes can hide it)
 *   left    site (name, units) · points and point groups · surface facts · display
 *   stage   plan view (two canvases) · profile view under it
 *   right   properties of what is selected (alignment + its profile, pad + volumes, structure, pipe, a point) or the project summary
 *   bottom  status bar: easting/northing, elevation, station/offset, messages
 */
Lang::use($__build); echo Lang::bootTag();   // language files (docs/LANG.md); harmless once app-shell.inc does it
/** Lang::e() text whose fills are trusted markup (<kbd>, <strong>, <em>): the text is escaped, then each fill put in. */
$__lx = static function (string $key, array $html): string {
    $mark = [];
    foreach (array_keys($html) as $i => $k) $mark[$k] = "\u{E000}" . $i . "\u{E001}";
    return strtr(Lang::e($key, $mark), array_combine(array_values($mark), array_values($html)));
};
$__tools = [
    'File' => [   // i18n-ignore: the group's key (also its aria-label and data-group-menu); the visible name is ui.tb.group.*
        ['new', 'file-earmark-plus', Lang::t('ui.tb.new'), Lang::t('ui.tb.new.title')],
        ['open', 'folder2-open', Lang::t('ui.tb.open'), Lang::t('ui.tb.open.title')],
        ['save', 'save', Lang::t('ui.tb.save'), Lang::t('ui.tb.save.title')],
    ],
    'Export' => [   // i18n-ignore: the group's key (also its aria-label and data-group-menu); the visible name is ui.tb.group.*
        ['landxml', 'filetype-xml', Lang::t('ui.tb.landxml'), Lang::t('ui.tb.landxml.title')],
        ['dxf', 'vector-pen', Lang::t('ui.tb.dxf'), Lang::t('ui.tb.dxf.title')],
        ['dwg', 'file-earmark-ruled', Lang::t('ui.tb.dwg'), Lang::t('ui.tb.dwg.title')],
        ['pdf', 'printer', Lang::t('ui.tb.pdf'), Lang::t('ui.tb.pdf.title')],
    ],
    'Surface' => [   // i18n-ignore: the group's key (also its aria-label and data-group-menu); the visible name is ui.tb.group.*
        ['breakline', 'bezier2', Lang::t('ui.tb.breakline'), Lang::t('ui.tb.breakline.title')],
        ['boundary', 'bounding-box', Lang::t('ui.tb.boundary'), Lang::t('ui.tb.boundary.title')],
    ],
    'Design' => [   // i18n-ignore: the group's key (also its aria-label and data-group-menu); the visible name is ui.tb.group.*
        ['alignment', 'signpost-split', Lang::t('ui.tb.alignment'), Lang::t('ui.tb.alignment.title')],
        ['pad', 'square', Lang::t('ui.tb.pad'), Lang::t('ui.tb.pad.title')],
        ['pipe', 'diagram-3', Lang::t('ui.tb.pipe'), Lang::t('ui.tb.pipe.title')],
        ['profile', 'graph-up', Lang::t('ui.tb.profile'), Lang::t('ui.tb.profile.title')],
    ],
    'Edit' => [   // i18n-ignore: the group's key (also its aria-label and data-group-menu); the visible name is ui.tb.group.*
        ['undo', 'arrow-counterclockwise', Lang::t('ui.tb.undo'), Lang::t('ui.tb.undo.title')],
        ['redo', 'arrow-clockwise', Lang::t('ui.tb.redo'), Lang::t('ui.tb.redo.title')],
        ['copy', 'copy', Lang::t('ui.tb.copy'), Lang::t('ui.tb.copy.title')],
        ['paste', 'clipboard-plus', Lang::t('ui.tb.paste'), Lang::t('ui.tb.paste.title')],
    ],
    'GIS' => [   // i18n-ignore: the group's key (also its aria-label and data-group-menu); the visible name is ui.tb.group.*
        ['crs', 'globe-americas', Lang::t('ui.tb.crs'), Lang::t('ui.tb.crs.title')],
        ['gis-import', 'box-arrow-in-down', Lang::t('ui.tb.gis-import'), Lang::t('ui.tb.gis-import.title')],
        ['gis-export', 'box-arrow-up', Lang::t('ui.tb.gis-export'), Lang::t('ui.tb.gis-export.title')],
        ['basemap', 'map', Lang::t('ui.tb.basemap'), Lang::t('ui.tb.basemap.title')],
    ],
    'View' => [   // i18n-ignore: the group's key (also its aria-label and data-group-menu); the visible name is ui.tb.group.*
        ['select', 'cursor', Lang::t('ui.tb.select'), Lang::t('ui.tb.select.title')],
        ['fit', 'arrows-fullscreen', Lang::t('ui.tb.fit'), Lang::t('ui.tb.fit.title')],
        ['view3d', 'badge-3d', Lang::t('ui.tb.view3d'), Lang::t('ui.tb.view3d.title')],
    ],
];
// 0.4: a group's More menu (as Edit's) keeps the toolbar on one row at 1440 px: [cmd, label, title, key, role]
$__more = [
    'Surface' => [   // i18n-ignore (the group's key in $__tools, not shown)
        ['cad-open', Lang::t('toolbar.cad'), Lang::t('toolbar.cad.title'), '', 'menuitem'],
        ['feature', Lang::t('toolbar.feature'), Lang::t('toolbar.feature.title'), 'L', 'menuitemcheckbox'],
        ['sections', Lang::t('toolbar.sections'), Lang::t('toolbar.sections.title'), 'X', 'menuitemcheckbox'],
    ],
];
?>
<main id="main" class="cv" data-civilcraft>
  <h1 class="visually-hidden"><?= Lang::e('ui.h1', ['app' => $app['name']]) ?></h1>

  <div class="cv-tools" role="toolbar" aria-label="<?= Lang::e('ui.tools') ?>">
    <?php foreach ($__tools as $__group => $__items): ?>
      <div class="cv-tool-group" role="group" aria-label="<?= e($__group) ?>">
        <span class="cv-tool-label" aria-hidden="true"><?= Lang::e('ui.tb.group.' . strtolower($__group)) ?></span>
        <div class="cv-tool-row">
          <?php foreach ($__items as [$__cmd, $__icon, $__label, $__title]): ?>
            <button type="button" class="cv-tool" data-cmd="<?= e($__cmd) ?>" title="<?= e($__title) ?>">
              <i class="bi bi-<?= e($__icon) ?>" aria-hidden="true"></i><span><?= e($__label) ?></span>
            </button>
          <?php endforeach; ?>
          <?php if (isset($__more[$__group])): ?>
            <details class="cv-menu" data-group-menu="<?= e($__group) ?>">
              <summary class="cv-tool" title="<?= Lang::e('toolbar.more.title', ['group' => Lang::t('ui.tb.group.' . strtolower($__group))]) ?>"><i class="bi bi-three-dots" aria-hidden="true"></i><span><?= Lang::e('toolbar.more') ?></span></summary>
              <div class="cv-menu-list" role="menu">
                <?php foreach ($__more[$__group] as [$__cmd, $__label, $__title, $__key, $__role]): ?>
                  <button type="button" role="<?= e($__role) ?>" data-cmd="<?= e($__cmd) ?>" title="<?= e($__title) ?>"><?= e($__label) ?><?php if ($__key !== ''): ?> <kbd><?= e($__key) ?></kbd><?php endif; ?></button>
                <?php endforeach; ?>
              </div>
            </details>
          <?php endif; ?>
          <?php if ($__group === 'Edit'): ?><?php /* i18n-ignore: the group's key, not shown */ ?>
            <details class="cv-menu" data-edit-menu>
              <summary class="cv-tool" title="<?= Lang::e('ui.edit.more.title') ?>"><i class="bi bi-three-dots" aria-hidden="true"></i><span><?= Lang::e('toolbar.more') ?></span></summary>
              <div class="cv-menu-list" role="menu">
                <button type="button" role="menuitem" data-cmd="cut"><?= Lang::e('ui.edit.cut') ?> <kbd>Ctrl+X</kbd></button>
                <button type="button" role="menuitem" data-cmd="copy"><?= Lang::e('ui.edit.copy') ?> <kbd>Ctrl+C</kbd></button>
                <button type="button" role="menuitem" data-cmd="paste"><?= Lang::e('ui.edit.paste') ?> <kbd>Ctrl+V</kbd></button>
                <button type="button" role="menuitem" data-cmd="paste-in-place"><?= Lang::e('ui.edit.paste_place') ?> <kbd>Ctrl+Shift+V</kbd></button>
                <button type="button" role="menuitem" data-cmd="duplicate"><?= Lang::e('ui.edit.duplicate') ?> <kbd>Ctrl+D</kbd></button>
                <?php /* i18n-ignore: a key name */ ?><button type="button" role="menuitem" data-cmd="delete"><?= Lang::e('ui.edit.delete') ?> <kbd>Delete</kbd></button>
                <hr>
                <button type="button" role="menuitem" data-cmd="select-all"><?= Lang::e('ui.edit.select_all') ?> <kbd>Ctrl+A</kbd></button>
                <button type="button" role="menuitem" data-cmd="select-none"><?= Lang::e('ui.edit.select_none') ?> <kbd>Esc</kbd></button>
              </div>
            </details>
          <?php endif; ?>
        </div>
      </div>
    <?php endforeach; ?>
    <input type="file" class="visually-hidden" accept=".csv,.txt,.pnt,.xyz,.xml,.landxml,.json,.dwg,.dxf,.geojson,.kml,.kmz,.shp,.shx,.dbf,.prj,.cpg,.zip,.gpkg,.tif,.tiff,.asc,.las,.laz,.png,.jpg,.jpeg,.pgw,.pngw,.jgw,.jpgw,.wld" multiple tabindex="-1" aria-hidden="true" data-file>
  </div>

  <aside class="cv-panel cv-left" aria-label="<?= Lang::e('ui.left') ?>">
    <section class="cv-sec">
      <h2 class="cv-h"><?= Lang::e('ui.site') ?></h2>
      <div class="cv-props">
        <label for="cv-name"><?= Lang::e('ui.site.name') ?></label>
        <input type="text" id="cv-name" class="cv-input" maxlength="120" autocomplete="off" data-name>
        <label for="cv-units"><?= Lang::e('ui.site.units') ?></label>
        <select id="cv-units" class="cv-select" data-units>
          <option value="ft"><?= Lang::e('units.ft') ?></option>
          <option value="m"><?= Lang::e('units.m') ?></option>
        </select>
      </div>
      <p class="cv-note"><?= Lang::e('ui.site.units.note') ?></p>
    </section>
    <section class="cv-sec">
      <h2 class="cv-h"><?= Lang::e('ui.points') ?></h2>
      <p class="cv-note" data-points-empty><?= $__lx('ui.points.empty', ['open' => '<strong>' . Lang::e('ui.tb.open') . '</strong>']) ?></p>
      <dl class="cv-dl" data-points-info></dl>
      <table class="cv-groups" data-groups hidden>
        <caption class="cv-note"><?= Lang::e('ui.groups.caption') ?></caption>
        <thead><tr><th scope="col"><?= Lang::e('ui.groups.group') ?></th><th scope="col" class="num"><?= Lang::e('ui.groups.points') ?></th><th scope="col"><?= Lang::e('ui.groups.surface') ?></th></tr></thead>
        <tbody></tbody>
      </table>
      <button type="button" class="btn-line btn-sm-cc cv-codes-open" data-codes-open><?= Lang::e('codes.open') ?></button>
    </section>
    <?php /* GIS: imported GIS layers (gis-vector-ui.js fills the list; hidden until there is one) */ ?>
    <section class="cv-sec cv-gis-layers" data-gis-layers hidden>
      <h2 class="cv-h"><?= Lang::e('v3d.show.gis') ?></h2>
      <ul class="cv-gis-list" data-gis-list></ul>
      <p class="cv-note"><?= Lang::e('ui.gis.note') ?></p>
    </section>
    <section class="cv-sec">
      <h2 class="cv-h" data-surface-h><?= Lang::e('ui.surface') ?></h2>
      <dl class="cv-dl" data-surface-info></dl>
      <div data-surface-report></div>
      <div class="cv-props cv-mt" data-surface-opts>
        <label for="cv-maxedge"><?= Lang::e('ui.maxedge') ?></label>
        <div class="cv-row"><input type="number" id="cv-maxedge" class="cv-input" min="0" step="any" data-maxedge><span class="cv-unit" data-unit></span></div>
      </div>
      <p class="cv-note"><?= Lang::e('ui.maxedge.note') ?></p>
      <div class="cv-links" data-surface-actions></div>
    </section>
    <section class="cv-sec">
      <h2 class="cv-h"><?= Lang::e('ui.display') ?></h2>
      <div class="cv-props">
        <label for="cv-showsurf"><?= Lang::e('ui.surface') ?></label>
        <select id="cv-showsurf" class="cv-select" data-show-surface>
          <option value="eg"><?= Lang::e('surface.eg') ?></option>
          <option value="fg"><?= Lang::e('ui.display.fg') ?></option>
        </select>
        <label for="cv-interval"><?= Lang::e('ui.display.interval') ?></label>
        <div class="cv-row"><select id="cv-interval" class="cv-select" data-interval></select></div>
        <label for="cv-major"><?= Lang::e('ui.display.major') ?></label>
        <select id="cv-major" class="cv-select" data-major>
          <option value="2"><?= Lang::e('ui.display.major.2') ?></option>
          <option value="4"><?= Lang::e('ui.display.major.4') ?></option>
          <option value="5"><?= Lang::e('ui.display.major.5') ?></option>
          <option value="10"><?= Lang::e('ui.display.major.10') ?></option>
        </select>
        <label for="cv-bands"><?= Lang::e('ui.display.bands') ?></label>
        <select id="cv-bands" class="cv-select" data-bandcount>
          <option value="5">5</option><option value="8">8</option><option value="10">10</option><option value="12">12</option>
        </select>
      </div>
      <fieldset class="cv-checks" data-checks>
        <legend class="visually-hidden"><?= Lang::e('v3d.show') ?></legend>
        <label><input type="checkbox" data-show="contours"> <?= Lang::e('ui.show.contours') ?></label>
        <label><input type="checkbox" data-show="labels"> <?= Lang::e('ui.show.labels') ?></label>
        <label><input type="checkbox" data-show="triangles"> <?= Lang::e('ui.show.triangles') ?></label>
        <label><input type="checkbox" data-show="bands"> <?= Lang::e('ui.show.bands') ?></label>
        <label><input type="checkbox" data-show="slopes"> <?= Lang::e('ui.show.slopes') ?></label>
        <label><input type="checkbox" data-show="points"> <?= Lang::e('ui.show.points') ?></label>
        <label><input type="checkbox" data-show="pointLabels"> <?= Lang::e('ui.show.pointlabels') ?></label>
        <label><input type="checkbox" data-show="breaklines"> <?= Lang::e('ui.show.breaklines') ?></label>
        <label title="<?= Lang::e('ui.show.grades.title') ?>"><input type="checkbox" data-show="gradeOverlay"> <?= Lang::e('ui.show.grades') ?></label>
        <label><input type="checkbox" data-show="outline"> <?= Lang::e('ui.show.outline') ?></label>
        <label><input type="checkbox" data-show="pipes"> <?= Lang::e('ui.show.pipes') ?></label>
      </fieldset>
      <div class="cv-legend" data-legend hidden></div>
    </section>
  </aside>

  <section class="cv-stage" aria-label="<?= Lang::e('ui.stage') ?>" data-stage>
    <div class="cv-plan" data-plan>
      <canvas class="cv-canvas" data-base aria-hidden="true"></canvas>
      <canvas class="cv-canvas cv-over" data-over tabindex="0" aria-label="<?= Lang::e('ui.plan.canvas') ?>"></canvas>
      <?php /* touch (0.4 S.8): Enter / Backspace / Esc as buttons while a line is being drawn; shown only on a touch screen */ ?>
      <div class="cv-draftbar" role="group" aria-label="<?= Lang::e('touch.draft') ?>" data-draftbar hidden>
        <button type="button" class="cv-tool" data-draft-act="finish"><i class="bi bi-check2" aria-hidden="true"></i><span><?= Lang::e('touch.finish') ?></span></button>
        <button type="button" class="cv-tool" data-draft-act="arc" aria-pressed="false" hidden><i class="bi bi-bezier2" aria-hidden="true"></i><span><?= Lang::e('fl.arc.btn') ?></span></button>
        <button type="button" class="cv-tool" data-draft-act="back"><i class="bi bi-arrow-counterclockwise" aria-hidden="true"></i><span><?= Lang::e('touch.back') ?></span></button>
        <button type="button" class="cv-tool" data-draft-act="cancel"><i class="bi bi-x-lg" aria-hidden="true"></i><span><?= Lang::e('touch.cancel') ?></span></button>
      </div>
      <div class="cv-hint" data-hint>
        <p class="cv-hint-h"><?= Lang::e('ui.hint.h') ?></p>
        <ol>
          <li><?= $__lx('ui.hint.1', ['open' => '<strong>' . Lang::e('ui.tb.open') . '</strong>']) ?></li>
          <li><?= $__lx('ui.hint.2', ['points' => '<em>' . Lang::e('ui.points') . '</em>', 'breaklines' => '<strong>' . Lang::e('ui.hint.breaklines') . '</strong>']) ?></li>
          <li><?= $__lx('ui.hint.3', ['alignment' => '<strong>' . Lang::e('ui.tb.alignment') . '</strong>', 'enter' => '<kbd>Enter</kbd>', 'profile' => '<strong>' . Lang::e('ui.tb.profile') . '</strong>']) ?><?php /* i18n-ignore: a key name */ ?></li>
          <li><?= $__lx('ui.hint.4', ['pad' => '<strong>' . Lang::e('ui.tb.pad') . '</strong>', 'enter' => '<kbd>Enter</kbd>']) ?><?php /* i18n-ignore: a key name */ ?></li>
        </ol>
        <p class="cv-hint-foot"><?= Lang::e('ui.hint.foot') ?> <button type="button" class="cv-linkbtn" data-sample><?= Lang::e('ui.hint.sample') ?></button></p>
        <?php /* recent files (host.js 1.4): the shell fills it with files it can reopen; empty = hidden */ ?>
        <div data-recent-files data-max="5"></div>
      </div>
      <div class="cv-drop" data-drop hidden><span><i class="bi bi-box-arrow-in-down-right" aria-hidden="true"></i> <?= Lang::e('ui.drop') ?></span></div>
      <div class="cv-busy" data-busy hidden><span data-busy-text><?= Lang::e('ui.busy') ?></span></div>
      <div class="cv-toolhint" data-toolhint hidden></div>
      <div class="cv3" data-view3d role="region" aria-label="<?= Lang::e('ui.view3d') ?>" hidden></div>
    </div>
    <div class="cv-profile" data-profile-panel hidden>
      <div class="cv-profile-bar">
        <h2 class="cv-h"><?= Lang::e('ui.tb.profile') ?></h2>
        <label class="visually-hidden" for="cv-prof-al"><?= Lang::e('sec.alignment') ?></label>
        <select id="cv-prof-al" class="cv-select cv-prof-al" data-prof-al></select>
        <button type="button" class="cv-toggle" data-pvi-add aria-pressed="false" title="<?= Lang::e('ui.pvi.add.title') ?>"><?= Lang::e('ui.pvi.add') ?></button>
        <?php /* 0.5 WL.20: feature lines in the profile (crossings; alongside within a distance) — civilcraft.js renderProfile */ ?>
        <button type="button" class="cv-toggle" data-prof-fl aria-pressed="true" title="<?= Lang::e('ui.prof.fl.title') ?>"><?= Lang::e('ui.prof.fl') ?></button>
        <label class="cv-prof-within" title="<?= Lang::e('ui.prof.fl.within.title') ?>"><?= Lang::e('ui.prof.fl.within') ?> <input type="text" inputmode="decimal" class="cv-input" data-prof-fl-within placeholder="0"></label>
        <span class="cv-note cv-prof-read" data-prof-read></span>
        <button type="button" class="cv-x" data-prof-close aria-label="<?= Lang::e('ui.prof.close') ?>"><i class="bi bi-x-lg" aria-hidden="true"></i></button>
      </div>
      <div class="cv-prof-canvas">
        <canvas class="cv-canvas" data-prof tabindex="0" aria-label="<?= Lang::e('ui.prof.canvas') ?>"></canvas>
      </div>
    </div>
    <div class="cv-profile cv-sections" data-sections-panel hidden>
      <div class="cv-profile-bar">
        <h2 class="cv-h"><?= Lang::e('sec.title') ?></h2>
        <label class="visually-hidden" for="cv-sec-al"><?= Lang::e('sec.alignment') ?></label>
        <select id="cv-sec-al" class="cv-select cv-prof-al" data-sec-al></select>
        <button type="button" class="cv-x" data-sec-prev aria-label="<?= Lang::e('sec.prev') ?>" title="<?= Lang::e('sec.prev') ?>"><i class="bi bi-chevron-left" aria-hidden="true"></i></button>
        <label class="visually-hidden" for="cv-sec-sta"><?= Lang::e('sec.station.label') ?></label>
        <select id="cv-sec-sta" class="cv-select cv-sec-sta" data-sec-sta></select>
        <button type="button" class="cv-x" data-sec-next aria-label="<?= Lang::e('sec.next') ?>" title="<?= Lang::e('sec.next') ?>"><i class="bi bi-chevron-right" aria-hidden="true"></i></button>
        <label class="visually-hidden" for="cv-sec-ve"><?= Lang::e('sec.ve.label') ?></label>
        <select id="cv-sec-ve" class="cv-select cv-sec-ve" data-sec-ve>
          <option value="0"><?= Lang::e('sec.ve.fit') ?></option>
          <?php /* i18n-ignore: factors */ ?><option value="1">1×</option><option value="2">2×</option><option value="5">5×</option><option value="10">10×</option>
        </select>
        <button type="button" class="btn-line btn-sm-cc" data-sec-csv title="<?= Lang::e('sec.csv.title') ?>"><?= Lang::e('sec.csv') ?></button>
        <span class="cv-note cv-prof-read" data-sec-read></span>
        <button type="button" class="cv-x" data-sec-close aria-label="<?= Lang::e('sec.close') ?>"><i class="bi bi-x-lg" aria-hidden="true"></i></button>
      </div>
      <div class="cv-prof-canvas">
        <canvas class="cv-canvas" data-sec tabindex="0" aria-label="<?= Lang::e('sec.canvas') ?>"></canvas>
      </div>
    </div>
  </section>

  <aside class="cv-panel cv-right" aria-label="<?= Lang::e('ui.props') ?>">
    <?php /* an assistant is connected (0.4 X.12, AGENTS-SPEC §7): civilcraft.js fills and shows it; never over the plan */ ?>
    <div class="cv-assist-banner" role="status" data-assist-banner hidden><p></p><button type="button" class="btn-line btn-sm-cc" data-assist-disconnect><?= Lang::e('assist.disconnect') ?></button></div>
    <section class="cv-sec">
      <h2 class="cv-h" data-props-h><?= Lang::e('ui.props.project') ?></h2>
      <div data-props></div>
    </section>
  </aside>

  <footer class="cv-status" aria-label="<?= Lang::e('ui.status') ?>">
    <output class="cv-coords" data-coords><?= Lang::e('ui.status.coords') ?></output>
    <output class="cv-latlon" data-latlon title="<?= Lang::e('ui.status.latlon') ?>" hidden></output><?php /* GIS: gis-crs-ui.js */ ?>
    <output class="cv-elev" data-elev></output>
    <output class="cv-staoff" data-staoff></output>
    <span class="cv-status-msg" data-status role="status" aria-live="polite"></span>
  </footer>

  <dialog class="cv-dialog" data-import aria-labelledby="cv-import-h">
    <form method="dialog" class="cv-dlg">
      <div class="cv-dlg-head">
        <h2 class="cv-h" id="cv-import-h"><?= Lang::e('ui.imp.h') ?></h2>
        <button type="button" class="cv-x" data-close aria-label="<?= Lang::e('ui.close') ?>"><i class="bi bi-x-lg" aria-hidden="true"></i></button>
      </div>
      <div class="cv-dlg-body">
        <div class="cv-props">
          <span class="k"><?= Lang::e('ui.imp.file') ?></span><span class="v" data-imp-file></span>
          <label for="cv-imp-format"><?= Lang::e('ui.imp.columns') ?></label>
          <select id="cv-imp-format" class="cv-select" data-imp-format>
            <option value="auto"><?= Lang::e('ui.imp.detect') ?></option>
            <option value="PNEZD"><?= Lang::e('ui.imp.pnezd') ?></option>
            <option value="PENZD"><?= Lang::e('ui.imp.penzd') ?></option>
            <?php /* i18n-ignore: a column-order code */ ?><option value="PNEZ">PNEZ</option>
            <?php /* i18n-ignore: a column-order code */ ?><option value="PENZ">PENZ</option>
            <?php /* i18n-ignore: a column-order code */ ?><option value="NEZD">NEZD</option>
            <?php /* i18n-ignore: a column-order code */ ?><option value="ENZD">ENZD</option>
            <?php /* i18n-ignore: a column-order code */ ?><option value="NEZ">NEZ</option>
            <?php /* i18n-ignore: a column-order code */ ?><option value="ENZ">ENZ</option>
          </select>
        </div>
        <p class="cv-note" data-imp-summary></p>
        <div class="cv-imp-preview" data-imp-preview></div>
        <div data-imp-bad></div>
      </div>
      <div class="cv-dlg-foot">
        <button type="button" class="btn-line btn-sm-cc" data-close><?= Lang::e('ui.cancel') ?></button>
        <button type="button" class="btn-plot btn-sm-cc" data-imp-ok><?= Lang::e('ui.imp.ok') ?></button>
      </div>
    </form>
  </dialog>

  <dialog class="cv-dialog" data-dwg aria-labelledby="cv-dwg-h">
    <form method="dialog" class="cv-dlg">
      <div class="cv-dlg-head">
        <h2 class="cv-h" id="cv-dwg-h"><?= Lang::e('ui.dwg.h') ?></h2>
        <button type="button" class="cv-x" data-close aria-label="<?= Lang::e('ui.close') ?>"><i class="bi bi-x-lg" aria-hidden="true"></i></button>
      </div>
      <div class="cv-dlg-body">
        <div class="cv-props">
          <label for="cv-dwg-format"><?= Lang::e('ui.dwg.format') ?></label>
          <select id="cv-dwg-format" class="cv-select" data-dwg-format>
            <option value="AC1015"><?= Lang::e('ui.dwg.2000') ?></option>
            <option value="AC1018">2004</option>
            <option value="AC1021">2007</option>
            <option value="AC1024">2010</option>
            <option value="AC1027">2013</option>
            <option value="AC1032"><?= Lang::e('ui.dwg.2018') ?></option>
          </select>
        </div>
        <p class="cv-note"><?= Lang::e('ui.dwg.note') ?></p>
        <label class="cv-check" data-dwg-map-row hidden><input type="checkbox" data-dwg-map checked> <?= Lang::e('map.out.dwg') ?></label>
      </div>
      <div class="cv-dlg-foot">
        <button type="button" class="btn-line btn-sm-cc" data-close><?= Lang::e('ui.cancel') ?></button>
        <button type="button" class="btn-plot btn-sm-cc" data-dwg-go><?= Lang::e('ui.dwg.go') ?></button>
      </div>
    </form>
  </dialog>

  <dialog class="cv-dialog" data-plot aria-labelledby="cv-plot-h">
    <form method="dialog" class="cv-dlg">
      <div class="cv-dlg-head">
        <h2 class="cv-h" id="cv-plot-h"><?= Lang::e('ui.plot.h') ?></h2>
        <button type="button" class="cv-x" data-close aria-label="<?= Lang::e('ui.close') ?>"><i class="bi bi-x-lg" aria-hidden="true"></i></button>
      </div>
      <div class="cv-dlg-body">
        <div class="cv-props">
          <label for="cv-plot-area"><?= Lang::e('ui.plot.area') ?></label>
          <select id="cv-plot-area" class="cv-select" data-plot-area>
            <option value="all"><?= Lang::e('ui.plot.all') ?></option>
            <option value="view"><?= Lang::e('ui.plot.view') ?></option>
          </select>
          <label for="cv-plot-paper"><?= Lang::e('ui.plot.paper') ?></label>
          <select id="cv-plot-paper" class="cv-select" data-plot-paper></select>
          <label for="cv-plot-scale"><?= Lang::e('ui.plot.scale') ?></label>
          <select id="cv-plot-scale" class="cv-select" data-plot-scale></select>
          <label for="cv-plot-ink"><?= Lang::e('ui.plot.ink') ?></label>
          <select id="cv-plot-ink" class="cv-select" data-plot-ink>
            <option value="color"><?= Lang::e('ui.plot.color') ?></option>
            <option value="mono"><?= Lang::e('ui.plot.mono') ?></option>
          </select>
        </div>
        <label class="cv-check" data-plot-map-row hidden><input type="checkbox" data-plot-map checked> <?= Lang::e('map.out.pdf') ?></label>
        <p class="cv-note" data-plot-info></p>
      </div>
      <div class="cv-dlg-foot">
        <button type="button" class="btn-line btn-sm-cc" data-close><?= Lang::e('ui.cancel') ?></button>
        <button type="button" class="btn-plot btn-sm-cc" data-plot-go><?= Lang::e('ui.plot.go') ?></button>
      </div>
    </form>
  </dialog>
</main>
