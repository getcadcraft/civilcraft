---
title: Enheter vid import: en fil anger sina enheter, eller så frågas du först
summary: När en ritning eller ett nät du hämtar in i ett projekt anger sina enheter omvandlar CivilCraft det och säger det. När den inte gör det frågar CivilCraft innan den läser in filen och minns ditt svar för just den filen.
keywords: enheter, import, DWG, DXF, STL, OBJ, mätning, fot, US survey feet, meter, millimeter, skala, fel storlek, för stor, för liten, fråga, minns, INSUNITS, ritningsenheter
from: 60921963
---

## Vad du gör

Hämtar in en fil i ett projekt och ser till att den kommer in i rätt storlek.

## Steg

1. Öppna filen som vanligt: {{ui:Öppna}}, släpp den på planen, eller CAD-ritningskommandot.
2. Om filen anger sina enheter frågas inget: importdialogen visar dem som **Som ritningen anger**.
3. Om den inte gör det frågar en dialog efter **Enheter för** filen innan importdialogen öppnas. Välj vad en enhet i filen är och klicka på {{ui:Använd dessa enheter}}.
4. {{ui:Avbryt}} (eller {{key:Esc}}) hoppar över filen. Ingenting av den läses in i projektet.

## Vilka filer som anger sina enheter

- **DWG och DXF**: ritningens infogningsenheter (`$INSUNITS`). En fil utan dem frågas om. Listan **Ritningsenheter** i importdialogen börjar med ditt svar och kan fortfarande ändras.
- **STL och OBJ** (friformade landskapsformer): anger aldrig enheter. Du frågas.
- **Punktlistor** (CSV, TXT) och listor från lägesmätning: en lista som anger sin enhet i sina första rader omvandlas, och statusraden säger det. En lista som inte anger någon frågas om när du trycker på {{ui:Importera}}, innan punkterna läses in. Kolumner för latitud och longitud går i stället via koordinatsystemet.
- **Tillägget Punktmoln**: frågar när du bygger ett moln vars fil inte anger någon enhet, och märker molnets tal med den enhet det bär.
- **IFC och LandXML**: anger sina egna; de omvandlas till projektets enheter.
- **LAS, LAZ och höjdrasterbilder**: placeras efter sitt koordinatsystem; terrängdialogen frågar efter höjdenheten när filen inte anger den.

## Bra att veta

- Svaret minns för just den filen på den här datorn, i alla CadCraft-appar. Nästa gång den kommer in frågas du inte.
- För att bli frågad igen: kommandopaletten ({{key:Mod+K}}) › **Fråga igen om enheterna för importerade filer**.
- En enhet som en lista anger läses från dess första åtta rader: en rad som `units: ft`, eller kolumnrubriker som alla bär samma enhet inom hakparenteser, till exempel `Elevation (m)`.
