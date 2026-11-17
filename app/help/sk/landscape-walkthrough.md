---
title: Navrhnite záhradu od začiatku do konca
summary: Desať krokov architekta krajiny od prieskumu po publikovanú sadu, s tým, čo pracovný priestor Krajina dnes robí pri každom z nich a čo zatiaľ nerobí.
keywords: návod, postup, ako na to, návrh krajiny, návrh záhrady, začíname, príklad, vzorka, krok za krokom, prieskum, čiary, terén, výsadba, zoznam, listy, publikovanie, jeden projekt
from: 87900bf5
---

Návrh krajiny sa točí v kruhu: prieskum, náčrt, čiary, terén, plochy, úrovne, výsadba, zoznamy, listy a späť. Tu je desať krokov s tým, čo pre každý z nich existuje. Kde má krok medzeru, je uvedená v časti **Ešte nie je hotové** na konci a nie je skrytá v kroku.

Môžete postupovať podľa ukážkovej lokality alebo podľa vlastného prieskumného výkresu. Pri vlastnom začnite krokom 1.

## 1. Import prieskumu

{{ui:Surface}} › {{ui:Linework from a drawing…}}, vyberte prieskumný výkres (DWG 2000–2018 alebo DXF). Skontrolujte jednotky, prevezmite vrstevnice, 3D polyčiary a hranicu pre povrch a bodové bloky ako body prieskumu. Časť **Kontrola úrovní prieskumu** číta úrovne zapísané ako text alebo atribút a pred pridaním čohokoľvek vypíše, čo vyzerá zle (jednotky, súradnicový systém, vzdialenosť od nuly, ploché vrstevnice, zvláštne úrovne, zdvojené body). Pozri [Kontrola prieskumného výkresu pri importe](topic:survey-check) a [Otvorenie DWG alebo DXF ako čiar](topic:open-dwg-dxf). Súradnicový systém nastavte pomocou {{ui:Coordinate system…}}.

## 2. Ručné náčrty

List na papieri, napríklad starý prieskum alebo označená tlač, sa vloží pomocou {{ui:Scan…}} (Začať zo skenu): umiestni sa v mierke alebo podľa známych súradníc pod pôdorys a dá sa obkresliť na čiary. ModelCraft číta fotografiu ručného náčrtu (Súbor › Importovať fotografiu náčrtu…). CivilCraft sám nemá nástroj na ručný náčrt: list umiestnite pod pôdorys a kreslite cez neho.

## 3. Z náčrtu na čiary

Nakreslite čiary tvarov a obrysy nad prieskumom v CivilCraft alebo vo 2D výkrese. Krajina › Viac › {{ui:From a line}} premení čiaru na dlažbu, osádzanú plochu, múr, schodiská, čiaru tvaru a ďalšie, prepojené so svojou čiarou: pohnete čiarou a objekt ju nasleduje. Pozri [Objekty z čiar](topic:objects-from-lines). V SuperCad Studio otvorte lokalitu, výkres a model budovy v jednom projekte: pracovný priestor **Krajina** má nástroje všetkých z nich a čiara vybraná vo 2D výkrese sa môže stať krajinným objektom, ktorý ju nasleduje (Ctrl+K, {{ui:Krajinný objekt z vybranej čiary výkresu}}).

## 4. Navrhovaný terén

Otvorte {{ui:Surface}} › {{ui:More}} › {{ui:Landscape workspace}}. Navrhovaný terén vytvárajte pomocou {{ui:Platform}}, {{ui:Berm}}, {{ui:Swale}} a plôch úprav s bodovými úrovňami a vrstevnicami; dlažby, chodníky, múry, rampy a schodiská, ktoré pridáte, sa zaradia do rovnakého navrhovaného povrchu. Existujúci terén sa nikdy nemení. {{ui:Levels}} › {{ui:Ground modifiers…}} vypíše všetko, čo tvaruje terén, v jednom poradí, s výkopom a násypom pre každé. Pozri [Úpravy terénu](topic:landscape-grading) a [Úpravy terénu a živé úrovne](topic:ground-modifiers).

## 5. Dlažby a osádzané plochy

{{ui:Hardscape}} › {{ui:Paving}}, {{ui:Path}}, {{ui:Wall}}, {{ui:Kerb}}, {{ui:Ramp}} a {{ui:Steps}}. {{ui:Areas}} nakreslí trávnik, záhon, lúku alebo pôdopokryvnú plochu s jej skladbou; sama sa orezáva okolo dlažieb, múrov a schodísk. {{ui:Bed}} vyplní plochu v rozstupe rastlín zo zmesi rastlín. Pozri [Spevnené plochy](topic:hardscape), [Osádzané plochy](topic:planted-areas) a [Výsadba](topic:planting).

## 6. Úrovne, sklony a spoje

V časti **Kontroly sklonu** zaškrtnite **Analýzu sklonu** a **Šípky odtoku a zátopy**. Ak sa voda zadržiava pri terase, pridajte okolo nej {{ui:Swale}}. Vlastnosti vám povedia, koľko stupňov schody potrebujú a či sa zmestia, a kde je chodník strmší než jeho limit. Panel problémov vypíše, kde sa objekty stretávajú zle: múr je príliš vysoký, záhon je nad dlažbou, schody minú svoju podestu. {{ui:Spot level}} a {{ui:Gradient arrow}} označujú terén a aktualizujú sa samy.

## 7. Výsadba

V **Rastlinách** prehľadajte zoznam rastlín (niekoľko stoviek druhov alebo váš vlastný zoznam), vyberte jednu a použite {{ui:Plant}}, {{ui:Bed}} alebo {{ui:Hedge}}. Veľkosť a popisky rastliny nastavte v Viac. Viac › {{ui:Plant table}} upravuje vaše vlastné záznamy: kultivary, dodávané veľkosti, hustotu, poznámky k špecifikácii. Každý záznam môže niesť vlastný symbol a 3D model (OBJ, STL alebo GLB) a Viac › {{ui:Plant graphics}} kreslí rastliny jednoduchšie v hrubších mierkach. Pozri [Zoznam rastlín](topic:plant-list), [Záznamy rastlín](topic:plant-records) a [Grafika rastlín](topic:plant-graphics).

## 8. Množstvá a zoznamy

Viac › {{ui:Worksheets}}: zoznamy rastlín a spevnených plôch, aj vaše vlastné, zostávajú prepojené s objektmi; uložte ich ako CSV alebo XLSX alebo ich umiestnite na listy (pozri [Pracovné tabuľky](topic:worksheets)). Viac › {{ui:Plant schedule…}} odošle počty do TakeoffCraft. Množstvá spevnených plôch sú vo Vlastnostiach dlažby, múrov a schodísk. Zavlažovanie má vlastný kusovník: {{ui:Irrigation}} › **Skontrolovať systém…**. Pozri [Zavlažovanie](topic:irrigation).

## 9. Výkresy a listy

Viac › {{ui:Landscape sheets…}}: plány výsadby, úprav terénu a zavlažovania, s detailmi. {{ui:Levels}} › {{ui:Section line}} nakreslí rezy cez terén, múry, skladby, schodiská a rastliny. Pozri [Listy krajiny](topic:landscape-sheets) a [Rezy a sada na publikovanie](topic:landscape-sections).

## 10. Publikovanie

{{ui:Publish set (.zip)}} v dialógovom okne listov vytvorí jedno PDF so zoznamom listov a DWG pre každý list. Viac › {{ui:Export landscape IFC}} dá BimCraft rastliny a spevnené plochy. Uložte projekt: všetko je v jednom súbore.

## Zmena jednej veci: schodisko

Zmysel držať všetko v jednom projekte je v tom, že zmena sa prenesie. Vyskúšajte to na schodisku medzi dvoma terasami:

1. Nakreslite čiaru schodiska ako čiaru tvaru (alebo čiaru vo výkrese), potom Krajina › Viac › {{ui:From a line}} › {{ui:Steps}}. Vo Vlastnostiach schodiska zaškrtnite **Tvaruje terén** a nastavte spodnú a hornú úroveň na dve terasy.
2. Nakreslite osádzaný záhon vedľa a pod schodiskom pomocou {{ui:Areas}} a dlažbu na terasách. Záhon sa orezáva okolo schodov a dlažby a zoznam rastlín počíta len to, čo je vysadené.
3. Zvýšte hornú úroveň schodiska vo Vlastnostiach. Navrhovaný terén, bodové úrovne, šípky sklonu a výkop a násyp sa zmenia naraz. Ak schodisko už nedosahuje na hornú terasu, panel problémov povie, o koľko.
4. Pohnite čiarou schodiska. Schody sa v tom istom kroku späť nasledujú za svojou čiarou; záhon sa znova orezuje a prepočíta a pracovné tabuľky a zoznamy ukážu nové čísla.
5. Stlačte raz Ctrl+Z: čiara, schody, terén a záhon sa vrátia spolu.

Pozri [Úpravy terénu a živé úrovne](topic:ground-modifiers), [Osádzané plochy](topic:planted-areas) a [Pracovné tabuľky](topic:worksheets).

## Ešte nie je hotové

Tieto položky sú požadované a v tomto zostavení nie sú:

- Múry, ktoré tvarujú terén (hlásia, kde ho stretávajú, a ich hrana ho môže nasledovať).
- Úprava vlastného zoznamu rastlín z knižnice v aplikácii (upravte zoznam projektu a uložte ho ako súbor rastlín).
- Textúry a farby vlastných GLB modelov rastlín (tvar sa načíta; použije sa farba rastliny).

Pozri [Pracovný priestor Krajina](topic:landscape) pre každý nástroj.
