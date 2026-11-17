---
title: I-plot ang plano sa PDF
summary: I-plot ang lahat o ang kasalukuyang view sa vector PDF sa karaniwang sheet, sa engineering o metric scale, sa kulay ng layer o sa itim.
keywords: plot, print, pdf, sheet, scale, laki ng papel, plan sheet, publish, title block, north arrow, scale bar
from: 9af396ca
---

{{ui:PDF}} ay nag-plot ng plano sa vector PDF sa isang sheet, na may title strip, north arrow at scale bar. Ginagawa ang PDF sa browser at dina-download; hindi ito dumadaan sa print dialog ng browser.

## I-plot

1. Ayusin ang plano sa ilalim ng **Display**: ang surface na ipinapakita, ang contour interval, at kung aling mga bagay ang naka-on. Sinusunod ng plot ang mga setting na ito.
2. Kung bahagi lamang ng site ang gusto mo, i-zoom at i-pan ang plano sa bahaging iyon.
3. I-click ang {{ui:PDF}} sa grupong **Export**, o pindutin ang {{key:Mod+P}}.
   Bubukas ang dialog na **I-plot ang plano sa PDF**.
4. Piliin ang **Area**: {{ui:Everything}} o {{ui:What is on screen}}.
5. Piliin ang **Paper**: Letter, Tabloid, ANSI D, ARCH D, ISO A4, A3 o A1. Nagsisimula ang proyektong feet sa Tabloid, ang proyektong metro sa A3. Palaging landscape ang mga sheet.
6. Piliin ang **Scale**. Minamarkahan ng listahan ng "(fits)" ang pinakamalaking scale na kasya, at iyon ang pinipili.
   - Feet: 1" = 5', 10', 20', 30', 40', 50', 60', 100', 200', 300', 400', 500', 1000'.
   - Metro: 1:50, 1:100, 1:200, 1:250, 1:500, 1:1000, 1:2000, 1:2500, 1:5000, 1:10000.
7. Piliin ang **Ink**: {{ui:Layer colors}} o {{ui:Black}}.
8. Basahin ang linyang nasa ilalim ng mga pagpipilian. Ibinibigay nito ang sukat ng area sa papel at ang laki ng sheet, halimbawa: "Ang area ay 297 × 222 mm sa 1" = 40' sa sheet na 432 × 279 mm (landscape)."
9. I-click ang {{ui:Download PDF}}.
   Dina-download ng browser ang `<name>.pdf`. Sinasabi ng status bar na "Na-plot ang <name>.pdf sa 1" = 40'."

Kung mas malaki ang area kaysa sa sheet sa scale na pinili mo, nasa gitna ang plot at napuputol ang mga gilid. Piliin ang scale na may markang "(fits)" o mas malaking sheet.

## Ano ang nasa sheet

- Ang plano, nakasentro sa drawing area, bilang tunay na vector: contours, labels, alignment na may stationing, corridors, pads at daylight lines, pipes, points.
- Lapad ng linya ayon sa layer: mas mabigat ang alignment, pads at pipes; manipis ang triangles at minor contours.
- Title strip sa ilalim na may **Name** ng proyekto, ang scale, tala ng contour interval at kung aling surface ang ipinapakita (existing o graded), at ang petsa at build sa kanan.
- North arrow sa kanang itaas (nakaturo pataas ang north ng plano) at scale bar sa title strip.
- Ang mga map layer na nasa ilalim ng plano (larawan, map tiles o map service), kapag may tsek ang **Map layers under the plan**: iginuguhit ang mga ito bilang iisang larawan ng buong drawing area sa 150 dots per inch, sa ilalim ng linework, at ang attribution ng mapa ay napupunta sa title strip. Naghihintay ang CivilCraft nang hanggang 8 segundo para sa mga map picture na dumarating pa; kung may kulang pa, sinasabi ito ng status bar.

Gumagamit ng built-in na Helvetica ng PDF ang teksto. Ang mga karakter sa labas ng Western European set (Windows-1252) ay ipinapakitang "?", at binibilang ito ng status message.

## Ano ang hindi naka-plot

- Elevation bands.
- Ang profile view. Hindi pa available ang pag-plot ng profile.
- Higit sa isang sheet (para sa alignment, gamitin ang [plan and profile sheets](topic:plan-profile-sheets)), viewports, custom title block, o portrait na sheet.

:::note
Sinasabi ng dialog na screen lamang ang slope arrows. Sa build na ito, naka-plot (at ina-export sa DXF) ang slope arrows na naka-on sa ilalim ng **Display**. I-off ang mga ito bago mag-plot kung ayaw mo itong makita.
:::

## Pag-print sa papel

Buksan ang na-download na PDF sa anumang PDF viewer at i-print sa 100% (actual size) para manatiling tama ang scale. Binabago ng "Fit to page" ang scale.
