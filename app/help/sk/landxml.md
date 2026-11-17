---
title: Výmena LandXML
summary: Otvorte LandXML z iného civilného softvéru ako nový projekt, exportujte body, povrchy, trasy, profily a sieť potrubí ako LandXML 1.2 a vedzte, čo sa necestuje.
keywords: landxml, xml, import, export, výmena, tin, povrch, trasa, profil, sieť potrubí, interoperabilita, výmena dát
from: 870d5ece
---

LandXML je otvorený výmenný formát, ktorý väčšina civilných programov číta a zapisuje. CivilCraft číta a zapisuje LandXML 1.2. Ak ste používali Civil 3D, jeho dialógové okná importu a exportu LandXML sú najbližšie; tu nie je čo voliť a poznámky vám povedia, čo sa vynechalo.

## Otvorenie súboru LandXML

1. Kliknite na {{ui:Open}} (alebo stlačte {{key:Mod+O}}) a vyberte súbor `.xml` alebo `.landxml`, alebo ho pretiahnite na pôdorys.
2. Ak má aktuálny projekt neuložené zmeny, CivilCraft sa najprv opýta. Vyberte {{ui:Save a copy}}, {{ui:Don’t save}} alebo {{ui:Cancel}}.
3. Vytvorí sa **nový projekt**. Stavový riadok povie, čo sa prečítalo, napríklad: "Otvorený súbor site.xml: 412 bodov, 2 povrchy, 3 trasy."
4. Pozrite sa na políčko pod údajmi v časti **Povrch**. Vypíše všetko, čo bolo preskočené alebo zmenené, napríklad:
   - "Otvoril sa iba prvý povrch ("EG"); súbor má ešte 1."
   - "Trasa "Ramp A" má prvky, ktoré CivilCraft zatiaľ nevie nakresliť (nie čiary, oblúky ani klotoidné špirály); bola preskočená."
   - "Pravidlá siete potrubí nie sú v súbore; používajú sa zástupné hodnoty — nastavte si svoje v časti Projekt."

Čo sa stane s čím:

| V súbore | V CivilCraft |
|---|---|
| Jednotky (Imperial alebo Metric) | **Jednotky** projektu (stopy alebo metre) |
| Názov projektu | Názov projektu, pole **Name** |
| CgPoints | body projektu; popis (alebo kód) určí skupinu |
| Prvý povrch TIN | existujúci terén, použitý tak, ako je ("Povrch (z LandXML)") |
| Každá trasa z čiar, oblúkov a klotoidných špirál | trasa s jej PI, polomermi a dĺžkami špirál obnovenými z oblúkov |
| Prvý návrhový profil každej trasy | jej návrhový profil s parabolickými zvislými oblúkmi |
| Prvá sieť potrubí | sieť potrubí s jej hornými okrajmi, sumpmi a dnami |
| Čiary tvaru z čiar a oblúkov | čiary tvaru, oblúky zachované; z iného programu začínajú ako **Iba nakreslené** |

Úplný zoznam prvkov a atribútov je v [LandXML: čo sa číta a zapisuje](topic:landxml-reference).

:::note
Povrch načítaný z LandXML sa nepreráta, keď zmeníte skupiny bodov alebo nakreslíte zlomové čiary. Kliknite na {{ui:Rebuild the surface from the points}} v časti **Povrch**, aby sa vytvoril z bodov (kláves {{key:Mod+Z}} vráti povrch LandXML späť).
:::

## Export LandXML

1. Kliknite na {{ui:LandXML}} v skupine **Export**.
2. Prehliadač stiahne `<name>.xml`. Stavový riadok povie, čo sa do nej dostalo, napríklad: "Exportovaný LandXML 1.2: 276 bodov, 2 povrchy, 1 trasa, sieť potrubí. Plochy sa tu nezapisujú do LandXML; zapisuje sa upravený povrch."

Súbor obsahuje:

- **Units**: US survey feet alebo metre.
- **CgPoints**: každý bod s číslom ako názvom, popisom a skupinou ako kódom.
- **Surfaces**: existujúci terén ako TIN so zlomovými čiarami a vonkajšou hranicou ako zdrojovými dátami; a keď plochy alebo koridory upravujú terén, druhý povrch TIN s názvom "Proposed".
- **Alignments**: čiary, oblúky a klotoidné špirály s ich staničeniami, každá s profilom, ktorý obsahuje existujúci terén vzorkovaný pozdĺž nej, a návrhovým profilom (PVI a parabolické oblúky), keď má aspoň dva PVI.
- **PipeNetworks**: šachty s ich hornými okrajmi, sumpmi a dnom potrubia pre každé potrubie, a potrubia s priemerom, dĺžkou a sklonom.
- **PlanFeatures**: každá čiara tvaru ako čiary a oblúky s výškou na každom konci a na to, na čo sa používa.

## Čo necestuje

- Plochy a koridory ako objekty. Ich výsledok je v povrchu "Proposed".
- Trasy s chybami (napríklad prekrývajúce sa oblúky): vynechajú sa a počítajú sa v stavovom hlásení.
- Potrubia bez oboch dien (invertov) a siete s menej než dvoma šachtami.
- Horný okraj vzatý z povrchu sa zapíše ako pevný. Po opätovnom otvorení si šachta zachová toto číslo, aj keď sa povrch zmení.
- Pravidlá siete (najmenší sklon, krytie, pokles): LandXML pre ne nemá miesto.
- Nastavenia zobrazenia a voľby povrchu skupín bodov: na to uložte projekt CivilCraft.

Pri otváraní CivilCraft nečíta špirály iné než klotoidné, mriežkové povrchy, body, ktoré iba odkazujú na iné body, parcely, špirály v čiarach tvaru, cesty ani údaje prieskumu. Každé z nich je uvedené v poznámkach, nikdy sa neodhaduje.

## Tam a späť

Ak chcete poslať prácu niekomu, kto používa iný civilný softvér, a dostať ju späť, exportujte LandXML, nechajte ho upraviť a jeho LandXML otvorte ako nový projekt. Ponechajte si vlastný súbor `.civilcraft.json`: je to jediný súbor, ktorý uchováva všetko, čo CivilCraft pozná.
