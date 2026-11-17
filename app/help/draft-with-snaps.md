---
title: Draft with snaps, picked corners and move, copy, rotate
summary: Place alignments, pads, parcels and feature lines exactly on points and corners you already have, type or pick a corner's easting and northing, turn a tangent toward two points, and move, copy or rotate an object by a distance or an angle.
section: tasks
order: 66
keywords: snap, snaps, osnap, snap to point, snap to corner, pi, vertex, corner, pick, crosshair, easting, northing, coordinates, typed coordinates, tangent, direction, bearing, move, copy, rotate, transform, copy rotated, duplicate, alt, free point, drafting
---

New in 0.9: when you draw, the cursor lands on the points and corners that are already in the plan, and a pad, parcel or feature-line corner can be typed or picked. This topic walks through the three tools.

## What you'll do

- Draw with snaps, so a new alignment, pad, parcel or line starts and ends exactly on something that exists.
- Set a corner's easting and northing by typing it or picking a place in the plan.
- Turn an alignment tangent toward two picked points.
- Move, copy or rotate a whole object.

## Steps

1. Choose a drawing tool, for example {{ui:Alignment}}, {{ui:Pad}}, {{ui:Parcel}} or {{ui:Feature line}}. Move the pointer near a survey point, an alignment PI, a pad, parcel or mass corner, a feature-line vertex or a storm structure. A marker appears with a label (PI, Corner, Vertex, Structure or Point and its number) and the easting and northing it will land on. Click to place the point there.
2. To place a point freely, hold {{key:Alt}} while you click. The snap turns off.
3. Select a pad, parcel or feature line. In Properties, the {{ui:Corners}} block lists every corner with an Easting box and a Northing box. Type new numbers, or press the crosshair button beside a corner and click a place in the plan. The corner takes that easting and northing. Press {{key:Esc}} to cancel a pick. The crosshair works only in the plan: close the 3D view first.
4. To turn a tangent, select an alignment. In Properties, under {{ui:Tangent from two points}}, choose the tangent, press {{ui:First point}} and click in the plan, press {{ui:Second point}} and click again, then press {{ui:Set direction}}. The tangent turns to run from the first point toward the second and keeps its length.
5. To move, copy or rotate, select an alignment, pad, parcel or feature line. In Properties, under {{ui:Move, copy and rotate}}, type {{ui:Move east}} and {{ui:Move north}} (negative numbers go west and south) and press {{ui:Move}} or {{ui:Copy}}. Or press {{ui:Distance from two points}} and click the point to move from and the point to move to.
6. To rotate, type the angle in {{ui:Rotate counter-clockwise}} (degrees), then press {{ui:Rotate}} or {{ui:Copy rotated}}. It turns about the middle of its corners unless you pick a point to rotate about with the crosshair beside the angle.

## Notes

- A copy leaves the original where it is and is selected afterwards.
- Every move, copy, rotate, picked corner and turned tangent is one undo step.
- Snaps reach 10 screen pixels from the cursor. A snap marker only offers a place; nothing is changed until you click.
- The same crosshair is on an alignment's PI rows. See [Alignments](topic:alignment), [Parcels](topic:parcels) and [Feature lines](topic:feature-lines).
