# SPDX-License-Identifier: Apache-2.0
"""
make_ifc.py — writes IFC test files for DetailCraft's IFC import with IfcOpenShell (a different tool from
DetailCraft's own writer), entity by entity, so every value the import should recover is known here.

  tools/detailcraft-test/venv/bin/python -I tools/detailcraft-test/make_ifc.py OUT_DIR

Writes OUT_DIR/ios-steel-ifc2x3.ifc (millimetres) and OUT_DIR/ios-steel-ifc4-feet.ifc (feet), the same
frame in both:
  - 2 storeys "Ground" (0) and "First" (3600 mm), placed under the building;
  - an IfcGrid (U axes 1, 2 along Y at x = 0, 6000; V axes A, B along X at y = 0, 5000);
  - IfcColumn HEA200 (IfcIShapeProfileDef, catalog dims) at grid A/1, 0 → 3600, placed in the storey;
  - IfcColumn with the same profile rotated 90 degrees (web along X) at A/2;
  - IfcBeam IPE300 from A/1 to A/2 at 3600, top of steel on the line (profile offset −h/2), extruded along
    the placement's Z with Axis = +X;
  - IfcBeam with a custom I profile "WELDED 500x250" (not in the catalog) from B/1 to B/2;
  - IfcBeam through an IfcMappedItem (the mapped representation is an IPE300 extrusion), A/1 → B/1;
  - IfcBeam whose body is an IfcBooleanClippingResult of an IPE300 extrusion, A/2 → B/2;
  - IfcMember L100x100x10 (IfcLShapeProfileDef, equal legs) as a brace A/1 → A/2 diagonal;
  - IfcPlate 20 thick: IfcArbitraryClosedProfileDef rectangle 300 × 400 extruded 20 along Z at the A/1 base;
  - IfcBeam with an IfcCircleProfileDef (a round bar: not convertible), an IfcWall and an IfcSlab (not
    steel), an IfcMember with an unequal angle 150 × 90 × 10 (not convertible);
  - (0.4 D11) holes as IfcOpeningElement + IfcRelVoidsElement: Ø22 through BP-1 at (100, 150) from its center
    (placed relative to the plate), Ø18 through B-A's top flange 500 along it, 40 toward +Y (placed in the
    storey); an IfcMechanicalFastener 'Bolt' Ø20 × 80, ObjectType A325, head at (100, 150, 40) pointing down
    (−Z) through the plate hole.
"""
import sys, os, math
import ifcopenshell
import ifcopenshell.guid

def build(schema, unit_feet):
    f = ifcopenshell.file(schema=schema)
    S = 1 / 304.8 if unit_feet else 1.0          # mm → file units
    g = lambda: ifcopenshell.guid.new()
    pt = lambda *c: f.createIfcCartesianPoint([float(v * S) for v in c])
    pt2 = lambda x, y: f.createIfcCartesianPoint([float(x * S), float(y * S)])
    d3 = lambda *c: f.createIfcDirection([float(v) for v in c])
    ax3 = lambda o, z=None, x=None: f.createIfcAxis2Placement3D(o, z, x)
    ax2 = lambda o, x=None: f.createIfcAxis2Placement2D(o, x)
    owner = None
    if schema == 'IFC2X3':
        person = f.createIfcPerson(None, 'Test', None, None, None, None, None, None)
        org = f.createIfcOrganization(None, 'Test', None, None, None)
        app = f.createIfcApplication(org, '0', 'make_ifc.py', 'make_ifc')
        owner = f.createIfcOwnerHistory(f.createIfcPersonAndOrganization(person, org, None), app, None, 'ADDED', None, None, None, 0)
    if unit_feet:
        metre = f.createIfcSIUnit(None, 'LENGTHUNIT', None, 'METRE')
        mwu = f.createIfcMeasureWithUnit(f.createIfcLengthMeasure(0.3048), metre)
        dim = f.createIfcDimensionalExponents(1, 0, 0, 0, 0, 0, 0)
        length = f.createIfcConversionBasedUnit(dim, 'LENGTHUNIT', 'FOOT', mwu)
    else:
        length = f.createIfcSIUnit(None, 'LENGTHUNIT', 'MILLI', 'METRE')
    units = f.createIfcUnitAssignment([length, f.createIfcSIUnit(None, 'PLANEANGLEUNIT', None, 'RADIAN')])
    wcs = ax3(pt(0, 0, 0))
    ctx = f.createIfcGeometricRepresentationContext(None, 'Model', 3, 1e-5, wcs, None)
    project = f.createIfcProject(g(), owner, 'IOS steel frame', None, None, None, None, [ctx], units)
    site_lp = f.createIfcLocalPlacement(None, ax3(pt(0, 0, 0)))
    bld_lp = f.createIfcLocalPlacement(site_lp, ax3(pt(1000, 2000, 0)))     # the building sits 1000, 2000 off the site origin
    site = f.createIfcSite(g(), owner, 'Site', None, None, site_lp, None, None, 'ELEMENT', None, None, None, None, None)
    bld = f.createIfcBuilding(g(), owner, 'Building', None, None, bld_lp, None, None, 'ELEMENT', None, None, None)
    f.createIfcRelAggregates(g(), owner, None, None, project, [site])
    f.createIfcRelAggregates(g(), owner, None, None, site, [bld])
    storeys = []
    for name, z in [('Ground', 0), ('First', 3600)]:
        lp = f.createIfcLocalPlacement(bld_lp, ax3(pt(0, 0, z)))
        storeys.append((f.createIfcBuildingStorey(g(), owner, name, None, None, lp, None, None, 'ELEMENT', float(z * S)), lp))
    f.createIfcRelAggregates(g(), owner, None, None, bld, [s for s, _ in storeys])
    ground, ground_lp = storeys[0]
    contents = []

    def shape(items, kind='SweptSolid'):
        return f.createIfcProductDefinitionShape(None, None, [f.createIfcShapeRepresentation(ctx, 'Body', kind, items)])

    def extrude(profile, depth, pos=None, direction=(0, 0, 1)):
        return f.createIfcExtrudedAreaSolid(profile, pos or ax3(pt(0, 0, 0)), d3(*direction), float(depth * S))

    def i_prof(name, h, b, tw, tf, r, off=(0, 0)):
        return f.createIfcIShapeProfileDef('AREA', name, ax2(pt2(*off)), b * S, h * S, tw * S, tf * S, r * S)

    def place(o, z=None, x=None):
        return f.createIfcLocalPlacement(ground_lp, ax3(pt(*o), d3(*z) if z else None, d3(*x) if x else None))

    def element(cls, name, lp, rep, **kw):
        args = [g(), owner, name, None, None, lp, rep, None]
        e = getattr(f, 'create' + cls)(*args)
        contents.append(e)
        return e

    # grid (U axes along Y, V axes along X), in the ground storey
    def axis(tag, a, b):
        return f.createIfcGridAxis(tag, f.createIfcPolyline([pt2(*a), pt2(*b)]), True)
    grid = f.createIfcGrid(g(), owner, 'Grid', None, None, place((0, 0, 0)), None,
                           [axis('1', (0, -1500), (0, 6500)), axis('2', (6000, -1500), (6000, 6500))],
                           [axis('A', (-1500, 0), (7500, 0)), axis('B', (-1500, 5000), (7500, 5000))], None)
    contents.append(grid)

    # HEA200: h 190, b 200, tw 6.5, tf 10, r 18 (EN 10365)
    hea = i_prof('HEA200', 190, 200, 6.5, 10, 18)
    element('IfcColumn', 'C-A1', place((0, 0, 0)), shape([extrude(hea, 3600)]))
    # same, turned 90 degrees about its axis
    element('IfcColumn', 'C-A2', place((6000, 0, 0), (0, 0, 1), (0, 1, 0)), shape([extrude(hea, 3600)]))
    # IPE300 h 300, b 150, tw 7.1, tf 10.7, r 15; top of steel on the line: profile offset −150 in profile Y
    ipe_top = i_prof('IPE300', 300, 150, 7.1, 10.7, 15, (0, -150))
    # placement: Z along +X (the extrusion), X (profile X) along +Y so profile Y = Z × X is up (+Z)
    element('IfcBeam', 'B-A', place((0, 0, 3600), (1, 0, 0), (0, 1, 0)), shape([extrude(ipe_top, 6000)]))
    # custom welded I: h 500, b 250, tw 10, tf 20 (no root radius)
    welded = f.createIfcIShapeProfileDef('AREA', 'WELDED 500x250', ax2(pt2(0, 0)), 250 * S, 500 * S, 10 * S, 20 * S, None)
    element('IfcBeam', 'B-B', place((0, 5000, 3600), (1, 0, 0), (0, 1, 0)), shape([extrude(welded, 6000)]))
    # mapped item: the representation map holds an IPE300 extruded 5000; the beam runs A/1 → B/1 along +Y
    ipe = i_prof('IPE300', 300, 150, 7.1, 10.7, 15)
    rmap = f.createIfcRepresentationMap(ax3(pt(0, 0, 0)), f.createIfcShapeRepresentation(ctx, 'Body', 'SweptSolid', [extrude(ipe, 5000)]))
    mapped = f.createIfcMappedItem(rmap, f.createIfcCartesianTransformationOperator3D(None, None, pt(0, 0, 0), None, None))
    element('IfcBeam', 'B-1', place((0, 0, 3450), (0, 1, 0), (-1, 0, 0)), shape([mapped], 'MappedRepresentation'))
    # clipped: IPE300 A/2 → B/2 with a half space cutting nothing important
    solid = extrude(ipe, 5000)
    half = f.createIfcHalfSpaceSolid(f.createIfcPlane(ax3(pt(0, 0, 4990), d3(0, 0, 1))), False)
    clip = f.createIfcBooleanClippingResult('DIFFERENCE', solid, half)
    element('IfcBeam', 'B-2', place((6000, 0, 3450), (0, 1, 0), (-1, 0, 0)), shape([clip], 'Clipping'))
    # L100x100x10 brace from A/1 (z 0) to A/2 (z 3600)
    L = math.hypot(6000, 3600)
    ang = f.createIfcLShapeProfileDef('AREA', 'L100x100x10', ax2(pt2(0, 0)), 100 * S, 100 * S, 10 * S, None, None, None, None, None) if schema == 'IFC2X3' else \
          f.createIfcLShapeProfileDef('AREA', 'L100x100x10', ax2(pt2(0, 0)), 100 * S, 100 * S, 10 * S, None, None, None)
    ax = (6000 / L, 0, 3600 / L)
    up = (-3600 / L, 0, 6000 / L)
    xdir = (up[1] * ax[2] - up[2] * ax[1], up[2] * ax[0] - up[0] * ax[2], up[0] * ax[1] - up[1] * ax[0])   # profile X = up × axis (DetailCraft's u)
    element('IfcMember', 'BR-1', place((0, 0, 0), ax, xdir), shape([extrude(ang, L)]))
    # plate 300 × 400 × 20 as an arbitrary closed rectangle extruded 20 up, centered on A/1, under the column
    poly = f.createIfcPolyline([pt2(-150, -200), pt2(150, -200), pt2(150, 200), pt2(-150, 200), pt2(-150, -200)])
    plate_prof = f.createIfcArbitraryClosedProfileDef('AREA', 'PL20', poly)
    bp1_lp = place((0, 0, -20))
    bp1 = element('IfcPlate', 'BP-1', bp1_lp, shape([extrude(plate_prof, 20)]))
    # holes (openings) and a bolt
    def opening(name, lp, r, depth):
        circ = f.createIfcCircleProfileDef('AREA', None, ax2(pt2(0, 0)), r * S)
        return f.createIfcOpeningElement(g(), owner, name, None, None, lp, shape([extrude(circ, depth)]), None)
    op1 = opening('Hole BP-1', f.createIfcLocalPlacement(bp1_lp, ax3(pt(100, 150, -1))), 11, 22)
    f.createIfcRelVoidsElement(g(), owner, None, None, bp1, op1)
    op2 = opening('Hole B-A', place((500, 40, 3600 - 12)), 9, 14)
    f.createIfcRelVoidsElement(g(), owner, None, None, [e for e in contents if e.Name == 'B-A'][0], op2)
    bolt_body = shape([extrude(f.createIfcCircleProfileDef('AREA', None, ax2(pt2(0, 0)), 10 * S), 80)])
    bolt_lp = place((100, 150, 40), (0, 0, -1), (1, 0, 0))
    if schema == 'IFC2X3':
        bolt = f.createIfcMechanicalFastener(g(), owner, 'Bolt', None, 'A325', bolt_lp, bolt_body, None, 20 * S, 80 * S)
    else:
        bolt = f.createIfcMechanicalFastener(g(), owner, 'Bolt', None, 'A325', bolt_lp, bolt_body, None, 20 * S, 80 * S, 'BOLT')
    contents.append(bolt)
    # not convertible
    bar = f.createIfcCircleProfileDef('AREA', 'RD30', ax2(pt2(0, 0)), 15 * S)
    element('IfcBeam', 'Round bar', place((0, 2500, 3000), (1, 0, 0), (0, 1, 0)), shape([extrude(bar, 6000)]))
    une = f.createIfcLShapeProfileDef('AREA', 'L150x90x10', ax2(pt2(0, 0)), 150 * S, 90 * S, 10 * S, None, None, None, None, None) if schema == 'IFC2X3' else \
          f.createIfcLShapeProfileDef('AREA', 'L150x90x10', ax2(pt2(0, 0)), 150 * S, 90 * S, 10 * S, None, None, None)
    element('IfcMember', 'Unequal angle', place((6000, 5000, 0)), shape([extrude(une, 3600)]))
    wall_prof = f.createIfcRectangleProfileDef('AREA', None, ax2(pt2(3000, -300)), 6000 * S, 200 * S)
    element('IfcWall', 'Wall', place((0, 0, 0)), shape([extrude(wall_prof, 3000)]))
    slab_prof = f.createIfcRectangleProfileDef('AREA', None, ax2(pt2(3000, 2500)), 6000 * S, 5000 * S)
    element('IfcSlab', 'Slab', place((0, 0, 3600)), shape([extrude(slab_prof, 150)]))

    mat = f.createIfcMaterial('S355')
    f.createIfcRelAssociatesMaterial(g(), owner, None, None, [e for e in contents if e.is_a() in ('IfcBeam', 'IfcColumn', 'IfcMember', 'IfcPlate')], mat)
    f.createIfcRelContainedInSpatialStructure(g(), owner, None, None, contents, ground)
    return f

if __name__ == '__main__':
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    build('IFC2X3', False).write(os.path.join(out, 'ios-steel-ifc2x3.ifc'))
    build('IFC4', True).write(os.path.join(out, 'ios-steel-ifc4-feet.ifc'))
    print('IfcOpenShell', ifcopenshell.version, '->', out)
