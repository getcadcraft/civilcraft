---
title: Nastavenie súradnicového systému projektu
summary: Určte, v akom súradnicovom systéme je meranie, aby CivilCraft zobrazoval zemepisnú šírku a dĺžku, umiestňoval GIS súbory a mapové vrstvy a zapisoval súbory .prj. Vyberte systém podľa kódu, názvu, samotných súradníc alebo zo súboru .prj.
keywords: súradnicový systém, crs, epsg, srid, state plane, spcs, utm, nad83, wgs 84, zobrazenie, prj, wkt, datum, zemepisná šírka, zemepisná dĺžka, lat long, geografický, mriežka, georeferencovanie, priradenie súradnicového systému
from: 964250e2
---

Súradnice projektu sú obyčajné čísla, kým neuvediete, čo znamenajú. Nastavenie súradnicového systému **nikdy nič nepresúva**: CivilCraft tak napríklad dostane informáciu, že E 6,150,000 N 2,080,000 sú súradnice štátnej roviny v kalifornskej zóne 6 v US survey stopách. Keď to vie:

- stavový riadok zobrazuje zemepisnú šírku a dĺžku kurzora,
- GIS súbory v iných systémoch (shapefile, GeoJSON, GeoPackage, výškové mriežky, LiDAR) sa pri otvorení prevedú do projektu,
- mapové vrstvy možno kresliť pod pôdorysom ([Zobrazenie mapových vrstiev pod pôdorysom](topic:map-layers)),
- exporty do GIS formátov nesú systém (súbor `.prj` pre shapefile, kód EPSG pre GeoPackage a GeoTIFF).

## Výber systému

1. Na paneli nástrojov v skupine {{ui:GIS}} vyberte {{ui:Súradnice}}. Otvorí sa dialógové okno **Súradnicový systém**. V hornej časti je uvedené, v akom systéme je projekt teraz, alebo **Žiadny — súradnice sú len čísla**.
2. Systém nájdite jedným z týchto spôsobov:
   - **Hľadanie**: zadajte kód EPSG (`2277`, `EPSG:2277`) alebo slová z názvu (`texas central`, `utm 14n`, `lambert-93`). Kódy sa vypisujú od zadaného čísla; slová vypisujú systémy, ktorých názov obsahuje všetky slová.
   - {{ui:Systémy, do ktorých tieto súradnice zapadajú}} (keď má projekt body alebo povrch): CivilCraft načíta stred projektu vo všetkých systémoch rodiny jednotiek projektu a vypíše tie, ktorých oblasť použitia ho obsahuje. Súradnice štátnej roviny zvyčajne zapadajú iba do niekoľkých zón: projekt v Texase s hodnotami E 3,115,000 N 10,070,000 v US survey stopách zapadá do štyroch variantov Texas Central (NAD83, NAD83(2011), HARN, NSRS2007). Každá položka ukazuje, kde by bol stred vášho projektu.
   - **Blízko (šírka, dĺžka)** a {{ui:Navrhnúť}}: zadajte, kde sa lokalita nachádza, napríklad `30.27, -97.74` alebo `30°16′N 97°44′W`, a CivilCraft vypíše zobrazené systémy, ktorých oblasť ju zahŕňa, najskôr štátne a krajinné mriežky.
   - {{ui:Prečítať súbor .prj…}}: otvorte súbor `.prj`, ktorý prišiel so shapefile alebo s výkresom. CivilCraft ho podľa matematiky zobrazenia priradí k svojmu zoznamu (takže súbor `.prj`, ktorý geodetický dátum pomenúva inak, stále nájde správny systém) a povie, o ktorý ide; ak sa nič presne nezhoduje, použije sa vlastný popis súboru. Súbor `.prj` môžete aj pretiahnuť do dialógového okna alebo otvoriť či pretiahnuť priamo na pôdorys.
3. Kliknite na systém v zozname. Pod **Vybraný** sa zobrazí názov, kód EPSG, jednotka, to, ako dobre je jeho dátum zviazaný s WGS 84, oblasť použitia v zemepisnej šírke a dĺžke a kde v ňom leží stred vášho projektu.
4. Ponechajte vybratú **Mriežku** (väčšina projektov; ostatné nájdete v [Terén a miestne súradnice](topic:ground-and-local-coordinates)) a zvoľte {{ui:Použiť}}.

Stavový riadok teraz zobrazuje zemepisnú šírku a dĺžku kurzora vedľa X a Y. Nastavenie systému je jeden krok späť: {{key:Mod+Z}} ho vráti.

:::note
Jednotky musia súhlasiť: projekt v stopách prijme systémy v US survey stopách alebo v medzinárodných stopách, projekt v metroch prijme systémy v metroch. CivilCraft vysvetlí odmietnutie ("Projekt je v stopách, ale tento systém je v metroch…"). Projekt v stopách so systémom v US survey stope používa survey stopy: "ft" projektu znamená stopu systému. Geografické systémy (zemepisná šírka a dĺžka, ako samotný WGS 84) nemôžu byť systémom projektu: výkresy potrebujú X a Y.
:::

## Zmena alebo odstránenie systému

Znova otvorte {{ui:Súradnice}}, vyberte iný systém a zvoľte {{ui:Použiť}}. Keď má projekt body alebo návrh, CivilCraft sa opýta **Sú už súradnice v …?**

- {{ui:Áno — nič sa nepresúva}}: čísla zostanú rovnaké a mení sa iba ich význam. Použite, ak bol starý systém vybraný omylom.
- {{ui:Nie — previesť ich}}: každý merací bod, hrana zlomu, hranica, PI osi trasy, roh plošiny a objekt sa prevedie zo starého systému do nového v jednom kroku späť. Povrch načítaný z LandXML ako trojuholníky sa prevádzať nedá; najprv ho znova vytvorte z bodov.

{{ui:Odstrániť systém}} systém odstráni (nič sa nepresúva). GIS vrstvy, ktoré sú už v projekte, zostanú tam, kde sú.

## Zemepisná šírka a dĺžka v stavovom riadku

Kým má projekt systém, stavový riadok zobrazuje zemepisnú šírku a dĺžku kurzora v WGS 84, napríklad `30°18′00.00″ N  97°42′00.00″ W`. Namiesto toho zvoľte desatinné stupne v {{ui:Nastavenia}}, {{ui:CivilCraft}}, **Zemepisná šírka a dĺžka** ([nastavenia CivilCraft](topic:settings)). Pri súradniciach terénu alebo miestnych súradniciach výpis najprv prejde týmto krokom, takže je správny pre bod pod kurzorom.

## Presnosť posunu dátumu

Zemepisná šírka, dĺžka, GeoJSON a mapové vrstvy sú všetky v WGS 84. Väzba každého systému na WGS 84 je uvedená v dialógovom okne:

| Čo dialógové okno uvádza | Čo to znamená |
|---|---|
| WGS 84 samotný | Žiadny posun. |
| NAD83 sa berie ako WGS 84 | Tieto dva sa väčšinou v Severnej Amerike líšia o meter alebo dva, najviac o niekoľko metrov. Vhodné pre mapové vrstvy a kontext lokality; nie pre geodetickú kontrolnú sieť. |
| Známy na približne *n* m (údaj EPSG) | Zverejnený posun; mapové vrstvy a GeoJSON môžu byť o približne toľko mimo. |
| Pre tento dátum nie je známy | Bez súboru mriežky neexistuje zverejnený posun: mapové vrstvy a GeoJSON môžu byť o stovky metrov mimo. |
| Zo súboru posunu mriežky … | Používa sa súbor posunu mriežky (nižšie): v rámci mriežky do približne 10 cm od NAD83. |

Vlastné súradnice projektu nikdy neprechádzajú posunom dátumu: prechádza ním iba to, čo sa prevádza do zemepisnej šírky a dĺžky alebo z nich. Výškové dátumy a geoidové modely sa nespracúvajú (výšky sa nikdy neprevádzajú). Tam, kde najlepší posun vyžaduje súbor mriežky, zoznam obsahuje hrubší zverejnený posun a dialógové okno uvádza jeho presnosť (napríklad systémy NAD27, asi 20 m), kým nepridáte mriežku.

## Súbory posunu mriežky

Pre systém NAD27 **Súbor posunu mriežky** v dialógovom okne súradnicového systému umiestni zemepisnú šírku a dĺžku, GIS súbory a mapové vrstvy do približne 10 cm od NAD83 namiesto približne 20 m:

- **Stiahnite** mriežku, ktorú navrhuje pre oblasť systému (NADCON5 pre súvislé územie USA, NADCON pre Aljašku, NTv2 pre Kanadu), zo servera cdn.proj.org, verejného servera mriežok PROJ. Odosiela sa iba názov súboru mriežky.
- Alebo pridajte súbor mriežky, ktorý už máte: NTv2 (`.gsb`) alebo mriežku PROJ GeoTIFF (`.tif`), až do 20 MB.

Mriežka sa uloží do súboru projektu, takže putuje spolu s projektom. Táto časť uvádza, či je stred projektu vnútri mriežky: mimo nej sa neuplatní žiadny posun, preto použite mriežku, ktorá pokrýva lokalitu. **Prestať používať mriežku** sa vráti k hrubému posunu. Každá zmena je jeden krok: {{key:Mod+Z}} ju vráti späť.

GIS vrstvy, ktoré sú už v projekte, pri zmene mriežky zostanú na mieste; ak ich chcete umiestniť cez mriežku, importujte ich znova. Vlastné súradnice projektu sa nikdy nepresúvajú.

## Čo bolo overené

- Každý prevod bol porovnaný s PROJ (pyproj 3.7.1 s PROJ 9.5.1), knižnicou súradníc, ktorú používa väčšina GIS programov, a to na viac ako 330 systémoch: štátna rovina v US survey stopách a stopách, UTM sever a juh, Lambert-93, British National Grid, GDA2020 MGA, New Zealand Transverse Mercator a web Mercator, medzi inými. X a Y súhlasia na 1 cm pri rovnakom posune dátumu (väčšina na výrazne menej ako 1 mm) a matematika zobrazenia súhlasí s vlastnými definíciami PROJ na 1 cm.
- Súbory `.prj`, ktoré PROJ zapísal v oboch bežných podobách (ESRI a OGC), boli načítané späť pre 105 systémov: 208 z 210 sa zhodovalo s presným kódom EPSG a ostatné dva so systémom s rovnakou matematikou na rovnakom elipsoide. Súbory `.prj`, ktoré zapisuje CivilCraft, číta PROJ ako rovnaký systém. Súbory ESRI `.prj` pre polárne stereografické systémy (UPS, polárna Aljaška) sa nedajú načítať; vyberte tieto systémy podľa kódu.
- Zemepisná šírka a dĺžka v stavovom riadku sa v prehliadači zhodovali s PROJ na 0.01″.
