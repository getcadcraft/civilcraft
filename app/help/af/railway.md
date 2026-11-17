---
title: Ontwerp 'n spoorbaan
summary: Maak 'n belyning 'n spoorweg: spoorooorgange (klotoïde, kubiese parabool, Bloss, Helmert, sinus-halfgolf, sinus), verhoging by elke kurwe met sy ewewigsverhoging, verhogingstekort en -oorskot, verhoging- en spoorgeometrie-perke as waarskuwings, wissels en kruisverbindings volgens stasie, 'n vryruimte-omhulsel wat langs die lyn gevee word, en 'n spoorbaan met rels, dwarslêers en 'n ballasbed wat as die koridor gebou word, in plan, snitte, profiel, 3D en hoeveelhede.
keywords: spoorweg, spoor, spoorlyn, spoorbaan, trein, metro, tram, verhoging, superverhoging, verhogingstekort, verhogingsoorskot, ewewigsverhoging, oorgang, oorgangskurwe, klotoïde, kubiese parabool, bloss, helmert, sinus-halfgolf, kosinus, spoorwydte, standaard spoorwydte, breë spoorwydte, meterspoor, smalspoor, dwarslêer, dwarsbalk, ballas, onderballas, formasie, kant, spoorhartafstand, 60E1, 54E1, UIC60, 115RE, 136RE, verhogingshelling, verandering van verhoging, wissel, wissels, kruisverbinding, hartstuk, hartstuknommer, lei, sluitkurwe, afbuigspoed, speling, vryruimte-omhulsel, struktuurwydte, laaiwydte, kinematiese omhulsel, perron, perronspleet, spoorafstand, helling, vertikale kurwe, minimum radius, LandXML-verhoging
from: 99de9745
---

Enige belyning kan 'n spoorbaan wees. Die kurwes daarvan kry dan spoorooorgange en 'n verhoging (die rels se superverhoging), en die koridor word as 'n spoorbaan gebou: rels op dwarslêers op 'n ballasbed, gegradeer in die grond soos 'n pad. Wissels en kruisverbindings word volgens stasie daarop geplaas, en 'n vryruimte-omhulsel kan langs die lyn gevee word en teen wat langs die spoor staan, nagegaan word.

Elke getal hieronder is 'n **plekhouer**, nie 'n standaard nie. Spoorweë stel hul perke volgens lynspoed, spoortipe en land; stel dit volgens jou eie spoorweg se standaard. CivilCraft lewer geen nasionale tabel nie.

## Maak die belyning 'n spoorweg

1. Kies die belyning en vind **Spoorweg** in Eienskappe.
2. Merk **Hierdie belyning is 'n spoorbaan**. Elke verandering is een ontdoen-stap.
3. Stel die **Ontwerpspoed** bo-aan die belyning se Eienskappe: dit is die lynspoed waarteen die verhoging nagegaan word. **Stadigste treine** (in die Spoorweg-blok) is die spoed waarteen die verhogingsoorskot nagegaan word.

## Oorgange

Gee elke kurwe 'n spiraallengte aan elke kant in die PI-tabel (**Spiraal in**, **Spiraal uit**), kies dan sy soort in die Spoorweg-blok se kurwe-tabel, of gebruik **Oorgang vir elke kurwe**:

| Soort | Kromming langs die oorgang |
|---|---|
| Klotoïde | groei eweredig (die padspiraal) |
| Kubiese parabool | y = x³ / (6·R·L), met L gemeet langs die raaklyn; die kurwe self is 'n bietjie langer |
| Bloss | 3u² − 2u³ van die volle kromming (u = die aandeel van die lengte): begin en eindig sag |
| Helmert | twee parabole, 2u² en dan 1 − 2(1 − u)² |
| Sinus-halfgolf | (1 − cos πu) / 2 |
| Sinus | u − sin(2πu) / 2π |

Almal behalwe die kubiese parabool draai deur L / 2R, soos die klotoïde. Stasies loop langs die ware lengte. LandXML behou die soort (spiType clothoid, cubicParabola, bloss, biquadratic, cosine, sinusoid).

## Verhoging

Tik die **Verhoging** van elke kurwe in millimeter. Die tabel wys vir elke kurwe:

- **Ewewigsverhoging** = G·v² / (g·R), met G die afstand tussen die rels se middelpunte (**Spoorhartafstand**, die spoorwydte plus die rel se kopbreedte tensy jy dit intik). Met G = 1500 mm is dit die bekende 11.8·V² / R (V in km/h, R in m).
- **Tekort** = ewewigsverhoging by die lynspoed − toegepaste verhoging.
- **Oorskot** = toegepaste verhoging − ewewigsverhoging by die stadigste treine se spoed.
- **Rampe**: die steilste verhogingshelling langs sy rampe, in mm per meter.

Die verhoging loop op oor elke oorgang, gevorm soos sy kromming: reguit vir 'n klotoïde of 'n kubiese parabool, Bloss-gevormd vir Bloss, en so meer. 'n Kurwe-einde sonder oorgang loop op die reguitstuk voor dit op, so lank as die verhogingshellingperk vereis, en dit sê so: die verhoging verander dan waar die kromming nie verander nie.

**Verhoging draai om** sê watter rel op die ontwerpprofiel bly: **die lae rel** (die gewone), **die binneste rel**, of **die spoormiddellyn** (elke rel beweeg die helfte van die verhoging). Die ontwerpprofiel is dan die bokant van die rel.

Die **Verhogingsdiagram** teken elke rel se hoogte oor die profiel langs die stasies; die profielaansig en die plan- en profielblaaie kry dieselfde as 'n band onder die profiel.

## Verhogingsperke en waarskuwings

**Grootste toegepaste verhoging**, **Grootste verhogingstekort**, **Grootste verhogingsoorskot**, **Steilste verhogingshelling** en **Vinnigste verandering van verhoging** (die helling by lynspoed, mm/s) word op elke kurwe nagegaan. 'n Waarde bo 'n perk is 'n waarskuwing in die Spoorweg-blok en in die Probleme-paneel, met die perk en die waarde wat gevind is. Sonder 'n ontwerpspoed word tekort en die tempo van verandering nie nagegaan nie ('n nota sê so).

## Die spoorbaan

Stel die **Spoorwydte** (standaard 1435 mm, breë, meter- of smal voorinstellings, of jou eie), die **Relprofiel** (60E1, 54E1, 49E1, 115RE, 136RE: slegs hul gepubliseerde afmetings), die aantal **Spore** en hul **Spoorhartafstand**, dan **Dwarslêers en ballas**: materiaal van die dwarslêers, lengte, breedte, diepte en afstand; ballasdiepte onder die dwarslêer (by die lae rel), skouer, helling, en hoe ver die bokant daarvan onder die dwarslêers lê; onderballasdiepte, die kant verby die ballastoon, en die formasie se dwarshelling.

Druk **Bou die spoorbaan**. Dit skakel die belyning se koridor aan, gebou as 'n spoorbaan langs die ontwerpprofiel: die rels en dwarslêers kantel met die verhoging, die formasie nie. Dagligthellings loop vanaf die kantrand by die koridor se sny- en vulhellings, en die spoorbaan gradeer in die voorgestelde oppervlak soos 'n pad.

- **Plan**: albei rels van elke spoor (laag C-RAIL-TRAK) en, met meer as een spoor, elke spoor se middellyn (C-RAIL-CNTR), op die skerm, in DXF, DWG, PDF en plan- en profielblaaie.
- **Snitte**: die dwarslêers, rels, en die onderkante van die ballas en onderballas in elke snit.
- **3D**: die rels, elke dwarslêer en die ballasbed (Wys › Spoorbaan), ook in GLB, OBJ en USD.
- **Hoeveelhede**: spoorbaanlengte, rel (albei rels van elke spoor, langs elke spoor se eie lyn), dwarslêers, die ballasbed en die ballas minus die dwarslêers, en die onderballas, volgens gemiddelde eindoppervlaktes tussen snitte.

## Spoorgeometrie-kontroles

Naas die verhoging kontroleer die Spoorweg-blok die lyn self teen ses verdere perke (almal plekhouers, almal joune om te stel):

- **Steilste helling** van die ontwerpprofiel, in mm per meter.
- **Kleinste vertikale kurwe-radius**, as 'n faktor k in R ≥ k·V² (R in meter, V in km/h). 'n Parabolïese vertikale kurwe van lengte L tussen twee hellings het 'n radius van L gedeel deur die verandering in helling.
- **Kortste vertikale kurwe**.
- **Kleinste kurwe-radius** in plan (0 skakel die kontrole af).
- **Kortste boog of reguitstuk**, as sekondes reistyd by lynspoed: 'n sirkelboog, of die reguitstuk tussen twee kurwes, wat korter as daardie afstand is, word gewaarsku. 1.8 s is die bekende "half die spoed in km/h, in meter".
- **Verandering van verhogingstekort** langs elke oorgang, in mm/s by lynspoed.

**Spoorgeometrie** lys die steilste helling wat gevind is en elke vertikale kurwe met sy radius en die radius wat die lynspoed vereis. 'n Vertikale kurwe wat op 'n oorgang of 'n verhogingsrampe lê, kry 'n nota. Sonder 'n ontwerpprofiel of 'n ontwerpspoed word die kontroles wat een nodig het, oorgeslaan en 'n nota sê so.

## Wissels en kruisverbindings

Onder **Wissels en kruisverbindings** druk **Voeg 'n wissel by**. Dit word op die langste reguitstuk geplaas; stel in die tabel:

- **Wisseltand-stasie**: waar die wissel op hierdie belyning begin.
- **Hartstuk**: die hartstuknommer N (1:N). Die hartstukhoek is 2·atan(1 / 2N).
- **Kant**: links of regs, kykend in die rigting van die toenemende stasie.
- **Kruisverbinding-afstand** in meter: bo 0 word die wissel 'n kruisverbinding na 'n parallelle spoor so ver weg (twee wissels en die reguitstuk tussen hulle).

Die tabel wys die **Lei** (wisseltand tot hartstuk), die sluitkurwe se **Radius** en die **Afbuigspoed** wat daardie radius toelaat met jou verhogingstekort-perk en geen verhoging nie. **Maak sy spoorbaan** skakel die afbuigroete om in 'n eie belyning (die wissel, die sluitkurwe, dan reguit aan by die hartstukhoek) met dieselfde spoorwegstellings, gereed om verleng te word.

Die plan teken elke wissel se twee afbuigende rels, sy middellyn, 'n merkstreep by die wisseltand en by die hartstuk, en "1:N" (laag C-RAIL-TURN), op die skerm en in DXF, DWG, PDF en blaaie. Die 3D-aansig teken die afbuigende rels op die hoofspoor se vlak.

Die vorm is 'n **plekhouer**: 'n reguit wissel en een sluitkurwe vanaf die hartstuknommer. 'n Geboude wissel volg die spoorweg se standaard en die vervaardiger se tekening. Waarskuwings: 'n wissel wat van die belyning af loop, op 'n kurwe, 'n oorgang, verhoging of vertikale kurwe lê, of 'n ander oorvleuel; en 'n nota wanneer die lynspoed bo sy afbuigspoed is.

## Vryruimte-omhulsel

Merk **Vee 'n vryruimte-omhulsel langs hierdie spoorbaan**. Kies die **Omtrek** (twee plekhouervorms, of **Jou eie omtrek** ingetik as een punt per lyn: verskuiwing van die spoormiddellyn, dan hoogte bo die bokant van die rel, in meter), die **Voertuiglengte** en **Draaistelmiddellyne**, en, as daar een is, 'n **Perkrand** (kant, afstand van die spoormiddellyn, hoogte bo die rel).

By elke stasie word die omtrek met die verhoging om die lae rel gekantel en deur die kurwe verbreed: die middel van die voertuig beweeg in met b² / 8R, en sy punte uit met (L² − b²) / 8R (b die draaistelmiddellyne, L die voertuiglengte, R die radius daar, wat die oorgang volg). Die blok teken die snit op die reguitstuk en waar dit die wydste is, en lys:

- die **wydste omhulsel** en waar,
- die **spoorhartafstande** teenoor die afstande wat twee naburige omhulsels nodig het,
- die ruimte wat by die **perkrand** oorbly, of hoe ver dit binne is,
- elke kenmerklyn, pypstruktuur en ander spoorweg-belyning wat **binne die omhulsel** gevind word.

'n Kenmerklyn met hoogtes word beoordeel teen die omtrek op sy hoogte bo die rel; sonder 'n ontwerpprofiel, of vir 'n punt sonder hoogte, word dit net in plan beoordeel en die lys sê so. Die plan wys die omhulsel se twee rande (laag C-RAIL-CLRN) met 'n kruis by elke ding binne.

Die omtrekke wat aangebied word, is **plekhouers, nie enige spoorweg se wydte nie**. Tik jou spoorweg se struktuurwydte in voordat jy op 'n resultaat staatmaak.

## In ander programme

- **LandXML**: 'n spoorweg-belyning word geskryf met sy oorgange (spiType) en 'n `Cant`-blok: die spoorwydte, die draaipunt, die lynspoed, en 'n stasie waar elke verhogingsrampe begin en eindig, met die toegepaste verhoging, die ewewigsverhoging en die tekort. Die oopmaak van 'n LandXML-lêer met 'n `Cant`-blok maak daardie belyning 'n spoorweg met daardie verhogings.
- **IFC**: die belyning met sy verhogingsegmente, die rels, dwarslêers, ballas en onderballas.

## Nog nie gebou nie

Wissels in die IFC-uitvoer, wisselfamilies buite die enkele sluitkurwe (geboë wissels, swing-nose-hartstukke, slips, diamante), kinematiese wydtereëls (die omhulsel is 'n vaste omtrek met kurwe-uitslag), bogrondse lyne en seinwese.

**Watter standaard.** In die Spoorweg-blok neem "Standaard om aan te haal" Geen of Europees (UIC en EN). Om Europees te kies, noem die dokumente wat 'n Europese projek aanhaal (EN 13803 vir die belyningparameters, EN 13232 vir wissels en kruisings, EN 15273 vir wydtes, EN 13848 vir spoorgeometriegehalte) en gee elke perk 'n blokkie vir die klousule waarvandaan dit kom. Geen getal uit enige standaard is ingebou nie: die verhogings-, tekort-, oorskot-, helling- en tempo-perke, die wisselgeometrie en die struktuurwydte is almal nog plekhouers, en die venster sê so. 'n Spoorweg-ingenieur kontroleer elke waarde teen die standaard se eie teks, en tik die klousule daarnaas in voordat enigiets gebou word. Suid-Afrika en die AREMA-tabelle is nie in hierdie vrystelling nie.
