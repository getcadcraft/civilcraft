/* SPDX-License-Identifier: Apache-2.0 */
/**
 * outline.js — PDF bookmarks and page links, through pdf-lib (`lib` is the module, passed in). DOM-free.
 *   writeOutline(lib, pdfDoc, items)   items [{ title, page (0-based), children }] replace /Outlines; [] removes it; each jumps to its page, fitted
 *   addPageLink(lib, pdfDoc, pageIndex, rect [x0, y0, x1, y1] in points, targetIndex)   an invisible clickable area on a page
 */
export function writeOutline(lib, pdfDoc, items) {
  const { PDFName, PDFHexString, PDFNumber } = lib;
  const ctx = pdfDoc.context;
  const N = (s) => PDFName.of(s);
  pdfDoc.catalog.delete(N('Outlines'));
  if (!items?.length) return;
  const pages = pdfDoc.getPages();
  const rootRef = ctx.nextRef();
  const build = (list, parentRef) => {
    const refs = list.map(() => ctx.nextRef());
    let total = 0;
    list.forEach((b, i) => {
      const kids = build(b.children || [], refs[i]);
      const d = ctx.obj({ Title: PDFHexString.fromText(b.title), Parent: parentRef });
      if (i > 0) d.set(N('Prev'), refs[i - 1]);
      if (i < list.length - 1) d.set(N('Next'), refs[i + 1]);
      if (kids.refs.length) { d.set(N('First'), kids.refs[0]); d.set(N('Last'), kids.refs.at(-1)); d.set(N('Count'), PDFNumber.of(kids.total)); }
      const pg = pages[b.page];
      if (pg) d.set(N('Dest'), ctx.obj([pg.ref, N('Fit')]));
      ctx.assign(refs[i], d);
      total += 1 + kids.total;
    });
    return { refs, total };
  };
  const top = build(items, rootRef);
  ctx.assign(rootRef, ctx.obj({ Type: 'Outlines', First: top.refs[0], Last: top.refs.at(-1), Count: PDFNumber.of(top.total) }));
  pdfDoc.catalog.set(N('Outlines'), rootRef);
}

export function addPageLink(lib, pdfDoc, pageIndex, rect, targetIndex) {
  const { PDFName } = lib, pages = pdfDoc.getPages(), pg = pages[pageIndex], to = pages[targetIndex];
  if (!pg || !to) return false;
  const ctx = pdfDoc.context, N = s => PDFName.of(s);
  const annot = ctx.register(ctx.obj({ Type: 'Annot', Subtype: 'Link', Rect: rect, Border: [0, 0, 0], Dest: [to.ref, N('Fit')] }));
  pg.node.addAnnot(annot);
  return true;
}
