---
title: Watervoorsieningspype: druk, vloei en brandvloei
summary: Teken 'n druknetwerk van aansluitpunte, reservoirs, tenks, pype, pompe en drukverminderingsklepe op die plan; CivilCraft werk die drukhoogtes, drukke en vloeie uit (Hazen–Williams, lusnetwerke), die vloei wat vir 'n brand beskikbaar is, en 'n dag se vraag. 'n Laboratoriumfunksie; elke resultaat benodig 'n ingenieur se nagaan.
keywords: water, watervoorsieningspyp, waterverspreiding, druknetwerk, drukpyp, lusnetwerk, hazen-williams, C-faktor, drukhoogteverlies, reskerende druk, brandvloei, brandkraan, vraag, aansluitpunt, reservoir, tenk, pomp, pompkurwe, drukverminderingsklep, prv, terugslagklep, uitgebreide tydperk, epanet, inp, snelheid
from: df46bf6d
---

Watervoorsieningspype is die drukkant van 'n terrein: pype wat altyd vol is, met water wat deur 'n reservoir, 'n tenk of 'n pomp gestoot word. CivilCraft werk die drukhoogte en druk by elke aansluitpunt en die vloei in elke pyp uit, insluitend lusnetwerke waar die water meer as een manier het om te gaan. Dit is in die laboratorium terwyl dit nagegaan word.

**Net 'n berekeningshulp.** Elke getal benodig 'n gekwalifiseerde ingenieur se nagaan: die antwoord is net so goed as die vraag, die hoogtes, die pypgroottes en die ruwheidswaardes wat jy gegee het, en 'n bestendige-toestand-model weet niks van waterslag, waterkwaliteit of 'n brandpomp se werklike gedrag nie.

## Teken die netwerk

1. Onder **Oppervlak** › {{ui:Meer}}, kies {{ui:Watervoorsieningspype…}}. Die venster bly oop terwyl jy aan die plan werk.
2. Kies {{ui:Reservoir}} en klik op die plan waar die toevoer is. Sy drukhoogte begin 100 ft (30 m) bo die grond; verander dit in Eienskappe.
3. Kies {{ui:Aansluitpunt}} en klik op elke plek waar water getap word of pype saamkom. 'n Aansluitpunt neem sy hoogte van die grond; tik 'n ander een in Eienskappe in om dit te oorskryf.
4. Kies {{ui:Pyp}}, klik op 'n knooppunt, en dan die knooppunt wat dit verbind. Die hulpmiddel bly aan vir die volgende pyp. 'n {{ui:Pomp}} en 'n {{ui:Drukverminderingsklep}} word op dieselfde manier geteken, van die suig- (of stroomopwaartse) knooppunt na die afleweringsknooppunt (of stroomafwaartse). 'n {{ui:Tenk}} word soos 'n aansluitpunt geplaas.
5. Kies 'n aansluitpunt en tik sy {{ui:Vraag}} in (gpm, of L/s in 'n meterprojek). Kies 'n pyp en stel sy {{ui:Deursnee}} (in, of mm) en, as jy dit weet, sy Hazen–Williams C.

Elke verandering is een ontdoen-stap. Delete verwyder die knooppunt en die pype wat daarby eindig.

## Wat elke deel beteken

- **Pyp.** Die lengte word langs die plan gemeet tensy jy een intik. C is die Hazen–Williams-ruwheid (130 om mee te begin; verander die verstek in die venster). 'n Kleiner-verliese-koëffisiënt K tel die verliese van buigings en passtukke by. Merk **Terugslagklep** vir 'n pyp wat nie water agteruit mag dra nie; 'n **Gesluit**-pyp dra niks nie.
- **Reservoir.** 'n Bron by 'n vaste drukhoogte, die waterpeil wat dit bo die verwysingsvlak hou. Dit gee of neem wat die netwerk nodig het.
- **Tenk.** 'n Peil wat oor 'n dag verander. In die bestendige resultate is dit 'n bron op sy huidige peil.
- **Pomp.** Een ontwerppunt (vloei en drukhoogte) gee die gewone kurwe daardeur: die drukhoogte by nul vloei is 133 % van die ontwerpdrukhoogte, en die drukhoogte is nul by twee keer die ontwerpvloei. 'n Pomp stoot nooit water agteruit nie.
- **Drukverminderingsklep.** Hou die druk wat jy stroomafwaarts stel, terwyl die toevoer hoër is. Wanneer die toevoer laer is, is dit oop en hou niks vas nie; as die water agteruit sou loop, sluit dit.

## Lees die resultate

Die venster wys elke knooppunt se drukhoogte en druk en elke skakel se vloei, snelheid en drukhoogteverlies per 1,000 ft (of per km), met die aansluitpunte in kleur op die plan: groen is tussen jou laagste en hoogste druk, rooi onder, geel bo. Vloeipyle wys die rigting. Kies 'n knooppunt of pyp om sy getalle in Eienskappe te lees.

Onder die tabelle is 'n lys van wat om na te kyk: lae of hoë druk, 'n pyp wat vinniger as jou limiet is, 'n aansluitpunt wat van elke bron afgesny is, of 'n oplosser wat nie tot rus gekom het nie. Dieselfde bevindinge is in die Probleme-paneel. Stel die limiete in die venster (20 psi, 100 psi en 10 ft/s om mee te begin; 140 kPa, 700 kPa en 3 m/s in 'n meterprojek).

## Brandvloei

{{ui:Brandvloei…}} teken 'n vloei by een aansluitpunt en wys die druk daar en die laagste druk enige plek in die netwerk. Dit vind ook die vloei wat by daardie aansluitpunt beskikbaar is terwyl die swakste knooppunt in die netwerk die reskerende druk hou wat jy gee. Ander vrae bly soos hulle is.

## 'n Dag se vraag

{{ui:'n Dag se vraag…}} laat die netwerk uur vir uur loop. Gee die vraagpatroon in die lêer se instellings ('n lys vermenigvuldigers wat herhaal); tenks vul en leegloop met die vloei in en uit, en 'n pomp kan 'n aan/uit-patroon volg. 'n Tenk wat sy hoogste of laagste peil bereik, word in die lys genoem: CivilCraft sluit nie sy inlaat of uitlaat vir jou nie, so lees dit as "hierdie tenk is te klein of die pomp te groot".

## EPANET-teks

{{ui:Stoor as EPANET-teks (.inp)}} skryf die netwerk in die platte-teksformaat wat baie waterprogramme lees, en {{ui:Maak EPANET-teks oop (.inp)…}} lees een. Net wat CivilCraft modelleer kom oor: aansluitpunte, reservoirs, tenks, pype, pompe met 'n drukhoogtekurwe, drukverminderingsklepe, vraagpatrone en die tye. Ander klepsoorte, pompe wat deur krag gegee word, en ander drukverliesformules word genoem en uitgelaat. Die lêer moet dieselfde eenhede as die projek gebruik.

## Brandkrane, klepe en passtukke

Kies 'n aansluitpunt en merk **Brandkraan** om een daar te plaas; kies 'n hoofpyp en druk **Voeg in die middel by** om 'n klep, 'n lugklep, 'n aftapklep of 'n meter daarop te plaas. Hulle is voorwerpe van die netwerk: hulle beweeg daarmee en een ontdoen-stap verwyder hulle.

Die uitleg impliseer ook passtukke, en CivilCraft lys hulle sonder dat jy vra: 'n **T-stuk** waar drie hoofpype saamkom, 'n **kruisstuk** waar vier dit doen, 'n **buig** (met sy hoek) waar twee hoofpype 5° of meer draai, 'n **reduseerstuk** waar twee groottes saamkom, en 'n **dop** by 'n doodloopeinde. {{ui:Passingskedule (CSV)}} tel hulle en die hoofpype volgens grootte. Dit is wat die uitleg impliseer, 'n hoeveelheidsopname om teen jou eie besonderhede na te gaan, nie 'n lys om van te bestel nie.

Hoofpype word op die grond minus 'n dekking (4 ft of 1.2 m) gelê sodat hulle in 3D geteken en gemodelleer kan word; die drukke hierbo hang nooit daarvan af nie.

## Op die plan en in lêers

Die plan, die PDF en die DWG of DXF dra die hoofpype op **C-WATR-MAIN** met hul groottes op **C-WATR-TEXT**, brandkrane op **C-WATR-HYDR**, klepe op **C-WATR-VALV** en die passtukke op **C-WATR-FITT**. LandXML-uitvoer skryf 'n waterpypnetwerk ('n struktuur vir elke knooppunt, 'n pyp vir elke hoofpyp, brandkrane benoem); LandXML-invoer lees een terug as watervoorsieningspype, sonder vraag, pompe of klepe, wat LandXML nie dra nie. Die IFC-uitvoer skryf die hoofpype as pypsegmente, brandkrane, klepe en passtukke in een watersisteem. Hierdie lêers is nagegaan teen ons eie leser en skrywers; probeer hulle in jou ander programme en vertel ons wat hulle sê.

## Wat nog nie hier is nie

Waterkwaliteit en ouderdom, beheer en reëls verder as 'n pomp se aan/uit-patroon, ander klepsoorte, vraag volgens druk, pype met 'n veranderende deursnee, en riooluitvloei oor tyd. Sien [Nog nie gebou nie](topic:not-built-yet). Sanitêre ontwerpvloei, wat 'n ander berekening is, is in [Sanitêre ontwerpvloei](topic:sanitary-design).
