---
title: Grafica plantelor după scară, simboluri proprii și plante 3D
summary: Cum sunt desenate plantele în plan la fiecare scară de desen și nivel de detaliu și cum primește o înregistrare de plantă propriul simbol (SVG sau bloc DXF/DWG) și propriul model 3D (OBJ, STL sau GLB).
keywords: grafica plantelor, simbol de plantă, simbol după scară, nivel de detaliu, cerc simplu, contur, simbol detaliat, simbol propriu, bloc, svg, dxf, dwg, plantă 3D, model 3D propriu, obj, stl, glb, gltf, model de arbore, plante în 3D
from: 875837d9
---

## Simboluri în plan după scară

Peisaj › {{ui:Mai multe}} › {{ui:Grafică pentru plante}} stabilește cum sunt desenate plantele în plan. **Automat, după scară** alege unul dintre cele trei niveluri după scara de desen:

- **Cerc simplu** (mai grosier decât 1:500): un cerc la extinderea plantei.
- **Contur cu centru** (de la 1:500 la 1:200): cercul și o mică cruce centrală.
- **Simbol detaliat** (mai fin decât 1:200): simbolul propriu al înregistrării, dacă are unul, altfel simbolul încorporat.

Modificați cele două scări cu **Simplu de la 1:** și **Contur de la 1:**, sau alegeți un singur nivel pentru toate scările. Fiecare set de planșe din caseta Planșe are propriul **Detaliul plantelor în plan**, astfel încât un plan de situație la 1:500 și un plan de plantare la 1:100 pot diferi. Setările se salvează odată cu proiectul.

## Simbolul propriu

Selectați o plantă din secțiunea Plante și apăsați {{ui:Simbol propriu…}}. Se citește un SVG sau un bloc dintr-un desen DXF sau DWG (dacă desenul are mai multe blocuri, alegeți unul). Simbolul este ajustat la extinderea plantei și desenat la nivelul detaliat. Este păstrat în proiect, deci fișierul călătorește cu el.

- Un SVG este citit pentru liniile, polilinii, poligoanele, dreptunghiurile, cercurile, elipsele și traseele sale. Scripturile, stilurile, legăturile și imaginile din el nu sunt niciodată analizate. Transformările nu se aplică: vi se semnalează când fișierul le conține, deci aplatizați-le mai întâi în programul de desen.
- Limite: 512 KB de SVG și 2000 de forme. Un fișier mai mare este refuzat, cu motivul indicat.

## Planta 3D proprie

{{ui:Model 3D propriu…}} de pe aceeași înregistrare citește un fișier **OBJ**, **STL** sau **GLB**. Apoi, în Grafica plantelor, setați **Plante în 3D** la **Modelul propriu al fiecărei înregistrări**: fiecare plantă a acelei înregistrări arată modelul dvs., scalat la înălțimea și extinderea sa. Înregistrările fără model propriu păstrează formele încorporate. Alegeți **Mase simple** pentru vederi rapide ale șantierelor mari.

Un GLB este citit doar pentru formă:

- Tot ce are nevoie modelul trebuie să fie în interiorul fișierului .glb. Un model care trimite la alte fișiere (un .bin separat sau imagini după adresă) este refuzat: nimic nu este descărcat.
- Geometria comprimată sau împachetată (Draco, meshopt, poziții cuantificate) nu este citită. Exportați fără compresie.
- Texturile și culorile din fișier nu sunt folosite: modelul este desenat în culoarea plantei. Texturile sunt totuși verificate, iar o textură mai mare de 4096 de pixeli pe latură este refuzată.
- Limite: un fișier de 32 MB, 50 000 de triunghiuri (numărându-se fiecare copie a unei piese plasate de mai multe ori), 64 de imagini și 16 MB de imagini.

Fiecare limită refuză fișierul cu motivul indicat; nimic citit doar parțial nu este păstrat. Un pas de anulare îi dă înregistrării simbolul sau modelul, iar {{ui:Eliminare simbol propriu}} sau {{ui:Eliminare model 3D propriu}} le îndepărtează din nou.

Vezi [Înregistrări de plante](topic:plant-records) pentru înregistrarea în sine și [Vizualizarea amplasamentului în 3D](topic:site-3d).
