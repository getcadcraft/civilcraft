---
title: Dhoofi qorshaha DXF
summary: Ku qor xarriiqyada qorshaha DXF R12 ah oo leh lakabyo magac leh, kontuurada heerarkooda, iyo xarriiqyada jabinta 3D, si barnaamij CAD kasta u akhrin karo.
keywords: dxf, dwg, cad, dhoofin, xarriiqyo, r12, 2000, 2004, 2007, 2010, 2013, 2018, lakabyo, kontuur, isweydaarsiga naqshadaha, khariidadda asaasiga ah, asal
from: f2d8ede9
---

{{ui:DXF}} wuxuu qoraa waxa qorshuhu muujinayo oo ah fayl DXF, qaabka R12, kaas oo barnaamij CAD kasta furi karo. Haddii aad AutoCAD ama Civil 3D isticmaashay, u fur ama geli sida aad DXF kasta u furi lahayd.

## Dhoofin

1. Qorshaha u deji sida naqshadda aad rabto: hoos **Bandhig** dooro dusha (jirta ama la soo jeediyay), fogaanta kontuurka, iyo waxyaabaha la daaro (kontuurada, calaamadaha, barooyinka, calaamadaha barooyinka, saddexagallada, xarriiqyada jabinta, cidhifka dusha, tuubooyinka, falaarta jiifka).
2. Riix {{ui:DWG/DXF}} kooxda **Dhoofi** oo dooro {{ui:DXF (R12, qoraal) — faylka isweydaarsiga fudud}}, kadibna {{ui:Download}}.
3. Browser-ka wuxuu soo dejiyaa `<name>.dxf`. Status bar-ka wuxuu tusaale ahaan sheegaa "Waa la dhoofiyay DXF R12: 2,140 shay; calaamadaha loo cabbiray 1" = 40'". Heerarka dhererka lama dhoofin.

Isku-xidhka waxaa lagu qoraa unugyada mashruucaaga, qiimayaashooda dhabta ah (isku-xidhka state plane wuxuu sidiisa ku sii jiraa). Waxba lama cabbiro ama lama guuro.

## Waxa ku jira faylka

| Shay | Unuga DXF | Lakab |
|---|---|---|
| Kontuurada yar iyo kuwa weyn | Polilayn 2D oo heerkooda ku jira | C-TOPO-MINR, C-TOPO-MAJR |
| Calaamadaha kontuurka | Qoraal | C-TOPO-TEXT |
| Saddexagallada | Polilayn | C-TOPO-TINN |
| Xarriiqyada jabinta iyo xadka | Polilayn 3D | C-TOPO-BRKL |
| Cidhifka dusha | Polilayn | C-TOPO-BNDY |
| Falaarta jiifka | Polilayn | C-TOPO-SLOP |
| Barooyinka sahanka iyo calaamadahooda | Barooyin (oo leh dhererka), qoraal | V-NODE, V-NODE-TEXT |
| Xarriiqyada koodhadhka xarriiqa | Polilayn 3D | V-NODE-LINE |
| Dhexe-xarriiqyada khadka waddada | Xarriiqyo iyo qaansooyin | C-ROAD-CNTR |
| Calaamadaha istaashiyanka iyo calaamadahooda | Polilayn, qoraal | C-ROAD-STAN |
| Cidhifyada koridorka | Polilayn | C-ROAD-CORR |
| Xarriiqyada muunadda | Polilayn | C-ROAD-SCTN |
| Padyada, xarriiqyada iftiinka dhulka, xarriiqyada jiifka | Polilayn | C-GRAD-PADS, C-GRAD-DAYL, C-GRAD-SLOP |
| [Xarriiqyada muhiimka ah](topic:feature-lines) | Polilayn 3D (qaansooyinka qaybo ku jira 0.01 dhexdooda; eeg [Xarriiqyada muhiimka ah](topic:feature-lines)) | C-GRAD-FEAT |
| Waddooyinka wareegga | Polilayn, qoraal | C-ROAD-SWPT |
| Tuubooyinka, qaab-dhismeedyada, calaamadahooda | Polilayn, qoraal | C-STRM-PIPE, C-STRM-STRC, C-STRM-TEXT |
| Tuubooyinka iyo qaab-dhismeedyada dhibaato leh | Polilayn | C-STRM-PROB |

Lakab walba midab baa leh. Liistada oo dhan waxay ku jirtaa [Lakabyada qorshaha](topic:plan-layers).

## Cabbirka calaamadaha

Qoraalku waa inuu leeyahay cabbir unugyada naqshadda. CivilCraft wuxuu u cabbiraa calaamadaha miisaanka uu qorshaha oo dhan ku habboon yahay xaashi Tabloid ah (fiit) ama xaashi A3 ah (mitir), wuxuuna sheegaa miisaanka fariinta status-ka. Haddii aad miisaan kale ku daabacdo barnaamijka CAD-kaaga, qoraalka halkaas miisaan ku samee.

## Waxa aan lagu dhoofin

- Heerarka dhererka (shaashadda kaliya).
- Muuqaalka profile-ka. Profile-yada waxa lagu dhoofiyaa LandXML, mana aha naqshad.
- Dusha laftiisa oo ah shay 3D. Isticmaal LandXML si aad TIN-ka u hesho, ama shid {{ui:Triangles}} si aad cidhifkeeda xarriiqyo ugu hesho.
- Wax kasta oo aad ku damisay hoos **Bandhig**.

## DWG

{{ui:DWG/DXF}} wuxuu xarriiqyada isku mid ah sidoo kale u qoraa naqshad DWG ah. Wadahadalkeeda wuxuu weydiinayaa qaabka: DXF, ama DWG 2000, 2004, 2007, 2010, 2013 ama 2018. 2000 waxay furmaa barnaamijyada CAD ee badankood, kuwa duq iyo kuwa cusub. Dooro mid cusub markii qofka helaya naqshadda uu weydiisto. Doorashadaada browser-kan ayaa lagu xasuustaa.

1. Riix {{ui:DWG}} kooxda **Dhoofi**.
2. Dooro **Format** oo riix **Download DWG**.
3. Browser-ka wuxuu soo dejiyaa `<name>.dwg`. Status bar-ka wuxuu sheegaa waxa gashay, tusaale ahaan "Waa la dhoofiyay DWG (qaabka 2018): 12 polilayn, 40 calaamad oo ku jira 9 lakab".

DWG-ga wuxuu leeyahay lakabyada isku mid ah, midabyada, kontuurada (sida polilayn heerkooda), xarriiqyada jabinta 3D, calaamadaha iyo barooyinka DXF-ka oo kale, iyo isku-xidhka isku mid ah. Magacyada lakabka oo DWG aanu qaadi karin waa la beddelaa, fariinta status-ka ayaa sheegta. CivilCraft wuxuu DWG ku qoraa koodkiisa, markaasna wax kastaba kumbiyuutarkaaga kama baxaan.

### Lakabyada khariidadda ee DWG-ga

Naqshad DWG ah sawir gudaheeda kuma qaadi karto: barnaamijyada CAD waxay muujiyaan sawir u taagan naqshadda dhinaceeda. Marka lakabyada khariidaddu muuqdaan, wadahadalku wuxuu soo jeedinayaa **Lakabyada khariidadda sida sawir naqshadda dhinaceeda**. Marka la calaamadiyo, soo dejintu waa `.zip` ku jira `<name>.dwg`, `<name>-map.png` (lakabyada khariidadda naqshadda oo dhan dushooda, ilaa 4,096 pikseel ballaadhka) iyo `<name>-map.pgw` (faylka adduunka, barnaamijyada GIS). Naqshaddu sawirka wuxuu u muujinayaa sida sawir ku jira lakabka G-MAP-IMAG, meeshiisa. Faylasha ku fur hal gal, oo isku hay.
