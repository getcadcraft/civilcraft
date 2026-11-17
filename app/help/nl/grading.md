---
title: Een bouwplateau afwerken
summary: Een vlak plateau tekenen, de hoogte en de ontgravings- en ophogingstaluds instellen, en CivilCraft het laten aansnijden op het bestaande terrein en aan het afgewerkte oppervlak laten toevoegen.
keywords: keermuur, keermuren, verticale zijde, muur in plaats van talud, helling per zijde, dijklichaam, grading, plaat, plateau, bouwplateau, aansnijden, aansnijdlijn, elementlijn, ontgravingstalud, ophogingstalud, afgewerkt niveau, afgewerkt oppervlak, terreinafwerking
from: 482319a6
---

Een plateau is een vlak gebied op één hoogte. Vanaf zijn rand loopt CivilCraft naar buiten af met uw ontgravingstalud waar het terrein hoger ligt dan het plateau, en met uw ophogingstalud waar het lager ligt, tot de helling het bestaande terrein raakt. Die raaklijn is de aansnijdlijn. Het plateau en zijn taluds vervangen het bestaande terrein binnen de aansnijdlijn, en zo ontstaat het afgewerkte oppervlak.

## Het plateau tekenen

U hebt eerst een bestaand terreinoppervlak nodig.

1. Druk op {{key:G}}, of klik op {{ui:Plaat}} in de groep **Ontwerp**.
   De hint zegt: "Plaat: klik op de hoeken. Enter of dubbelklik beëindigt, Backspace verwijdert de laatste, Esc annuleert."
2. Klik de hoeken van het plateau in volgorde aan, welke kant op u wilt. Een blauwe omtrek volgt de aanwijzer.
3. Druk op {{key:Enter}} na de laatste hoek (minimaal drie).
   Het plateau wordt getekend en geselecteerd. Het begint op de terreinhoogte in het midden, afgerond op 0.1, met een ontgravingstalud van 2 : 1 en een ophogingstalud van 3 : 1. De statusbalk zegt bijvoorbeeld: "Plaat 1 op hoogte 254.3 (het terrein in het midden), ontgraving 2:1, ophoging 3:1. Wijzig ze in Eigenschappen."

:::warning
Rond af met {{key:Enter}}. Dubbelklikken beëindigt ook, maar in deze build laat het de hoek vallen waarop u dubbelklikte. Klik de laatste hoek één keer aan en druk daarna op {{key:Enter}}.
:::

De omtrek van het plateau mag niet over zichzelf lopen ("De omtrek van het plateau kruist zichzelf.").

## Hoogte en taluds instellen

Met het plateau geselecteerd toont het rechterpaneel **Plaat**:

1. **Naam**.
2. **Hoogte**: de vlakke hoogte van het plateau.
3. **Ontgravingstalud** en **Ophogingstalud**, als H:V (2 betekent 2 : 1). Beide moeten meer dan 0 zijn.
4. **Plateauoppervlak** en **Hoeken** worden ter informatie getoond.

Druk op {{key:Enter}} na elke waarde. De aansnijdlijn, het afgewerkte oppervlak en de volumes worden meteen bijgewerkt.

Onder de velden staat bijvoorbeeld: "Aansnijdlijn: 48 hellingslijnen (20 in ontgraving, 28 in ophoging), verste punt 31.20 ft uit." Het plan toont de aansnijdlijn en de hellingslijnen in magenta.

## Hoe de aansnijding wordt gevonden

- Hellingslijnen vertrekken loodrecht op elke rand, ongeveer elke twintigste deel van de maat van het plateau.
- Bij buitenhoeken waaieren ze elke 10° uit, zodat de helling om de hoek heen loopt.
- Bij binnenhoeken loopt één lijn langs de bissectrice, waar de hellingen van de twee randen samenkomen.
- Elke lijn stijgt op het ontgravingstalud of daalt op het ophogingstalud, tot ze het terrein bereikt.

## Hellingen per zijde en keermuren

Onder **Zijden en keermuren** in de Eigenschappen van een plateau, een platform of een berm kan elke zijde op een eigen manier worden afgewerkt. Zijde 1 loopt van de eerste hoek die u aanklikte naar de tweede, zijde 2 van de tweede naar de derde, enzovoort.

- **Alle zijden**: **Hellend** gebruikt de bovenstaande ontgravings- en ophogingstaluds op elke zijde; **Verticaal: keermuren** zet op elke zijde een muur.
- Per zijde: **Taluds hierboven**, **Eigen taluds** (typ een ontgravings- en een ophogingstalud voor die zijde) of **Verticaal (keermuur)**.
- Typ een helling als `3` of `3:1` (horizontaal naar 1 verticaal), `33%` of `18.4°`; ze wordt getoond als H:1. De eigen **Ontgravingstalud** en **Ophogingstalud** van het plateau nemen hetzelfde.
- Een verticale zijde heeft geen dijklichaam: een keermuur loopt langs de rand, van het plateau naar beneden tot het bestaande terrein (in ophoging), of van het terrein naar beneden tot het plateau (in ontgraving). **Muurdikte** (0.3 m of 1 ft om mee te beginnen) is hoe ver het terrein van de plateaurand naar het bestaande terrein springt. Ontgravings- en ophogingsvolumes laten het dijklichaam weg dat die zijde niet meer heeft.
- Waar een muur een hellende zijde raakt, loopt het talud om het uiteinde van de muur heen; twee muren komen samen in een verstek.
- Onder de velden: de lengte van de muren, het zichtbare vlak (hoogte × lengte), en de hoogste en gemiddelde hoogte.

Het plan tekent de buitenkant van elke muur met korte streepjes erover, en de hoogte aan beide uiteinden en op het hoogste punt (op de laag keermuren, die ook naar DXF en DWG gaat). De 3D-weergave toont de muren als volumes (Tonen › Keermuren), en GLB-, OBJ- en USD-exports nemen ze mee. Doorsneden over de rand tonen de stap.

**Waarschuwingen** (in Eigenschappen, en in het paneel Problemen): een muur hoger dan **Waarschuw boven een muurhoogte van** (1.0 m of 3.3 ft om mee te beginnen) "kan een constructief berekende muur of een vergunning vergen; controleer de lokale regels", en, wanneer u de **Steilste helling die de grond houdt** typt, elke zijde waarvan het ontgravings- of ophogingstalud steiler is dan dat. Het zijn waarschuwingen: het afwerken wordt nog steeds uitgevoerd. Elke wijziging is één stap voor {{key:Mod+Z}}.

## Hoeken verplaatsen

Selecteer het plateau en sleep een vierkante grip bij een hoek. Elke versleping is één stap ongedaan te maken. Een hoek toevoegen of verwijderen is nog niet beschikbaar: verwijder het plateau en teken het opnieuw.

## Wanneer het niet afwerkt

Een rood vak onder **Grondverzet** noemt het plateau en het probleem:

| Melding | Wat te doen |
|---|---|
| "3 hellingslijnen lopen van het oppervlak af voordat ze het raken: het plateau ligt te dicht bij de rand van het oppervlak, of de hoogte is te hoog of te laag." | Verplaats het plateau van de rand van het oppervlak naar binnen, of breng de hoogte dichter bij het terrein. |
| "De aansnijdlijn kruist zichzelf (hellingen van verschillende zijden van het plateau lopen in elkaar). Pas de vorm van het plateau aan of wijzig de taluds." | Typisch voor smalle of L-vormige plateaus in diepe ontgraving of hoge ophoging. Verbreed het plateau, vlak het verschil af, of maak de taluds steiler. |
| "De omtrek van het plateau kruist zichzelf." | Teken de hoeken opnieuw in volgorde rond het plateau. |

Een plateau met een probleem blijft buiten het afgewerkte oppervlak en de volumes totdat het is opgelost.

## Het resultaat zien

1. Stel onder **Weergave** **Oppervlak** in op {{ui:Voorgesteld (afgewerkt)}}. De hoogtelijnen lopen nu vlak over het plateau en volgen de hellingen tot de aansnijdlijn.
2. Beweeg de aanwijzer over het plateau: de statusbalk toont de hoogten **Terrein** en **Afgewerkt**.
3. Lees ontgraving en ophoging onder **Grondverzet**; zie [Grondverzetvolumes](topic:volumes).

Plateaus worden afgewerkt na corridors, in de volgorde waarin ze getekend zijn. Een later plateau vervangt alles eerder binnen zijn eigen aansnijdlijn.

## Een plateau verwijderen

Selecteer het en druk op {{key:Delete}} (op een Mac: Fn en delete), of klik op {{ui:Verwijderen}}.

## Nog niet beschikbaar

Plateaus zijn vlak. Hellende plateaus, elementlijnen met wisselend verloop, banken, en afwerking tot een afstand- of hoogtedoel zijn nog niet beschikbaar. Zie [Nog niet beschikbaar](topic:not-built-yet).
