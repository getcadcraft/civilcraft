---
title: TrussCraft in ModelCraft
summary: What TrussCraft does in ModelCraft: each truss as a mesh object in a group, the outline from a selected face, the same cut, stock, jig and STL/OBJ outputs.
section: tasks
order: 5
keywords: truss, trusses, trusscraft, modelcraft, mesh, face, stl, obj, jig, stock
---

## What you get

- Type the roof outline, or select a flat face (a floor or slab top) and click {{ui:Take outline from the selected face}}. Lay out, then {{ui:Place as mesh objects in the model}}: one mesh object per truss in a group named TrussCraft, painted in the species colour, in one undo step. Placing again replaces the group; ModelCraft's own export then writes the set as STL, OBJ or glTF.
- The cut list, joint schedule, stock length plan, the life-size jig drawing and the set as STL or OBJ come from this add-on's buttons.

## What it cannot do

A truss is a mesh object, not faces you can push and pull, and it is not tied to any roof you drew. ModelCraft has no roof model to read, so hips and valleys come from the straight skeleton of the outline you give, at one pitch.
