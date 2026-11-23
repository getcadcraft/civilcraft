---
title: Ontwerp 'n vertikale profiel
summary: Maak die profielaansig oop, begin 'n ontwerpprofiel uit die grond, voeg PVI's by en sleep hulle, stel vertikale krommelengtes, en lees hellings, K-waardes en hoogste en laagste punte.
keywords: profiel, vertikale belyning, pvi, vertikale kromme, helling, k-waarde, kruin, holte, bvc, evc, profielaansig, afgewerkte helling, fg, bestaande grondprofiel, kenmerklyne in profiel, kruisings, geprojekteer, kerb, sloot, etikette
from: dbb1f32d
---

Elke belyning het een ontwerpprofiel: 'n lys PVI's (stasie en elevasie) wat deur reguit hellings verbind is, met 'n simmetriese parabolies vertikale kromme by enige binnepunt-PVI wat 'n lengte het. Die bestaande grondprofiel word vir jou uit die oppervlak gemonster.

## Maak die profielaansig oop

1. Kies die belyning (klik dit met {{ui:Kies}}).
2. Druk {{key:R}}, of klik {{ui:Lengteprofiel}} in die werkbalk, of {{ui:Profielaansig}} onder aan die regterpaneel.
   Die profielaansig gaan onder die plan oop met die bestaande grond langs die belyning. Met twee of meer belynings, kies een in die lys links op die profielbalk.

Die aansig begin deur die hele belyning te wys en die elevasies uit te rek om die paneel te vul; die oordrywing word in die onderste linkerhoek gedruk, byvoorbeeld "Vertikale oordrywing 10×".

## Zoem en beweeg die profiel

- **Zoem:** draai die muiswiel (of knyp op 'n raakpaneel) en die aansig zoem om die wyser. Hou {{key:Shift}} om net die stasies te zoem, of {{key:Alt}} om net die elevasies te zoem (dit verander die oordrywing). Met die profielaansig in fokus, zoem die plus- en minsleutels om die middel.
- **Beweeg:** sleep met die regter- of middelmuisknoppie, of swiep met twee vingers op 'n raakpaneel.
- **Pas aan:** dubbelklik die profiel of druk {{key:F}} om die hele belyning weer te wys.

Die wysiging van 'n PVI behou die zoom wat jy gekies het; dit spring nie terug na {{ui:Pas aan}} nie.

Beweeg die wyser langs die profiel: die balk wys die stasie, grond- en ontwerpelevasies, die helling en die afgraving of opvulling daar, en 'n stip volg op die belyning in die plan.

## Begin die ontwerpprofiel

1. In die regterpaneel onder **Ontwerpprofiel**, klik {{ui:Begin vanaf die grond}}.
   Twee PVI's word op die grond aan die twee einde van die belyning geplaas, verbind deur een reguit helling. Die statusbalk sê "Ontwerpprofiel begin op die grond aan albei eindes. Skakel Voeg PVI's by aan en klik om helling-breke by te voeg; gee hulle 'n kromlengte in die tabel."

As die belyning nie die oppervlak kruis nie, kry jy "Hierdie belyning het geen grond onder dit om vanaf te begin nie." Voeg dan PVI's by deur te klik (volgende afdeling).

## Voeg PVI's by

1. Druk {{key:I}}, of klik {{ui:Voeg PVI's by}} in die profielbalk. Dit bly ingedruk.
2. Klik in die profiel waar jy 'n helling-breuk wil hê. 'n PVI word by daardie stasie en elevasie bygevoeg, afgerond tot 0.01, en gekies.
3. Voeg soveel by as jy nodig het, en druk dan {{key:I}} weer om byvoeging te stop.

'n Klik waar daar reeds 'n PVI is, word geweier ("Daar is reeds 'n PVI by …"). PVI's bly altyd in stasie-volgorde.

## Vasvang terwyl jy byvoeg of sleep

Die **Vasvang**-knoppie in die profielbalk is van die begin af aan. Terwyl dit aan is, land 'n PVI wat jy byvoeg of sleep op die naaste PVI, grondpunt, PVI-stasie of die grondlyn, en 'n etiket by die merker sê watter een. Hou {{key:Alt}} vir 'n vrye punt, enige plek.

## Pas PVI's aan

- **Sleep** 'n PVI in die profiel om dit te skuif. Dit kan nie sy bure verbygaan nie. Die skuif is een ontdoenstap.
- **Tik** presiese waardes in die PVI-tabel in die regterpaneel: **Stasie**, **Elevasie**, **Helling %** en **Kromme L** (vertikale krommelengte). Druk {{key:Enter}} na elk.
- **Kies** 'n waarde uit die profiel: die klein knoppie langs 'n PVI se stasie of elevasie wag vir een klik in die profielaansig en vul daardie waarde in. Die klik vasvang soos Voeg PVI's by; hou {{key:Alt}} vir 'n vrye punt; {{key:Esc}} kanselleer.
- **Helling %** is die helling van die raaklyn wat by daardie PVI begin en na die volgende loop. Dit intik skuif die **volgende** PVI se elevasie (sy stasie beweeg nooit nie). As die volgende PVI vergrendel is, beweeg die vorige PVI se elevasie eerder.
- **Vergrendel** 'n PVI met die hangslot aan die einde van sy ry. 'n Vergrendelde PVI word nie gesleep nie, en 'n hellingwysiging skuif dit nie. As albei eindes van 'n raaklyn vergrendel is, kan sy helling nie verander nie: die statusbalk sê so, en jy ontgrendel eers een einde. Die vergrendeling word in die lêer gestoor.
- **Verwyder** 'n PVI met die x aan die einde van sy ry, of kies dit (klik dit) en druk {{key:Delete}}. Wanneer die profielaansig fokus het, verwyder {{key:Backspace}} dit ook.

Die eerste en laaste PVI kry nooit 'n kromme nie.

## Vertikale krommes

1. Tik 'n lengte in **Kromme L** vir 'n binne-PVI, byvoorbeeld 200.
2. Die kromme word gesentreer op die PVI geteken. Die profiel en die regterpaneel wys sy soort (kruin of holte), L en K, die BVC- en EVC-stasies en -elevasies, en sy hoogste of laagste punt wanneer dit een binne die kromme het.

K word uit L bereken (K = L gedeel deur die algebraïese verskil in hellings, in persent). Jy tik L; K direk intik is nog nie beskikbaar nie.

As 'n vertikale kromme nie pas nie, sê 'n rooi blokkie waarom: dit loop terug in die PVI of kromme voor dit, of verby die volgende PVI, en hoeveel ruimte daar aan daardie kant is ('n kromme benodig die helfte van sy lengte aan elke kant van sy PVI). Sy knoppie stel **die langste kromme wat pas**, met sy K, as een stap in ({{key:Mod+Z}} ontdoen dit). Of skuif die PVI's uit mekaar.

## Lees die feite

Onder die PVI-tabel gee 'n lys elke helling in persent ("Helling 1: +1.25%") en elke kromme, byvoorbeeld "Kruin by 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)", dan "Hoogste punt 1+62.40, 254.12".

As die PVI's nie albei eindes van die belyning bereik nie, sê 'n nota so. 'n Koridor word net gebou waar die profiel en belyning oorvleuel.

## Kenmerklyne in die profiel

Kenmerklyne wys ook in die profielaansig, sodat jy 'n kerb, 'n sloot of 'n muurbo teen die pad se profiel kan sien.

- Waar 'n kenmerklyn die belyning **kruis**, wys die profiel 'n klein ruit by daardie stasie en elevasie, gemerk met die lyn se naam en sy elevasie daar (die lyn se eie elevasie, uitgewerk langs die segment wat kruis).
- Tik 'n afstand in {{ui:Langs binne}} om ook die kenmerklyne wat **langs** die belyning binne daardie afstand loop te teken, as stippellyne op hul eie elevasies. Leeg of 0 wys net die kruisings.
- Die merkers en etikette volg elke verandering: skuif 'n hoekpunt, tik 'n helling of lig die lyn op, en die profiel wys die nuwe elevasies dadelik.
- Klik 'n kruising se ruit om daardie kenmerklyn te kies; die gekose lyn word in die uitlig-kleur geteken.
- {{ui:Kenmerklyne}} in die profielbalk verberg of wys hulle almal. Albei instellings word saam met die projek gestoor.

Sien [Kenmerklyne](topic:feature-lines).

## Volgende

- [Veeg 'n padkoridor](topic:corridor) langs die belyning en hierdie profiel.
- Die profiel word saam met die belyning na LandXML geskryf; sien [LandXML uitruil](topic:landxml).
