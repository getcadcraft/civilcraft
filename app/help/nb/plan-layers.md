---
title: Planlayere
summary: De faste layernavnene, fargene og linjevektene CivilCraft bruker på skjermen, i DXF og i PDF, og hvilken visningsinnstilling som styrer hvert enkelt.
keywords: layer, layernavn, ncs, farger, aci, linjevekt, dxf-layer, pdf, visningsinnstillinger, linjetegning
from: c2aa8475
---

Alt på planen hører til et layer. Navnene følger det vanlige mønsteret for anleggsprosjekter (fag, hovedgruppe, undergruppe). Layerne er faste i denne versjonen: de kan ikke gis nytt navn, endres i farge eller suppleres med egne. I DXF har hvert layer fargenummeret som vises; i PDF med {{ui:Layerfarger}} brukes de samme fargene, og med {{ui:Svart}} skrives alt ut i svart.

| Layer | Inneholder | Farge (DXF-nummer) | Vises når |
|---|---|---|---|
| C-TOPO-MINR | Mindre høydekurver | Grå (8) | {{ui:Høydekurver}} |
| C-TOPO-MAJR | Hovedhøydekurver | Hvit eller svart (7) | {{ui:Høydekurver}} |
| C-TOPO-TEXT | Kurveetiketter | Hvit eller svart (7) | {{ui:Høydekurver}} og {{ui:Kurveetiketter}} |
| C-TOPO-TINN | Trekantkanter | Grå (8) | {{ui:Trekanter}} |
| C-TOPO-BRKL | Bruddlinjer og grensen | Oransje (30) | {{ui:Bruddlinjer}} |
| C-TOPO-BNDY | Terrengmodellens kant | Hvit eller svart (7) | {{ui:Terrengmodellens kant}} |
| C-TOPO-SLOP | Fallpiler | Cyan (4) | {{ui:Fallpiler}} |
| V-NODE | Oppmålingspunkter | Grønn (3) | {{ui:Punkter}} |
| V-NODE-TEXT | Punktetiketter: nummer, kote, beskrivelse | Grønn (3) | {{ui:Punkter}} og {{ui:Punktetiketter}} |
| V-NODE-LINE | Linjer fra linjekoder (grupper som ikke er bruddlinjer) | Grønn (3) | {{ui:Punkter}} |
| C-ROAD-CNTR | Veglinjenes senterlinjer | Rød (1) | Alltid |
| C-ROAD-STAN | Profilnummermerker og etiketter, PC og PT | Rød (1) | Alltid |
| C-ROAD-CORR | Korridorkanter | Gul (2) | Alltid |
| C-ROAD-SCTN | Profillinjer (der tverrprofiler kuttes) | Grå (8) | Når veglinjen har profillinjer |
| C-GRAD-PADS | Byggeplatekonturer | Blå (5) | Alltid |
| C-GRAD-DAYL | Dagslinjer | Magenta (6) | Alltid |
| C-GRAD-SLOP | Skråningslinjer i terrengforming | Magenta (6) | Alltid |
| C-GRAD-FEAT | Formlinjer (3D) | Grønn (3) | Alltid |
| C-ROAD-SWPT | Sveipebaner: kontur, ytterste hjulspor, navn | Oransje (30) | Alltid |
| C-STRM-PIPE | Rør | Blå (5) | {{ui:Rør}} |
| C-STRM-STRC | Konstruksjoner | Blå (5) | {{ui:Rør}} |
| C-STRM-TEXT | Etiketter for rør og konstruksjoner | Blå (5) | {{ui:Rør}} |
| C-STRM-PROB | Rør og konstruksjoner med problemer | Rød (1) | {{ui:Rør}} |

Bruddlinjer tegnes bare mens **Flate** under **Visning** er {{ui:Eksisterende terreng}}; grensen tegnes med begge flatene.

## Linjevekter i PDF

| Vekt | Layer |
|---|---|
| 0.50 mm | Veglinjenes senterlinjer, byggeplater, rør, problemrør |
| 0.35 mm | Hovedhøydekurver, dagslinjer, konstruksjoner |
| 0.25 mm | Bruddlinjer |
| 0.13 mm | Mindre høydekurver |
| 0.09 mm | Trekantkanter, skråningslinjer i terrengforming |
| 0.18 mm | Alt annet |

DXF-filer har ingen linjevekter; sett dem per layer i tegneprogrammet.

## Etikettstørrelser

Etiketter er dimensjonert på papir: høydekurvetiketter 2.0 mm, profilnummeretiketter 1.8 mm, PC- og PT-etiketter samt rør- og konstruksjonsetiketter 1.6 mm, punktetiketter 1.5 mm. Rørstiketter gir navn, diameter og fall; konstruksjonsetiketter gir navn og kumtopp. På skjermen beholder de samme størrelse når det zoomes. I DXF skaleres de for målestokken som er angitt i eksportmeldingen; se [Eksporter planen til DXF](topic:dxf-export).

## Vises ikke på noe layer

Høydebånd tegnes under linjetegningen bare på skjermen. Profilvisningen er ikke en del av planen.
