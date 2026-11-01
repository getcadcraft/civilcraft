---
title: TrussCraft in BimCraft
summary: What TrussCraft does in BimCraft: roofs read from the model, every timber piece placed as an IfcMember.
section: tasks
order: 5
keywords: truss, trusses, trusscraft, bimcraft, ifc, ifcmember, roof, place
---

## What you get

- The roofs of the open model are listed under {{ui:Layout on a roof}}; TrussCraft uses the roof's own pitch, overhang, gables and wall-top height.
- {{ui:Place in the model}} writes each timber piece as an IfcMember (CHORD, STRUT or POST in IFC4) with its section, species and truss mark, in one undo step.

## What it cannot do

Hips, valleys and girders are made as the roof's geometry needs them. Problems lists what is not made. The result is not a substitute for engineered truss design.
