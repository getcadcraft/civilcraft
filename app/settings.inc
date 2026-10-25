<?php
// SPDX-License-Identifier: Apache-2.0
/**
 * settings.inc — CivilCraft's own panel of the Settings dialog (core/components/app-settings.inc includes it, as the
 * "CivilCraft" tab). civilcraft.js reads and stores the fields (localStorage civilcraft.settings), syncs them each
 * time the dialog opens and resets them on "cc-settings-reset".
 *   order     PNEZD (default) / PENZD: the column order of copied point rows, of point rows pasted from the
 *             clipboard, and the import dialog's guess when a file has no header row
 *   renumber  clash (default: pasted points keep numbers nobody uses) / always (every pasted point gets a new number)
 *   start     new point numbers count up from this number (empty = one past the highest number in use)
 *   labels    nzd (default) / nz / n: what a point label shows on the plan and in DXF, DWG and PDF
 *   corner    cube (default) / axes / none: the corner indicator of the plan and the 3D view (viewcube.js)
 *   exag      2 (default) / 1 / 3 / 5 / 10: the 3D view's vertical exaggeration (its bar has the same list)
 *   latlon    dms (default) / dd: latitude and longitude in the status bar (GIS, gis-crs-ui.js)
 *   internet  off (default) / on: map layers from the internet (GIS, gis-map-ui.js) — off, no map server is ever asked
 *   cvAssist, cvAssistRead, cvAssistEdit, cvAssistSave, cvAssistExport   AI assistants and scripts (0.4 X.12, AGENTS-SPEC §7;
 *             save/export 0.7 AS.3): on/off (default off), then which groups (read on, the rest off when first turned on); the
 *             Activity list is filled by civilcraft.js; [data-assistants-folders] = host.js's Folders list (0.7 MCP-PATHS, Studio)
 */
?>
<fieldset class="shell-set" data-cv-settings>
  <legend><?= Lang::e('set.order') ?></legend>
  <div class="shell-seg cv-set-seg2" role="radiogroup" aria-label="<?= Lang::e('set.order') ?>">
    <label><input type="radio" name="cvOrder" value="PNEZD"> P, N, E, Z, D</label>
    <label><input type="radio" name="cvOrder" value="PENZD"> P, E, N, Z, D</label>
  </div>
  <p class="shell-hint-text"><?= Lang::e('set.order.hint') ?></p>
</fieldset>
<fieldset class="shell-set">
  <legend><?= Lang::e('set.renum') ?></legend>
  <div class="shell-seg cv-set-seg2" role="radiogroup" aria-label="<?= Lang::e('set.renum') ?>">
    <label><input type="radio" name="cvRenumber" value="clash"> <?= Lang::e('set.renum.clash') ?></label>
    <label><input type="radio" name="cvRenumber" value="always"> <?= Lang::e('set.renum.always') ?></label>
  </div>
  <div class="shell-row">
    <label for="cv-set-start"><?= Lang::e('set.start') ?></label>
    <input type="number" id="cv-set-start" class="cv-input cv-set-start" name="cvStart" min="1" max="999999999" step="1" inputmode="numeric" placeholder="<?= Lang::e('set.start.ph') ?>">
  </div>
  <p class="shell-hint-text"><?= Lang::e('set.renum.hint') ?></p>
</fieldset>
<fieldset class="shell-set">
  <legend><?= Lang::e('set.labels') ?></legend>
  <div class="shell-seg" role="radiogroup" aria-label="<?= Lang::e('set.labels') ?>">
    <label><input type="radio" name="cvLabels" value="n"> <?= Lang::e('set.labels.n') ?></label>
    <label><input type="radio" name="cvLabels" value="nz"> <?= Lang::e('set.labels.nz') ?></label>
    <label><input type="radio" name="cvLabels" value="nzd"> <?= Lang::e('set.labels.nzd') ?></label>
  </div>
  <p class="shell-hint-text"><?= Lang::e('set.labels.hint') ?></p>
</fieldset>
<fieldset class="shell-set">
  <legend><?= Lang::e('set.corner') ?></legend>
  <div class="shell-seg" role="radiogroup" aria-label="<?= Lang::e('set.corner') ?>">
    <label><input type="radio" name="cvCorner" value="cube"> <i class="bi bi-box" aria-hidden="true"></i> <?= Lang::e('set.corner.cube') ?></label>
    <label><input type="radio" name="cvCorner" value="axes"> <i class="bi bi-arrows-move" aria-hidden="true"></i> <?= Lang::e('set.corner.axes') ?></label>
    <label><input type="radio" name="cvCorner" value="none"> <i class="bi bi-slash-circle" aria-hidden="true"></i> <?= Lang::e('set.corner.none') ?></label>
  </div>
  <p class="shell-hint-text"><?= Lang::e('set.corner.hint') ?></p>
</fieldset>
<fieldset class="shell-set">
  <legend><?= Lang::e('set.exag') ?></legend>
  <div class="shell-seg cv-set-seg5" role="radiogroup" aria-label="<?= Lang::e('set.exag') ?>">
    <label><input type="radio" name="cvExag" value="1"> 1×</label>
    <label><input type="radio" name="cvExag" value="2"> 2×</label>
    <label><input type="radio" name="cvExag" value="3"> 3×</label>
    <label><input type="radio" name="cvExag" value="5"> 5×</label>
    <label><input type="radio" name="cvExag" value="10"> 10×</label>
  </div>
  <p class="shell-hint-text"><?= Lang::e('set.exag.hint') ?></p>
</fieldset>
<?php /* GIS (builder C): status bar latitude/longitude and map layers from the internet */ ?>
<fieldset class="shell-set">
  <legend><?= Lang::e('set.latlon') ?></legend>
  <div class="shell-seg cv-set-seg2" role="radiogroup" aria-label="<?= Lang::e('set.latlon') ?>">
    <label><input type="radio" name="cvLatlon" value="dms"> 30°18′00.00″ N</label>
    <label><input type="radio" name="cvLatlon" value="dd"> 30.300000° N</label>
  </div>
  <p class="shell-hint-text"><?= Lang::e('set.latlon.hint') ?></p>
</fieldset>
<fieldset class="shell-set">
  <legend><?= Lang::e('set.internet') ?></legend>
  <div class="shell-seg cv-set-seg2" role="radiogroup" aria-label="<?= Lang::e('set.internet') ?>">
    <label><input type="radio" name="cvInternet" value="off"> <?= Lang::e('set.internet.off') ?></label>
    <label><input type="radio" name="cvInternet" value="on"> <?= Lang::e('set.internet.on') ?></label>
  </div>
  <p class="shell-hint-text"><?= Lang::e('set.internet.hint') ?></p>
</fieldset>
<fieldset class="shell-set" data-cv-assist-set>
  <legend><?= Lang::e('set.assist.legend') ?></legend>
  <label class="shell-check"><input type="checkbox" name="cvAssist"> <?= Lang::e('set.assist.on') ?></label>
  <p class="shell-hint-text"><?= Lang::e('set.assist.hint') ?></p>
  <label class="shell-check cv-set-sub"><input type="checkbox" name="cvAssistRead"> <?= Lang::e('set.assist.read') ?></label>
  <label class="shell-check cv-set-sub"><input type="checkbox" name="cvAssistEdit"> <?= Lang::e('set.assist.edit') ?></label>
  <label class="shell-check cv-set-sub"><input type="checkbox" name="cvAssistSave"> <?= Lang::e('set.assist.save') ?></label>
  <label class="shell-check cv-set-sub"><input type="checkbox" name="cvAssistExport"> <?= Lang::e('set.assist.export') ?></label>
  <div data-assistants-folders></div>
  <details class="cv-assist-log" data-cv-assist-log>
    <summary><?= Lang::e('set.assist.activity') ?></summary>
    <ol></ol>
  </details>
</fieldset>
