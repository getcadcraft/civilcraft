---
title: CabinetCraft in ModelCraft
summary: What CabinetCraft does in ModelCraft: the cabinets as coloured bodies in the model that render, measure and export, and the room from a selected floor face.
section: reference
order: 5
keywords: cabinetcraft, modelcraft, cabinets, add-on
---

## The cabinets as bodies of the model

{{ui:Drawings}} › {{ui:Place in the model}} puts the cabinets in the model as one group for the job (tag CabinetCraft / cabinets), with a sub-group for every cabinet, filler, end panel and countertop, and in each one a body for every panel, coloured by its material pick. They are real faces and edges, so they render, can be selected and measured, can be hidden with their tag and are written by {{ui:File}} › {{ui:Export}} to OBJ, glTF and STL with the rest of the model. It is one undo step; placing again replaces the group; {{ui:Remove from the model}} takes it out.

## The room from a floor face

Select a floor face (a level face looking up) in the model, then on the {{ui:Room}} tab press {{ui:Find rooms}} and {{ui:Use this room}}. The face's outline becomes the job's room, with the starter library's doors and windows near its edge as openings, and the cabinets are placed at that floor's height.

## The cut list and the drawings

The cut list, the nest, the drilling lists, the labels and the drawings (plan, elevations, sections, 3D view) are the panel's, in {{ui:Export}} and {{ui:Drawings}}; they are files (CSV, DXF, SVG, HTML).

## What it does not do here

There is no G-code in ModelCraft (a CAM export is PartCraft's). The bodies are for rendering and presentation: they are not parametric, they carry no cut list of their own, and changing the job does not change them until you place again.
