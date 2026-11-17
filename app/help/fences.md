---
title: Fences
summary: A fence along a line, parcel or pad: posts, rails, panels or pickets, gates, raked or stepped on the ground, a schedule, plan symbols and IFC elements. Also available to an assistant.
section: tasks
order: 66
keywords: fence, posts, rails, panels, pickets, gate, raked, stepped, terrain, schedule, ifc, railing, boundary
---

Make a fence along a feature line, an alignment, a parcel or a pad, with its posts and gates placed for you.

## Make a fence

1. Select a line, a parcel or a pad.
2. Open **Surface, More, Fences...**
3. Choose the style (panels, rails or pickets), raked or stepped, the height, the post spacing and the gate width, then **Fence along selection**, or **With a gate** to put a gate in the middle of the longest straight run.

Posts go at the ends, at each corner (a vertex that turns by 20 degrees or more), at both edges of every gate and at equal bays in between, none longer than the spacing. **Raked** panels follow the ground between their posts. **Stepped** panels stay level and step at the posts; the gap under a panel is widest at its downhill post, and the window warns when that gap is over the limit, or when the ground rises through a panel. Gates of 6 feet (1.8 m) and wider get two leaves; the plan shows the leaves open with their swing.

## Schedule and outputs

Each fence shows its length, posts by kind, panels, gates and steps, with a **CSV** schedule of posts, panels, rails, pickets and gates. The plan has fence layers (C-FENC, C-FENC-POST, C-FENC-GATE) for PDF, DXF and DWG. The IFC export holds the posts (IfcMember, post), panels (IfcRailing, user defined fence panel), rails (IfcMember) and gates (IfcDoor, gate), one system per fence.

## From an assistant

`fence_build` makes a fence (points or a named line, parcel or pad, gates by station) and `fence_list` lists the fences with their schedule.

## What is not done

The starting sizes are usual choices, not a code. Types from the Library are carried as a name only. Gates must lie in one straight run. BimCraft does not have this tool yet.
