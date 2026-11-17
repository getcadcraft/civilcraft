---
title: Åbn en DWG eller DXF som stregtegning
summary: Åbn en tegnings stregtegning i planen, lag for lag, brug dens konturer, 3D-polylinjer og lukkede konturer til overfladen, og lav dens punktblokke om til målepunkter.
keywords: opmålingskontrol, kotetekst, dwg, dxf, cad, tegning, stregtegning, konturer, brudlinjer, grænse, polylinje, 3D-polylinje, lag, grundkort, topo, opmålingstegning, blokke, blokreferencer, målepunkter fra blokke, attributter, punktblokke, indsætningspunkt
from: da0f4c58
---

En topografisk opmåling kommer ofte som en tegning: konturer som polylinjer i deres kote, brudlinjer som 3D-polylinjer og områdets grænse som en lukket polylinje. CivilCraft åbner tegningens **modelrum** som lag i planen og kan omdanne disse linjer direkte til overfladen.

## Åbn tegningen

1. Klik på {{ui:Stregtegning}} i gruppen **Overflade** (eller {{ui:Åbn}}, eller slip filen i planen), og vælg en `.dwg`- eller `.dxf`-fil. Tegningen læses på denne computer; intet uploades. DWG fra 2000 til 2018 og ASCII-DXF læses.
2. Dialogen **Stregtegning** lister tegningens lag, der indeholder linjer, lukkede former eller punkter, og om de har **koter**. Lag, der er slukket i tegningen, starter umarkeret. Tekst, skravering, målsætninger og andre objekter, der ikke er stregtegning, tælles og udelades (dialogen siger hvilke).
3. Kontrollér **Tegningens enheder**. Når tegningen angiver sine enheder, omregner CivilCraft dem til projektets (millimeter til meter, meter til fod, tommer til fod). En tegning i fod læses som amerikanske opmålingsfod uden skalering: de to adskiller sig med 2 dele pr. million, og skalering af statsplanskoordinater med det ville flytte dem flere fod. Når tegningen ikke angiver sine enheder, læses dens tal i projektets enheder; vælg de rigtige enheder i listen, hvis de ikke passer.
4. Under {{ui:Brug til overfladen}} vælger du, hvad hvert lag giver overfladen (eller lader **Vis kun den** stå). Lag navngivet som konturer (TOPO, CONT, CNTR), der har koter, starter som brudlinjer.
5. Klik på {{ui:Tilføj}}. Lagene vises under **GIS-lag** i venstre panel; hver brug lægges ind i overfladen. Hver del er et trin for sig: {{key:Mod+Z}} tager dem tilbage ét ad gangen.

## Hvad hver type lag kan give

| Laget indeholder | Brug til overfladen |
|---|---|
| Konturer (polylinjer i en kote) | Brudlinjer i linjernes egen kote, eller i feltet ELEV |
| 3D-polylinjer | Brudlinjer i deres egne koter |
| En lukket kontur | Overfladens grænse (den største lukkede form, eller den du valgte) |
| Punkter med en kote | Målepunkter, beskrevet med lagnavnet |
| Linjer i kote 0 (planens stregtegning) | Intet: den bliver i planen som grundtegning |

En tegning, CivilCraft har skrevet, gemmer sine feature-linjer som 3D-polylinjer, der husker deres buer. Dialogen viser så **Feature-linjer**: lad den være markeret for at hente dem tilbage som feature-linjer med deres buer og brug (ét fortrydelsestrin), eller fjern markeringen for at læse dem som almindelig stregtegning.

Senere kan du bruge {{ui:Brug til overfladen}} i lagets menu under **GIS-lag** for at gøre det samme for et lag, du kun har vist.

## Opmålingspunkter fra blokke

Opmålingstegninger har ofte deres punkter som blokke: et lille symbol ved hver måling, med attributter for punktnummer, beskrivelse og kote. Når tegningen har blokreferencer, har dialogen et afsnit **Opmålingspunkter fra blokke**:

1. Markér de blokke, der skal tages med (tabellen siger, hvor mange referencer hver har, på hvilke lag og hvilke attributter), eller markér lag for at tage alle blokreferencer på dem.
2. Vælg hvor hvert punkts **nummer**, **beskrivelse** og **kote** kommer fra: en attribut, blokkens eller lagets navn, de næste ledige numre, eller indsætningspunktets Z. CivilCraft starter på de sandsynlige attributter (PT, DESC, ELEV og lignende) og tager kun koten fra en attribut, når blokkene står på nul.
3. Fjern markeringen af stregtegningslagene, hvis du kun vil have punkterne, og klik derefter på {{ui:Tilføj}}.

Hver reference bliver ét opmålingspunkt i sit indsætningspunkt. Kun referencer placeret i modelrummet tæller; blokke indlejret i andre blokke gør ikke. Numre, der allerede er i projektet, eller er brugt to gange i tegningen, får nye numre efter det højeste, og en kote-attribut, der ikke er et tal, efterlader det punkt uden kote; statuslinjen tæller begge dele. Tegningen ændres aldrig, og hvert punkt husker sin blok: dets Egenskaber viser **Fra blok** med blokken, laget og håndtaget. Tilføjelsen af punkterne er ét trin, så {{key:Mod+Z}} fjerner dem alle.

## Koter skrevet som tekst, og kontrollen

Kotetal skrevet som tekst (eller i en blokattribut, der ikke er en opmålingspunktblok) er ikke stregtegning. Afsnittet **Opmålingskoter og kontrol** kan tage dem med som opmålingspunkter og lister, hvad der ser forkert ud i tegningen: enheder, koordinatsystem, afstand fra nul, flade konturer, underlige koter, dobbelte punkter. Se [Kontrollér en opmålingstegning ved import](topic:survey-check).

## Hvordan tegningen læses

- Buer, cirkler, ellipser, buede polylinjesegmenter og splines bliver til korte lige stykker (højst hver 5°).
- Blokreferencer tegnes der, hvor de er placeret, også indlejrede blokke; det en blok indeholder på lag 0, får referencens lag.
- Objekter tegnet i et andet plan (en anden ekstruderingsretning) placeres i verdenskoordinater.
- Hvert objekt får tre felter: LAYER, TYPE (objekttypen) og ELEV (dets kote, når alle dets punkter deler én).
- Koordinater tages, som de er: tegningen skal bruge de samme koordinater som projektet (fx samme statsplanszone). Eksterne tegninger (xrefs) åbnes ikke: åbn dem hver for sig.

:::tip
En konturtegning giver den bedste overflade med få kotepunkter på toppe og i lavninger, hvor konturer alene efterlader flade trekanter. Tilføj dem som opmålingspunkter, eller fra et punktlag i tegningen.
:::
