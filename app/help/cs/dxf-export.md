---
title: Export půdorysu do DXF
summary: Zapíše linie půdorysu jako DXF ve formátu R12 do pojmenovaných vrstev, s vrstevnicemi v jejich výškách a lomovými hranami ve 3D, pro libovolný CAD program.
keywords: dxf, dwg, cad, export, linie, r12, 2000, 2004, 2007, 2010, 2013, 2018, vrstvy, vrstevnice, výměna výkresů, podkladová mapa, podklad
from: f2d8ede9
---

{{ui:DXF}} zapíše to, co půdorys ukazuje, jako soubor DXF ve formátu R12, který otevře každý CAD program. Pokud jste používali AutoCAD nebo Civil 3D, otevřete nebo vložte jej stejně jako jakýkoli jiný soubor DXF.

## Export

1. Nastavte půdorys podle toho, jak chcete výkres: v části **Zobrazení** vyberte povrch (stávající nebo navržený), interval vrstevnic a to, co je zapnuto (vrstevnice, popisky, body, popisky bodů, trojúhelníky, lomové hrany, hrana povrchu, potrubí, šipky sklonu).
2. Klikněte na {{ui:DWG/DXF}} ve skupině **Export** a vyberte {{ui:DXF (R12, text) — prostý výměnný soubor}}, potom klikněte na {{ui:Stáhnout}}.
3. Prohlížeč stáhne soubor `<name>.dxf`. Stavový řádek hlásí například "Exportováno DXF R12: 2,140 objektů; popisky dimenzovány pro 1" = 40'. Pásma se neexportují."

Souřadnice se zapisují v jednotkách projektu, ve skutečných hodnotách (souřadnice státní roviny zůstávají beze změny). Nic se nemění měřítkem ani neposouvá.

## Co je v souboru

| Prvek | Entita DXF | Vrstva |
|---|---|---|
| Hlavní a vedlejší vrstevnice | 2D mnohočáry v jejich výšce | C-TOPO-MINR, C-TOPO-MAJR |
| Popisky vrstevnic | Text | C-TOPO-TEXT |
| Trojúhelníky | Mnohočáry | C-TOPO-TINN |
| Lomové hrany a hranice | 3D mnohočáry | C-TOPO-BRKL |
| Hrana povrchu | Mnohočáry | C-TOPO-BNDY |
| Šipky sklonu | Mnohočáry | C-TOPO-SLOP |
| Zaměřovací body a jejich popisky | Body (s výškou), text | V-NODE, V-NODE-TEXT |
| Linie z kódů linií | 3D mnohočáry | V-NODE-LINE |
| Osy tras | Úsečky a oblouky | C-ROAD-CNTR |
| Značky a popisky staničení | Mnohočáry, text | C-ROAD-STAN |
| Hrany koridoru | Mnohočáry | C-ROAD-CORR |
| Příčné řezy | Mnohočáry | C-ROAD-SCTN |
| Plošiny, linie odkryvu, linie svahů | Mnohočáry | C-GRAD-PADS, C-GRAD-DAYL, C-GRAD-SLOP |
| Konstrukční čáry | 3D mnohočáry (oblouky jako kusy v toleranci 0,01; viz [Konstrukční čáry](topic:feature-lines)) | C-GRAD-FEAT |
| Trasy vozidel | Mnohočáry, text | C-ROAD-SWPT |
| Potrubí, objekty, popisky | Mnohočáry, text | C-STRM-PIPE, C-STRM-STRC, C-STRM-TEXT |
| Potrubí a objekty s problémy | Mnohočáry | C-STRM-PROB |

Každá vrstva má barvu. Úplný seznam je v [Vrstvy půdorysu](topic:plan-layers).

## Velikost popisků

Text musí mít velikost v jednotkách výkresu. CivilCraft dimenzuje popisky pro měřítko, při kterém se celý půdorys vejde na list Tabloid (stopy) nebo na list A3 (metry), a ve stavovém řádku uvede, které měřítko použil. Pokud vykreslujete v jiném měřítku ve svém CAD programu, upravte velikost textu tam.

## Co se neexportuje

- Pásma výšek (pouze na obrazovce).
- Pohled na profil. Profily se exportují jako LandXML, ne jako výkres.
- Samotný povrch jako 3D objekt. Pro TIN použijte LandXML, nebo zapněte {{ui:Trojúhelníky}}, aby se jeho hrany exportovaly jako linie.
- Cokoli, co jste vypnuli v části **Zobrazení**.

## DWG

{{ui:DWG/DXF}} zapíše stejné linie také jako výkres DWG. Jeho dialog se ptá na formát: DXF, nebo DWG verze 2000, 2004, 2007, 2010, 2013 nebo 2018. Verze 2000 se otevře téměř v každém CAD programu, starém i novém; vyberte novější, pokud to vyžaduje ten, kdo výkres dostane. Vaše volba se v tomto prohlížeči zapamatuje.

1. Klikněte na {{ui:DWG}} ve skupině **Export**.
2. Vyberte **Formát** a klikněte na **Stáhnout DWG**.
3. Prohlížeč stáhne soubor `<name>.dwg`. Stavový řádek uvede, co bylo zapsáno, například "Exportováno DWG (formát 2018): 12 mnohočar, 40 popisků na 9 vrstvách".

DWG má stejné vrstvy, barvy, vrstevnice (jako mnohočáry ve své výšce), 3D lomové hrany, popisky a body jako DXF, ve stejných souřadnicích. Názvy vrstev, které DWG nemůže obsahovat, se změní a stavový řádek to uvede. CivilCraft zapisuje DWG vlastním kódem, takže nic neopouští váš počítač.

### Vrstvy mapy v DWG

DWG výkres nemůže obsahovat obrázek uvnitř sebe: CAD programy zobrazují obrázek, který leží vedle výkresu. Když jsou zobrazeny vrstvy mapy, dialog nabízí **Vrstvy mapy jako obrázek vedle výkresu**. Pokud je zaškrtnuto, stažený soubor je `.zip`, který obsahuje `<name>.dwg`, `<name>-map.png` (vrstvy mapy přes celý výkres, až 4 096 pixelů na šířku) a `<name>-map.pgw` (jeho světový soubor pro GIS programy). Výkres zobrazí obrázek na vrstvě G-MAP-IMAG, na správném místě. Rozbalte soubory do jedné složky a nechte je pohromadě.
