---
title: Land records: getting started
summary: Keep a record for each parcel, check the drawing against what the register says, find overlaps and gaps, subdivide, consolidate or rezone as proposals, and fill application and amendment outlines.
section: start
order: 1
keywords: IFC, BIM model, MarkupCraft, markup, BCF, building footprint, coverage, floor area ratio, takeoff, quantities, notes, markup, zoning minimum, lot size, jurisdiction, cadastre, cadastral, land records, parcel, lot, register, title, deed, reconcile, reconciliation, overlap, gap, sliver, subdivide, subdivision, consolidate, merge lots, boundary adjustment, rezoning, land use, zoning amendment, plan amendment, application, permitting, planning, schedule of parcels, add-on
---

## What you'll do

1. Switch the add-on on in {{ui:Settings}} › {{ui:Add-ons}}, then open the **Land records** tab.
2. Open **Records**. Every parcel in the drawing is listed with its drawn area. Click a parcel, type what the register says about it (its number, the holder, the land use and zone, the area the record states and where that figure comes from), and press **Add the record**.
3. Open **Drawing against record** and press **Check the drawing against the records**.
4. Open **Change parcels** to work out a subdivision, a consolidation, a moved boundary or a change of land use or zone as a proposal.
5. Open **Documents** to fill an application or amendment outline from a proposal.

Parcels come from CivilCraft's own **Parcel** tool, from deed calls, from a traverse, from a field walk (see the other topic), or from a GIS polygon layer: under **Records**, **Parcels and records from a GIS layer** makes a parcel and a record from each polygon, taking the number, holder, land use, zone and area from the fields you name.

## Records

A record holds what a document says, not what is drawn. The two are kept apart on purpose, so they can be compared. **Open records from a CSV file** reads a table whose first row names its columns; a row is matched to a parcel by the parcel's name. **Land by designation** adds up every parcel by the land use and zone its record states.

Holders' names are personal data. They are kept in the drawing's own file and are not sent anywhere.

## Drawing against record

The check lists, for each parcel, the drawn area, the recorded area and the difference, and says whether the difference is within the tolerance you typed. It also reports:

- parcels that share ground, with the area shared;
- corners that lie close to a neighbor's line without being on it, which is what a common boundary drawn twice leaves behind;
- an outline that crosses itself;
- a number used by more than one record, a parcel with no record, and a record with no parcel.

A record that states no area is "not compared". It is never shown as agreeing. The findings also go to **Problems**. The check compares. It does not say which figure is right: that is for a licensed surveyor and the land registry.

## Change parcels

Tick the parcels, choose the change and press **Work it out**:

- **Cut one parcel into equal lots**, or **cut lots of given areas off**, by parallel lines in a direction you give in degrees clockwise from north.
- **Cut one parcel by a line** through two points.
- **Make adjoining parcels one**. They must share a side.
- **Move the line between two parcels** to a line through two points.
- **Change the land use or zone**.

The result is shown with the parcels before and after and a balance of ground, which should be nothing. **Your lot rules** are limits you type yourself (the smallest lot, the shortest street frontage); new lots are checked against them. **Keep as a proposal** stores it with the drawing. **Apply to the drawing** replaces the old parcels with the new ones, each with a record that names what it came from, as one undo step.

## Buildings and quantities

Open **Buildings and quantities**. The building masses of the drawing (drawn in Massing) are laid over the parcels: each lot shows its footprint, floor area, coverage and floor area ratio. A building that crosses a lot line is counted on the lot that holds most of it, for the part that is on it, and is flagged. Below, the takeoff lists each lot's area, outline and corners and the boundary on the ground, with a line two lots share counted once. **Save the quantities for TakeoffCraft** writes a quantities file TakeoffCraft opens.

## Buildings from an IFC model

Under **Buildings and quantities**, press **Read buildings from an IFC file** and choose a model from any BIM program. Each building's outline is traced and laid over the parcels, with its storeys, height and floor area. A file with a map position lands where it belongs. For any other, type how far to move it east and north and how much to turn it before you read it. **Make building masses** turns a model's buildings into masses of the drawing, so they show on the plan.

## Notes on the plan

Choose a parcel in **Records**, open **Notes on the plan**, write a few words and press **Pin the note**. The note is one of the drawing's issues: it shows on the plan and in the Issues list, and goes out in a BCF file. **Make notes from the last check** pins one note for each warning of the check. Notes that are still open are printed in the papers.

## Mark up in MarkupCraft

Under **Notes on the plan**, press **Open the plan in MarkupCraft**. The parcel plan opens there as a PDF at a round scale, and the open notes are saved as a BCF file. In MarkupCraft choose the BCF import and pick that file: each note lands on its spot. Mark up as usual. To bring the result home, export BCF from MarkupCraft's Markups list, then press **Read marked-up notes back (BCF)** here. A note still at its place takes its new status and comments. A note drawn on the sheet becomes a note on the plan.

## Place rules

The add-on holds no place's rules. Add the rules add-on for your place in {{ui:Settings}} › {{ui:Add-ons}} (their names start with "Land rules"), then choose it under **Place rules**. You see the minimum lot sizes its texts print for each zone, what its law states about changing a parcel, and each source with a link. Type the zone in each parcel's record, then press **Compare the lots with these rules**. Width and depth are compared only for a lot whose zoning names its street line. Anything that could not be compared is listed with the reason. A proposal is compared the same way as you draft it, and the place's worksheets appear under **Documents**.

The figures are a reading aid. Check the source before you rely on one.

## Documents

Choose a kept proposal in the list under **Change parcels**, then under **Documents** choose a paper and press **Fill the paper**. The plain outlines that come with the add-on belong to no authority. A value nobody stated prints as "[not stated: …]" and is listed, so nothing is made up. Save the page and print it, or save it as PDF from the print window. An authority's own wording can be opened as a template pack.

## Limits

This is a filing and checking aid. It does not survey, it does not decide a boundary, and it ships no place's lot sizes, tolerances or forms.
