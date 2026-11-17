---
title: Súbory, ktoré môžete otvoriť, uložiť a exportovať
summary: Bodové súbory, LandXML a projekty CivilCraft na vstupe; projekty, LandXML, DXF a PDF na výstupe; čo každý uchováva, kam súbory smerujú a čo sa mení offline.
keywords: otvoriť, uložiť, export, import, formáty súborov, csv, txt, landxml, xml, dxf, pdf, json, stiahnuť, súbor projektu
from: 82bff559
---

CivilCraft otvára súbory z vášho počítača a ukladá ich tak, že ich sťahuje späť do počítača. Nič sa nenahráva a nič sa neuchováva na serveri. Pozri aj [Vaše súbory](common:your-files).

## Čo otvára

Kliknite na {{ui:Open}} (alebo stlačte {{key:Mod+O}}) a vyberte súbor, alebo pretiahnite súbor z {{pick:mac=Finder|windows=File Explorer|linux=váš správca súborov}} na pôdorys. Naraz jeden súbor; súbory väčšie než 200 MB sa odmietnu. LandXML alebo súbor projektu väčší než 32 MB sa číta po častiach po približne 4 MB, nikdy nie ako jeden blok textu. Počas otvárania LandXML počítajte s tým, že spotrebuje približne 13-násobok veľkosti súboru v pamäti (súbor 69 MB použil v našom teste približne 0.9 GB).

| Druh | Názvy súborov | Čo sa stane |
|---|---|---|
| Bodový súbor | `.csv`, `.txt`, `.pnt`, `.xyz` (ľubovoľný textový súbor) | Otvorí sa dialógové okno **Importovať body**. Body nahradia body projektu; osi trasy, plochy a potrubia zostanú. |
| LandXML | `.xml`, `.landxml` | Z tohto súboru sa vytvorí **nový projekt** (ak má aktuálny projekt neuložené zmeny, najprv sa vás opýtame). |
| Projekt CivilCraft | `.civilcraft.json` (ľubovoľný `.json`) | Projekt sa otvorí tak, ako bol uložený (ak má aktuálny projekt neuložené zmeny, najprv sa vás opýtame). |

CivilCraft rozhoduje podľa koncovky súboru a potom podľa jeho prvých znakov: text začínajúci `{` sa číta ako projekt, text začínajúci `<` ako LandXML a všetko ostatné ako bodový súbor. Súbor, ktorý okno na otvorenie zašedne, sa stále dá pustiť na pôdorys.

:::note
Import bodového súboru do projektu, ktorý už body má, ich nahradí bez opýtania a vymaže históriu späť (otvorenie ľubovoľného súboru je nový začiatok pre späť). Ak povrch pochádza z LandXML, import bodov ho prepne späť na povrch vytvorený z bodov. Ak by ste mohli chcieť staré body neskôr obnoviť, najprv uložte.
:::

Podrobnosti: [Formáty bodových súborov](topic:point-file-formats), [LandXML: čo sa číta a zapisuje](topic:landxml-reference).

## Čo ukladá

{{ui:Save}} ({{key:Mod+S}}) zapíše dva súbory vedľa seba, pomenované podľa **Názov** v ľavom paneli: `<name>.civilcraft.json`, projekt, ktorý ďalej upravujete, a `<name>.ifc`, ten istý návrh ako IFC 4.3 pre ostatných (pozri [Export a import IFC](topic:ifc)). Každý súbor eviduje ten druhý a IFC navyše nesie komprimovanú kópiu projektu, takže IFC poslané samostatne sa stále otvorí plne upraviteľné.

- **V Studiu** sa oba súbory zapíšu vedľa seba, na mieste.
- **V Chrome a Edge** prvé uloženie požiada o priečinok a zapíše oba do neho; ďalšie uloženia idú do toho istého priečinka. Zrušením otázky na priečinok stiahnete oba súbory namiesto toho.
- **V iných prehliadačoch** sa oba súbory stiahnu, najprv súbor projektu.

Otvorenie ktoréhokoľvek súboru hľadá ten druhý. Otvorte oba naraz (alebo ich pustite oba), alebo otvorte jeden: v Studiu sa druhý nájde v tom istom priečinku; v prehliadači sa CivilCraft opýta, či ho chcete pridať, alebo či chcete pokračovať s tým, ktorý máte. Ak IFC zmenil iný program po tom, ako ho CivilCraft uložil, alebo je jeden súbor starší než druhý, projekt sa otvorí z novšieho návrhu a panel **Problémy** povie, čo sa stalo, s tlačidlami **Uložiť teraz** (zapíše oba súbory znova) a **Zobraziť geometriu IFC ako referenciu**. Samotné IFC, ktoré iný program zmenil, sa otvorí z jeho kópie projektu s tým, čo sa stále zhoduje: osi trasy, ktoré zmenil, preberú jeho geometriu, objekty, ktoré odstránil, sa vynechajú a zvyšok jeho zmien sa len vypíše, nepreberie sa. Súbor projektu z verzie pred 0.7.1 sa otvorí ako doteraz.

Súbor projektu uchováva:

- každý bod (číslo, súradnice, výšku, popis) a názov bodového súboru, z ktorého pochádza
- nastavenia povrchu: voľby skupín, nakreslené hrany zlomu, hranicu, najdlhšiu vonkajšiu hranu a TIN načítaný z LandXML
- nastavenia zobrazenia
- osi trasy s ich PI, polomermi a začiatočným staničením, ich návrhové profily (PVI a dĺžky oblúkov) a nastavenia koridoru
- plošiny a sieť potrubí s jej pravidlami

Nezachováva históriu späť. Povrchy, vrstevnice, hranice zárezu a násypu a objemy sa neukladajú; pri otvorení projektu sa znova vytvoria zo uložených vstupov. Súbor projektu z novšieho CivilCraft sa odmietne so správou, ktorá uvedie jeho verziu.

## Čo exportuje

| Tlačidlo | Súbor | Obsah |
|---|---|---|
| {{ui:LandXML}} | `<name>.xml` | LandXML 1.2: body, existujúci terén (a upravený povrch, ak existuje) ako povrchy TIN, osi trasy, terénne a návrhové profily, sieť potrubí |
| {{ui:DXF}} | `<name>.dxf` | R12 DXF čiar pôdorysu tak, ako sú zobrazené, na pomenovaných vrstvách |
| {{ui:DWG}} | `<name>.dwg` | Rovnaké čiary ako výkres DWG vo formáte, ktorý vyberiete (2000 až 2018) |
| {{ui:PDF}} | `<name>.pdf` | Vektorové vykreslenie pôdorysu na liste v mierke, ktorú vyberiete |
| {{ui:GLB}} alebo {{ui:OBJ}} (na lište 3D pohľadu) | `<name>-3d.glb`, `<name>-3d.obj` | To, čo 3D pohľad zobrazuje ako 3D model: metre, Y nahor, skutočná mierka, okolo zaznamenaného lokálneho počiatku |

Čo každý z nich vynecháva: [Výmena LandXML](topic:landxml), [Export pôdorysu do DXF](topic:dxf-export) (DWG tiež), [Vykreslenie pôdorysu do PDF](topic:plot-pdf), [Export lokality v 3D](topic:export-3d).

## Kam súbory smerujú

Uložené a exportované súbory idú tam, kam prehliadač ukladá sťahovania, zvyčajne do priečinka Stiahnuté súbory. Ak chcete pri každom sťahovaní vybrať priečinok:

:::chromium
Otvorte **Nastavenia** prehliadača, potom **Stiahnuté súbory** a zapnite možnosť **Opýtať sa, kam uložiť každý súbor pred stiahnutím**.
:::

:::firefox
Otvorte **Nastavenia**, potom **Všeobecné** a v časti **Súbory a aplikácie** zvoľte **Vždy sa opýtať, kam uložiť súbory**.
:::

:::safari
Otvorte **Safari > Nastavenia > Všeobecné** a nastavte **Umiestnenie sťahovaných súborov** na **Pýtať sa pri každom sťahovaní**.
:::

Ak uložíte dvakrát s rovnakým názvom, prehliadač môže k druhému súboru pridať číslo, napríklad `Site (1).civilcraft.json`. Pri ďalšom otváraní otvorte najnovší.

## Online a offline

CivilCraft funguje na vašom počítači v oboch prípadoch: otvorenie číta súbor v prehliadači, uloženie ho stiahne. Ak chcete otvoriť CivilCraft bez akéhokoľvek pripojenia, najprv ho uložte na použitie offline:

1. Keď ste online, kliknite v hornej lište aplikácie na {{ui:Save for offline}}.
2. Tlačidlo počíta („Ukladá sa 12 z 30“) a potom zobrazí {{ui:Offline ready}}. CivilCraft je malý (približne 0.6 MB), takže to chvíľu trvá. Uložená kópia obsahuje túto pomoc a ukážkovú lokalitu.
3. Bez pripojenia otvorte tú istú adresu (alebo záložku na ňu). Funguje všetko vrátane {{ui:Otvoriť ukážkovú lokalitu}}.

Ďalšie stavy tlačidla:

- {{ui:Could not save}}: niektoré súbory sa nestiahli. Skontrolujte pripojenie a kliknutím to skúste znova.
- {{ui:Offline not available}}: toto okno prehliadača nemôže uchovať offline kópiu (súkromné okná a niektoré spravované počítače to blokujú). Použite bežné okno.

Kliknutím na {{ui:Offline ready}} zistíte, kedy bola kópia uložená, a máte dve možnosti: {{ui:Uložiť znova (získať najnovšiu verziu)}} a {{ui:Odstrániť offline kópiu}}. Pred návštevou lokality uložte znova, aby kópia zodpovedala najnovšiemu zostaveniu. Viac v [Offline](common:offline).

:::offline
Teraz ste offline. Ak bol CivilCraft uložený na použitie offline, funguje všetko vrátane ukážkovej lokality. Ak nie, zostaňte pracovať v tejto karte, ale neobnovujte ju, kým nebudete znova online; bez uloženej kópie {{ui:Otvoriť ukážkovú lokalitu}} zlyhá s hláškou "Ukážku sa nepodarilo načítať".
:::

:::tip
Na terénne použitie uložte CivilCraft na použitie offline a body merania nechajte priamo na notebooku. Projekty a exporty sa ukladajú ako sťahovania aj bez pripojenia, takže môžete importovať denné merania, skontrolovať povrch a uložiť projekt priamo na stavenisku.
:::

Cloudové ukladanie zatiaľ nie je k dispozícii a desktopové zostavenia ešte nie sú vydané. Zatiaľ sú súbory, ktoré uložíte, jedinou kópiou: uschovajte ich na mieste, ktoré sa zálohuje.

## Doplnky používané súborom

Keď uložíte projekt s dátami z doplnku (zaškrtávacie políčka stavebných predpisov alebo zdroj Adresa na lokalitu), súbor zaeviduje, ktoré doplnky a ktoré verzie. Ak ho otvoríte na počítači, na ktorom daný doplnok chýba, nad pôdorysom sa zobrazí lišta, ktorá to povie, a ponúkne pridanie zo zoznamu vášho účtu. Záznam je iba poznámka: súbor sa otvorí tak či onak.

## Späť v Studiu

V rámci CadCraft Studio sa každý dokončený krok v CivilCraft oznámi Studiu, takže jeho späť na úrovni projektu môže vrátiť posledný krok naprieč aplikáciami. Studio vráti krok späť iba vtedy, keď je vlastný zásobník späť v CivilCraft presne v takom stave, v akom ho tento krok zanechal; po otvorení iného súboru toto okno preskočí.

## Zatvorenie s neuloženými zmenami

Ak má projekt neuložené zmeny a zatvoríte kartu, obnovíte stránku alebo odídete zo stránky, prehliadač sa opýta, či chcete odísť. Jeho znenie a vzhľad patria prehliadaču a CivilCraft ich nemôže zmeniť. {{ui:New}} a otvorenie projektu alebo súboru LandXML sa namiesto toho opýtajú vo vlastnom okne CivilCraft **Neuložené zmeny** s tlačidlami {{ui:Cancel}}, {{ui:Neukladať}} a {{ui:Uložiť kópiu}}.
