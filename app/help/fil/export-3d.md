---
title: I-export ang site sa 3D
summary: I-save ang ipinapakita ng 3D view bilang GLB o OBJ file para sa ibang 3D program, sa meters na may Y up, sa paligid ng local origin na itinatala ng file.
keywords: glb, gltf, obj, 3d export, i-export 3d, model export, game engine, visualization, 3d viewer, meters, y up, origin, local origin, state plane
from: 07d23992
---

Ini-export ng 3D view ang ipinapakita nito bilang 3D model na mabubuksan ng ibang program: isang 3D viewer, modeler, game engine o visualization tool.

## I-export

1. Buksan ang 3D view ({{key:D}}) at piliin kung ano ang ipapakita gamit ang {{ui:Show}}. Ang nakatago ay hindi ina-export.
2. I-click ang {{ui:GLB}} o {{ui:OBJ}} sa bar.
   Magda-download ang file bilang "*project name*-3d.glb" o "-3d.obj", at sinasabi ng status bar ang origin.

## Ano ang laman ng mga file

| | GLB | OBJ |
|---|---|---|
| Mga surface | Mga mesh na may normals at ang kulay ng band o surface | Mga mesh na may normals (walang kulay) |
| Mga pipe at structure | Bilog na mesh; ang may problema ay pula | Bilog na mesh |
| Contours, breaklines, alignments, ticks, corridor at pad lines | Mga linya, bawat set ay nasa sarili nitong kulay | Line records (`l`) |
| Survey points | Points | Point records (`p`) |

Pinananatili ng bawat set ang pangalan nito ("Existing ground", "Pipes", "Major contours" at iba pa), kaya maitatago mo o mabibigyan ng estilo sa ibang program.

## Units, axes at origin

- **Meters.** Ang feet na proyekto ay kino-convert mula sa US survey feet (1 ft = 1200/3937 m).
- **Y up**, ang karaniwang convention ng mga format na ito: ang easting ay nagiging +X, ang elevation ay +Y, at ang northing ay −Z.
- **True scale.** Hindi inilalapat ang vertical exaggeration ng view.
- **Isang local origin.** Ang state plane coordinates ay milyon-milyong feet, masyadong malaki para sa single-precision numbers na iniimbak ng mga format na ito, kaya isinusulat ang file na relative sa malapit na origin: ang sariling origin ng umiiral na lupa para sa easting at northing, at ang pinakamababang elevation nito (round down). Itinatala ang origin, sa units ng proyekto, sa file: sa GLB bilang `extras` sa scene at sa top node nito, sa OBJ bilang comment line malapit sa itaas (`# origin easting … northing … elevation …`). Para ibalik ang model sa coordinates ng proyekto, idagdag ang origin (pagkatapos i-convert ang meters pabalik sa feet sa feet na proyekto).

## Hindi pa nagagawa

- Pag-export ng exaggerated view, o pag-export sa project units sa halip na meters.
- Textures, material file para sa OBJ (.mtl) at per-object properties (ang mga pangalan ng pipe at structure ay nasa CivilCraft lamang).
- Pag-export ng corridor bilang hiwalay na solids, o ng profile view sa 3D.
