---
title: Kom van ander siviele sagteware
summary: Hoe bekende siviele ontwerpwerkvloeie na CivilCraft val, en die verskille wat ervare gebruikers in die eerste uur laat struikel.
keywords: oorskakel, migreer, bekend, verskille, werkvloei, opdragte, kartering, cogo, korridor, gradering, pypnetwerk, style, opdragreël
from: feae37d6
---

As jy Civil 3D gebruik het, ken jy al die idees in CivilCraft: punte en puntgroepe, TIN-oppervlaktes met breeklyne en grense, belynings volgens PI, profiele volgens PVI, samestellings wat in korridors geveeg word, gradering tot daglig, swaartekrag-pypnetwerke, LandXML. Wat anders is, is byna alles rondom hulle: daar is geen tekenlêer nie, geen opdragreël (tensy jy die {{ui:Klassieke tekening}}-kieslysstyl kies), geen style, geen Prospector en geen instellingsdialoë nie. CivilCraft is 'n klein, gefokusde gereedskap in 'n blaaier, en in hierdie weergawe doen dit 'n fraksie van wat 'n volledige siviele pakket doen. Hierdie bladsy koppel wat jy ken aan wat hier is.

:::tip
As jy van die lint van Civil 3D hou, kies die {{ui:Siviele lint}}-kieslysstyl in {{ui:Instellings}} › {{ui:CivilCraft}} › {{ui:Kieslyste, sleutels en muis}}: Tuis-, Oppervlaktes-, Wysig-, Geolokasie-, Aansig- en Uitvoer-oortjies, die middelknoppie beweeg die aansig, en {{key:Shift}} met die middelknoppie wentel die 3D-aansig. As jy opdragte tik, voeg {{ui:Klassieke tekening}} 'n opdragreël by (ALIGNMENT, PAD, PROFILE, ZOOM …). Sien [Kieslyste, sleutels en muis](topic:menus-keys-and-mouse).
:::

## Werkvloeikaart

| Wat jy wil doen | Bekende manier | In CivilCraft |
|---|---|---|
| Bring opmetingspunte in | Punte invoer met 'n puntlêerformaat | {{ui:Maak oop}}, en kontroleer dan die kolomvolgorde in **Voer punte in** ([Voer opmetingspunte in](topic:import-points)) |
| Sorteer punte | Puntgroepe, beskrywingsleutels | Outomatiese groepe volgens die eerste woord van die beskrywing; geen beskrywingsleutels nie |
| Wysig 'n punt | Puntredigeerder, handvatsels | Klik dit en tik in Eienskappe, of sleep dit ([Wysig 'n opmetingspunt](topic:edit-points)) |
| Bou bestaande grond | Skep 'n oppervlak, voeg puntgroepe as data by | Outomaties: die oppervlak word herbou wanneer sy invoere verander |
| Voeg breeklyne by | Breeklyne uit polilyne of kenmerklyne | Stel 'n puntgroep op {{ui:Breeklyn}}, of klik punte met die {{ui:Breeklyn}}-gereedskap ({{key:B}}) |
| Snoei die oppervlak | Buitegrens, versteekgrens, maksimum driehoeklengte | {{ui:Grens}} ({{key:O}}, net buite) en **Langste buitekant-rand** |
| Wys kontoere | Oppervlakstyl | **Vertoning** in die linkerpaneel: interval, hoofelke, etikette, bande, hellingpyltjies |
| Lê 'n middellyn uit | Belyningsgereedskap, boog- en spiraalinstellings | {{ui:Belyning}} ({{key:A}}): klik PI's, {{key:Enter}}; radiusse en spiraallengtes in die PI-tabel |
| Skep 'n profielaansig | Profielaansig-towenaar, bande | {{ui:Profiel}} ({{key:R}}): een profielaansig onder die plan, altyd ingepas |
| Ontwerp die helling | Profieluitleggereedskap | {{ui:Begin vanaf die grond}}, {{ui:Voeg PVI's by}} ({{key:I}}), sleep PVI's, tik **Boog L** |
| Bou 'n pad | Samestelling, subsamestellings, korridor, teikens, streke | Merk **Veeg 'n samestelling langs die ontwerpprofiel** onder die belyning; 'n baan, skouer en sylhelling aan elke kant, of elke kant gebou uit dele (goot, kerb, sypaadjie …) |
| Gradeer 'n plataform | Kenmerklyne, graderingsgroepe, graderingskriteria | {{ui:Plataform}} ({{key:G}}): 'n plat plataform met afgrawing- en opvulhellings tot daglig |
| Bereken grondwerk | Volumeoppervlaktes, volumedashboard | **Grondwerk** in die regterpaneel, roosmetode, werk lewend by |
| Lê storm- of sanitêr uit | Pypnetwerk met 'n onderdeellys, reëls | {{ui:Pype}} ({{key:P}}): klik strukture stroomaf; drie reëls wat jy stel; outomatiese invertes |
| Ruil met ander uit | LandXML-invoer en -uitvoer | {{ui:Maak oop}} 'n LandXML-lêer; {{ui:LandXML}} om uit te voer ([Ruil LandXML uit](topic:landxml)) |
| Stuur lynwerk na CAD | Uitvoer na DWG | {{ui:DWG}} (2000 tot 2018-formaat) of {{ui:DXF}} (R12) |
| Plot | Uitlegte, aansigvensters, bladstelle | {{ui:PDF}}: een landskapblad van die plan op 'n gekose skaal; plan- en profielbladsye en snitbladsye as PDF |
| Deel werk tussen lêers | Dataverkortings, verwysings | Nie beskikbaar nie: een projek per lêer |
| Ontdoen | Ontdoen | {{key:Mod+Z}} en {{key:Mod+Y}}, 200 stappe; vertoninginstellings is nie ontdoenstappe nie |

## Verskille wat mense laat struikel

**Daar is geen opdragreël nie** tensy jy die {{ui:Klassieke tekening}}-kieslysstyl kies. Gereedskap is nutsbalkknoppies en enkele letters: {{key:A}} belyning, {{key:G}} plataform, {{key:P}} pype, {{key:B}} breeklyn, {{key:O}} grens, {{key:R}} profiel, {{key:I}} voeg PVI's by, {{key:V}} kies, {{key:F}} pas in. In die ander kieslysstyle doen dit niks om 'n opdragnaam te tik nie. Sien [Sleutels en muis](topic:keyboard).

**Enter voltooi; dubbelklik is riskant.** Klik die laaste punt een keer, en druk dan {{key:Enter}}. In hierdie weergawe voltooi 'n dubbelklik ook, maar dit laat die punt waarop jy dubbelgeklik het val. Regsklik voltooi of herhaal nie; dit beweeg net die aansig as jy daarmee sleep.

**Alles is dinamies, altyd.** Verander 'n puntgroep, 'n radius, 'n PVI of 'n plataformhelling, en die oppervlak, kontoere, korridor, daglig-lyne en volumes werk onmiddellik by. Daar is niks om te herbou nie en niks raak verouderd nie.

**Niks is 'n tekenvoorwerp nie.** Die plan is 'n aansig van die ontwerp, nie 'n tekening wat jy met CAD-opdragte kan wysig nie. Jy kan nie jou eie lyne of teks byvoeg, 'n laag se kleur verander of enigiets ontbind nie. Voer na DXF uit en voltooi die tekening in 'n CAD-program.

**Geen style nie.** Kleure, lynwydtes, etikgroottes en laagname is vas (sien [Planlae](topic:plan-layers)). Papier en Model in die appbalk wissel tussen 'n ligte en donker skerm.

**Een van elk.** Een bestaande grondoppervlak, een gegradeerde resultaat, een pypnetwerk per projek. Baie belynings en plataforms is in orde.

**Eenhede is etikette.** Om {{ui:Amerikaanse voet}} of {{ui:Meter}} te kies, omskakel niks nie. Daar is geen tekenskaal nie. 'n Koördinaatstelsel is opsioneel: stel een onder {{ui:Koördinate}} en niks beweeg nie, dit sê net wat die getalle beteken (sien [Stel die projek se koördinaatstelsel](topic:coordinate-systems)). Voet word as Amerikaanse opmetingsvoet behandel wanneer dit na LandXML geskryf word.

**Breeklyngroepe voeg by puntnommervolgorde.** 'n Groep op {{ui:Breeklyn}} word een lyn deur al sy punte, in nommervolgorde. Gedeelde kodes (twee vloeilyne wat albei "FL" gekodeer is) maak een sigsaaglyn; teken dié met die hand.

**Stasies lyk dieselfde, meter verskil.** Voet gebruik 100 ft-stasies (12+34.56); meter gebruik 1000 m-stasies (1+234.567).

**Skrap op 'n Mac.** Die Mac-sleutel met die etiket delete is Backspace vir die blaaier. Gebruik Fn en delete, of die {{ui:Skrap}}-knoppie, om 'n keuse te skrap.

**Lêers is aflaaie.** {{ui:Stoor}} laai elke keer 'n `.civilcraft.json`-lêer af; daar is geen "stoor oor die oop lêer" nie. 'n Herstelkopie van ongestoorde werk word in hierdie blaaier gehou ([Herstel ongestoorde werk](common:recover)). Om 'n puntlêer oop te maak, vervang die punte sonder om te vra. Sien [Lêers wat jy kan oopmaak, stoor en uitvoer](topic:files).

**Reëls is joune.** Pypnetwerkreëls en die korridorsamestelling begin met plekhouerwaardes wat nie 'n standaard is nie. Stel jou eie voordat jy enige kontrole vertrou.

**Volumes is roosgebaseer.** Afgrawing en opvulling kom uit 'n fyn rooster tussen die twee oppervlaktes, binne die daglig-lyne, sonder swel of krimp. Hulle is naby aan, maar nie dieselfde as, 'n TIN-na-TIN-volume nie.

## Wat ontbreek

Spirale behalwe klotoïde, samestellings wat langs die pad verander, skuins plataforms, inlaatkapasiteit en retensie, onderdeelkatalogusse, pype in profiel, erfuitlegte en erfgrootte-bepaling, kleinste-kwadrate-verstelling en opmetingsdatabasisse, DWG oopmaak, en meer. Die volle lys, met wat jy vandag in plaas daarvan doen, is in [Nog nie gebou nie](topic:not-built-yet).
