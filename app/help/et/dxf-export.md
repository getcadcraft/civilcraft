---
title: Plaani eksportimine DXF-failina
summary: Kirjuta plaani jooned R12 DXF-failina nimetatud kihtidele, samakõrgusjooned nende kõrgusel ja murdejooned 3D-s, mis tahes CAD-programmi jaoks.
keywords: dxf, dwg, cad, eksport, jooned, r12, 2000, 2004, 2007, 2010, 2013, 2018, kihid, samakõrgusjooned, joonise vahetus, aluskaart, taust
from: f2d8ede9
---

{{ui:DXF}} kirjutab selle, mida plaan näitab, DXF-failina R12 vormingus, versioonis, mida avab iga CAD-programm. Kui oled kasutanud AutoCAD-i või Civil 3D-d, ava või lisa see fail nii nagu iga muu DXF-i.

## Eksport

1. Seadista plaan joonise jaoks, nagu soovid: jaotises **Kuva** vali pind (olemasolev või projekteeritud), samakõrgusjoonte intervall ja see, mis on sisse lülitatud (samakõrgusjooned, sildid, punktid, punktisildid, kolmnurgad, murdejooned, pinna serv, torud, kalde nooled).
2. Klõpsa jaotises **Eksport** nupul {{ui:DWG/DXF}} ja vali {{ui:DXF (R12, tekst) — lihtne vahetusfail}}, seejärel {{ui:Laadi alla}}.
3. Brauser laadib alla faili `<name>.dxf`. Olekuribal on näiteks: „Exported R12 DXF: 2,140 objects; labels sized for 1" = 40'. Bands are not exported.“

Koordinaadid kirjutatakse sinu projekti ühikutes, nende tegelikes väärtustes (riigi koordinaatsüsteemi koordinaadid jäävad samaks). Midagi ei skaleerita ega nihutata.

## Mis failis on

| Objekt | DXF-element | Kiht |
|---|---|---|
| Peened ja põhilised samakõrgusjooned | 2D-murdjooned nende kõrgusel | C-TOPO-MINR, C-TOPO-MAJR |
| Samakõrgusjoonte sildid | Tekst | C-TOPO-TEXT |
| Kolmnurgad | Murdjooned | C-TOPO-TINN |
| Murdejooned ja piir | 3D-murdjooned | C-TOPO-BRKL |
| Pinna serv | Murdjooned | C-TOPO-BNDY |
| Kalde nooled | Murdjooned | C-TOPO-SLOP |
| Mõõdistuspunktid ja nende sildid | Punktid (koos kõrgusega), tekst | V-NODE, V-NODE-TEXT |
| Joonekoodidest tulevad jooned | 3D-murdjooned | V-NODE-LINE |
| Trassi telgjooned | Jooned ja kaared | C-ROAD-CNTR |
| Pikettimärgid ja sildid | Murdjooned, tekst | C-ROAD-STAN |
| Koridori servad | Murdjooned | C-ROAD-CORR |
| Proovijooned | Murdjooned | C-ROAD-SCTN |
| Platvormid, väljumisjooned, kaldejooned | Murdjooned | C-GRAD-PADS, C-GRAD-DAYL, C-GRAD-SLOP |
| Tunnusjooned | 3D-murdjooned (kaared tükkidena 0.01 piires; vt [Tunnusjooned](topic:feature-lines)) | C-GRAD-FEAT |
| Sõidutrajektoorid | Murdjooned, tekst | C-ROAD-SWPT |
| Torud, rajatised, sildid | Murdjooned, tekst | C-STRM-PIPE, C-STRM-STRC, C-STRM-TEXT |
| Probleemsed torud ja rajatised | Murdjooned | C-STRM-PROB |

Igal kihil on oma värv. Täielik loend on jaotises [Plaani kihid](topic:plan-layers).

## Siltide suurus

Tekst peab joonise ühikutes omama suurust. CivilCraft sobitab siltide suuruse mõõtkavaga, mille juures kogu plaan mahub Tabloid-lehele (jalad) või A3-lehele (meetrid), ning ütleb olekuteates, milline mõõtkava see on. Kui prindid oma CAD-programmis teises mõõtkavas, skaleeri tekst seal.

## Mis ei eksportita

- Kõrgusvööndid (ainult ekraanil).
- Pikiprofiilivaade. Profiilid eksporditakse LandXML-ina, mitte joonisena.
- Pind ise 3D-objektina. TIN-i jaoks kasuta LandXML-i või lülita sisse {{ui:Kolmnurgad}}, et saada selle servad joonestena.
- Kõik, mida sa jaotises **Kuva** välja lülitasid.

## DWG

{{ui:DWG/DXF}} kirjutab sama joonestiku ka DWG-joonisena. Selle dialoog küsib vormingut: DXF või DWG 2000, 2004, 2007, 2010, 2013 või 2018. Versioon 2000 avaneb peaaegu igas CAD-programmis, nii vanas kui uues; vali uuem, kui joonise saaja seda nõuab. Sinu valik jääb sellesse brauserisse meelde.

1. Klõpsa jaotises **Eksport** nupul {{ui:DWG}}.
2. Vali **Vorming** ja klõpsa **Laadi DWG alla**.
3. Brauser laadib alla faili `<name>.dwg`. Olekuribal on, mis sisse läks, näiteks „Exported DWG (2018 format): 12 polylines, 40 labels on 9 layers“.

DWG-s on samad kihid, värvid, samakõrgusjooned (kõrgusel asuvate murdjoontena), 3D-murdejooned, sildid ja punktid nagu DXF-is, samades koordinaatides. Kihinimed, mida DWG ei kanna, muudetakse ja olekuteade ütleb seda. CivilCraft kirjutab DWG oma koodiga, nii et midagi ei lahku sinu arvutist.

### Kaardikihid DWG-s

DWG-joonis ei saa endas hoida pilti: CAD-programmid näitavad pilti, mis asub joonise kõrval. Kui kaardikihid on nähtaval, pakub dialoog valikut **Kaardikihid pildina joonise kõrval**. Kui see on märgitud, on allalaadimine `.zip`, mis sisaldab faili `<name>.dwg`, faili `<name>-map.png` (kaardikihid kogu joonise kohal, kuni 4,096 pikslit laiuselt) ja faili `<name>-map.pgw` (selle maailmafail GIS-programmide jaoks). Joonis näitab pilti kihil G-MAP-IMAG kohapeal. Paki failid lahti ühte kausta ja hoia need koos.
