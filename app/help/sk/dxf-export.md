---
title: Export pôdorysu do DXF
summary: Zapíše čiary pôdorysu ako DXF vo formáte R12 na pomenované hladiny, s vrstevnicami v ich výškach a hranami zlomu v 3D, pre ľubovoľný CAD program.
keywords: dxf, dwg, cad, export, čiary, r12, 2000, 2004, 2007, 2010, 2013, 2018, hladiny, vrstevnice, výmena výkresov, podkladová mapa, podklad
from: f2d8ede9
---

{{ui:DXF}} zapíše to, čo pôdorys zobrazuje, ako súbor DXF vo formáte R12, verzii, ktorú otvorí každý CAD program. Ak ste používali AutoCAD alebo Civil 3D, otvorte alebo vložte ho rovnako ako ktorýkoľvek iný súbor DXF.

## Export

1. Nastavte pôdorys podľa potreby výkresu: v časti **Zobrazenie** vyberte povrch (jestvujúci alebo navrhovaný), interval vrstevníc a to, čo má byť zapnuté (vrstevnice, popisy, body, popisy bodov, trojuholníky, hrany zlomu, hrana povrchu, potrubia, šípky sklonu).
2. Kliknite na {{ui:DWG/DXF}} v skupine **Export** a vyberte {{ui:DXF (R12, text) — obyčajný výmenný súbor}}, potom kliknite na {{ui:Stiahnuť}}.
3. Prehliadač stiahne `<name>.dxf`. Stavový riadok hlási napríklad: "Exportovaný R12 DXF: 2,140 objektov; popisy dimenzované pre 1" = 40'. Výškové pásma sa neexportujú."

Súradnice sa zapisujú v jednotkách projektu, v ich skutočných hodnotách (súradnice v štátnej rovinnej sústave zostávajú nezmenené). Nič sa neškáluje ani nepresúva.

## Čo je v súbore

| Vec | Entita DXF | Hladina |
|---|---|---|
| Menšie a hlavné vrstevnice | 2D lomené čiary vo svojej výške | C-TOPO-MINR, C-TOPO-MAJR |
| Popisy vrstevníc | Text | C-TOPO-TEXT |
| Trojuholníky | Lomené čiary | C-TOPO-TINN |
| Hrany zlomu a hranica | 3D lomené čiary | C-TOPO-BRKL |
| Hrana povrchu | Lomené čiary | C-TOPO-BNDY |
| Šípky sklonu | Lomené čiary | C-TOPO-SLOP |
| Zamerané body a ich popisy | Body (s výškou), text | V-NODE, V-NODE-TEXT |
| Čiary z kódov čiar | 3D lomené čiary | V-NODE-LINE |
| Osi trás | Čiary a oblúky | C-ROAD-CNTR |
| Značky a popisy staničenia | Lomené čiary, text | C-ROAD-STAN |
| Hrany koridoru | Lomené čiary | C-ROAD-CORR |
| Priečne rezy | Lomené čiary | C-ROAD-SCTN |
| Plošiny, čiary zarezania, čiary sklonu | Lomené čiary | C-GRAD-PADS, C-GRAD-DAYL, C-GRAD-SLOP |
| Charakteristické čiary | 3D lomené čiary (oblúky ako úseky v rámci 0.01; pozri [Charakteristické čiary](topic:feature-lines)) | C-GRAD-FEAT |
| Dráhy vozidiel | Lomené čiary, text | C-ROAD-SWPT |
| Potrubia, objekty, popisy | Lomené čiary, text | C-STRM-PIPE, C-STRM-STRC, C-STRM-TEXT |
| Potrubia a objekty s problémami | Lomené čiary | C-STRM-PROB |

Každá hladina má farbu. Úplný zoznam je v [Hladiny pôdorysu](topic:plan-layers).

## Veľkosť popisov

Text musí mať veľkosť v jednotkách výkresu. CivilCraft dimenzuje popisy pre mierku, pri ktorej sa celý pôdorys zmestí na list Tabloid (stopy) alebo A3 (metre), a v stavovom riadku uvedie, akú mierku použil. Ak vykreslíte v inej mierke vo svojom CAD programe, zmeňte mierku textu tam.

## Čo sa neexportuje

- Výškové pásma (len na obrazovke).
- Pohľad na pozdĺžny profil. Profily sa exportujú ako LandXML, nie ako výkres.
- Samotný povrch ako 3D objekt. Pre TIN použite LandXML, alebo zapnite {{ui:Trojuholníky}}, aby sa jeho hrany exportovali ako čiary.
- Všetko, čo ste vypli v časti **Zobrazenie**.

## DWG

{{ui:DWG/DXF}} zapíše rovnaké čiary aj ako výkres DWG. Jeho dialóg sa pýta na formát: DXF, alebo DWG verzie 2000, 2004, 2007, 2010, 2013 alebo 2018. Formát 2000 otvorí takmer každý CAD program, starý aj nový; zvoľte novší, keď to vyžaduje ten, kto výkres dostane. Vaša voľba sa zapamätá v tomto prehliadači.

1. Kliknite na {{ui:DWG}} v skupine **Export**.
2. Vyberte **Formát** a kliknite na **Stiahnuť DWG**.
3. Prehliadač stiahne `<name>.dwg`. Stavový riadok uvedie, čo sa zapísalo, napríklad "Exportovaný DWG (formát 2018): 12 lomených čiar, 40 popisov na 9 hladinách".

DWG má rovnaké hladiny, farby, vrstevnice (ako lomené čiary vo svojej výške), 3D hrany zlomu, popisy a body ako DXF, v rovnakých súradniciach. Názvy hladín, ktoré DWG nedokáže uložiť, sa zmenia a stavový riadok to uvedie. CivilCraft zapisuje DWG vlastným kódom, takže nič neopustí váš počítač.

### Mapové vrstvy v DWG

DWG výkres nedokáže obsahovať obrázok vnútri seba: CAD programy zobrazia obrázok vedľa výkresu. Keď sú zobrazené mapové vrstvy, dialóg ponúkne **Mapové vrstvy ako obrázok vedľa výkresu**. Keď je to zaškrtnuté, sťahovaním je súbor `.zip` obsahujúci `<name>.dwg`, `<name>-map.png` (mapové vrstvy cez celý výkres, až 4,096 pixelov na šírku) a `<name>-map.pgw` (jeho svetový súbor pre programy GIS). Výkres zobrazí obrázok ako obrázok na hladine G-MAP-IMAG, na správnom mieste. Rozbaľte súbory do jedného priečinka a nechajte ich pohromade.
