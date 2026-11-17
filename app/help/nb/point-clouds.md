---
title: Punktsky fra drone eller skanner
summary: Med tillegget Punktsky åpner du en LAS- eller LAZ-fil med millioner av punkter, ser på alt, renser den, sorterer den i terreng, vegetasjon og bygninger, og bygger terreng, høydekurver og volumer fra den.
keywords: punktsky, las, laz, drone, fotogrammetri, recap, lidar, skanning, terreng, klassifiser, støy, haug, volum, skjæring og fylling, høydekurver, bruddlinje, eye-dome, ortomosaikk, ortho, drapering, kartlayer, eksporter las, eksporter laz, komprimer
from: e4a4901f
---

De fleste trenger aldri dette, så det er et tillegg. Slå på {{ui:Punktsky}} i Innstillinger › Tillegg; en fane {{ui:Punktsky}} vises i høyre panel. Filen leses i nettleseren og deles opp i fliser som lagres i nettleserens eget lager (eller en mappe du velger). **Ingenting lastes opp.**

:::warning
Alt denne fanen viser, er et tall fra dataene dine, ikke et sertifikat. Den er testet på et oppdiktet område, ikke ennå på en ekte drone-befaring: les de første resultatene med forsiktighet og fortell oss hva du finner. Den registrerte fagpersonen avgjør hva terrenget, høydekurvene og volumene er verdt.
:::

## Åpne en punktsky

Under {{ui:Åpne en punktsky}} velger du en LAS- eller LAZ-fil. Fanen sier hvor mange punkter den inneholder, koordinatsystemet og enhetene, og hvor mye plass en bygging trenger; trykk {{ui:Bygg punktskyen}}. En bygging kan stoppes og fortsettes med {{ui:Fortsett}} (velg samme fil igjen). Filen endres aldri. En fil med 100 millioner punkter bygges på minutter på en arbeidsstasjon og bruker omtrent like mye plass som filen.

Under {{ui:Punktskyer på denne datamaskinen}} åpner eller fjerner du en punktsky. {{ui:Behold punktskyer i en mappe…}} (Chrome, Edge og Studio-appen) lagrer flisene i en mappe du velger, for eksempel en mappe for CadCraft-punktskyer i Dokumenter, slik at en 10 GB punktsky ikke må få plass i nettleserens lagring; punktskyer bygget tidligere blir værende der de ble bygget. Nettleseren spør om tillatelse på nytt etter en omstart: trykk {{ui:Bruk mappen … igjen}}.

## Se på den

{{ui:Se på den i 3D}} tegner punktskyen fra grove fliser og forfiner når du nærmer deg, og tegner aldri mer enn {{ui:Flest punkter tegnet}} om gangen (2,5 millioner; 500 000 på en telefon). Farge etter filens egen farge, høyde, klasse, intensitet eller {{ui:Residual}}. {{ui:Eye-dome-belysning}} skygger kanter etter dybde slik at formen leses uten normaler (av på en telefon); {{ui:Punkter krymper med avstand}} gjør fjerne punkter mindre og nære større; {{ui:Punktstørrelse}} angir størrelsen. Planen viser punktskyen som et rasterbilde under tegningen og **forfiner når du zoomer inn** på en del av den.

## Rens den

Under {{ui:Rens}} tegner du et lasso, en boks eller en mangekant i planen (eller i 3D fra toppvisningen: i 3D tas omrisset rett ned, så det er bare nøyaktig ovenfra). Fanen viser hvor mange punkter som er innenfor **før** du bruker: {{ui:Slett disse punktene}}, {{ui:Endre klassen deres}}, {{ui:Gjenopprett slettede punkter}} eller {{ui:Beskjær til denne grensen}}. {{ui:Angre}} og {{ui:Gjør om}} går gjennom endringsloggen; selve filen endres aldri. {{ui:Støyfilter…}} markerer løse punkter som lave punkter (klasse 7) eller høy støy (klasse 18).

## Sorter den

{{ui:Finn terrenget}} arbeider flis for flis og markerer terreng (klasse 2) og lave punkter; toleransen er 0,15 m, eller 0,08 m med bryteren for oppmålingskvalitet. Den rapporterer flissømmer som ikke stemmer. {{ui:Klassifiser vegetasjon og bygninger}} markerer deretter lav, middels og høy vegetasjon og bygninger ut fra høyde over terrenget og hvor flat omgivelsene er. Det er ingen maskinlæring, så et flatt tak på et skur under trær kan være feil: se etter.

## Terreng, høydekurver, bruddlinjer

{{ui:Bygg terreng}} lager eksisterende terreng fra terrengpunktene og legger det til prosjektet på samme måte som en LAS-import (ett steg for å angre). Deretter sammenlignes punktene med det: gjennomsnittet, RMS, 95. persentil, andelen innenfor toleransen, og de ti stedene som avviker mest, hver med {{ui:Gå dit}}. Farge etter {{ui:Residual}} viser hvor terrenget og punktskyen er uenige.

En **bruddlinje** (en kant, grøft eller toppen av en skråning) velges på punktskyen: {{ui:Velg en bruddlinje på punktskyen}} i 3D-visningen tar nærmeste tegnede punkt ved hvert klikk, og {{ui:Velg en bruddlinje i planen}} tar nærmeste punkt i punktskyen (terreng først) under hvert klikk; dobbeltklikk eller Enter avslutter linjen. Neste {{ui:Bygg terreng}} bruker den. {{ui:Vis høydekurver}} tegner høydekurvene over punktskyen i et lite bilde og setter prosjektets intervall.

## Volumer

{{ui:Volum av haug…}} beregner volumet av flaten over et grunnplan innenfor en grense du tegner. Tegn grensen på jevnt terreng rundt haugen og velg grunnplanet: det laveste grensepunktet, et plan, en jevn buet flate, en flate gjennom grensen, eller et nivå du skriver inn. På skrånende eller buet terreng bruk planet eller den buede flaten; det laveste punktet blir for høyt. Grensepunkter som stikker over resten (et tre på linjen) utelates fra grunnplanet. {{ui:Flyging til flyging}} gir skjæring og fylling mellom to punktskyer. Begge kan lagres som CSV.

## Ortomosaikk

Under {{ui:Ortomosaikk (bilde ovenfra)}} velger du droneens ortomosaikk sammen med verdensfilen og `.prj` når den har dem: en GeoTIFF, eller en PNG eller JPEG. Den blir et **kartlayer** i prosjektet, slik at planen viser den under tegningen, og 3D-visningen (farge {{ui:Kart}}) maler den på terrenget du bygde, så {{ui:Bygg terreng}} må gjøres først. Fanen sier hvor mye av punktskyen bildet dekker, og varsler når det ikke dekker noe: vanlig årsak er et annet koordinatsystem, så gi `.prj`-filen sammen med det. Når det ikke finnes en `.prj`, spør programmet hvor koordinatene er. Bildet lagres inne i prosjektfilen; en GeoTIFF over 200 MB avvises, og et svært stort mosaikk reduseres til 16 megapiksler, så for en stor befaring: klipp mosaikken til området først.

## Eksport

{{ui:Eksporter}} skriver den rensede, klassifiserte punktskyen som en ny fil (alle punkter, de rensede klassene, eller bare terrenget). Under {{ui:Filtype}} velger du:

- **LAS 1.4 (ikke komprimert)**: punktformat 6, eller 7 med farge.
- **LAZ (komprimert)**: de samme punktene komprimert uten tap, så alle punkter kommer tilbake nøyaktig. Den skrives som punktformat 0, eller 2 med farge, i en LAS 1.4-fil. På det oppdiktede 300 m-området var LAZ omtrent en femdel av størrelsen til LAS 1.4-filen. LAZ-formatene 0 og 2 rommer bare klasse 0 til 31: et punkt med høyere klasse avvises med en melding, så eksporter den punktskyen som LAS 1.4.

LAZ skrives av CadCraft sin egen komprimerer, laget etter den publiserte LAZ-spesifikasjonen. Vi har kontrollert at vår egen leser og to uavhengige LAZ-lesere (laz-perf, som appen bruker for å åpne LAZ-filer, og laspy med lazrs) leser hvert punkt tilbake nøyaktig, og at LAZ-filer laget av laspy blir helt like byte for byte når vi skriver punktene deres på nytt. Andre programmer er ikke prøvd ennå, så hvis ett ikke åpner en fil, si fra hvilket.

Der nettleseren kan skrive en fil mens den går, velger du filen først, og en svært stor punktsky skrives til den flis for flis i stedet for å samles i minnet; ellers samles filen og lastes ned, noe som går fint opp til noen hundre megabyte.

## Det den ikke gjør

Den leser bare LAS og LAZ (E57, PLY og PCD er ikke koblet til denne fanen ennå, og flere filer fra én befaring slås ikke sammen), omprojiserer ikke en punktsky (prosjektets system og meter forutsettes), leser ikke Autodesks RCP- eller RCS-filer, lager ikke en flate av fotografier, og finner ikke stolper, kanter eller rør av seg selv.
