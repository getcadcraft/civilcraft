---
title: Eenheden bij importeren: een bestand geeft zijn eenheden op, of u wordt eerst gevraagd
summary: Wanneer een tekening of mesh die u in een project brengt zijn eenheden opgeeft, converteert CivilCraft die en zegt dat. Wanneer niet, vraagt CivilCraft eerst voordat het wordt ingelezen en onthoudt het uw antwoord voor dat bestand.
keywords: eenheden, importeren, DWG, DXF, STL, OBJ, meting, voet, US survey feet, meter, millimeter, schaal, verkeerd formaat, te groot, te klein, vragen, onthouden, INSUNITS, tekeningeenheden
from: 60921963
---

## Wat u gaat doen

Een bestand in een project brengen en zeker weten dat het in de juiste grootte binnenkomt.

## Stappen

1. Open het bestand zoals gewoonlijk: {{ui:Openen}}, sleep het op het plan, of gebruik het CAD-tekencommando.
2. Als het bestand zijn eenheden opgeeft, wordt er niets gevraagd: het importvenster toont ze als **Zoals in de tekening staat**.
3. Als dat niet zo is, vraagt een dialoogvenster naar de **Eenheden van** het bestand voordat het importvenster opent. Kies wat één eenheid in het bestand is en klik op {{ui:Deze eenheden gebruiken}}.
4. {{ui:Annuleren}} (of {{key:Esc}}) slaat het bestand over. Er wordt niets ervan in het project ingelezen.

## Welke bestanden hun eenheden opgeven

- **DWG en DXF**: de invoegeenheden van de tekening (`$INSUNITS`). Een bestand zonder die gegevens wordt ernaar gevraagd. De lijst **Tekeningeenheden** in het importvenster begint met uw antwoord en kan nog worden gewijzigd.
- **STL en OBJ** (vrije-vormterreinen): geven nooit eenheden op. U wordt gevraagd.
- **Puntenlijsten** (CSV, TXT) en voortgangsmetingen: een lijst die zijn eenheid in de eerste regels opgeeft, wordt omgezet, en de statusregel zegt dat. Een lijst zonder eenheid wordt ernaar gevraagd wanneer u op {{ui:Importeren}} drukt, voordat de punten worden ingelezen. Kolommen met breedte- en lengtegraad gaan in plaats daarvan via het coördinatenstelsel.
- **De add-on Puntenwolken**: vraagt wanneer u een wolk bouwt waarvan het bestand geen eenheid opgeeft, en labelt de getallen van de wolk met de eenheid die hij draagt.
- **IFC en LandXML**: geven hun eigen eenheden op; ze worden omgezet naar de eenheden van het project.
- **LAS, LAZ en hoogterasters**: worden geplaatst op hun coördinatenstelsel; het terreindialoog vraagt om de hoogte-eenheid wanneer het bestand die niet vermeldt.

## Goed om te weten

- Het antwoord wordt voor dat bestand op deze computer onthouden, in elke CadCraft-app. De volgende keer dat het binnenkomt, wordt u niet gevraagd.
- Om opnieuw gevraagd te worden: het opdrachtenpalet ({{key:Mod+K}}) › **Opnieuw vragen naar de eenheden van geïmporteerde bestanden**.
- Een eenheid die een lijst opgeeft, wordt gelezen uit de eerste acht regels: een regel zoals `units: ft`, of kolomkoppen die allemaal dezelfde eenheid tussen haakjes dragen, zoals `Elevation (m)`.
