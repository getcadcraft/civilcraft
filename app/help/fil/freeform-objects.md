---
title: Freeform objects
summary: Dalhin sa site ang hugis na ginawa sa ibang app (STL, OBJ o library item); nakapatong ito sa lupa o nakaukit dito, at binibilang ang volume, lawak at footprint nito gaya ng iba.
keywords: freeform, custom object, sculpture, planter, seat, mesh, stl, obj, library item, terrain aware, sumunod sa lupa, ukit sa lupa, dami, volume, ifc
from: ec835f33
---

Ang isang natatanging feature (isang planter, seat wall, sculpture, play mound) ay maaaring gawin sa ModelCraft o PartCraft at ilagay dito, para nasa iisang model at iskedyul kasama ng lahat ng iba.

1. Landscape › More › {{ui:Freeform object…}} at piliin ang **STL** o **OBJ** file (sa units ng proyekto: feet sa feet na proyekto, metres sa metres na proyekto) o isang CadCraft **library item** (`.json`) na may mesh body.
2. I-click kung saan ito ilalagay.

## Ang base nito

- **Sumusunod sa lupa**: ang pinakamababang point nito ay nakapatong sa pinakamababang lupa sa ilalim ng footprint nito, kaya walang lumulutang. Tinatantiya ng Properties kung gaano karami nito ang nasa ilalim ng lupa.
- **Inuukit ang lupa**: ang base nito ay itinakda sa isang elevation, at ang lupa sa loob ng footprint nito ay ginradehan dito gamit ang daylight slopes, at binibilang sa Earthwork gaya ng platform.

Paikutin ito gamit ang **Turned**; i-drag ito sa plano para ilipat.

## Binibilang

Ibinibigay ng Properties ang **volume** nito (para sa sarado na solid), ang **lawak ng surface**, ang **footprint** at ang **taas**, na sinusukat mula sa mesh. Isinusulat ito ng IFC export kasama ang **IFC class** na pipiliin mo at ang mga quantity na iyon.

:::note
Ang footprint ay ang convex hull ng outline: ang concave na hugis (isang L-shaped na planter) ay ginradehan na parang napuno na.
:::
