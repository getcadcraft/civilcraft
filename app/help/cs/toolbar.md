---
title: Přehled panelu nástrojů
summary: Každé tlačítko panelu nástrojů v CivilCraft, co dělá, jeho klávesa, a kdy je šedé nebo odmítne.
keywords: panel nástrojů, tlačítka, příkazy, nástroje, soubor, export, povrch, návrh, úpravy, zobrazení, nabídka
from: 4c4352bc
---

Panel nástrojů vede přes horní část aplikace v sedmi skupinách. Každé tlačítko ukazuje svou nápovědu a klávesu, když na něj najedete myší.

## Soubor

| Tlačítko | Klávesa | Co dělá |
|---|---|---|
| {{ui:Nový}} | žádná | Začne prázdný projekt. Když jsou neuložené změny, nejdřív se zeptá. |
| {{ui:Otevřít}} | {{key:Mod+O}} | Otevře soubor bodů (CSV, TXT), LandXML nebo projekt CivilCraft. |
| {{ui:Uložit}} | {{key:Mod+S}} | Stáhne projekt jako `<name>.civilcraft.json`. |

## Export

| Tlačítko | Klávesa | Co dělá |
|---|---|---|
| {{ui:LandXML}} | žádná | Stáhne `<name>.xml`: body, povrchy, osy, profily a síť potrubí jako LandXML 1.2. „Zatím není co exportovat.“, když je projekt prázdný. |
| {{ui:DXF}} | žádná | Stáhne `<name>.dxf`: čáry půdorysu jako R12 DXF. |
| {{ui:PDF}} | {{key:Mod+P}} | Otevře **Vykreslit půdorys do PDF**. „Zatím není co vykreslit.“, když je projekt prázdný. |

## Povrch

| Tlačítko | Klávesa | Co dělá |
|---|---|---|
| {{ui:Lomová hrana}} | {{key:B}} | Klikejte na zaměřené body v pořadí, {{key:Enter}} dokončí. Lomová hrana převezme výšky bodů. |
| {{ui:Hranice}} | {{key:O}} | Klikejte na rohy vnější hranice, {{key:Enter}} dokončí. Nahradí jakoukoli hranici. |

Oba příkazy hlásí „Povrch zatím není: nejdřív otevřete zaměřené body.“, když povrch chybí.

## Návrh

| Tlačítko | Klávesa | Co dělá |
|---|---|---|
| {{ui:Osa trasy}} | {{key:A}} | Klikejte na PI v pořadí, {{key:Enter}} dokončí. |
| {{ui:Plošina}} | {{key:G}} | Klikněte na rohy plošiny, {{key:Enter}} dokončí. Stejně jako nástroje povrchu upozorní, když povrch chybí; plošina se upravuje jen podle povrchu. |
| {{ui:Potrubí}} | {{key:P}} | Klikejte na šachty od horní k dolní (kliknutím na existující ji připojíte), {{key:Enter}} dokončí. |
| {{ui:Profil}} | {{key:R}} | Zobrazí nebo skryje pohled na profil pod půdorysem. |

## Úpravy

| Tlačítko | Klávesa | Co dělá |
|---|---|---|
| {{ui:Zpět}} | {{key:Mod+Z}} | Vrátí zpět poslední změnu (až 200). Šedé, když není co vrátit. |
| {{ui:Znovu}} | {{key:Mod+Y}} | Znovu provede to, co bylo vráceno. Šedé, když není co znovu provést. |
| {{ui:Kopírovat}} | {{key:Mod+C}} | Zkopíruje vybrané zaměřené body a dá je do schránky jako řádky bodů, které tabulkový procesor přijme. Šedé, dokud nejsou body vybrány. |
| {{ui:Vložit}} | {{key:Mod+V}} | Vloží body: následují ukazatel a kliknutí je položí s čísly, která nemá žádný jiný bod. Vložit lze i řádky bodů zkopírované v tabulce. |
| {{ui:Více}} | žádná | Otevře nabídku níže. |

Nabídka {{ui:Více}}:

| Položka | Klávesa | Co dělá |
|---|---|---|
| {{ui:Vyjmout}} | {{key:Mod+X}} | Zkopíruje vybrané body a smaže je (jeden krok zpět). |
| {{ui:Kopírovat}} | {{key:Mod+C}} | Jako tlačítko {{ui:Kopírovat}}. |
| {{ui:Vložit}} | {{key:Mod+V}} | Jako tlačítko {{ui:Vložit}}. |
| {{ui:Vložit na stejné místo}} | {{key:Mod+Shift+V}} | Vloží body na jejich vlastní souřadnice, s čísly, která nemá žádný jiný bod. |
| {{ui:Duplikovat}} | {{key:Mod+D}} | Kopie vybraných bodů se pohybuje za ukazatelem; kliknutím určete místo. Schránka zůstane nedotčena. |
| {{ui:Smazat}} | {{key:Delete}} | Smaže vybrané zaměřené body, nebo vybranou osu, plošinu, šachtu (i s jejím potrubím), potrubí nebo PVI. |
| {{ui:Vybrat všechny body}} | {{key:Mod+A}} | Vybere každý zaměřený bod. |
| {{ui:Zrušit výběr}} | {{key:Esc}} | Zruší výběr. |

Položka, která teď nemůže fungovat, je šedá a její nápověda řekne proč. Podrobnosti: [Výběr, kopírování a vkládání zaměřených bodů](topic:copy-paste-points).

Zpět se vztahuje na úpravy návrhu, nastavení povrchu a zaměřené body (vložení, vyjmutí, duplikování, smazání). Nevztahuje se na nastavení zobrazení; otevření nebo import jakéhokoli souboru ho vymaže.

## GIS

| Tlačítko | Klávesa | Co dělá |
|---|---|---|
| {{ui:Souřadnice}} | žádná | Otevře dialog **Souřadnicový systém**: řekněte, v jakém systému je projekt, nebo použijte souřadnice terénu nebo místní. Viz [Nastavení souřadnicového systému projektu](topic:coordinate-systems) a [Souřadnice terénu a místní](topic:ground-and-local-coordinates). |
| {{ui:Importovat}} | žádná | Importuje data GIS: shapefile, GeoJSON, GeoPackage, mřížky výšek a LiDAR. Viz [Import dat GIS](topic:gis-import). |
| {{ui:Export}} | žádná | Exportuje data skutečného provedení pro oddělení GIS. Viz [Export skutečného provedení pro GIS](topic:gis-export). |
| {{ui:Analýza}} | žádná | Otevře panel analýzy GIS: pufr, překryv, prostorové spojení, výběr podle atributu, měření. Viz [Analýza vrstev GIS](topic:gis-analysis). |
| {{ui:Tabulka atributů}} | žádná | V Povrch › Více. Otevře tabulku atributů vrstvy GIS: třídění, filtr, výběr, úpravy, přidání polí, výpočet, uložení jako CSV. Viz [Práce s tabulkou atributů vrstvy](topic:gis-table). |
| {{ui:Mapa}} | žádná | Otevře dialog **Mapové vrstvy**: georeferencovaný obrázek nebo mapové servery, které přidáte, vykreslené pod půdorysem. Viz [Zobrazení mapových vrstev pod půdorysem](topic:map-layers). |

Nástroje GIS se načtou při prvním použití těchto tlačítek, při otevření souboru GIS, nebo při otevření projektu se souřadnicovým systémem nebo vrstvami GIS.

## Zobrazení

| Tlačítko | Klávesa | Co dělá |
|---|---|---|
| {{ui:Výběr}} | {{key:V}} nebo {{key:Esc}} | Kliknutím vyberete osy, plošiny, šachty, potrubí a body ({{key:Shift}} a klik nebo tažení přidá body); tažením úchytů přesunete PI, rohy plošin a šachty. |
| {{ui:Přizpůsobit}} | {{key:F}} | Přiblíží půdorys tak, aby ukázal povrch, body, osy a plošiny (ve 3D zobrazení ukáže vše). |
| {{ui:3D}} | {{key:D}} | Zobrazí lokalitu ve 3D nad půdorysem, nebo se vrátí k půdorysu. Lišta nad 3D pohledem nastavuje pohled, zvětšení výšek, barvy a co se zobrazuje, a exportuje GLB nebo OBJ. Viz [Zobrazení lokality ve 3D](topic:site-3d). |

## Tlačítka v panelech

| Tlačítko | Kde | Co dělá |
|---|---|---|
| {{ui:Otevřít ukázkovou lokalitu}} | Pole na prázdném půdorysu | Načte ukázkové zaměření (vyžaduje připojení, pokud CivilCraft není uložen pro práci offline) |
| {{ui:Odebrat hranici}} | Levý panel, Povrch | Odstraní vnější hranici |
| {{ui:Odebrat nakreslené lomové hrany}} | Levý panel, Povrch | Odstraní každou lomovou hranu nakreslenou nástrojem (ne skupiny lomových hran) |
| {{ui:Obnovit povrch z bodů}} | Levý panel, Povrch (jen povrch LandXML) | Zahodí TIN z LandXML a vytvoří povrch z bodů; nelze vrátit zpět |
| {{ui:Začít od terénu}} | Pravý panel, Osa | Začne návrhový profil s PVI na terénu na každém konci |
| {{ui:Pohled na profil}} | Pravý panel, Osa | Otevře pohled na profil této osy |
| {{ui:Přidat PVI}} | Lišta profilu | Když je stisknuto, kliknutí v profilu přidá PVI |
| {{ui:Nastavit všechna dna podle pravidel}} | Pravý panel, Síť potrubí | Nastaví dna všech potrubí podle pravidel |
| {{ui:Nastavit jeho dna podle pravidel}} | Pravý panel, Potrubí | Nastaví dna tohoto potrubí podle pravidel |
