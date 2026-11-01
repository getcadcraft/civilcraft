---
title: Súbory, ktoré môžete otvoriť, uložiť a exportovať
summary: Súbory bodov, LandXML a projekty CivilCraft na vstupe; projekty, LandXML, DXF a PDF na výstupe; čo každý súbor uchováva, kam súbory idú a čo sa mení v offline režime.
keywords: otvoriť, uložiť, export, import, formáty súborov, csv, txt, landxml, xml, dxf, pdf, json, stiahnuť, projektový súbor
from: a7debb61
---

CivilCraft otvára súbory z vášho počítača a ukladá ich stiahnutím späť do neho. Nič sa nenahráva a nič sa neuchováva na serveri. Pozri aj [Vaše súbory](common:your-files).

## Čo otvára

Kliknite na {{ui:Otvoriť}} (alebo stlačte {{key:Mod+O}}) a vyberte súbor, alebo pretiahnite súbor z {{pick:mac=Finder|windows=Prieskumník súborov|linux=správcu súborov}} na plán. Vždy jeden súbor naraz; súbory väčšie ako 200 MB sa odmietnu.

| Druh | Názvy súborov | Čo sa stane |
|---|---|---|
| Súbor bodov | `.csv`, `.txt`, `.pnt`, `.xyz` (ľubovoľný textový súbor) | Otvorí sa dialógové okno **Import bodov**. Body nahradia body projektu; osi trás, stavebné plochy a potrubia zostanú. |
| LandXML | `.xml`, `.landxml` | Z súboru sa vytvorí **nový projekt** (ak má aktuálny projekt neuložené zmeny, najprv sa vás opýtame). |
| Projekt CivilCraft | `.civilcraft.json` (ľubovoľný `.json`) | Projekt sa otvorí tak, ako bol uložený (ak má aktuálny projekt neuložené zmeny, najprv sa vás opýtame). |

CivilCraft rozhoduje podľa koncovky súboru a potom podľa prvých znakov: text začínajúci na `{` sa načíta ako projekt, text začínajúci na `<` ako LandXML, všetko ostatné ako súbor bodov. Súbor, ktorý je v okne na otvorenie zošedený, možno aj tak pretiahnuť na plán.

:::note
Import súboru bodov do projektu, ktorý už body obsahuje, ich nahradí bez opýtania a vymaže históriu späť (otvorenie ľubovoľného súboru je pre funkciu späť nový začiatok). Ak povrch pochádzal z LandXML, import bodov ho prepne späť na povrch zostavený z bodov. Ak by ste mohli chcieť staré body späť, najprv uložte.
:::

Podrobnosti: [Formáty súborov bodov](topic:point-file-formats), [LandXML: čo sa číta a zapisuje](topic:landxml-reference).

## Čo ukladá

{{ui:Uložiť}} ({{key:Mod+S}}) zapíše dva súbory vedľa seba, pomenované podľa **Názov** v ľavom paneli: `<name>.civilcraft.json`, projekt, v ktorom budete pokračovať v úpravách, a `<name>.ifc`, rovnaký návrh vo formáte IFC 4.3 pre ostatných (pozri [Export a import IFC](topic:ifc)). Každý súbor eviduje ten druhý a IFC navyše obsahuje komprimovanú kópiu projektu, takže IFC odoslaný samostatne sa stále otvorí ako plne upraviteľný.

- **V Studio** sa oba súbory zapíšu vedľa seba, na mieste.
- **V Chrome a Edge** prvé uloženie sa opýta na priečinok a zapíše do neho oba súbory; ďalšie uloženia idú do rovnakého priečinka. Ak na otázku priečinka kliknete na Zrušiť, namiesto toho sa stiahnu oba súbory.
- **V ostatných prehliadačoch** sa stiahnu oba súbory, najprv súbor projektu.

Pri otvorení jedného súboru sa hľadá druhý. Otvorte oba naraz (alebo ich pretiahnite oba), alebo otvorte jeden: v Studio sa druhý nájde v rovnakom priečinku; v prehliadači vás CivilCraft požiada, aby ste ho pridali, alebo aby ste pokračovali s tým, ktorý máte. Ak IFC po uložení v CivilCraft zmenil iný program, alebo je jeden zo súborov starší ako druhý, projekt sa otvorí z novšieho návrhu a panel Problémy povie, čo sa stalo, s tlačidlami **Uložiť teraz** (znova zapíše oba súbory) a **Zobraziť geometriu IFC ako referenciu**. Samostatné IFC, ktoré zmenil iný program, sa otvorí z jeho kópie projektu s tým, čo ešte sedí: osi trás, ktoré zmenil, prevezmú jeho geometriu, objekty, ktoré odstránil, sa vynechajú a zvyšok jeho zmien sa len vypíše, nie prevezme. Projektový súbor z verzie pred 0.7.1 sa otvorí ako doteraz.

Projektový súbor uchováva:

- každý bod (číslo, súradnice, výšku, popis) a názov súboru bodov, z ktorého pochádzajú
- nastavenia povrchu: voľby skupín, nakreslené hrany zlomu, hranicu, najdlhšiu vonkajšiu hranu a TIN načítaný z LandXML
- nastavenia zobrazenia
- osi trás s ich PI, polomermi a začiatočným staničením, ich návrhové profily (PVI a dĺžky oblúkov) a nastavenia koridoru
- stavebné plochy a sieť potrubí s jej pravidlami

Nedrží históriu späť. Povrchy, vrstevnice, čiary prechodu do terénu a objemy sa neukladajú; pri otvorení projektu sa znova vytvoria z uložených vstupov. Projektový súbor z novšej verzie CivilCraft sa odmietne so správou, ktorá uvedie jeho verziu.

## Čo exportuje

| Tlačidlo | Súbor | Obsah |
|---|---|---|
| {{ui:LandXML}} | `<name>.xml` | LandXML 1.2: body, existujúci terén (a upravený povrch, ak existuje) ako TIN povrchy, osi trás, terénne a návrhové profily, sieť potrubí |
| {{ui:DXF}} | `<name>.dxf` | R12 DXF čiar pôdorysu tak, ako sú zobrazené, na pomenovaných hladinách |
| {{ui:DWG}} | `<name>.dwg` | Tie isté čiary ako výkres DWG vo formáte, ktorý vyberiete (2000 až 2018) |
| {{ui:PDF}} | `<name>.pdf` | Vektorový výkres pôdorysu na liste v mierke, ktorú vyberiete |
| {{ui:GLB}} alebo {{ui:OBJ}} (na paneli 3D pohľadu) | `<name>-3d.glb`, `<name>-3d.obj` | Čo zobrazuje 3D pohľad ako 3D model: metre, Y smerom nahor, skutočná mierka, okolo zaznamenaného lokálneho počiatku |

Čo každý z nich vynecháva: [Výmena LandXML](topic:landxml), [Export pôdorysu do DXF](topic:dxf-export) (aj DWG), [Vykreslenie pôdorysu do PDF](topic:plot-pdf), [Export staveniska v 3D](topic:export-3d).

## Kam idú súbory

Uložené a exportované súbory idú tam, kam prehliadač ukladá stiahnuté súbory, zvyčajne do priečinka Stiahnuté súbory. Ak chcete pri každom uložení vybrať priečinok:

:::chromium
Otvorte **Nastavenia** prehliadača, potom **Stiahnuté súbory** a zapnite **Pýtať sa, kam uložiť každý súbor pred jeho stiahnutím**.
:::

:::firefox
Otvorte **Nastavenia**, potom **Všeobecné** a v časti **Súbory a aplikácie** vyberte **Vždy sa opýtať, kam uložiť súbory**.
:::

:::safari
Otvorte **Safari > Nastavenia > Všeobecné** a nastavte **Umiestnenie na stiahnutie súborov** na **Opýtať sa pri každom stiahnutí**.
:::

Ak uložíte dvakrát pod rovnakým názvom, prehliadač môže k druhému súboru pridať číslo, napríklad `Site (1).civilcraft.json`. Pri ďalšom otvorení otvorte najnovší.

## Online a offline

CivilCraft v každom prípade funguje iba na vašom počítači: otvorenie načíta súbor v prehliadači, uloženie ho stiahne. Ak chcete CivilCraft otvoriť bez akéhokoľvek pripojenia, najprv ho uložte na offline použitie:

1. Keď ste online, kliknite v hornom paneli aplikácie na {{ui:Uložiť na offline použitie}}.
2. Tlačidlo ukazuje priebeh ("Ukladá sa 12 z 30") a potom zobrazí {{ui:Pripravené offline}}. CivilCraft je malý (asi 0.6 MB), takže to chvíľu trvá. Uložená kópia obsahuje túto pomoc a ukážkové stavenisko.
3. Bez pripojenia otvorte rovnakú adresu (alebo jej záložku). Všetko funguje vrátane {{ui:Otvoriť ukážkové stavenisko}}.

Ďalšie stavy tlačidla:

- {{ui:Nepodarilo sa uložiť}}: niektoré súbory sa nestiahli. Skontrolujte pripojenie a kliknutím to skúste znova.
- {{ui:Offline nie je k dispozícii}}: toto okno prehliadača nemôže uchovať offline kópiu (súkromné okná a niektoré spravované počítače to blokujú). Použite bežné okno.

Kliknutím na {{ui:Pripravené offline}} zistíte, kedy bola kópia uložená, a máte dve možnosti: {{ui:Uložiť znova (získať najnovšiu verziu)}} a {{ui:Odstrániť offline kópiu}}. Pred návštevou staveniska uložte znova, aby kópia zodpovedala najnovšiemu zostaveniu. Viac v [Offline](common:offline).

:::offline
Teraz ste offline. Ak bol CivilCraft uložený na offline použitie, všetko funguje vrátane ukážkového staveniska. Ak nie, pokračujte v práci na tejto karte, ale neobnovujte ju, kým nebudete znova online; bez uloženej kópie {{ui:Otvoriť ukážkové stavenisko}} zlyhá s hlásením "Ukážku sa nepodarilo načítať".
:::

:::tip
Na použitie v teréne uložte CivilCraft na offline použitie a súbory bodov majte priamo v notebooku. Projekty a exporty sa aj bez pripojenia ukladajú ako stiahnutia, takže môžete importovať denné zamerania, skontrolovať povrch a uložiť projekt na mieste.
:::

Ukladanie do cloudu zatiaľ nie je k dispozícii a desktopové verzie ešte nie sú k dispozícii. Dnes sú súbory, ktoré uložíte, jedinou kópiou: uložte ich na miesto, ktoré sa zálohuje.

## Doplnky, ktoré súbor používa

Keď uložíte projekt, ktorý obsahuje údaje z doplnku (zaškrtávacie políčka Stavebné predpisy alebo zdroj Adresa na stavenisko), súbor zaznamená, ktoré doplnky a ktoré verzie. Ak ho otvoríte na počítači, na ktorom doplnok chýba, nad plánom sa zobrazí lišta, ktorá to oznámi a ponúkne pridanie zo zoznamu vášho účtu. Záznam je len poznámka: súbor sa otvorí tak či onak.

## Späť zo Studio

V CadCraft Studio sa každý krok, ktorý dokončíte v CivilCraft, oznámi Studio, takže jeho funkcia späť na úrovni projektu môže vziať späť posledný krok naprieč aplikáciami. Studio vráti krok späť, iba ak je zásobník späť v CivilCraft presne v stave, v akom ho tento krok zanechal; po otvorení iného súboru toto okno preskočí.

## Zatvorenie s neuloženými zmenami

Ak má projekt neuložené zmeny a zatvoríte kartu, obnovíte stránku alebo opustíte stránku, prehliadač sa opýta, či chcete odísť. Jeho znenie a vzhľad patria prehliadaču a CivilCraft ich nemôže zmeniť. {{ui:Nový}} a otvorenie projektu alebo súboru LandXML sa namiesto toho opýtajú vo vlastnom okne CivilCraft **Neuložené zmeny** s tlačidlami {{ui:Zrušiť}}, {{ui:Neukladať}} a {{ui:Uložiť kópiu}}.
