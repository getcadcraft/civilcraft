---
title: TrussCraft: getting started
summary: Design timber roof trusses in BimCraft, PartCraft, ModelCraft and CadCraft: common trusses, hip sets, girders with jacks and valley sets, your own loads and plate tables, the member, cut and joint lists and a first member check. A design aid, not engineered truss design.
section: start
order: 1
keywords: truss, trusses, roof truss, timber, hip, valley, girder, jack, king post, queen post, howe, pratt, fink, scissor, mono, attic, cut list, method of joints, trusscraft, add-on
---

## What you'll do

1. Switch the add-on on in {{ui:Settings}} › {{ui:Add-ons}}.
2. Open the **Trusses** tab. Choose the type, the span (bearing to bearing), the pitch, the overhang, the heel height and the spacing.
3. Under {{ui:Loads and combinations (yours)}} type the pressures and the combination factors of the standard you work to. They start at zero or blank: TrussCraft carries no code table.
4. Click {{ui:Design one truss}}. TrussCraft makes the members, finds the forces by the method of joints for each of your combinations, chooses the smallest sawn sizes that pass, and draws the elevation.
5. Give the roof: BimCraft reads the roofs of the model; in PartCraft, ModelCraft and CadCraft type the outline's corners or take them from what you selected (the {{ui:Take outline}} button), and click {{ui:Lay out on the roof}}. The roof's own geometry decides the trusses: commons on the ridge stretch, and at a hip end either step-down trusses or a girder that carries jack and corner trusses. The table under the buttons lists every distinct truss; click a row to draw it. The 3D view turns with the two sliders.
6. The place button puts the set in your app in one undo step; what it makes depends on the app (see the topic for your app, {{ui:TrussCraft in your app}}). The buttons under it save the member list, the cut list for the whole set, the joint schedule, a stock length plan, a life-size jig drawing of one truss, and the set as STL or OBJ.

## Not a substitute for a truss designer

This is a design aid. It is **not a substitute for engineered truss design or manufacturer sign-off**, and the Problems panel says so every time, first. The check is axial force by the method of joints on loads at the panel points (plus chord bending between panel points when you give an Fb). It leaves out joint slip, plate and tooth capacity, bracing design, unbalanced snow and drift. Bearings, uplift and a bracing checklist appear as Problems for the truss designer to design. A truss TrussCraft cannot make is named in Problems; nothing is dropped quietly.

## What is yours to set

The species and grade table, the sizes and the dead-load starting values are labelled typical values, rounded, and not a standard's table. Wind, uplift, combination factors, Fb, bearing stress and the deflection limit start empty. Load your own species table and your own connector plate table (CSV or JSON) to replace the typical values and the placeholder plates.
