---
title: CivilCraft-inställningar
summary: Välj kolumnordningen för kopierade och inklistrade punktrader och för gissning av en fils kolumner, hur inklistrade punkter numreras, vad punktetiketter visar, hörnindikatorn, den vertikala överdriften i 3D, hur latitud och longitud visas och om kartlager hämtas från internet.
keywords: inställningar, inställningar, PNEZD, PENZD, kolumnordning, punktrader, numrering, punktnummer, startnummer, punktetiketter, etiketter, beskrivning, höjd, ViewCube, axelikon, hörnindikator, kompass, vertikal överdrift, 3d, latitud, longitud, grader minuter sekunder, decimalgrader, kartlager, internet, integritet
from: 64b9cb92
---

Öppna {{ui:Inställningar}} med kugghjulet i appfältet eller {{key:Mod+,}}. Den första fliken, {{ui:CivilCraft}}, innehåller de inställningar som hör till det här programmet; {{ui:Allmänt}} innehåller de som alla CadCraft-program delar (tema, verktygsfält, paneler). CivilCraft-inställningarna finns bara i programmet: du ändrar dem här, och den här webbläsaren kommer ihåg dem. {{ui:Återställ CivilCraft-inställningar}} sätter tillbaka varje inställning till startvärdet.

## Punktrader

**P, N, E, Z, D** (start) eller **P, E, N, Z, D**: punkt, nordvärde, östvärde, höjd, beskrivning, eller östvärde före nordvärde. Det används på tre ställen:

- **Kopiera**: raderna CivilCraft lägger på systemets urklipp för ett kalkylblad.
- **Klistra in**: rader som klistras in från ett kalkylblad eller en textfil som saknar rubrikrad.
- **Importera**: gissningen i dialogrutan **Importera punkter** när en fil saknar rubrikrad (en fil med fyra kolumner läses som PENZ, en med tre som ENZ). Se [Punktfilsformat](topic:point-file-formats).

En rubrikrad som namnger sina kolumner går alltid före, och så gör ett val i importdialogens lista **Kolumner**.

## Nummer för inklistrade punkter

- **Behåll lediga nummer** (startvärdet): en inklistrad punkt behåller sitt nummer när ingen punkt har det; bara punkter som krockar får nya nummer.
- **Alltid nya nummer**: varje inklistrad punkt får ett nytt nummer, även om dess eget är ledigt.

**Nya nummer börjar på**: lämna tomt för att räkna upp från ett över det högsta numret i bruk. Skriv in ett nummer, till exempel 5000, för att ge nya punkter nummer från 5000 och uppåt; nummer som redan används hoppas över. Två punkter delar aldrig ett nummer på något sätt. Se [Markera, kopiera och klistra in mätpunkter](topic:copy-paste-points#point-numbers-never-clash).

## Punktetiketter

Vad en punktetikett visar när {{ui:Punktetiketter}} är på under **Visa**: **Nummer**, **Nummer och höjd** eller **Nummer, höjd och beskrivning** (startvärdet). DXF-, DWG- och PDF-exporterna visar samma etiketter som skärmen.

## Hörnindikator

Vad som sitter i hörnet på planen och i 3D-vyn: **ViewCube** (startvärdet), **Axelikon** eller **Ingen**.

- **ViewCube** (uppe till höger). På planen visar den ovansidan, med kompassringen: N är rutnätsnord (uppåt i planen). Klicka på någon annan sida, kant eller hörn på kuben, eller dra den, så öppnas [3D-vyn](topic:site-3d) och ser från dit. {{ui:Start}} på plankuben anpassar planen.
- I 3D-vyn vrids kuben med vyn: klicka på en sida, kant eller hörn för att se från dit, dra kuben för att kretsa runt, dra kompassringen för att vrida kring vertikalen, klicka på en bokstav för att se från den sidan, och använd {{ui:Start}} för isovyn av hela tomten. När du tittar rakt mot en sida tar de små pilarna dig till nästa sida, och de böjda pilarna vrider vyn en kvarts varv.
- **Axelikon** (nere till vänster): en liten markering för X (öst) och Y (nord) på planen, X, Y och Z (upp) i 3D.

## Vertikal överdrift i 3D

Hur mycket 3D-vyn sträcker höjderna: **1×**, **2×** (startvärdet), **3×**, **5×** eller **10×**. Listan i 3D-vyns fält är samma inställning, så att ändra något av dem ändrar båda. Volymer, profiler och 3D-exporter förblir i sann skala.

## Latitud och longitud

Hur statusfältet visar pekarens latitud och longitud när projektet har ett koordinatsystem: **grader, minuter och sekunder** (startvärdet, till exempel `30°18′00.00″ N`) eller **decimalgrader** (`30.300000° N`). Se [Ange projektets koordinatsystem](topic:coordinate-systems#latitude-and-longitude-in-the-status-bar).

## Kartlager från internet

**Av** (startvärdet) eller **På**. När den är på frågar CivilCraft de kartservrar du lägger till efter bilder av området på skärmen. Din ritning stannar på den här datorn; servern ser området och din internetadress. Medan den är av frågas ingen kartserver om något, även när ett projekt du öppnar anger en; en georefererad bild från en fil fungerar på båda sätten. Se [Visa kartlager under planen](topic:map-layers).

## Assistenter

**Låt AI-assistenter och skript använda CivilCraft** (av från början) låter en assistent på din dator nå den öppna tomten genom CadCraft Studio: **Läs** beskriver tomten och ger punkter, ythöjder, stationer, profiler, volymer och fastigheter; **Redigera** låter den markera och lägga till mätpunkter; **Spara** och **Exportera** låter den spara projektet och skriva LandXML eller DWG. **Mappar den får använda** (i Studio) är var den får spara och exportera. **Aktivitet** listar dess anrop. Se [Låt en AI-assistent arbeta med din tomt](topic:assistants).
