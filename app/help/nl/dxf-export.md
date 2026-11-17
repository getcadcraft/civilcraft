---
title: Het plan exporteren naar DXF
summary: Schrijft de planlijnen als R12-DXF op benoemde lagen, met hoogtelijnen op hun hoogte en breeklijnen in 3D, voor elk CAD-programma.
keywords: dxf, dwg, cad, exporteren, lijnwerk, r12, 2000, 2004, 2007, 2010, 2013, 2018, lagen, hoogtelijnen, tekenuitwisseling, achtergrondkaart, achtergrond
from: f2d8ede9
---

{{ui:DXF}} schrijft wat het plan toont als DXF-bestand in de R12-indeling, de versie die elk CAD-programma opent. Als u AutoCAD of Civil 3D hebt gebruikt, opent of invoegt u het zoals elk ander DXF-bestand.

## Exporteren

1. Stel het plan in zoals u de tekening wilt: kies onder **Weergave** het terrein (bestaand of ontwerp), het hoogtelijninterval en welke onderdelen aan staan (hoogtelijnen, labels, punten, puntlabels, driehoeken, breeklijnen, terreinrand, leidingen, hellingpijlen).
2. Klik op {{ui:DWG/DXF}} in de groep **Exporteren** en kies {{ui:DXF (R12, text) — het eenvoudige uitwisselbestand}}, en klik daarna op {{ui:Downloaden}}.
3. De browser downloadt `<name>.dxf`. De statusbalk zegt bijvoorbeeld "Geëxporteerd R12-DXF: 2,140 objecten; labels op maat voor 1" = 40'. Banden worden niet geëxporteerd."

Coördinaten worden geschreven in uw projecteenheden, op hun echte waarden (State Plane-coördinaten blijven zoals ze zijn). Niets wordt geschaald of verplaatst.

## Wat in het bestand zit

| Onderdeel | DXF-entiteit | Laag |
|---|---|---|
| Kleine en hoofdhoogtelijnen | 2D-polylijnen op hun hoogte | C-TOPO-MINR, C-TOPO-MAJR |
| Hoogtelijnlabels | Tekst | C-TOPO-TEXT |
| Driehoeken | Polylijnen | C-TOPO-TINN |
| Breeklijnen en begrenzing | 3D-polylijnen | C-TOPO-BRKL |
| Terreinrand | Polylijnen | C-TOPO-BNDY |
| Hellingpijlen | Polylijnen | C-TOPO-SLOP |
| Meetpunten en hun labels | Punten (met hoogte), tekst | V-NODE, V-NODE-TEXT |
| Lijnen uit lijncodes | 3D-polylijnen | V-NODE-LINE |
| Tracé-as | Lijnen en bogen | C-ROAD-CNTR |
| Stationering-streepjes en labels | Polylijnen, tekst | C-ROAD-STAN |
| Corridorranden | Polylijnen | C-ROAD-CORR |
| Dwarsprofiellijnen | Polylijnen | C-ROAD-SCTN |
| Plateaus, ontgravingslijnen, hellingslijnen | Polylijnen | C-GRAD-PADS, C-GRAD-DAYL, C-GRAD-SLOP |
| Elementlijnen | 3D-polylijnen (bogen als stukken binnen 0.01; zie [Elementlijnen](topic:feature-lines)) | C-GRAD-FEAT |
| Zwenkbanen | Polylijnen, tekst | C-ROAD-SWPT |
| Leidingen, kunstwerken, labels | Polylijnen, tekst | C-STRM-PIPE, C-STRM-STRC, C-STRM-TEXT |
| Leidingen en kunstwerken met problemen | Polylijnen | C-STRM-PROB |

Elke laag heeft een kleur. De volledige lijst staat bij [Planlagen](topic:plan-layers).

## Labelgrootte

Tekst moet een grootte hebben in tekeningeenheden. CivilCraft bepaalt de grootte van labels voor de schaal waarop het hele plan past op een Tabloid-blad (feet) of een A3-blad (meter), en de statusmelding zegt welke schaal dat is. Plot u op een andere schaal in uw CAD-programma, schaal de tekst dan daar.

## Wat niet wordt geëxporteerd

- Hoogtebanden (alleen op het scherm).
- De profielweergave. Profielen gaan naar LandXML, niet naar een tekening.
- Het terrein zelf als 3D-object. Gebruik LandXML voor de TIN, of schakel {{ui:Driehoeken}} in om de randen als lijnwerk te krijgen.
- Alles wat u onder **Weergave** hebt uitgeschakeld.

## DWG

{{ui:DWG/DXF}} schrijft hetzelfde lijnwerk ook als DWG-tekening. In het dialoogvenster vraagt het naar het formaat: DXF, of een DWG van 2000, 2004, 2007, 2010, 2013 of 2018. 2000 opent in bijna elk CAD-programma, oud en nieuw; kies een nieuwere versie wanneer degene die de tekening krijgt daarom vraagt. Uw keuze wordt in deze browser onthouden.

1. Klik op {{ui:DWG}} in de groep **Exporteren**.
2. Kies het **Formaat** en klik op **DWG downloaden**.
3. De browser downloadt `<name>.dwg`. De statusbalk zegt wat erin zit, bijvoorbeeld "Geëxporteerd DWG (2018-formaat): 12 polylijnen, 40 labels op 9 lagen".

De DWG heeft dezelfde lagen, kleuren, hoogtelijnen (als polylijnen op hun hoogte), 3D-breeklijnen, labels en punten als de DXF, in dezelfde coördinaten. Laagnamen die een DWG niet kan bevatten worden gewijzigd, en de statusmelding zegt dat. CivilCraft schrijft DWG met eigen code, dus er verlaat niets uw computer.

### Kaartlagen in de DWG

Een DWG-tekening kan geen afbeelding in zich houden: CAD-programma's tonen een afbeelding die naast de tekening staat. Als kaartlagen zichtbaar zijn, biedt het dialoogvenster **Kaartlagen als afbeelding naast de tekening**. Met dit vinkje aan is de download een `.zip` met `<name>.dwg`, `<name>-map.png` (de kaartlagen over de hele tekening, tot 4,096 pixels breed) en `<name>-map.pgw` (het wereldbestand, voor GIS-programma's). De tekening toont de afbeelding als rasterafbeelding op laag G-MAP-IMAG, op de juiste plek. Pak de bestanden uit in één map en houd ze bij elkaar.
