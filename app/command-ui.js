/* SPDX-License-Identifier: Apache-2.0 */
/**
 * command-ui.js: civilcraft.js's 1 bindings for this topic, moved out of init() unchanged (0.11 PERF.71 round two, perf-finish-11 r2 civil-detail; no behaviour change).
 * mountCommand(ctx) is called once by init(); ctx carries what the closure shared with this code: values by name, and
 * accessors for the variables init() assigns (read and written as ctx.<name>, exactly as the closure's own variable was).
 */
import { Project } from './project.js';
import { newProjectUnits } from './units.js';
import { t } from './i18n.js';

export function mountCommand(ctx) {
  const { ST, ui, view, secUi, deleteSelected, copyPoints, pasteFromButton, duplicatePoints, selectAll, selectNone, gisLoad, refresh, rebind, showProfile, setTool, say, openHostFiles, ifcUi, confirmDiscard, is3D, show3D } = ctx;

  async function command(c) {
    switch (c) {
      case 'new': if (await confirmDiscard()) { ST.project = new Project(); ST.project.state.units = newProjectUnits(); ST.projectTarget = null; rebind(); ST.sel = null; ST.selPvi = -1; ST.lastReport = null; refresh(); view.fit(null); say(t('cv.new.done')); } break;
      case 'open': if (ctx.fileHost.kind === 'desktop') await openHostFiles(await ctx.fileHost.openFile({ types: ctx.OPEN_TYPES, multiple: true })); else ui.file.click(); break;
      case 'save': await ctx.saveProject(); break;
      case 'save-older': ctx.saveOlder(); break;   // 0.11 DC.27
      case 'landxml': ctx.exportLandXml(); break;
      case 'dxf': ctx.exportDxf(); break;
      case 'dwg': ctx.dwgDialog(); break;
      case 'pdf': ctx.plotDialog(); break;
      case 'ifc': (await ifcUi())?.exportDialog(); break;   // 0.7.1 71.24
      case 'select': setTool('select'); break;
      case 'measure': setTool(ST.tool === 'measure' ? 'select' : 'measure'); break;   // 0.7 PL.10
      case 'alignment': case 'pad': case 'breakline': case 'boundary': case 'pipe': case 'feature': case 'mass': if (is3D()) await show3D(false); setTool(ST.tool === c ? 'select' : c); break;
      case 'profile': showProfile(ui.profPanel.hidden); break;
      case 'sections': secUi.toggle(); break;   // 0.4 V13
      case 'grades': {   // 0.5 WL.21: the grade and elevation overlay (screen only), from E or Display
        const on = !ST.project.state.display.gradeOverlay;
        ST.project.setDisplay('gradeOverlay', on);
        say(t(on ? ((ST.project.state.features || []).length ? 'fl.grades.on' : 'fl.grades.none') : 'fl.grades.off'));
        break;
      }
      case 'undo': { const l = ST.project.undo(); say(l ? t('cv.undo.done', { what: l }) : t('cv.undo.none')); break; }
      case 'redo': { const l = ST.project.redo(); say(l ? t('cv.redo.done', { what: l }) : t('cv.redo.none')); break; }
      case 'delete': deleteSelected(); break;
      case 'copy': copyPoints(false); break;
      case 'cut': copyPoints(true); break;
      case 'paste': await pasteFromButton(false); break;
      case 'paste-in-place': await pasteFromButton(true); break;
      case 'duplicate': duplicatePoints(); break;
      case 'select-all': selectAll(); break;
      case 'select-none': selectNone(); break;
      case 'fit': if (is3D()) ctx.view3d.view.fit(); else ctx.fitAll(); break;
      case 'view3d': await show3D(!is3D()); break;
      default:
        if (ctx.lsUi.command(c)) { refresh(); break; }   // 0.7 LD: landscape, ls-*
        if (ctx.plUi.command(c)) { refresh(); break; }   // 0.7 PL: powerlines, pl-*
        if (ctx.wmUi.command(c) || ctx.issUi.command(c) || ctx.utUi.command(c) || ctx.pkUi.command(c) || ctx.fcUi.command(c)) break;   // 0.8 LC.16: water
        if (ctx.geoUi.command(c)) break;   // 0.8 round 2 (civil-geo_PART_2): geo-soil, geo-road, geo-survey, geo-mine, geo-link, geo-rail
        if (ctx.moUi.command(c)) break;   // 0.8 EG.58 (civil_PART_3): mass-options
        if (ctx.solarUi.command(c)) break;   // 0.8 EG.15 (civil_PART_3): solar
        if (ctx.egUi.command(c)) break;   // 0.8 round 2: eg-rain, eg-earthwork, eg-route, eg-site, eg-pond, eg-progress
        if (ctx.rvUi.command(c)) { refresh(); break; }   // 0.8 SU.957: river, river-xs, river-results
        if (ctx.pfUi.command(c)) { refresh(); break; }   // 0.8 SU.914: free-section, ramp
        if (ctx.gdUi.command(c)) break;   // 0.8 SU.911: ground-contours
        if (ctx.tpUi.command(c)) break;   // 0.9 SU.1110 + WB.6: corridor-templates, terrain-templates
        if (ctx.msUi.command(c)) break;   // 0.7 LC.1: mass
        if (ctx.GIS_CMDS.has(c) || ctx.gisReg.commands.has(c)) { try { await gisLoad(); } catch { break; } await ctx.gisReg.commands.get(c)?.(); }
        break;
    }
  }

  return { command };
}
