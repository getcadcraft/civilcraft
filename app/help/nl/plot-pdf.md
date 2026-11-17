---
title: Het plan naar PDF plotten
summary: Alles of het huidige beeld plotten naar een vector-PDF op een standaardblad, op een technische of metrische schaal, in laagkleuren of zwart.
keywords: plotten, afdrukken, pdf, blad, schaal, papierformaat, plan-blad, publiceren, titelblok, noordpijl, schaalbalk
from: 9af396ca
---

{{ui:PDF}} plot het plan naar een vector-PDF op één blad, met een titelstrook, een noordpijl en een schaalbalk. De PDF wordt in de browser gemaakt en gedownload; het gaat niet via het afdrukvenster van de browser.

## Plotten

1. Stel het plan in onder **Weergave**: het getoonde oppervlak, het hoogtelijninterval en wat er aan staat. De plot volgt deze instellingen.
2. Wilt u maar een deel van het terrein, zoom en verschuif het plan erheen.
3. Klik op {{ui:PDF}} in de groep **Exporteren**, of druk op {{key:Mod+P}}.
   Het dialoogvenster **Het plan naar PDF plotten** opent.
4. Kies het **Gebied**: {{ui:Everything}} of {{ui:What is on screen}}.
5. Kies het **Papier**: Letter, Tabloid, ANSI D, ARCH D, ISO A4, A3 of A1. Een project in voet begint op Tabloid, een project in meter op A3. Bladen zijn altijd liggend.
6. Kies de **Schaal**. De lijst markeert de grootste schaal die past met "(past)" en selecteert die.
   - Voet: 1" = 5', 10', 20', 30', 40', 50', 60', 100', 200', 300', 400', 500', 1000'.
   - Meter: 1:50, 1:100, 1:200, 1:250, 1:500, 1:1000, 1:2000, 1:2500, 1:5000, 1:10000.
7. Kies de **Inkt**: {{ui:Layer colors}} of {{ui:Black}}.
8. Lees de regel onder de keuzes. Die geeft de grootte van het gebied op papier en het bladformaat, bijvoorbeeld "Het gebied is 297 × 222 mm bij 1" = 40' op een blad van 432 × 279 mm (liggend)."
9. Klik op {{ui:Download PDF}}.
   De browser downloadt `<name>.pdf`. De statusbalk meldt "<name>.pdf geplot bij 1" = 40'."

Is het gebied bij de gekozen schaal groter dan het blad, dan wordt de plot gecentreerd en worden de randen afgesneden. Kies de schaal met "(past)" of een groter blad.

## Wat er op het blad staat

- Het plan, gecentreerd in het tekengebied, als echte vectoren: hoogtelijnen, labels, tracés met stationering, corridors, plateaus en ontgravingslijnen, leidingen, punten.
- Lijndiktes per laag: tracés, plateaus en leidingen zwaarder; driehoeken en tussenhoogtelijnen fijn.
- Een titelstrook langs de onderkant met de projectnaam **Naam**, de schaal, een notitie van het hoogtelijninterval en welk oppervlak (bestaand of ontworpen), en rechts de datum en het buildnummer.
- Een noordpijl rechtsboven (plan-noord staat boven) en een schaalbalk in de titelstrook.
- De kaartlagen onder het plan (een afbeelding, kaarttegels of een kaartdienst), wanneer **Kaartlagen onder het plan** is aangevinkt: ze worden als één afbeelding van het hele tekengebied getekend, op 150 dpi, onder het lijnwerk, en de bronvermelding van een kaart komt in de titelstrook. CivilCraft wacht tot 8 seconden op kaartafbeeldingen die nog binnenkomen; als er dan nog ontbrekende zijn, meldt de statusbalk dat.

Tekst gebruikt de ingebouwde Helvetica van de PDF. Tekens buiten de West-Europese set (Windows-1252) worden als "?" afgedrukt, en het statusbericht telt ze.

## Wat niet geplot wordt

- Hoogtebanden.
- De profielweergave. Het plotten van profielen is nog niet beschikbaar.
- Meer dan één blad (voor een tracé, gebruik [plan- en profielbladen](topic:plan-profile-sheets)), viewports, een eigen titelblok of staande bladen.

:::note
Het dialoogvenster meldt dat helling-pijlen alleen op het scherm staan. In deze build worden helling-pijlen die onder **Weergave** aan staan wel geplot (en naar DXF geëxporteerd). Zet ze uit voor het plotten als u ze niet wilt.
:::

## Afdrukken op papier

Open de gedownloade PDF in een PDF-viewer en druk af op 100% (werkelijke grootte), zodat de schaal klopt. Met "Op pagina passen" verandert de schaal.
