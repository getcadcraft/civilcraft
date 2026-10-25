---
title: Draw building masses on a site
summary: Draw a building mass on a parcel, give it floors and a floor height, see its gross floor area, choose how it sits on sloping ground, push and pull its height in 3D, and send it to BimCraft or save it as an IFC file.
section: tasks
order: 96
keywords: mass, massing, building mass, volume, footprint, floors, floor height, gross floor area, GFA, slope, podium, cut and fill, push pull, 3D, site study, early design, IFC, develop, BimCraft, A-MASS
---

A building mass is a footprint, a number of floors and a floor height: the early question "how much building fits here, and what does it do to the ground". Masses sit on the plan with their name, floor count and gross floor area, go into the PDF plot and the DWG and DXF exports on the layers `A-MASS` and `A-MASS-TEXT`, and are saved in the project file.

## Draw a mass

1. In **Properties**, under **Building masses**, click **Draw a mass**. (It is also in the toolbar's **More** menu next to **Surface**.)
2. Click the corners of the footprint. A click near a parcel corner or a survey point takes that point's exact place.
3. Click the first corner again, or press {{key:Enter}}, to finish. {{key:Backspace}} takes back the last corner; {{key:Esc}} stops.

A new mass has three floors and a floor height of 12 ft (3.6 m), and belongs to the parcel its middle falls in.

## Floors, height and area

Click a mass to change its **Name**, **Use**, **Floors**, **Floor height** and **Parcel**. **Height** is floors times floor height: type a height and the floor count becomes the nearest whole number of floors (never less than one). **Footprint** and **Gross floor area** (footprint times floors) are worked out for you.

## On sloping ground

The ground under a mass is read from the surface: existing ground, or the graded ground where you chose **Proposed ground (graded)**. **On sloping ground** says where the ground floor goes:

- **Stepped**: at the average ground under the footprint. The low side is filled up to it and the high side cut, and the two come close to balancing.
- **Podium**: at the highest ground. A solid base fills the low side.
- **Cut**: at the lowest ground. The high side is cut away into the hill.

Properties shows the range of ground under the mass, the **Ground floor level**, and the volume of fill and cut between the ground and that level. A spot of the footprint that is off the surface is left out, and Properties says how many.

## In the 3D view

Masses are drawn in the 3D site view, with a line round every floor and their names over the roof. **Show** has a check box for **Building masses**. Click one to select it. With a mass selected:

- drag its roof up or down to push or pull it a floor at a time, or press {{key:PageUp}} and {{key:PageDown}};
- the whole move is one undo step.

The street view of **Drive** sees the masses too, and **Sun** casts their shadows on the ground.

## Send it on

- **Masses as IFC** saves every mass as an IFC4 file: a site, a building with its storeys, and the mass as a building element with its numbers in the property set `CadCraft_SiteMass`. With a coordinate system set on the project the file is placed on the map and carries the site's latitude and longitude; without one it says nothing about where it is.
- **Develop in BimCraft** opens BimCraft in a new tab with the masses. There, picking a mass shows its numbers and **Develop this mass**, which builds walls on every level and a floor under the building from the footprint, in one undo step. Nothing is uploaded: the file passes between the two tabs of this browser.

See also **Zoning limits** and **Sun hours**.
