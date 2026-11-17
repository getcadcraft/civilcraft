---
title: Prechod z iného civilného softvéru
summary: Ako známe pracovné postupy civilného návrhu zodpovedajú CivilCraft a rozdiely, ktoré prvú hodinu zaskočia skúsených používateľov.
keywords: prechod, migrácia, známe, rozdiely, pracovný postup, príkazy, mapovanie, cogo, koridor, zemné práce, potrubná sieť, štýly, príkazový riadok
from: feae37d6
---

Ak ste používali Civil 3D, už poznáte myšlienky v CivilCraft: body a skupiny bodov, povrchy TIN s hranami zlomu a hranicami, osi trasy podľa PI, profily podľa PVI, zostavy natiahnuté do koridorov, úpravy terénu s napojením na terén, gravitačné potrubné siete, LandXML. Iné je takmer všetko okolo nich: nie je tu výkresový súbor, nie je príkazový riadok (pokiaľ nezvolíte štýl ponuky {{ui:Klasické rysovanie}}), nie sú štýly, nie je Prospector ani dialógy nastavení. CivilCraft je malý, zameraný nástroj v prehliadači a v tejto verzii robí zlomok toho, čo úplný civilný balík. Táto stránka mapuje to, čo poznáte, na to, čo je tu.

:::tip
Ak máte radi pás Civil 3D, zvoľte štýl ponuky {{ui:Civilná páska}} v {{ui:Nastavenia}} › {{ui:CivilCraft}} › {{ui:Ponuky, klávesy a myš}}: karty Domov, Povrchy, Úprava, Geolokácia, Pohľad a Výstup, stredné tlačidlo posúva pohľad a {{key:Shift}} so stredným tlačidlom otáča 3D pohľad. Ak píšete príkazy, {{ui:Klasické rysovanie}} pridá príkazový riadok (ALIGNMENT, PAD, PROFILE, ZOOM …). Pozrite [Ponuky, klávesy a myš](topic:menus-keys-and-mouse).
:::

## Mapa pracovných postupov

| Čo chcete urobiť | Známy spôsob | V CivilCraft |
|---|---|---|
| Priniesť geodetické body | Import bodov v súbore bodov | {{ui:Otvoriť}}, potom skontrolujte poradie stĺpcov v **Import bodov** ([Import geodetických bodov](topic:import-points)) |
| Triediť body | Skupiny bodov, kľúče popisu | Automatické skupiny podľa prvého slova popisu; žiadne kľúče popisu |
| Upraviť bod | Editor bodov, úchyty | Kliknite na bod a upravte ho vo Vlastnostiach, alebo ho potiahnite ([Úprava geodetického bodu](topic:edit-points)) |
| Vytvoriť jestvujúci terén | Vytvorenie povrchu, pridanie skupín bodov ako údajov | Automaticky: povrch sa prebuduje vždy, keď sa zmenia jeho vstupy |
| Pridať hrany zlomu | Pridanie hrán zlomu z polylínií alebo charakteristických čiar | Nastavte skupinu bodov na {{ui:Hrana zlomu}}, alebo klikajte na body nástrojom {{ui:Hrana zlomu}} ({{key:B}}) |
| Orezať povrch | Vonkajšia hranica, skrytá hranica, najväčšia dĺžka trojuholníka | {{ui:Hranica}} ({{key:O}}, len vonkajšia) a **Najdlhšia vonkajšia hrana** |
| Zobraziť vrstevnice | Štýl povrchu | **Zobrazenie** v ľavom paneli: interval, hlavná každých, popisy, pásy, šípky sklonu |
| Vytvoriť os trasy | Nástroje vytvárania osí, nastavenia oblúkov a prechodníc | {{ui:Os trasy}} ({{key:A}}): klikajte na PI, {{key:Enter}}; polomery a dĺžky prechodníc v tabuľke PI |
| Vytvoriť pohľad na profil | Sprievodca pohľadom na profil, pásy | {{ui:Pozdĺžny profil}} ({{key:R}}): jeden pohľad na profil pod pôdorysom, vždy prispôsobený |
| Navrhnúť sklon | Nástroje návrhu profilu | {{ui:Začať z terénu}}, {{ui:Pridať PVI}} ({{key:I}}), potiahnutie PVI, zadanie **Oblúk L** |
| Postaviť cestu | Zostava, podzostavy, koridor, ciele, oblasti | Zaškrtnite **Natiahnuť zostavu pozdĺž návrhového profilu** pod osou trasy; pruh, krajnica a svah na každej strane, alebo každá strana zložená z častí (odvodňovací žľab, obrubník, chodník …) |
| Upraviť plošinu | Čiary úprav, skupiny úprav, kritériá úprav | {{ui:Plošina}} ({{key:G}}): rovná plošina s výkopovými a násypovými svahmi do terénu |
| Vypočítať zemné práce | Povrchy objemov, panel objemov | **Zemné práce** v pravom paneli, metóda mriežky, priebežne aktualizované |
| Navrhnúť dažďovú alebo splaškovú kanalizáciu | Potrubná sieť so zoznamom častí, pravidlá | {{ui:Potrubia}} ({{key:P}}): klikajte na objekty smerom po prúde; tri pravidlá, ktoré nastavíte; automatické dná |
| Výmena s inými | Import a export LandXML | {{ui:Otvoriť}} súbor LandXML; {{ui:LandXML}} na export ([Výmena LandXML](topic:landxml)) |
| Poslať čiary do CAD | Export do DWG | {{ui:DWG}} (formát 2000 až 2018) alebo {{ui:DXF}} (R12) |
| Vykresliť | Rozloženia, výrezy, sady listov | {{ui:PDF}}: jeden list na šírku s pôdorysom v zvolenej mierke; listy pôdorysu a profilu a rezové listy ako PDF |
| Zdieľať prácu medzi súbormi | Odkazy na dáta, referencie | Nedostupné: jeden projekt na súbor |
| Späť | Späť | {{key:Mod+Z}} a {{key:Mod+Y}}, 200 krokov; nastavenia zobrazenia nie sú kroky späť |

## Rozdiely, ktoré ľudí zaskočia

**Neexistuje príkazový riadok**, pokiaľ nezvolíte štýl ponuky {{ui:Klasické rysovanie}}. Nástroje sú tlačidlá na paneli nástrojov a jednotlivé písmená: {{key:A}} os trasy, {{key:G}} plošina, {{key:P}} potrubia, {{key:B}} hrana zlomu, {{key:O}} hranica, {{key:R}} profil, {{key:I}} pridať PVI, {{key:V}} výber, {{key:F}} prispôsobiť. V ostatných štýloch ponuky písanie názvu príkazu nič neurobí. Pozrite [Klávesy a myš](topic:keyboard).

**Enter dokončí; dvojklik je riskantný.** Raz kliknite na posledný bod a potom stlačte {{key:Enter}}. V tejto verzii dvojklik tiež dokončí, ale odstráni bod, na ktorý ste dvakrát klikli. Pravé tlačidlo nedokončí ani neopakuje; pri ťahaní len posúva pohľad.

**Všetko je dynamické, stále.** Zmeňte skupinu bodov, polomer, PVI alebo sklon plošiny a povrch, vrstevnice, koridor, čiary napojenia a objemy sa okamžite aktualizujú. Nič sa nemusí prebudovať a nič nezastará.

**Nič nie je kresliaci objekt.** Pôdorys je pohľad na návrh, nie výkres, ktorý možno upravovať príkazmi CAD. Nemôžete pridať vlastné čiary ani text, zmeniť farbu vrstvy ani niečo rozložiť. Exportujte do DXF a výkres dokončite v CAD programe.

**Žiadne štýly.** Farby, hrúbky čiar, veľkosti popisov a názvy vrstiev sú pevné (pozri [Vrstvy pôdorysu](topic:plan-layers)). Papier a Model v paneli aplikácie prepínajú medzi svetlou a tmavou obrazovkou.

**Jeden z každého.** Jeden jestvujúci povrch terénu, jeden upravený výsledok, jedna potrubná sieť na projekt. Veľa osí trasy a plošín je v poriadku.

**Jednotky sú len označenia.** Voľba {{ui:Americké stopy}} alebo {{ui:Metre}} nič neprevádza. Nie je tu mierka výkresu. Súradnicový systém je voliteľný: nastavte ho v {{ui:Súradnice}} a nič sa nepohne, iba povie, čo čísla znamenajú (pozri [Nastavenie súradnicového systému projektu](topic:coordinate-systems)). Stopy sa pri zápise do LandXML považujú za americké geodetické stopy.

**Skupiny hrán zlomu sa spájajú v poradí čísel bodov.** Skupina nastavená na {{ui:Hrana zlomu}} sa stane jednou čiarou cez všetky svoje body, v poradí čísel. Spoločné kódy (dve prúdnice kódované "FL") vytvoria jednu klikatú čiaru; tie nakreslite ručne.

**Staničenia vyzerajú rovnako, metre sa líšia.** Stopy používajú staničenie po 100 ft (12+34.56); metre používajú staničenie po 1000 m (1+234.567).

**Mazanie na Macu.** Kláves označený delete na Macu je v prehliadači Backspace. Na zmazanie výberu použite Fn a delete, alebo tlačidlo {{ui:Zmazať}}.

**Súbory sú sťahovania.** {{ui:Uložiť}} stiahne súbor `.civilcraft.json` pri každom použití; neexistuje „uložiť cez otvorený súbor“. Záložná kópia neuložených prác sa uchováva v tomto prehliadači ([Obnoviť neuložené práce](common:recover)). Otvorenie súboru bodov nahradí body bez opýtania sa. Pozrite [Súbory, ktoré môžete otvoriť, uložiť a exportovať](topic:files).

**Pravidlá sú vaše.** Pravidlá potrubnej siete a zostava koridoru začínajú zástupnými hodnotami, ktoré nie sú normou. Nastavte si vlastné, skôr než čomukoľvek dôverujete.

**Objemy sú založené na mriežke.** Výkop a násyp vychádzajú z jemnej mriežky medzi dvoma povrchmi, vnútri čiar napojenia, bez nabytia a zmrštenia. Sú blízko, ale nie rovnaké ako objem TIN-na-TIN.

## Čo chýba

Iné než klotoidné prechodnice, zostavy, ktoré sa menia pozdĺž cesty, plošiny so sklonom, kapacita vtokov a retencia, katalógy častí, potrubia v profile, rozdelenie parciel a veľkosti pozemkov, vyrovnanie metódou najmenších štvorcov a databázy zameraní, otvorenie DWG a ďalšie. Úplný zoznam s tým, čo robiť dnes, je v [Ešte nie je hotové](topic:not-built-yet).
