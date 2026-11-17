---
title: Referencia panela nástrojov
summary: Každé tlačidlo panela nástrojov v CivilCraft, čo robí, jeho klávesová skratka a kedy je zobrazené sivo alebo odmietne príkaz.
keywords: panel nástrojov, tlačidlá, príkazy, nástroje, súbor, export, povrch, návrh, úprava, GIS, zobrazenie, ponuka
from: 4c4352bc
---

Panel nástrojov prebieha cez hornú časť aplikácie v siedmich skupinách. Každé tlačidlo ukáže svoju bublinovú nápovedu a klávesu, keď nad ním ukážete kurzorom.

## Súbor

| Tlačidlo | Klávesa | Čo robí |
|---|---|---|
| {{ui:Nový}} | žiadna | Spustí prázdny projekt. Najprv sa opýta, ak sú neuložené zmeny. |
| {{ui:Otvoriť}} | {{key:Mod+O}} | Otvorí súbor bodov (CSV, TXT), LandXML alebo projekt CivilCraft. |
| {{ui:Uložiť}} | {{key:Mod+S}} | Stiahne projekt ako `<name>.civilcraft.json`. |

## Export

| Tlačidlo | Klávesa | Čo robí |
|---|---|---|
| {{ui:LandXML}} | žiadna | Stiahne `<name>.xml`: body, povrchy, osi, profily a potrubnú sieť ako LandXML 1.2. „Zatiaľ nie je čo exportovať.“, keď je projekt prázdny. |
| {{ui:DXF}} | žiadna | Stiahne `<name>.dxf`: čiary pôdorysu ako R12 DXF. |
| {{ui:PDF}} | {{key:Mod+P}} | Otvorí **Vykresliť pôdorys do PDF**. „Zatiaľ nie je čo vykresliť.“, keď je projekt prázdny. |

## Povrch

| Tlačidlo | Klávesa | Čo robí |
|---|---|---|
| {{ui:Hrana zlomu}} | {{key:B}} | Kliknite na geodetické body v poradí, {{key:Enter}} dokončí. Hrana zlomu prevezme výšky bodov. |
| {{ui:Hranica}} | {{key:O}} | Kliknite na rohy vonkajšej hranice, {{key:Enter}} dokončí. Nahradí každú hranicu. |

Obe hlásia „Povrch ešte nie je: najprv otvorte geodetické body.“, keď povrch nie je.

## Návrh

| Tlačidlo | Klávesa | Čo robí |
|---|---|---|
| {{ui:Os trasy}} | {{key:A}} | Kliknite na PI v poradí, {{key:Enter}} dokončí. |
| {{ui:Plošina}} | {{key:G}} | Kliknite na rohy plošiny, {{key:Enter}} dokončí. Podobne ako nástroje povrchu upozorní, keď povrch nie je; plošina sa dá upraviť len podľa povrchu. |
| {{ui:Potrubia}} | {{key:P}} | Kliknite na objekty od hornej časti toku smerom dole (kliknutím na jestvujúci sa k nemu pripojíte), {{key:Enter}} dokončí. |
| {{ui:Pozdĺžny profil}} | {{key:R}} | Zobrazí alebo skryje pohľad na profil pod pôdorysom. |

## Úprava

| Tlačidlo | Klávesa | Čo robí |
|---|---|---|
| {{ui:Späť}} | {{key:Mod+Z}} | Vráti späť poslednú zmenu (až 200). Zobrazené sivo, keď nie je čo vrátiť. |
| {{ui:Znova}} | {{key:Mod+Y}} | Znova vykoná, čo bolo vrátené späť. Zobrazené sivo, keď nie je čo znova vykonať. |
| {{ui:Kopírovať}} | {{key:Mod+C}} | Skopíruje vybrané geodetické body a dá ich do schránky ako riadky bodov, ktoré tabuľkový procesor prijme. Zobrazené sivo, kým nie sú body vybrané. |
| {{ui:Prilepiť}} | {{key:Mod+V}} | Prilepí body: idú za ukazovateľom a kliknutím sa položia s číslami, ktoré nemá žiadny iný bod. Riadky bodov skopírované v tabuľkovom procesore sa tiež prilepia. |
| {{ui:Viac}} | žiadna | Otvorí ponuku nižšie. |

Ponuka {{ui:Viac}}:

| Položka | Klávesa | Čo robí |
|---|---|---|
| {{ui:Vystrihnúť}} | {{key:Mod+X}} | Skopíruje vybrané body a potom ich zmaže (jeden krok späť). |
| {{ui:Kopírovať}} | {{key:Mod+C}} | Ako tlačidlo {{ui:Kopírovať}}. |
| {{ui:Prilepiť}} | {{key:Mod+V}} | Ako tlačidlo {{ui:Prilepiť}}. |
| {{ui:Prilepiť na rovnaké miesto}} | {{key:Mod+Shift+V}} | Prilepí body na ich vlastné súradnice, s číslami, ktoré nemá žiadny iný bod. |
| {{ui:Duplikovať}} | {{key:Mod+D}} | Kópia vybraných bodov ide za ukazovateľom; kliknite, kam má ísť. Schránka sa nezmení. |
| {{ui:Zmazať}} | {{key:Delete}} | Zmaže vybrané geodetické body, alebo vybranú os trasy, plošinu, objekt (s jeho potrubiami), potrubie alebo PVI. |
| {{ui:Vybrať všetky body}} | {{key:Mod+A}} | Vyberie každý geodetický bod. |
| {{ui:Zrušiť výber}} | {{key:Esc}} | Zruší výber. |

Položka, ktorá teraz nemôže konať, je zobrazená sivo a jej bublinová nápoveda uvedie dôvod. Podrobnosti: [Vybrať, kopírovať a prilepiť geodetické body](topic:copy-paste-points).

Späť sa týka úprav návrhu, nastavení povrchu a geodetických bodov (prilepenie, vystrihnutie, duplikovanie, zmazanie). Nevzťahuje sa na nastavenia zobrazenia a otvorenie alebo import ľubovoľného súboru ju vymaže.

## GIS

| Tlačidlo | Klávesa | Čo robí |
|---|---|---|
| {{ui:Súradnice}} | žiadna | Otvorí dialóg **Súradnicový systém**: uveďte, v akom systéme je projekt, alebo použite terénne či miestne súradnice. Pozri [Nastavenie súradnicového systému projektu](topic:coordinate-systems) a [Terénne a miestne súradnice](topic:ground-and-local-coordinates). |
| {{ui:Importovať}} | žiadna | Importuje údaje GIS: shapefile, GeoJSON, GeoPackage, mriežky výšok a LiDAR. Pozri [Import údajov GIS](topic:gis-import). |
| {{ui:Export}} | žiadna | Exportuje skutočné vyhotovenie pre oddelenie GIS. Pozri [Export skutočného vyhotovenia pre GIS](topic:gis-export). |
| {{ui:Analyzovať}} | žiadna | Otvorí panel analýzy GIS: pufer, prekrytie, priestorové spojenie, výber podľa atribútu, meranie. Pozri [Analýza vrstiev GIS](topic:gis-analysis). |
| {{ui:Tabuľka atribútov}} | žiadna | V Povrch › Viac. Otvorí tabuľku atribútov vrstvy GIS: radenie, filter, výber, úpravu, pridanie polí, výpočet, uloženie ako CSV. Pozri [Práca s tabuľkou atribútov vrstvy](topic:gis-table). |
| {{ui:Mapa}} | žiadna | Otvorí dialóg **Vrstvy mapy**: georeferencovaný obrázok alebo mapové servery, ktoré pridáte, nakreslené pod pôdorysom. Pozri [Zobrazenie vrstiev mapy pod pôdorysom](topic:map-layers). |

Nástroje GIS sa načítajú pri prvom použití niektorého z týchto tlačidiel, pri otvorení súboru GIS, alebo pri otvorení projektu, ktorý má súradnicový systém alebo vrstvy GIS.

## Zobrazenie

| Tlačidlo | Klávesa | Čo robí |
|---|---|---|
| {{ui:Výber}} | {{key:V}} alebo {{key:Esc}} | Kliknutím vyberte osi trasy, plošiny, objekty, potrubia a body ({{key:Shift}} a kliknutie alebo ťah pridá body); ťahaním úchytov posúvate PI, rohy plošiny a objekty. |
| {{ui:Prispôsobiť}} | {{key:F}} | Priblíži pôdorys tak, aby ukázal povrch, body, osi trasy a plošiny (v 3D pohľade: ukáže všetko). |
| {{ui:3D}} | {{key:D}} | Zobrazí lokalitu v 3D nad pôdorysom, alebo sa vráti na pôdorys. Lišta nad 3D pohľadom nastavuje pohľad, prehnanie, farby a to, čo sa zobrazí, a exportuje GLB alebo OBJ. Pozri [Zobrazenie lokality v 3D](topic:site-3d). |

## Tlačidlá v paneloch

| Tlačidlo | Kde | Čo robí |
|---|---|---|
| {{ui:Otvoriť ukážkovú lokalitu}} | Pole na prázdnom pôdoryse | Načíta ukážkové geodetické zameranie (potrebuje pripojenie, pokiaľ CivilCraft nie je uložený na offline použitie) |
| {{ui:Odstrániť hranicu}} | Ľavý panel, Povrch | Odstráni vonkajšiu hranicu |
| {{ui:Odstrániť nakreslené hrany zlomu}} | Ľavý panel, Povrch | Odstráni každú hranu zlomu nakreslenú nástrojom (nie skupiny hrán zlomu) |
| {{ui:Znova vytvoriť povrch z bodov}} | Ľavý panel, Povrch (len povrch LandXML) | Zruší TIN LandXML a vytvorí povrch z bodov; nedá sa vrátiť späť |
| {{ui:Začať z terénu}} | Pravý panel, Os trasy | Spustí projektový profil s PVI na teréne na každom konci |
| {{ui:Pohľad na profil}} | Pravý panel, Os trasy | Otvorí pohľad na profil pre túto os trasy |
| {{ui:Pridať PVI}} | Lišta profilu | Kým je stlačené, kliknutie v profile pridá PVI |
| {{ui:Nastaviť všetky dná podľa pravidiel}} | Pravý panel, Potrubná sieť | Nastaví dná každého potrubia podľa pravidiel |
| {{ui:Nastaviť jeho dná podľa pravidiel}} | Pravý panel, Potrubie | Nastaví dná tohto potrubia podľa pravidiel |
