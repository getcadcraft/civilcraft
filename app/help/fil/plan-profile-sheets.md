---
title: Plan at profile sheets
summary: I-plot ang isang alignment bilang hanay ng plan at profile sheet sa iisang PDF, na may match line sa pagitan ng mga ito.
keywords: plan and profile, sheets, plot, pdf, match line, paggawa ng plano, plano ng kalsada, plot ng profile, vertical exaggeration, hanay ng sheet
from: 34b4ec78
---

Ganito karaniwang iginuguhit ang plano ng kalsada gamit ang plan at profile sheets: bawat sheet ay nagpapakita ng isang bahagi ng kalsada nang dalawang beses, ang plan sa itaas at ang profile sa ibaba, sa parehong horizontal scale, kaya nasa iisang lugar ang isang station sa dalawa.

## Gumawa ng mga sheet

1. Piliin ang alignment. Sa **Properties**, i-click ang {{ui:Plan and profile sheets}}.
2. Piliin ang **Paper**, ang **Plan scale** at ang **Profile exaggeration** (ilang beses na mas mataas ang pagkakaguhit ng profile kaysa sa haba nito; 10× bilang panimula). Sinasabi ng dialog kung ilang sheet ang magagawa at kung gaano karaming bahagi ng alignment ang ipinapakita ng bawat isa.
3. Para i-plot ang bahagi lamang ng alignment, baguhin ang **From station** at **To station**.
4. I-click ang {{ui:Download PDF}}. Ang PDF ay may isang pahina bawat sheet.

## Ano ang nasa sheet

| Bahagi | Ipinapakita |
|---|---|
| Plan | Lahat ng nasa plano (contours, survey points, ang alignment at stationing nito, corridors, pads, feature lines, pipes, sample lines), iniikot para tumawid sa sheet ang bahaging ito, kasama ang north arrow na naka-ikot ayon dito |
| Match lines | Isang dash-dot line na patayo sa alignment sa bawat dulo na nagpapatuloy sa ibang sheet, may label na "Match line sta 5+50.00, tingnan ang sheet 2" |
| Profile | Ang existing ground (may gitling), ang design profile (pula), ang grade ng bawat tangent at ang PVI, elevation, L at K ng bawat vertical curve; mga station sa ibaba, mga elevation sa magkabilang gilid |
| Title strip | Ang pangalan ng proyekto, ang alignment at saklaw ng station nito, "Sheet 1 ng 3", ang horizontal at vertical scale, at ang exaggeration |

Ang saklaw bawat sheet ay kasing haba ng pinapayagan ng plan window sa scale, binilugan pababa sa buong 50 ft (20 m) sa mahahabang bahagi o sa buong 10 ft (5 m) sa maiikli.

:::note
Kapag hindi kasya ang mga elevation ng profile sa exaggeration na pinili mo, iguguhit ng CivilCraft ang bawat sheet sa pinakamalaki sa 10×, 5×, 4×, 2× at 1× na kasya, at sinasabi ito ng status bar. Ang kurbadang alignment ay iniikot ayon sa direksyon mula sa simula hanggang sa dulo ng bawat bahagi, kaya maaaring bahagyang tumaas o bumaba ang kalsada sa sheet.
:::
