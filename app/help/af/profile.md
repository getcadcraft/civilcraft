---
title: Ontwerp 'n vertikale profiel
summary: Maak die profielaansig oop, begin 'n ontwerpprofiel vanaf die grond, voeg PVI's by en sleep dit, stel vertikale kromlengtes, en lees gradiënte, K-waardes en hoë- en laagpunte.
keywords: profiel, vertikale belyning, pvi, vertikale kromme, gradiënt, k-waarde, kruin, holte, bvc, evc, profielaansig, afgewerkte gradiënt, fg, bestaande grondprofiel, kenmerklyne in profiel, kruisings, geprojekteer, randsteen, sloot, etikette
from: e9182bfa
---

Elke belyning het een ontwerpprofiel: 'n lys van PVI's (stasionering en hoogte) wat deur reguit gradiënte verbind word, met 'n simmetriese parabolies vertikale kromme by enige binnepunt-PVI wat 'n lengte het. Die bestaande grondprofiel word vir jou uit die oppervlak gemonster.

## Maak die profielaansig oop

1. Kies die belyning (klik daarop met {{ui:Kies}}).
2. Druk {{key:R}}, of klik {{ui:Lengteprofiel}} in die nutsbalk, of {{ui:Profielaansig}} onderaan die regterpaneel.
   Die profielaansig gaan oop onder die plan met die bestaande grond langs die belyning. Met twee of meer belynings, kies een in die lys aan die linkerkant van die profielbalk.

Die aansig wys altyd die hele belyning en rek die hoogtes om die paneel te vul; die oordrywing word in die linkerkantse onderhoek gedruk, byvoorbeeld "Vertikale oordrywing 10×". Dit zoem of skuif nie.

Beweeg die aanwyser langs die profiel: die balk wys die stasionering, grond- en ontwerphoogtes, die gradiënt en die afgraaf of opvul daar, en 'n stip volg op die belyning in die plan.

## Begin die ontwerpprofiel

1. In die regterpaneel onder **Ontwerpprofiel**, klik {{ui:Begin vanaf die grond}}.
   Twee PVI's word op die grond by die twee eindes van die belyning geplaas, verbind deur een reguit gradiënt. Die statusbalk sê dat die ontwerpprofiel op die grond by albei eindes begin het; skakel Voeg PVI's by aan en klik om gradiëntbreuke by te voeg, en gee hulle 'n kromlengte in die tabel.

As die belyning nie die oppervlak kruis nie, kry jy 'n boodskap dat daar geen grond onder die belyning is om vanaf te begin nie. Voeg dan PVI's by deur te klik (volgende afdeling).

## Voeg PVI's by

1. Druk {{key:I}}, of klik {{ui:Voeg PVI's by}} in die profielbalk. Dit bly ingedruk.
2. Klik in die profiel waar jy 'n gradiëntbreuk wil hê. 'n PVI word by daardie stasionering en hoogte bygevoeg, afgerond tot 0.01, en gekies.
3. Voeg soveel by as jy nodig het, druk dan {{key:I}} weer om op te hou byvoeg.

'n Klik waar daar reeds 'n PVI is, word geweier ("Daar is reeds 'n PVI by …"). PVI's bly altyd in stasioneringsvolgorde.

## Pas PVI's aan

- **Sleep** 'n PVI in die profiel om dit te skuif. Dit kan nie by sy bure verbygaan nie. Die skuif is een ontdoen-stap.
- **Tik** presiese waardes in die PVI-tabel in die regterpaneel: **Stasionering**, **Hoogte** en **Kromlengte L** (vertikale kromlengte). Druk {{key:Enter}} ná elke een.
- **Verwyder** 'n PVI met die x aan die einde van sy ry, of kies dit (klik daarop) en druk {{key:Delete}}. Wanneer die profielaansig die fokus het, verwyder {{key:Backspace}} dit ook.

Die eerste en laaste PVI kry nooit 'n kromme nie.

## Vertikale krommes

1. Tik 'n lengte in **Kromlengte L** vir 'n binnepunt-PVI, byvoorbeeld 200.
2. Die kromme word gesentreer op die PVI geteken. Die profiel en die regterpaneel wys sy soort (kruin of holte), L en K, die BVC- en EVC-stasionerings en -hoogtes, en sy hoë- of laagpunt wanneer dit een binne die kromme het.

K word uit L bereken (K = L gedeel deur die algebraïese verskil in gradiënte, in persent). Jy tik L; om K direk te tik is nog nie beskikbaar nie.

As 'n vertikale kromme nie pas nie, sê 'n rooi blokkie waarom: dit loop terug in die PVI of kromme voor dit, of verby die volgende PVI, en hoeveel ruimte daar aan daardie kant is (’n kromme benodig die helfte van sy lengte aan elke kant van sy PVI). Die knoppie daarvan stel **die langste kromme wat pas**, met sy K, as een stap ({{key:Mod+Z}} ontdoen dit). Of skuif die PVI's uit mekaar.

## Lees die feite

Onder die PVI-tabel gee 'n lys elke gradiënt in persent ("Gradiënt 1: +1.25%") en elke kromme, byvoorbeeld "Kruin by 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)", en dan "Hoë punt 1+62.40, 254.12".

As die PVI's nie albei eindes van die belyning bereik nie, sê 'n noot dit. 'n Korridor word net gebou waar die profiel en belyning oorvleuel.

## Kenmerklyne in die profiel

Kenmerklyne word ook in die profielaansig gewys, sodat jy 'n randsteen, 'n sloot of 'n muurbokant teen die pad se profiel kan sien.

- Waar 'n kenmerklyn die belyning **kruis**, wys die profiel 'n klein ruit by daardie stasionering en hoogte, geëtiketteer met die lyn se naam en sy hoogte daar (die lyn se eie hoogte, uitgewerk langs die segment wat kruis).
- Tik 'n afstand in {{ui:Langs binne}} om ook die kenmerklyne te teken wat **langs** die belyning binne daardie afstand loop, as gestippelde lyne op hul eie hoogtes. Leeg of 0 wys slegs die kruisings.
- Die merke en etikette volg elke verandering: skuif 'n hoekpunt, tik 'n gradiënt of verhoog die lyn, en die profiel wys die nuwe hoogtes dadelik.
- Klik op 'n kruising se ruit om daardie kenmerklyn te kies; die gekose lyn word in die uitlig-kleur geteken.
- {{ui:Kenmerklyne}} in die profielbalk verberg of wys hulle almal. Beide instellings word saam met die projek gestoor.

Sien [Kenmerklyne](topic:feature-lines).

## Volgende

- Trek 'n padkorridor langs die belyning en hierdie profiel: [Korridor](topic:corridor).
- Die profiel word saam met die belyning na LandXML geskryf; sien [Uitruil LandXML](topic:landxml).
