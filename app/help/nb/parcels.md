---
title: Tegn eiendommer og skriv juridiske beskrivelser
summary: Tegn en eiendom etter hjørnene, eller skriv inn kallene fra et skjøte eller matrikkelkart, sjekk hvor godt kallene lukker seg, merk retninger og avstander på planen, gjør et strekk til en kurve, og kopier et utkast til juridisk beskrivelse.
keywords: eiendommer, tomter, eiendomsgrenser, grense, skjøte, matrikkelkart, kall og grenser, retning, avstand, lukking, lukkefeil, presisjon, juridisk beskrivelse, startpunkt, kurve, radius, areal, acres
from: 6793d6ce
---

Eiendommer ligger på planen med retningen og avstanden langs hvert rette strekk (en kurve viser radius, lengde og sentralvinkel), og navn og areal i midten. De havner i PDF-plotten og i DWG- og DXF-eksportene, på lagene `V-PROP` (linjer) og `V-PROP-TEXT` (merkelapper). Alt ligger under **Eiendommer** i høyre panel når ingenting er valgt.

## Tegn en eiendom

1. Klikk **Tegn en eiendom**.
2. Klikk på hjørnene, med start i startpunktet. Et klikk nær et punkt tar punktets nøyaktige plassering.
3. Klikk på det første hjørnet igjen, eller trykk {{key:Enter}}, for å fullføre. {{key:Backspace}} tar tilbake det siste hjørnet; {{key:Esc}} fjerner hjørnene så langt; trykk den igjen for å forlate verktøyet.

## Angi kall fra et skjøte

1. Klikk **Angi kall fra skjøte**.
2. Si hvor kallene starter: et punkts nummer, eller en nordlig og østlig koordinat.
3. Skriv inn eller lim inn kallene, ett per linje:
   - en linje: en retning og en avstand, for eksempel `N 45°30'15" E 125.50`. `N45-30-15E`, `N 45 30 15 E`, `N 45.5 E` og asimut (`AZ 45°30'15"`) fungerer også, og "thence", komma og "feet" ignoreres.
   - en kurve: `C R 300 L 52.36 right` (radius og buelengde), eller `C R 300 D 10°00'00" left` (radius og sentralvinkel). En kurve følger etter strekket før den; når den ikke gjør det, legg til dens korderetning: `C R 300 L 52.36 right CB N 50 00 00 E`.
   - `#` starter en kommentarlinje.
4. Mens du skriver, viser dialogboksen lengden på kallene, **lukkefeilen** (hvor langt fra start de ender, og i hvilken retning), **presisjonen** (lengden delt på lukkefeilen, 1 : 10,000 og så videre) og arealet. Linjer den ikke kan lese, listes med linjenummer.
5. **Legg til eiendommen**. Når kallene ikke lukker seg, lukkes eiendommen med et rett strekk over gapet: sjekk kallene mot skjøtet. For å fordele feilen i et polygontog over strekkene, juster det først.

## Kurver

I en eiendoms **Egenskaper** har hvert strekk en **Radius**. Skriv inn en radius for å gjøre strekket til en kurve mellom de samme to hjørnene (en radius mindre enn halvparten av avstanden mellom hjørnene kan ikke nås, og avvises), og velg **Høyre** eller **Venstre** under **Kurver**: en kurve til høyre har sitt senter til høyre for kjøreretningen, som i et skjøte. Tøm radiusen for å gjøre strekket rett igjen. Hver endring er ett steg: {{key:Mod+Z}} angrer den.

## Den juridiske beskrivelsen

En eiendoms **Egenskaper** ender med dens juridiske beskrivelse, skrevet fra tegningen:

- «Begynner ved» **Startpunktet** du skriver inn (for eksempel «nordøsthjørnet av tomt 4»), ellers det første hjørnets nordlige og østlige koordinat, eller punktet kallene startet fra.
- «deretter» for hvert strekk: en retning og en avstand, eller en kurve med radius, buelengde, sentralvinkel, og korderetning og -avstand.
- «Inneholder» arealet i kvadratfot og acres (kvadratmeter og hektar i et prosjekt i meter).

**Kopier** legger den på utklippstavlen; **Last ned som tekst** lagrer den som en `.txt`-fil.

:::warning
Den juridiske beskrivelsen er et utkast fra tegningen, ikke en oppmåling. En autorisert landmåler må kontrollere den mot matrikkelen og signere den før noen stoler på den.
:::

Klikk inne i en eiendom på planen for å velge den; {{key:Delete}} fjerner den. Eiendommer lagres i prosjektfilen.
