/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-ifc is a standalone library. */
/**
 * geo-style.js — the colour each piece of geometry is drawn in (IFC4 ADD2 TC1 §8.20 Presentation appearance resource,
 * §8.10 Material resource):
 *   1. an IfcStyledItem on the representation item (or on an item that contains it: a boolean, a mapped item);
 *   2. the element's material (also through its type): IfcMaterial → IfcMaterialDefinitionRepresentation → styled items,
 *      with layer sets, profile sets, constituent sets and lists read for their first material that has a colour;
 *   3. white.
 * Surface styles: IfcSurfaceStyle → IfcSurfaceStyleRendering / IfcSurfaceStyleShading (SurfaceColour, Transparency), also
 * through IFC2X3's IfcPresentationStyleAssignment. Colours are { x: r, y: g, z: b, w: alpha } (0–1).
 *
 *   const st = new Styles(g)
 *   st.itemColor(itemId) → colour | null       st.productColor(productId) → colour | null       Styles.DEFAULT
 */

export class Styles {
  static DEFAULT = Object.freeze({ x: 1, y: 1, z: 1, w: 1 });

  constructor(g) {
    this.g = g;
    this.byItem = null;
    this.matColor = new Map();
    this.prodColor = new Map();
  }

  index() {
    if (this.byItem) return;
    const g = this.g;
    this.byItem = new Map();
    for (const s of g.f.ofType('IFCSTYLEDITEM', true)) {
      const item = g.ref(g.a(s, 'Item'));
      if (item === null) continue;
      const c = this.styleColor(g.a(s, 'Styles'));
      if (c && !this.byItem.has(item)) this.byItem.set(item, c);
    }
  }

  itemColor(id) { this.index(); return this.byItem.get(id) || null; }

  /** The first surface colour found in a list of styles (any nesting). */
  styleColor(list, depth = 0) {
    const g = this.g;
    if (depth > 6) return null;
    for (const v of Array.isArray(list) ? list : [list]) {
      const id = g.ref(v);
      if (id === null) continue;
      const t = g.t(id);
      if (t === 'IFCPRESENTATIONSTYLEASSIGNMENT') { const c = this.styleColor(g.a(id, 'Styles'), depth + 1); if (c) return c; }
      else if (t === 'IFCSURFACESTYLE') { const c = this.styleColor(g.a(id, 'Styles'), depth + 1); if (c) return c; }
      else if (t === 'IFCSURFACESTYLERENDERING' || t === 'IFCSURFACESTYLESHADING') {
        const rgb = this.colour(g.ref(g.a(id, 'SurfaceColour')));
        if (!rgb) continue;
        const tr = g.num(g.a(id, 'Transparency'), 0) || 0;
        return { x: rgb[0], y: rgb[1], z: rgb[2], w: 1 - Math.min(1, Math.max(0, tr)) };
      }
    }
    return null;
  }

  colour(id) {
    const g = this.g;
    if (id === null) return null;
    if (g.t(id) === 'IFCCOLOURRGB') return [g.num(g.a(id, 'Red'), 1), g.num(g.a(id, 'Green'), 1), g.num(g.a(id, 'Blue'), 1)];
    return null;
  }

  /** Colour from the product's material (or its type's). */
  productColor(pid) {
    if (this.prodColor.has(pid)) return this.prodColor.get(pid);
    const g = this.g;
    const assoc = g.f.inverse('IFCRELASSOCIATESMATERIAL', 'RelatedObjects');
    let c = null;
    for (const r of assoc.get(pid) || []) { c = this.materialColor(g.ref(g.a(r, 'RelatingMaterial'))); if (c) break; }
    if (!c) {
      const byType = g.f.inverse('IFCRELDEFINESBYTYPE', 'RelatedObjects');
      for (const r of byType.get(pid) || []) {
        const type = g.ref(g.a(r, 'RelatingType'));
        for (const ar of assoc.get(type) || []) { c = this.materialColor(g.ref(g.a(ar, 'RelatingMaterial'))); if (c) break; }
        if (c) break;
      }
    }
    this.prodColor.set(pid, c);
    return c;
  }

  materialColor(id, depth = 0) {
    const g = this.g;
    if (id === null || depth > 6) return null;
    if (this.matColor.has(id)) return this.matColor.get(id);
    const t = g.t(id);
    let c = null;
    if (t === 'IFCMATERIAL') {
      const reps = g.f.inverse('IFCMATERIALDEFINITIONREPRESENTATION', 'RepresentedMaterial');
      for (const r of reps.get(id) || []) {
        for (const sr of g.refs(g.a(r, 'Representations'))) {
          for (const it of g.refs(g.a(sr, 'Items'))) { if (g.t(it) === 'IFCSTYLEDITEM') c = this.styleColor(g.a(it, 'Styles')); if (c) break; }
          if (c) break;
        }
        if (c) break;
      }
    } else if (t === 'IFCMATERIALLAYERSETUSAGE') c = this.materialColor(g.ref(g.a(id, 'ForLayerSet')), depth + 1);
    else if (t === 'IFCMATERIALPROFILESETUSAGE' || t === 'IFCMATERIALPROFILESETUSAGETAPERING') c = this.materialColor(g.ref(g.a(id, 'ForProfileSet')), depth + 1);
    else if (t === 'IFCMATERIALLAYERSET') c = first(g.refs(g.a(id, 'MaterialLayers')), (l) => this.materialColor(g.ref(g.a(l, 'Material')), depth + 1));
    else if (t === 'IFCMATERIALPROFILESET') c = first(g.refs(g.a(id, 'MaterialProfiles')), (l) => this.materialColor(g.ref(g.a(l, 'Material')), depth + 1));
    else if (t === 'IFCMATERIALCONSTITUENTSET') c = first(g.refs(g.a(id, 'MaterialConstituents')), (l) => this.materialColor(g.ref(g.a(l, 'Material')), depth + 1));
    else if (t === 'IFCMATERIALLIST') c = first(g.refs(g.a(id, 'Materials')), (m) => this.materialColor(m, depth + 1));
    else if (t === 'IFCMATERIALLAYER' || t === 'IFCMATERIALPROFILE' || t === 'IFCMATERIALCONSTITUENT') c = this.materialColor(g.ref(g.a(id, 'Material')), depth + 1);
    this.matColor.set(id, c);
    return c;
  }
}

function first(list, f) { for (const x of list) { const c = f(x); if (c) return c; } return null; }
