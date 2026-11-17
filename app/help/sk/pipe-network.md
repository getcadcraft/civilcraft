---
title: Rozvrhnutie gravitačnej potrubnej siete
summary: Kreslite úseky dažďovej alebo splaškovej kanalizácie objekt po objekte, nastavte pravidlá sklonu, krytia a poklesu, nechajte CivilCraft určiť dná a opravte problémy, ktoré vypíše.
keywords: tvorca objektov, typ objektu, obdĺžnikový objekt, uličný vpust, rám, krytie, hrúbka steny, položka knižnice, potrubná sieť, dažďová, splašková, kanalizácia, objekty, šachty, vtoky, dná, sklon, pokles, poklop, kalová jama, gravitačné potrubia
from: 10a3c14d
---

Projekt obsahuje jednu gravitačnú potrubnú sieť, dažďovú alebo splaškovú. Skladá sa z objektov (šácht a vtokov) a priamych potrubí medzi nimi. Tok ide smerom, ktorým kreslite. CivilCraft skontroluje každé potrubie a objekt podľa troch pravidiel, ktoré nastavíte, a môže z týchto pravidiel nastaviť všetky dná.

## Kreslenie úseku

Potrubia môžete kresliť bez povrchu, ale poklopy, krytie a automatické dná ho potrebujú.

1. Stlačte {{key:P}}, alebo kliknite na {{ui:Pipes}} v skupine **Návrh**.
   Nápoveda hlási: "Potrubia: klikajte na objekty od hornej časti úseku smerom nadol (kliknutím na existujúci objekt sa k nemu pripojíte). Enter ukončí."
2. Kliknite tam, kde má byť horný objekt. Objekt sa umiestni.
3. Kliknite na každý ďalší objekt smerom nadol. Ak sa chcete pripojiť k existujúcemu objektu, kliknite na neho: stavový riadok napíše "Pripojené S3."
4. Stlačte {{key:Enter}}.
   Potrubia sa nakreslia, ich dná sa nastavia podľa pravidiel a stavový riadok napríklad napíše: "3 potrubia nakreslené, 12 dien nastavených podľa pravidiel; všetky kontroly prešli."

Nové objekty sa pomenujú S1, S2 … s priemerom 48 in (1200 mm). Nové potrubia sa pomenujú P1, P2 … s priemerom 12 in (300 mm). Priemery sú v palcoch v projekte v stopách a v milimetroch v projekte v metroch.

Ukončite stlačením {{key:Enter}}. Dvojité kliknutie funguje tiež, ale keď dvakrát kliknete na existujúci objekt, aby ste tam úsek ukončili, pripojenie sa zruší: kliknite na neho raz a potom stlačte {{key:Enter}}.

## Nastavenie pravidiel

Keď nie je nič vybrané, pravý panel (**Projekt**) má blok **Potrubná sieť**:

| Nastavenie | Východzia hodnota | Význam |
|---|---|---|
| Typ | Dažďová | {{ui:Storm}} alebo {{ui:Sanitary}}; zapisuje sa do LandXML |
| Najmenší sklon | 0.50 % | Každé potrubie musí klesať aspoň o toľko |
| Najmenšie krytie | 2 ft (0.6 m) | Od terénu po temeno potrubia, po celej jeho dĺžke |
| Pokles v objektoch | 0.10 ft (0.03 m) | Dno výtoku musí byť aspoň o túto vzdialenosť pod každým dnom vtoku |

**Tieto východzie hodnoty sú zástupné, nie normy.** Nastavte hodnoty, ktoré vyžaduje váš úrad alebo projekt. Krytie sa meria od terénu po temeno (dno plus vnútorný priemer); hrúbka steny sa nepočíta. Tam, kde sa upravujú plošiny alebo koridory, je upravený povrch terénom.

## Nechajte CivilCraft nastaviť dná

- {{ui:Set every invert from the rules}} (v bloku **Potrubná sieť**) nastaví všetky potrubia.
- {{ui:Set its inverts from the rules}} (keď je vybrané jedno potrubie) nastaví len toto potrubie.

Smerom nadol každý úsek začína aspoň s krytím na svojom hornom objekte, klesá aspoň o najmenší sklon, klesá aspoň o pokles v každom objekte a ide hlbšie všade tam, kde by terén pozdĺž potrubia zanechal menej než najmenšie krytie. Dná sa zaokrúhľujú nadol na 0.01, nikdy nahor. Stavový riadok napíše "Dná nastavené: najmenšie krytie na hornom konci každého úseku, aspoň najmenší sklon, aspoň pokles v každom objekte." alebo uvedie, čo sa nepodarilo.

## Úprava objektov a potrubí

Kliknite na objekt alebo potrubie nástrojom {{ui:Select}}, aby ste ho videli v pravom paneli.

**Objekt**: **Názov**, **Poklop**, **Hĺbka kalovej jamy**, **Priemer**, potom **Použitý poklop**, **Kalová jama**, **X** a **Y**, a potrubia dnu a von s ich dnami.

- Nechajte **Poklop** prázdny, aby sa vzal z povrchu; pole potom ukáže hodnotu povrchu sivou farbou. Zadajte hodnotu, ak chcete poklop pevne nastaviť.
- Potiahnite úchyt objektu v pôdoryse, aby ste ho presunuli. Jeho potrubia ho nasledujú; ich dná zostanú, ako boli, takže potom skontrolujte problémy.

**Typ**: vyberte jeden z typov objektov siete (nižšie), alebo žiadny pre okrúhly objekt vlastného priemeru.

**Potrubie**: **Názov**, objekty, medzi ktorými vedie, **Priemer**, **Horné dno**, **Spodné dno**, potom **Dĺžka**, **Sklon** a **Najmenšie krytie**.

Stlačte {{key:Enter}} po každej hodnote.

## Čítanie a oprava problémov

Blok **Potrubná sieť** vypíše každý problém (až 40); kliknutím na jeden vyberiete potrubie alebo objekt. Vybrané potrubie alebo objekt vypíše svoje vlastné problémy. Keď nič nie je vybrané, napíše: "Každé potrubie a objekt prechádza pravidlami."

| Správa (príklady) | Čo robiť |
|---|---|
| "P2 stúpa (-0.40 %)." alebo "… vedie rovno …" | Vymeňte dná, alebo ich nastavte podľa pravidiel. |
| "P2 pri 0.30 % je plochejšie ako minimum 0.50 %." | Znížte spodné dno alebo zvýšte horné dno. |
| "P3 má po celej dĺžke krytie 1.40 pri dĺžke 35, čo je menej ako minimum 2." | Znížte potrubie; nastavte jeho dná podľa pravidiel. |
| "V S3 P4 odchádza na 245.20, čo je menej ako 0.1 pod P3 prichádzajúcim na 245.25." | Znížte horné dno výtokového potrubia. |
| "Temeno P1 je nad poklopom S1." | Potrubie je pre objekt príliš vysoko. |
| "Zo S2 odchádzajú 2 potrubia; gravitačná sieť by mala mať jeden odtok z každého objektu." | Odstráňte jedno odchádzajúce potrubie, alebo ho nakreslite znova správnym smerom. |
| "Potrubia tvoria slučku; tok musí končiť na výtoku." | Úsek sa nakreslil späť do seba; zmažte jedno potrubie. |
| "S5 je mimo povrchu a nemá výšku poklopu." | Zadajte poklop, alebo presuňte objekt na povrch. |
| "P6 čiastočne vedie mimo povrchu; krytie tam nie je známe." | Rozšírte povrch, alebo prijmite, že tam krytie nie je kontrolované. |
| "P7 zatiaľ nemá dná." | Zadajte ich, alebo ich nastavte podľa pravidiel. |

Problémové potrubia a objekty sú v pôdoryse tiež označené červenou farbou.

## Typy objektov

Typ objektu je objekt postavený z jeho parametrov: šachta, vtok, rozdeľovacia šachta alebo výtok, **okrúhly** (vnútorný priemer) alebo **obdĺžnikový** (vnútorná šírka a dĺžka), s jeho **hrúbkou steny**, **podlahovou doskou**, **kalovou jamou** pod najnižším potrubím a **rámom a poklopom** (okrúhlym alebo obdĺžnikovým otvorom, výškou rámu). Typy patria do siete, pod **Typy objektov** vo Vlastnostiach projektu.

1. Kliknite na {{ui:New structure type}}. Dialóg kreslí objekt v pôdoryse a v reze, ako píšete.
2. Kliknite na {{ui:Add the type}}.
3. Vyberte objekt a zvoľte typ pod **Typ**. Prevezme veľkosť typu a jeho kalovú jamu; vlastnú kalovú jamu možno ešte zmeniť.

Upravte typ a každý objekt tohto typu sleduje jeho rozmery. Odstráňte typ a jeho objekty zostanú ako okrúhle objekty rovnakej šírky. Každá zmena je jeden krok: {{key:Mod+Z}} ju vráti späť.

Obdĺžnikový objekt sa kreslí v pôdoryse, v DXF, DWG a PDF a v 3D ako obdĺžnik, ktorého dĺžka ide pozdĺž jeho výtokového potrubia; potrubia začínajú pri jeho stene. LandXML ho zapíše ako obdĺžnikový objekt (`RectStruct`) s jeho hrúbkou steny a takéto objekty načíta späť ako typy.

### Zdieľanie typu cez knižnicu

{{ui:Save as library item}} zapíše typ ako položku knižnice CadCraft (súbor `.json`): jeho symbol v pôdoryse, 3D teleso do typickej hĺbky a všetky rozmery. Nahrajte ho do knižnice, aby ste ho zdieľali. {{ui:Open a library item}} načíta objekt uložený týmto spôsobom späť do siete, prevedený na jednotky projektu. Položky knižnice, ktoré nie sú objektmi vytvorenými v CivilCraft, sa odmietnu s uvedením dôvodu.

## Zmazanie

Vyberte potrubie a stlačte {{key:Delete}}, aby ste ho odstránili. Zmazanie objektu odstráni aj potrubia k nemu pripojené. Na Macu stlačte Fn a Delete, alebo kliknite na {{ui:Delete}}.

## Ešte nie je hotové

Prietoky, veľkosti potrubí a čiara hydraulického sklonu sú v [Dažďová kanalizácia](topic:storm-drainage). Katalógy potrubí, nekruhové potrubia, potrubia v pohľade na profil, zakrivené potrubia a viac ako jedna sieť na projekt zatiaľ nie sú k dispozícii. Pozri [Ešte nie je hotové](topic:not-built-yet).
