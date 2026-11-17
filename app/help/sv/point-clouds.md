---
title: Punktmoln från drönare eller skanner
summary: Med tillägget Punktmoln öppnar du en LAS- eller LAZ-fil med miljontals punkter, granskar allt, rensar den, sorterar den i mark, vegetation och byggnader och bygger mark, höjdkurvor och volymer av den.
keywords: punktmoln, las, laz, drönare, fotogrammetri, recap, lidar, skanning, mark, klassificera, brus, upplag, volym, schakt och fyllning, höjdkurvor, brytlinje, eye-dome, ortomosaik, ortho, dra över, kartlager, exportera las, exportera laz, komprimera
from: e4a4901f
---

De flesta behöver aldrig detta, så det är ett tillägg. Slå på {{ui:Punktmoln}} under Inställningar › Tillägg; en flik {{ui:Punktmoln}} visas i den högra panelen. Filen läses in i din webbläsare och delas upp i brickor som sparas i webbläsarens egna lagring (eller i en mapp du väljer). **Inget laddas upp.**

:::warning
Allt som fliken rapporterar är ett tal från dina data, inte ett intyg. Det har testats på ett påhittat område, ännu inte på en verklig drönarflygning: läs de första resultaten med försiktighet och berätta för oss vad du hittar. Den behöriga yrkespersonen avgör vad marken, höjdkurvorna och volymerna är värda.
:::

## Öppna ett punktmoln

Under {{ui:Öppna ett punktmoln}} väljer du en LAS- eller LAZ-fil. Fliken visar hur många punkter den innehåller, dess koordinatsystem och enheter samt hur mycket utrymme en byggnation behöver; tryck på {{ui:Bygg punktmolnet}}. En byggnation kan stoppas och fortsätta med {{ui:Fortsätt}} (välj samma fil igen). Filen ändras aldrig. En fil med 100 miljoner punkter byggs på några minuter på en arbetsstation och tar ungefär lika mycket utrymme som filen.

Under {{ui:Punktmoln på den här datorn}} öppnar eller tar du bort ett punktmoln. {{ui:Behåll punktmoln i en mapp…}} (Chrome, Edge och appen Studio) håller brickorna i en mapp du väljer, till exempel en punktmolnsmapp för CadCraft i Dokument, så att ett 10 GB stort punktmoln inte behöver rymmas i webbläsarens lagring; punktmoln som byggts tidigare finns kvar där de byggdes. Webbläsaren frågar igen efter behörighet efter en omstart: tryck på {{ui:Använd mappen … igen}}.

## Titta på det

{{ui:Visa i 3D}} ritar punktmolnet från grova brickor och förfinar när du närmar dig, aldrig fler än {{ui:Flest ritade punkter}} samtidigt (2.5 miljoner; 500 tusen på en telefon). Färglägg efter filens egna färg, höjd, klass, intensitet eller residual. {{ui:Eye-dome-belysning}} skuggar kanter efter djup så att formen framgår utan normaler (av på en telefon); {{ui:Punkter krymper med avstånd}} gör långt bortliggande punkter mindre och närliggande större; {{ui:Punktstorlek}} anger storleken. Planen visar punktmolnet som en rasterbild under ritningen och **förfinas när du zoomar in** på en del av det.

## Rensa det

Under {{ui:Rensa}} ritar du en lasso, en låda eller en polygon i planen (eller i 3D från vyn uppifrån: i 3D tas konturen rakt ner, så den är exakt bara uppifrån). Fliken visar hur många punkter som finns inuti **innan** du tillämpar: {{ui:Ta bort dessa punkter}}, {{ui:Ändra deras klass}}, {{ui:Återställ borttagna punkter}} eller {{ui:Beskär till denna gräns}}. {{ui:Ångra}} och {{ui:Gör om}} går igenom redigeringsloggen; filen ändras aldrig. {{ui:Brusfilter…}} markerar lösa punkter som lågpunkter (klass 7) eller högt brus (klass 18).

## Sortera

{{ui:Hitta marken}} arbetar brick för brick och markerar mark (klass 2) och lågpunkter; toleransen är 0,15 m, eller 0,08 m med reglaget för mätklass. Den rapporterar brickskarvar som inte stämmer. {{ui:Klassificera vegetation och byggnader}} markerar sedan låg, medelhög och hög vegetation samt byggnader utifrån höjd över marken och hur plan omgivningen är. Det finns ingen maskininlärning, så ett platt tak på ett skjul under träd kan vara fel: kontrollera.

## Mark, höjdkurvor, brytlinjer

{{ui:Bygg mark}} skapar den befintliga marken från markpunkterna och lägger till den i projektet på samma sätt som en LAS-import (ett ångra-steg). Sedan jämförs punkterna med den: medelvärdet, RMS, 95-percentilen, andelen inom tolerans och de tio ställen som avviker mest, vart och ett med {{ui:Gå dit}}. Färgläggning efter {{ui:Residual}} visar var marken och punktmolnet inte stämmer överens.

En **brytlinje** (en kantsten, ett dike eller en bankkrön) väljs i punktmolnet: {{ui:Välj en brytlinje i punktmolnet}} i 3D-vyn tar närmaste ritade punkt vid varje klick, och {{ui:Välj en brytlinje i planen}} tar närmaste punkt i molnet (mark först) under varje klick; dubbelklicka eller tryck på Enter för att avsluta linjen. Nästa {{ui:Bygg mark}} använder den. {{ui:Visa höjdkurvor}} ritar höjdkurvorna över punktmolnet i en liten bild och anger projektets intervall.

## Volymer

{{ui:Upplagsvolym…}} beräknar volymen av ytan ovanför en bas inom en gräns du ritar. Rita gränsen på plan mark runt högen och välj basen: lägsta gränspunkten, ett plan, en mjukt böjd bas, en yta genom gränsen eller en nivå du skriver in. På lutande eller böjd mark använd planet eller den böjda basen; lägsta punkten ger för hög avläsning. Gränspunkter som står över resten (ett träd på linjen) utelämnas från basen. {{ui:Flygning mot flygning}} ger schakt och fyllning mellan två punktmoln. Båda kan sparas som CSV.

## Ortomosaik

Under {{ui:Ortomosaik (bild uppifrån)}} väljer du drönarens ortomosaik tillsammans med dess världsfil och `.prj` när den har sådana: en GeoTIFF, eller en PNG eller JPEG. Den blir ett **kartlager** i projektet, så planen visar det under ritningen, och 3D-vyn (färg {{ui:Karta}}) målar det på marken du byggt, så bygg {{ui:Bygg mark}} först. Fliken visar hur stor del av punktmolnet bilden täcker och varnar när den inte täcker något: den vanliga orsaken är ett annat koordinatsystem, så ange `.prj`-filen tillsammans med den. Finns ingen `.prj` frågar programmet var koordinaterna finns. Bilden sparas i projektfilen; en GeoTIFF över 200 MB avvisas och en mycket stor mosaik minskas till 16 megapixlar, så för en stor mätning klipp först ut området till platsen.

## Exportera

{{ui:Exportera}} skriver det rensade och klassificerade punktmolnet som en ny fil (alla punkter, de rensade klasserna eller bara marken). Under {{ui:Filtyp}} väljer du:

- **LAS 1.4 (inte komprimerad)**: punktformat 6, eller 7 med färg.
- **LAZ (komprimerad)**: samma punkter komprimerade utan förlust, så att varje punkt kommer tillbaka exakt. Den skrivs som punktformat 0, eller 2 med färg, i en LAS 1.4-fil. På den påhittade 300 m-platsen var LAZ ungefär en femtedel av storleken på LAS 1.4-filen. LAZ-formaten 0 och 2 innehåller bara klasserna 0 till 31: en punkt med högre klass avvisas med ett meddelande, så exportera det molnet som LAS 1.4.

LAZ skrivs av CadCraft:s egen komprimerare, byggd efter den publicerade LAZ-specifikationen. Vi har kontrollerat att vår egen läsare och två oberoende LAZ-läsare (laz-perf, som appen använder för att öppna LAZ-filer, och laspy med lazrs) läser tillbaka varje punkt exakt, och att LAZ-filer som laspy skapat blir identiska, byte för byte, när vi skriver deras punkter igen. Andra program har inte testats ännu, så om ett av dem inte öppnar en fil, berätta vilket.

Där webbläsaren kan skriva en fil medan den arbetar väljer du filen först, och ett mycket stort punktmoln skrivs till den en bricka i taget i stället för att samlas i minnet; annars samlas filen och laddas ner, vilket går bra upp till några hundra megabyte.

## Det den inte gör

Den läser bara LAS och LAZ (E57, PLY och PCD är ännu inte kopplade till den här fliken, och flera filer från en flygning sammanfogas inte), omprojicerar inte ett punktmoln (projektets system och meter antas), läser inte Autodesks RCP- eller RCS-filer, skapar inte en yta av fotografier och hittar inte stolpar, kantstenar eller rör av sig själv.
