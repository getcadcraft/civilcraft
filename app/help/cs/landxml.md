---
title: Výměna LandXML
summary: Otevřete LandXML z jiného civilního softwaru jako nový projekt, exportujte body, povrchy, osy, profily a síť potrubí jako LandXML 1.2 a vězte, co se na cestu nedostane.
keywords: landxml, xml, import, export, výměna, tin, povrch, osa trasy, profil, síť potrubí, interoperabilita, výměna dat
from: 870d5ece
---

LandXML je otevřený výměnný formát, který většina civilních programů čte a zapisuje. CivilCraft čte a zapisuje LandXML 1.2. Pokud jste používali Civil 3D, jeho dialogy importu a exportu LandXML jsou nejbližší; tady nejsou žádné volby k rozhodování a poznámky vám řeknou, co se vynechalo.

## Otevření souboru LandXML

1. Klikněte na {{ui:Otevřít}} (nebo stiskněte {{key:Mod+O}}) a zvolte soubor `.xml` nebo `.landxml`, nebo jej přetáhněte na půdorys.
2. Má-li aktuální projekt neuložené změny, CivilCraft se nejprve zeptá. Zvolte {{ui:Uložit kopii}}, {{ui:Neukládat}} nebo {{ui:Zrušit}}.
3. Vytvoří se **nový projekt**. Stavový řádek říká, co bylo načteno, například „Otevřeno site.xml: 412 bodů, 2 povrchy, 3 osy trasy.“
4. Podívejte se do pole pod fakty o **Povrchu**. Vypisuje vše, co bylo přeskočeno nebo změněno, například:
   - „Otevřen jen první povrch („EG“); soubor má ještě 1.“
   - „Osa „Rampa A“ má prvky, které CivilCraft zatím nedokáže nakreslit (ne čáry, oblouky nebo klotoidní spirály); byla přeskočena.“
   - „Pravidla sítě potrubí nebyla v souboru; používají se zástupné hodnoty — nastavte svá v části Projekt.“

Co se stane čím:

| V souboru | V CivilCraftu |
|---|---|
| Jednotky (Imperial nebo Metric) | **Jednotky** projektu (stopy nebo metry) |
| Název projektu | **Název** projektu |
| CgPoints | body projektu; popis (nebo kód) určí skupinu |
| První povrch TIN | stávající terén, použitý tak, jak je („Povrch (z LandXML)“) |
| Každá osa čar, oblouků a klotoidních spirál | osa s PI, poloměry a délkami spirál obnovenými z oblouků |
| První navržený profil každé osy | jeho navržený profil s parabolickými svislými oblouky |
| První síť potrubí | síť potrubí s jejími poklopy, jímkami a dny |
| Prvky půdorysu čar a oblouků | hranové čáry, oblouky zachovány; z jiného programu začínají jako **Jen nakresleno** |

Úplný seznam prvků a atributů je v [LandXML: co se čte a zapisuje](topic:landxml-reference).

:::note
Povrch načtený z LandXML se nepřestaví, když změníte skupiny bodů nebo nakreslíte lomové hrany. Klikněte na {{ui:Obnovit povrch z bodů}} v sekci **Povrch**, aby se vytvořil z bodů (místo toho {{key:Mod+Z}} vrátí povrch z LandXML).
:::

## Export LandXML

1. Klikněte na {{ui:LandXML}} ve skupině **Export**.
2. Prohlížeč stáhne `<název>.xml`. Stavový řádek říká, co se do něj dostalo, například „Exportováno LandXML 1.2: 276 bodů, 2 povrchy, 1 osa trasy, síť potrubí. Plošiny zde nejsou součástí LandXML; upravený povrch ano.“

Soubor obsahuje:

- **Units**: US survey stopy nebo metry.
- **CgPoints**: každý bod s jeho číslem jako názvem, jeho popisem a jeho skupinou jako kódem.
- **Surfaces**: stávající terén jako TIN, s jeho lomovými hranami a vnější hranicí jako zdrojová data; a, když plošiny nebo koridory upravují terén, druhý povrch TIN pojmenovaný „Proposed“.
- **Alignments**: čáry, oblouky a klotoidní spirály s jejich staničením, každá s profilem obsahujícím stávající terén vzorkovaný podél ní a navržený profil (PVI a parabolické oblouky), má-li alespoň dva PVI.
- **PipeNetworks**: objekty s jejich poklopy, jímkami a dnem na každém potrubí, a potrubí s průměrem, délkou a sklonem.
- **PlanFeatures**: každá hranová čára jako čáry a oblouky s výškou na každém konci a k čemu slouží.

## Co se na cestu nedostane

- Plošiny a koridory jako objekty. Jejich výsledek je v povrchu „Proposed“.
- Osy s chybami (například překrývající se oblouky): vynechají se a počítají se ve stavové zprávě.
- Potrubí bez obou den a sítě s méně než dvěma objekty.
- Poklop převzatý z povrchu se zapíše jako pevný poklop. Po novém otevření si objekt zachová toto číslo, i když se povrch změní.
- Pravidla sítě (nejmenší sklon, krytí, pokles): LandXML pro ně nemá místo.
- Nastavení zobrazení a volby povrchů skupin bodů: pro ně uložte projekt CivilCraftu.

Při otevírání CivilCraft nečte spirály jiné než klotoidní, mřížkové povrchy, body, které odkazují jen na jiné body, parcely, spirály v prvcích půdorysu, komunikace nebo zaměřovací data. Každé z toho je uvedeno v poznámkách, nikdy se to nehádá.

## Obousměrná výměna

Chcete-li předat práci někomu, kdo používá jiný civilní software, a dostat ji zpět, exportujte LandXML, nechte je upravit a otevřete jejich LandXML jako nový projekt. Uchovejte také svůj vlastní `.civilcraft.json`: je to jediný soubor, který si uchová vše, co CivilCraft zná.
