Positions from a device are latitude and longitude on the WGS 84 ellipsoid. With a coordinate system in the drawing they go through CivilCraft's own projection code. Without one, they are placed on a site plane through the first corner by the mid-latitude formulas, using the ellipsoid's meridian and prime-vertical radii of curvature.

A point is the average of the readings of the last few seconds, weighted by the inverse square of the accuracy each reading reports. The point's stated accuracy is the best figure among those readings. It is not divided by the square root of their number, because a phone's errors over a few seconds move together.

The "give or take" of a walked area is half the square root of the sum, over the corners, of each corner's accuracy squared times the squared distance between its two neighbors. This is the standard propagation of independent corner errors through the area formula.

A recorded route is reduced to corners with the Douglas-Peucker method. Areas use the shoelace formula; curved sides are counted exactly by CivilCraft's parcel code. Shared ground between two parcels is found by cutting one into triangles and clipping the other to each (Sutherland-Hodgman). A cut to a given area is found by bisection on the position of the line.

No tolerance, lot size or form of any authority is built in.

Buildings per parcel: each building mass belongs to the parcel that holds most of its footprint (the overlap of the two outlines). Only the part on the parcel counts; the floor area is taken in the same share, since every floor of a mass has the footprint's shape. Coverage is footprint over lot area, floor area ratio is floor area over lot area.

Takeoff: the boundary on the ground is the sum of the outlines less the length two lots have in common, found segment by segment within a millimeter; corners closer than a millimeter are one corner.

Place rules: a figure is kept in the unit it was printed in and converted exactly for the comparison (0.3048 m to the foot, 43,560 square feet to the acre). A lot is below a minimum only when it is below by more than rounding.

Footprints from IFC: every triangle of every element of a building is projected onto the plan and painted into square cells; the outline of the painted cells is traced and straightened to within one cell. Floor area is the model's own stated gross floor area where there is one, else the plan area of each storey's floor slabs, else footprint times storeys, and the panel says which.

The plan sheet: the lots are fitted to an A3 sheet at the first scale of 1:20, 50, 100, 200, 250, 500, 1,000 and so on that holds them. A note's place on the sheet is written into its BCF topic in meters of paper, which is how MarkupCraft places a topic on a sheet.
