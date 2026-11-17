---
title: Tegn matrikler og skriv deres matrikelbeskrivelser
summary: Tegn en matrikel ud fra dens hjørner, eller indtast opmålingerne fra et skøde eller et matrikelkort, kontrollér hvor godt opmålingerne lukker, angiv retninger og afstande på planen, gør et forløb til en kurve, og kopiér en kladde til matrikelbeskrivelsen.
keywords: matrikler, grunde, ejendomsgrænser, grænse, skøde, matrikelkort, opmåling, retning, afstand, lukning, lukkefejl, præcision, matrikelbeskrivelse, startpunkt, kurve, radius, areal, acres
from: 6793d6ce
---

Matrikler ligger på planen med retningen og afstanden langs hvert lige forløb (en kurve viser sin radius, længde og centervinkel) og deres navn og areal i midten. De går med i PDF-plottet og DWG- og DXF-eksporterne, på lagene `V-PROP` (linjer) og `V-PROP-TEXT` (tekst). Alt findes under **Matrikler** i højre panel, når intet er valgt.

## Tegn en matrikel

1. Klik på **Tegn en matrikel**.
2. Klik på hjørnerne, startende ved startpunktet. Et klik nær et opmålingspunkt tager det punkts præcise placering.
3. Klik på det første hjørne igen, eller tryk {{key:Enter}}, for at afslutte. {{key:Backspace}} fjerner det sidste hjørne; {{key:Esc}} kasserer de hjørner, der er tegnet indtil nu; tryk igen for at forlade værktøjet.

## Indtast opmålingerne fra et skøde

1. Klik på **Indtast skødets opmålinger**.
2. Angiv hvor opmålingerne starter: et opmålingspunkts nummer eller en nord- og en østkoordinat.
3. Skriv eller indsæt opmålingerne, én pr. linje:
   - en linje: en retning og en afstand, for eksempel `N 45°30'15" E 125.50`. `N45-30-15E`, `N 45 30 15 E`, `N 45.5 E` og azimut (`AZ 45°30'15"`) virker også, og "thence", komma og "feet" ignoreres.
   - en kurve: `C R 300 L 52.36 right` (radius og buelængde) eller `C R 300 D 10°00'00" left` (radius og centervinkel). En kurve følger efter forløbet før den; når den ikke gør, tilføjer du dens korderetning: `C R 300 L 52.36 right CB N 50 00 00 E`.
   - `#` starter en kommentarlinje.
4. Mens du skriver, viser dialogen opmålingernes længde, **lukkefejlen** (hvor langt fra start de ender, og i hvilken retning), **præcisionen** (længden divideret med lukkefejlen, 1 : 10,000 og så videre) og arealet. Linjer, den ikke kan læse, vises med deres linjenumre.
5. **Tilføj matriklen**. Når opmålingerne ikke lukker, lukkes matriklen med et lige forløb over hullet: kontrollér opmålingerne mod skødet. For at fordele et polygontræks fejl over dets forløb skal du justere det først.

## Kurver

I en matrikels **Egenskaber** har hvert forløb en **Radius**. Skriv en radius for at gøre det forløb til en kurve mellem de samme to hjørner (en radius mindre end halvdelen af afstanden mellem hjørnerne kan ikke nå, og afvises derfor), og vælg **Højre** eller **Venstre** under **Kurver**: en kurve til højre har sit center til højre for kørselsretningen, som i et skøde. Ryd radiussen for at gøre forløbet lige igen. Hver ændring er ét trin: {{key:Mod+Z}} fortryder den.

## Matrikelbeskrivelsen

En matrikels **Egenskaber** ender med dens matrikelbeskrivelse, skrevet ud fra tegningen:

- "Begyndende ved" **Startpunktet**, du skriver (for eksempel "hjørnet nordøst for Lot 4"), ellers det første hjørnes nord- og østkoordinat, eller det opmålingspunkt, opmålingerne startede fra.
- "derefter" hvert forløb: en retning og en afstand, eller en kurve med dens radius, buelængde, centervinkel og korderetning og -afstand.
- "Indeholdende" dens areal i kvadratfod og acres (kvadratmeter og hektar i et meterprojekt).

**Kopiér** lægger den i udklipsholderen; **Hent som tekst** gemmer den som en `.txt`-fil.

:::warning
Matrikelbeskrivelsen er en kladde ud fra tegningen, ikke en opmåling. En autoriseret landinspektør skal kontrollere den mod registret og underskrive den, før nogen stoler på den.
:::

Klik inde i en matrikel på planen for at vælge den; {{key:Delete}} fjerner den. Matrikler gemmes i projektfilen.
