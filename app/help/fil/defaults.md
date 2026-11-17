---
title: Mga panimulang value at placeholders
summary: Bawat value na sinisimulan ng CivilCraft, para sa mga bagong project, display, alignments, pads, corridors, pipe networks, volumes at plots, at kung alin ang mga placeholder na dapat palitan.
keywords: defaults, mga default, settings, mga setting, panimulang value, placeholders, design criteria, standards, mga pamantayan, rules, assumptions
from: fbfc7432
---

Walang settings dialog o template ang CivilCraft. Ito ang mga value na sinisimulan ng mga bagay. Ang mga value na minarkahang **placeholder** ay hindi galing sa anumang pamantayan: palitan ang mga ito ng criteria ng iyong project bago ka umasa sa isang check o quantity.

## Bagong project

| Setting | Halaga |
|---|---|
| Name | Walang pamagat na site (papalitan ito ng pangalan ng unang point file) |
| Units | US feet |
| Surface name | Existing ground |
| Point groups | Bawat group ay nagsisimula bilang {{ui:Points}} |
| Longest outside edge | 0 (panatilihin ang bawat triangle) |
| Undo steps kept | 200 |

## Display

| Setting | Halaga |
|---|---|
| Surface | {{ui:Existing ground}} |
| Contours every | 1 (ft o m) |
| Major every | Ika-5 na contour |
| Bands | 8 |
| On | Naka-on: contours, contour labels, mga punto, breaklines, surface edge, pipes |
| Off | Naka-off: triangles, elevation bands, slope arrows, point labels |

## Alignments at profiles

| Setting | Halaga |
|---|---|
| Name | Alignment 1, Alignment 2 … |
| Start station | 0+00 |
| Curve radius at each interior PI | 100 ft o 30 m, mas maliit kung hindi ito kasya sa kalahati ng bawat tangent |
| Design profile | Wala hangga't hindi ka nagsisimula ng isa; ang {{ui:Start from the ground}} ay naglalagay ng PVI sa ground sa bawat dulo |
| Vertical curve length | 0 (walang curve) hangga't wala kang itinatype |

## Pads

| Setting | Halaga |
|---|---|
| Name | Pad 1, Pad 2 … |
| Elevation | Ang ground sa gitna ng pad, bilugan sa 0.1 (0 kung nasa labas ng surface ang gitna) |
| Cut slope | 2 : 1 (placeholder) |
| Fill slope | 3 : 1 (placeholder) |

## Corridor assembly (placeholders)

| Setting | US feet | Metres |
|---|---|---|
| Lapad ng lane | 12 ft | 3.6 m |
| Lane slope | 2% | 2% |
| Lapad ng shoulder | 4 ft | 1.2 m |
| Shoulder slope | 4% | 4% |
| Cut slope | 2 : 1 | 2 : 1 |
| Fill slope | 3 : 1 | 3 : 1 |
| Section kada | 10 ft | 5 m |

## Pipe network

| Setting | US feet | Metres |
|---|---|---|
| Pangalan at uri | Storm, storm | Storm, storm |
| Least slope (placeholder) | 0.50% | 0.50% |
| Least cover (placeholder) | 2 ft | 0.6 m |
| Drop in structures (placeholder) | 0.10 ft | 0.03 m |
| Diameter ng bagong structure | 48 in | 1200 mm |
| Diameter ng bagong pipe | 12 in | 300 mm |
| Sump depth | 0 | 0 |
| Rim | Mula sa surface | Mula sa surface |

Ang pipe network na binuksan mula sa LandXML ay gumagamit din ng mga patakarang ito, dahil hindi dala ng LandXML ang mga ito.

## Volumes

| Setting | Halaga |
|---|---|
| Method | Grid, sinusukat sa cell centers sa loob ng daylight lines |
| Cell size | Pinili para ang bounding rectangle ng graded area ay maglaman ng mga 250,000 cells (1, 2 o 5 beses ang power of ten) |
| Swell and shrink | Wala |

## Plot

| Setting | Halaga |
|---|---|
| Area | {{ui:Everything}} |
| Paper | Tabloid 11 × 17 in (feet projects), ISO A3 (metre projects); laging landscape |
| Scale | Ang pinakamalaking nakalistang scale na kasya |
| Ink | {{ui:Layer colors}} |

Sinusukat ang DXF labels para sa scale kung saan kasya ang lahat sa Tabloid (feet) o A3 (metro).
