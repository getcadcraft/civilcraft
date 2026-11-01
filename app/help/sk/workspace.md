---
title: Obrazovka po častiach
summary: Prehliadka každej lišty a panela v CivilCraft pod ich názvom na obrazovke, od panela nástrojov po riadok stavu.
keywords: rozhranie, obrazovka, panel nástrojov, panely, vlastnosti, riadok stavu, pohľad na profil, rozloženie, prehliadka, ui
from: 76272010
---

CivilCraft má jednu obrazovku. Nie sú tu karty ani rozloženia. Bočné panely sa dajú presúvať, nechať plávať alebo dať do samostatného okna: pozrite [Usporiadanie panelov a používanie druhého monitora](common:arrange-panels). Zhora nadol a zľava doprava:

- **lišta aplikácie** (značka CadCraft, názov aplikácie, verzia, O aplikácii, režim obrazovky, Pomocník, Uložiť na offline použitie, Papier a Model)
- **panel nástrojov** so siedmimi skupinami tlačidiel
- **ľavý panel**: Stavenisko, Body, Povrch, Zobrazenie a po importe aj Vrstvy GIS
- **pôdorys** v strede, s **pohľadom na profil** pod ním, keď je otvorený
- **pravý panel**: Vlastnosti toho, čo je vybrané
- **riadok stavu** pozdĺž spodného okraja

## Lišta aplikácie

Tenká lišta úplne hore patrí stránke CadCraft, nie samotnému CivilCraft.

- Ponuka verzií ukazuje, ktoré zostavenie používate.
- {{ui:O aplikácii CivilCraft}} otvorí stránku aplikácie na webe.
- {{ui:Celá obrazovka}} prepína režimy obrazovky: celá obrazovka, potom celá obrazovka so skrytými lištami, potom späť do normálneho. {{key:Ctrl+Shift+F}} robí to isté na každej platforme, vrátane Macu (tam je to kláves Control, nie Command). Pri skrytých lištách ich vrátite presunutím ukazovateľa k hornému okraju.
- {{ui:Pomocník}} (alebo {{key:F1}}) otvorí tohto pomocníka v bočnom paneli; {{key:F1}} alebo {{key:Esc}} ho zatvorí.
- {{ui:Uložiť na offline použitie}} uchová CivilCraft v tomto prehliadači, aby sa otvoril bez pripojenia; potom zobrazí {{ui:Pripravené offline}}. Pozrite [Súbory, ktoré môžete otvoriť, uložiť a exportovať](topic:files#online-and-offline).
- {{ui:Papier}} a {{ui:Model}} prepínajú medzi svetlým a tmavým motívom. Pôdorys a profil motív sledujú; PDF sa vždy tlačia na bielom.

## Panel nástrojov

Každá skupina má nad tlačidlami malý štítok. Po podržaní ukazovateľa nad tlačidlom sa zobrazí jeho popis a kláves.

| Skupina | Tlačidlá | Čo robia |
|---|---|---|
| Súbor | {{ui:Nový}}, {{ui:Otvoriť}}, {{ui:Uložiť}} | Začať odznova, otvoriť súbor bodov, LandXML alebo projekt, uložiť projekt ako stiahnutý súbor |
| Export | {{ui:LandXML}}, {{ui:DXF}}, {{ui:DWG}}, {{ui:PDF}} | Zapísať LandXML 1.2, DXF R12 alebo DWG pôdorysu, alebo vykresliť pôdorys do PDF |
| Povrch | {{ui:Hrana zlomu}}, {{ui:Hranica}} | Nakresliť hranu zlomu cez zamerané body; nakresliť vonkajšiu hranicu |
| Návrh | {{ui:Os trasy}}, {{ui:Plošina}}, {{ui:Potrubia}}, {{ui:Pozdĺžny profil}} | Nakresliť os trasy, plošinu, úsek potrubia; zobraziť alebo skryť pohľad na profil |
| Upraviť | {{ui:Späť}}, {{ui:Znova}}, {{ui:Kopírovať}}, {{ui:Prilepiť}}, {{ui:Viac}} | Späť, znova, kopírovať a prilepiť zamerané body; {{ui:Viac}} obsahuje Vystrihnúť, Prilepiť na rovnaké miesto, Duplikovať, Zmazať, Vybrať všetky body a Zrušiť výber |
| GIS | {{ui:Súradnice}}, {{ui:Importovať}}, {{ui:Exportovať}}, {{ui:Mapa}} | Nastaviť súradnicový systém, importovať a exportovať súbory GIS, zobraziť mapové vrstvy pod pôdorysom |
| Zobrazenie | {{ui:Výber}}, {{ui:Prispôsobiť}}, {{ui:3D}} | Vybrať a presúvať veci; zväčšenie na zobrazenie všetkého; zobraziť stavenisko v 3D ([Zobrazenie staveniska v 3D](topic:site-3d)) |

Nástroj kreslenia zostáva stlačený, kým je aktívny. Opätovným kliknutím naň, stlačením klávesu {{key:Esc}} alebo klávesu {{key:V}} sa vrátite k {{ui:Výber}}. {{ui:Späť}}, {{ui:Znova}}, {{ui:Kopírovať}} a položky v {{ui:Viac}} sú sivé, keď nemôžu konať; popis nástroja povie prečo (napríklad „Najprv vyberte zamerané body“). Každé tlačidlo je uvedené v [Referencii panela nástrojov](topic:toolbar).

V úzkom okne sa panel nástrojov posúva do strán.

## Ľavý panel

### Stavenisko

- **Názov**: názov projektu. Pomenúva každý súbor, ktorý uložíte alebo exportujete, a tlačí sa v pruhu popisu PDF.
- **Jednotky**: {{ui:Americké stopy}} alebo {{ui:Metre}}. Určuje, čo čísla znamenajú. Zmena **neprepočíta** súradnice; pozrite [Jednotky, staničenie a formáty čísel](topic:units-and-stations).

### Body

Keď je prázdny, povie vám, ako otvoriť súbor bodov. S bodmi zobrazuje názov súboru, počet bodov a koľko z nich má výšku, a potom tabuľku **skupín bodov**: jeden riadok na prvé slovo popisu (GRD, FL, TBS …), s počtom a voľbou **Povrch**:

- {{ui:Body}}: body idú do povrchu (predvolené pre každú skupinu).
- {{ui:Hrana zlomu}}: body skupiny sa spoja v poradí čísel bodov do jednej hrany zlomu.
- {{ui:Vynechané}}: skupina sa povrchu nedotkne.

### Povrch

Údaje o jestvujúcom teréne: body, trojuholníky, najnižšia a najvyššia výška, priemerná výška, plocha 2D a 3D, hrany zlomu a či existuje hranica. Pod údajmi rámček uvádza všetko, čo tvorca povrchu musel opraviť alebo nemohol urobiť. Potom:

- **Najdlhšia vonkajšia hrana**: 0 ponechá každý vonkajší trojuholník; číslo odreže dlhé tenké trojuholníky zvonka.
- Odkazy, ktoré sa zobrazia, keď sa uplatňujú: {{ui:Odstrániť hranicu}}, {{ui:Odstrániť nakreslené hrany zlomu}} a pre povrch načítaný z LandXML {{ui:Znova vytvoriť povrch z bodov}}.

### Zobrazenie

- **Povrch**: {{ui:Jestvujúci terén}} alebo {{ui:Navrhovaný (upravený)}}. Druhý je k dispozícii, keď plošina alebo koridor upravujú terén bez problémov.
- **Vrstevnice každých**, **Hlavná každá** a **Pásma** (počet farebných pásiem).
- Zaškrtávacie polia: {{ui:Vrstevnice}}, {{ui:Popisky vrstevníc}}, {{ui:Trojuholníky}}, {{ui:Pásma výšok}}, {{ui:Šípky sklonu}}, {{ui:Body}}, {{ui:Popisky bodov}}, {{ui:Hrany zlomu}}, {{ui:Okraj povrchu}}, {{ui:Potrubia}}.
- Keď sú pásma zapnuté, zobrazí sa legenda výšok pásiem.

Nastavenia zobrazenia sa ukladajú s projektom, ale nie sú krokmi späť: {{key:Mod+Z}} zaškrtávacie pole nikdy nevráti.

## Pôdorys

Pôdorys zobrazuje body, povrch a všetko, čo navrhnete, v pôdoryse so severom hore. Kolieskom meníte zväčšenie pri ukazovateli, ťahaním prázdneho miesta posúvate. Úplný zoznam je v [Klávesy a myš](topic:keyboard).

- Na prázdnom projekte rámček s názvom **Začnite zamernými bodmi** uvádza prvé kroky a ponúka {{ui:Otvoriť ukážkové stavenisko}}.
- Kým je aktívny nástroj kreslenia, nápoveda navrchu pôdorysu hovorí, kam kliknúť a ako dokončiť.
- Ťahanie súboru nad pôdorys zobrazuje „Pustite súbor bodov, LandXML alebo projekt“.
- Vybrané veci sú zvýraznené. Vybraná os trasy alebo plošina zobrazuje štvorcové úchyty na svojich PI alebo rohoch; vybraný objekt jeden úchyt. Úchyt potiahnutím presuniete.
- Vybrané zamerané body majú prstenec. {{key:Shift}} a kliknutie pridá alebo odoberie bod; {{key:Shift}} a ťahanie nakreslí rámček (alebo pri ťahaní okolo nich laso), ktorý pridá body vnútri. Pozrite [Výber, kopírovanie a prilepenie zameraných bodov](topic:copy-paste-points).

## Pohľad na profil

Stlačením klávesu {{key:R}} alebo kliknutím na {{ui:Pozdĺžny profil}} ho otvoríte pod pôdorysom. Jeho lišta obsahuje:

- zoznam osí trás (povolený, keď sú dve alebo viac)
- {{ui:Pridať PVI}}: kým je stlačené, kliknutie v profile pridá PVI ({{key:I}} ho prepína)
- údaj o stanici, teréne, návrhovej výške, sklone a výkope alebo násype pod ukazovateľom
- tlačidlo zatvoriť

Profil zobrazuje jestvujúci terén, návrhový profil, sklony na každej tangente, stanicu a výšku každého PVI, L a K každého vertikálneho oblúka s jeho BVC a EVC, vysoké a nízke body a prevýšenie mierky výšok. Vždy sa prispôsobí celej osi trasy: nemení zväčšenie ani sa neposúva. Pohyb ukazovateľa po ňom vloží bodku na os trasy v pôdoryse.

## Pravý panel: Vlastnosti

Jeho nadpis hovorí, čo zobrazuje.

- **Projekt** (nič nie je vybrané): osi trás a plošiny ako odkazy, blok **Zemné práce** a blok **Sieť potrubí** s jeho pravidlami a problémami.
- **Os trasy**: názov, počiatočné staničenie, dĺžka, tabuľka PI, oblúky, tabuľka PVI návrhového profilu a údaje, a nastavenia **Koridoru**.
- **Plošina**: názov, výška, sklony výkopu a násypu, plocha, údaje o línii zásahu a zemné práce.
- **Objekt** alebo **Potrubie**: rozmery, hlavy šácht, dná potrubia, sklon, krytie a všetky problémy.
- **Bod** a jeho číslo: súradnice bodu, výška, popis a skupina (iba na čítanie).

Polia sa prejavia po stlačení klávesu {{key:Enter}} alebo po opustení poľa. Neprijatá hodnota je označená ako neplatná a nič sa nezmení.

## Riadok stavu

- **E** a **N**: východ a sever pod ukazovateľom.
- Výška **Terén** tam (a **Upravený** tam, kde ju zmenila plošina alebo koridor), alebo „Mimo povrchu“.
- Najbližšia os trasy (alebo vybraná) so **Sta** a odsadením (**L** alebo **R**) pod ukazovateľom.
- Vpravo správy: čo sa práve stalo alebo prečo bolo niečo odmietnuté. Správa sa po niekoľkých sekundách sama vymaže.

## Dialógové okná

- **Import bodov**: otvorí sa s každým súborom bodov. Pozrite [Import zameraných bodov](topic:import-points).
- **Vykresliť pôdorys do PDF**: pozrite [Vykreslenie pôdorysu do PDF](topic:plot-pdf).
- **Neuložené zmeny**: pýta sa predtým, než {{ui:Nový}} alebo otvorenie projektu či súboru LandXML zahodí neuloženú prácu. {{ui:Uložiť kópiu}} najprv stiahne projekt.

## Malé obrazovky

Do šírky 760 pixelov, napríklad na telefóne, pôdorys zostáva na obrazovke: panel nástrojov je jeden riadok posúvaný do strán a panely sa otvárajú ako listy z lišty dole. {{ui:Nástroje}} skryje panel nástrojov a {{ui:Presunúť}} ho dá dole.
