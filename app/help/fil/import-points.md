---
title: Mag-import ng survey point
summary: Magbukas ng CSV o text point file, suriin ang column order sa Import points dialog, ayusin ang mga row na hindi mabasa, at ayusin ang mga punto sa mga group.
keywords: import points, csv, txt, pnezd, penzd, point file, survey, cogo points, point groups, columns, northing easting
from: ad33d88a
---

Ang point file ay text file na may isang punto bawat linya: point number, northing, easting, elevation at description sa anumang pagkakasunod, pinaghihiwalay ng kuwit, tab, semicolon o espasyo. Binabasa ito ng CivilCraft sa browser at agad na gumagawa ng surface mula rito.

## Bago ka magsimula

- Alamin ang column order ng file kung kaya mo (magkamukha ang PNEZD at PENZD sa computer).
- Alamin ang mga unit nito. Hindi kino-convert ng CivilCraft: itakda ang **Units** sa kaliwang panel para tumugma sa file (tingnan ang [Units, stations and number formats](topic:units-and-stations)).
- Maaaring malaki ang mga coordinate (ayos lang ang state plane northing at easting na milyon-milyon).

## I-import ang file

1. I-click ang {{ui:Open}} sa toolbar, o pindutin ang {{key:Mod+O}}, at piliin ang file. Maaari mo rin itong i-drag sa plano.
   Bumubukas ang **Import points** dialog na may pangalan ng file, listahan ng **Columns** na nakatakda sa {{ui:Detect}}, isang summary line at ang unang anim na punto.
2. Basahin ang summary line. Sinasabi nito kung ilang punto ang nabasa, sa aling column order, paano natukoy ang order na iyon, at ano ang naghihiwalay sa mga column. Tatlong paraan kung paano natutukoy ang order:
   - "from the header row": ang unang linya ang nagpapangalan sa mga column nito (Point, Northing, Easting, Elevation, Description, o X, Y, Z …). Ito ang pinakaligtas.
   - "as chosen": pumili ka ng order sa **Columns**.
   - "guessed from the column count and your point row setting (PNEZD) — check that northing and easting are not swapped": walang magagamit na header. Kung karaniwang easting ang nauuna sa mga file mo, itakda ang **Point rows** sa P, E, N, Z, D sa [CivilCraft settings](topic:settings).
3. Suriin ang preview table. Laging **Point**, **Northing**, **Easting**, **Elevation**, **Description** ang mga column nito, anuman ang order ng file. Karaniwang malinaw na magkaiba ang laki ng northing at easting ng isang tunay na site: kung mukhang nagpalit sila, mali ang hula.
4. Kung mali ang order, piliin ang tama sa **Columns** (halimbawa {{ui:PENZD — point, easting, northing, elevation, description}}). Agad na nag-a-update ang summary at preview.
5. Tingnan sa ilalim ng preview ang **Rows not read**. Pinangalanan ng bawat linya ang line number ng file, ang dahilan at ang simula ng row. Tingnan ang [Rows that are not read](topic:import-points#rows-that-are-not-read).
6. I-click ang {{ui:Import}}. Lumalabas ang mga punto sa plano, nagzu-zoom ang view sa mga ito at nabubuo ang surface. Sinasabi ng status bar, halimbawa, "Imported 276 points from site.csv; surface: 546 triangles."

Kung wala pang pangalan ang proyekto, kukunin nito ang pangalan ng file.

## Suriin ang mga group

Bawat punto ay kabilang sa isang group na pinangalanan ayon sa **unang salita ng description nito**, sa malalaking titik: ang "GRD", "FL 12" at "fl" ay mga group na GRD, FL at FL. Ang mga punto na walang description ay napupunta sa "(no description)".

1. Tingnan ang table sa ilalim ng **Points** sa kaliwang panel: group, bilang ng punto at pagpili ng **Surface**.
2. Nagsisimula ang bawat group bilang {{ui:Mga punto}}. Palitan ng {{ui:Breakline}} ang flowline, gilid ng pavement, top at toe ng slope, ridge at mga katulad na coded line. Itakda sa {{ui:Hindi isinama}} ang mga group na hindi dapat humubog sa ground (control point, tuktok ng puno, poste ng utility na sinukat sa tuktok).
3. I-click ang punto sa plano (gamit ang {{ui:Piliin}}) para makita ang number, coordinates, elevation, description at group nito sa kanang panel.

:::warning
Pinagdudugtong ng breakline group ang **lahat** ng punto nito sa **isang** linya, ayon sa pagkakasunod ng point number. Gumagana ito kapag bawat coded line ay sinukat nang sunud-sunod na may sariling code. Ang dalawang magkahiwalay na flowline na parehong coded na "FL" ay nagiging isang linyang zig-zag sa pagitan nila. Kung pinagsasaluhan ang mga code mo, gamitin ang tool na {{ui:Breakline}} para i-click ang mga punto ng bawat linya (tingnan ang [Buuin at pinuhin ang surface](topic:build-surface)).
:::

## Mga row na hindi nababasa

| Reason shown | What it means | What to do |
|---|---|---|
| "northing or easting is not a number" | Ang coordinate column ay may text | Suriin ang column order, o isang maling text row sa gitna ng file |
| "elevation is not a number" | Ang elevation column ay may text | Maling column order, o description sa elevation column |
| "no point number" | Walang laman ang point column | Lagyan ng numero ang punto, o pumili ng order na walang P (NEZD, NEZ …): kung gayon, bibigyan ng numero ang mga punto ng 1, 2, 3 … |
| "point 12 appears twice (the first one is kept)" | Dalawang row ang may parehong numero | Baguhin ang numero ng isa sa file kung parehong totoong sukat ang dalawa |
| "3 columns, expected 5 (PNEZD)" | Kulang ang row | Sirang linya, o maling column order |

Nananatili ang punto na walang elevation, pero hindi ito ginagamit sa surface. Ipinapakita ng **Points** facts kung ilang punto ang may elevation.

Nilalampasan ang mga linyang nagsisimula sa `#`, `;` o `//` bilang komento. Nilalampasan din ang mga blangkong linya.

## Palitan o magdagdag ng punto

Ang muling pag-import ay **pinapalitan** ang lahat ng punto; hindi ito nagdaragdag sa mga iyon. Nananatili ang iyong alignment, pad, pipe, iginuhit na breakline at boundary. Nabubura ang undo history, kaya i-save muna ang proyekto kung baka kailanganin mo pa ang lumang mga punto. Para pagsamahin ang dalawang file, pagdugtungin ang mga ito sa text editor o spreadsheet bago mag-import (bantayan ang mga paulit-ulit na point number).

Hindi pa maaaring ilipat, i-edit o burahin ang mga punto sa loob ng CivilCraft. Ayusin ang mga ito sa file at mag-import muli.

## Kaugnay

- [Point file formats](topic:point-file-formats): bawat column order at kung paano nakikilala ang mga header.
- [Buuin at pinuhin ang surface](topic:build-surface).
