---
title: Unități la import: un fișier își declară unitățile sau vi se cere mai întâi
summary: Când un desen sau o plasă pe care o aduceți într-un proiect își declară unitățile, CivilCraft le convertește și spune asta. Când nu le declară, CivilCraft întreabă înainte de citire și reține răspunsul pentru acel fișier.
keywords: unități, import, DWG, DXF, STL, OBJ, topografie, picioare, US survey feet, metri, milimetri, scară, dimensiune greșită, prea mare, prea mic, întrebare, reținut, INSUNITS, unități desen
from: 60921963
---

## Ce veți face

Aduceți un fișier într-un proiect și sigurați-vă că intră la dimensiunea corectă.

## Pași

1. Deschideți fișierul ca de obicei: {{ui:Deschidere}}, trageți-l pe plan sau folosiți comanda de desen CAD.
2. Dacă fișierul își declară unitățile, nu se întreabă nimic: caseta de import le arată ca **Ca în desen**.
3. Dacă nu, o casetă cere **Unități de** pentru fișier înainte să se deschidă caseta de import. Alegeți ce înseamnă o unitate în fișier și faceți clic pe {{ui:Folosește aceste unități}}.
4. {{ui:Anulare}} (sau {{key:Esc}}) omite fișierul. Nimic din el nu este citit în proiect.

## Ce fișiere își declară unitățile

- **DWG și DXF**: unitățile de inserare ale desenului (`$INSUNITS`). Un fișier fără ele este întrebat. Lista **Unități desen** din caseta de import pornește de la răspunsul dat și poate fi schimbată în continuare.
- **STL și OBJ** (forme libere de teren): nu declară niciodată unități. Vi se cere.
- **Liste de puncte** (CSV, TXT) și liste de măsurători topografice: o listă care își declară unitatea în primele rânduri este convertită, iar linia de stare spune asta. Una care nu declară nimic este întrebată când apăsați {{ui:Import}}, înainte ca punctele să intre. Coloanele de latitudine și longitudine trec în schimb prin sistemul de coordonate.
- **Suplimentul pentru nor de puncte**: întreabă când construiți un nor al cărui fișier nu declară o unitate și etichetează numerele norului în unitatea pe care o poartă.
- **IFC și LandXML**: își declară unitățile; sunt convertite în unitățile proiectului.
- **LAS, LAZ și rastere de cote**: sunt plasate după sistemul lor de coordonate; dialogul de teren cere unitatea de cotă când fișierul nu o spune.

## De reținut

- Răspunsul este reținut pentru acel fișier, pe acest calculator, în toate aplicațiile CadCraft. Data următoare când intră, nu vi se mai cere.
- Pentru a fi întrebat din nou: paleta de comenzi ({{key:Mod+K}}) › **Întrebați din nou pentru unitățile fișierelor importate**.
- O unitate pe care o declară o listă este citită din primele opt rânduri: un rând ca `units: ft`, sau titluri de coloane care poartă toate aceeași unitate între paranteze, ca `Elevation (m)`.
