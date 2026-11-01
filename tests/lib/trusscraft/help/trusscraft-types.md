---
title: TrussCraft: truss types and what they do
summary: King post, queen post, Howe, Pratt, Fink, scissor, mono and attic trusses, and the profile trusses a roof's hip and valley make; what TrussCraft can and cannot check.
section: reference
order: 2
keywords: king post, queen post, howe, pratt, fink, scissor, mono, attic, truss types, pitch, span, heel, overhang, raised heel, stub
---

## The types

| Type | Shape | Notes |
|---|---|---|
| King post | One post at the centre | Short spans. |
| Queen post | Two posts, a strut between them and a brace | The middle panel is a rectangle, so the brace is part of it. |
| Howe | Verticals and diagonals that rise toward the centre | Set the number of panels (even, 4 to 12). |
| Pratt | Verticals and diagonals that fall toward the centre | The same panels. |
| Fink | The W: two webs a side | The common domestic truss. |
| Scissor | Bottom chords that rise at a lower pitch | The bearings spread under load; the wall must allow for it. |
| Mono | A single slope | Panels as above; the tail is at the low end. |
| Attic | A room in the roof | With pinned corners the room is a mechanism. TrussCraft treats the room's four corners as rigid (a stated idealisation you can switch off) and solves the room as a frame; the forces depend on that statement. |

## Dimensions

**Span** is bearing to bearing, outer face to outer face. **Pitch** is the top chord's slope. **Overhang** is the plan distance the top chord runs past the bearing. **Heel height** is the vertical depth at the outer face. When it is taller than the chords need by 60 mm or more, the truss gets a **bearing stub** under each heel joint: a real member (ST1, ST2) that carries the vertical reaction in compression and appears in the member list, cut list and placed geometry. The horizontal heel reaction is shear at the stub and its anchorage, which Problems states. A smaller raise is drawn as a heel block. The cut list measures long point to long point along the centre-line, with webs shortened to the chord face.
