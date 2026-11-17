---
title: Coordonate de teren și locale
summary: Lucrați în coordonate de teren (suprafață), scalate din grid printr-un factor de scară combinat pe care îl tastați sau îl calculați într-un punct, sau într-o rețea presupusă a amplasamentului, legată de sistem prin două puncte de control.
keywords: coordonate de teren, coordonate de suprafață, grid spre teren, factor de scară combinat, csf, factor combinat, factor grid, factor de cotă, factor nivel mării, convergență, unghi de proiecție, factor de scară, coordonate presupuse, coordonate locale, rețea de amplasament, 5000 5000, puncte de control, localizare, calibrare, două puncte, eroare de închidere
from: 3d7453de
---

Coordonatele State Plane și UTM sunt coordonate **grid**: o proiecție cartografică întinde sau micșorează distanțele puțin (zeci de părți pe milion), iar cu cât terenul este mai sus, cu atât o distanță măsurată pe teren diferă mai mult de cea din grid. Multe măsurători predau deci coordonate de **teren**, scalate astfel încât distanțele pe plan să fie egale cu distanțele măsurate pe teren, sau o rețea **presupusă** a amplasamentului (5000, 5000 într-un punct de control). CivilCraft își păstrează numerele ca atare și înregistrează cum se raportează ele la grid, astfel încât latitudinea și longitudinea, fișierele GIS și straturile de hartă ajung tot în locul potrivit.

Deschideți {{ui:Coordonate}} din grupul {{ui:GIS}}, alegeți (sau păstrați) sistemul, apoi alegeți sub **Coordonate grid, de teren sau locale**:

| Alegere | Coordonatele sunt | Cum se raportează la grid |
|---|---|---|
| {{ui:Grilă}} | Ale sistemului (punctul de plecare) | Aceleași numere |
| {{ui:Teren}} | Scalate la distanțe pe teren | grid = bază + factor combinat × (teren − bază) |
| {{ui:Local}} | O rețea presupusă a amplasamentului | Mutate, rotite și scalate pe grid prin două puncte de control |

Orice alegeți se salvează cu proiectul și este un pas de anulare; nimic nu se mută.

## Coordonate de teren

1. Alegeți {{ui:Teren}}.
2. Tastați **Factorul de scară combinat** din măsurătoare (de exemplu `0.99987`), sau calculați-l:
   1. Sub **Calculați factorul într-un punct**, punctul pornește de la mijlocul proiectului. Alegeți {{ui:Alegeți un punct pe plan}} și faceți clic pe locul dorit (un clic lângă un punct de măsurătoare ia acel punct), sau tastați E și N.
   2. Cota vine din suprafața de acolo; tastați alta dacă aveți nevoie.
   3. Alegeți {{ui:Calcul}}. CivilCraft afișează:
      - **Factorul de scară grid k**: cât întinde proiecția cartografică distanțele acolo.
      - **Factorul de cotă**: cu cât sunt mai scurte distanțele pe elipsoid decât la acea înălțime.
      - **Factorul combinat** = k × factorul de cotă: distanța grid = distanța pe teren × acesta.
      - **Convergența**: unghiul de la nordul grid la nordul adevărat de acolo (azimutul geodezic = azimutul grid + convergența).
   4. Alegeți butonul {{ui:Utilizare}} de sub numere, pentru a pune factorul combinat în casetă.
3. Stabiliți **Punctul de bază**, unde coordonatele de teren și cele grid sunt identice. Pornește de la 0, 0: majoritatea jurisdicțiilor care publică coordonate de teren scalează în jurul originii, așa că acestea rămân recognoscibil apropiate de cele grid. Unele măsurători scalează în jurul punctului de control al proiectului: folosiți ce spune măsurătoarea.
4. Alegeți {{ui:Aplicare}}.

:::warning
Cota este luată ca înălțime deasupra elipsoidului. CivilCraft nu are model de geoid, deci acolo unde geoidul este cu 30 m (100 ft) sub sau deasupra elipsoidului, factorul de cotă este greșit cu aproximativ 5 ppm. Când măsurătoarea își declară factorul combinat, tastați-l pe acela.
:::

## Coordonate locale (presupuse)

1. Alegeți {{ui:Local}}.
2. La **Punctul de control 1**, tastați numărul punctului de măsurătoare (sau alegeți {{ui:Alegere}} și faceți clic pe el pe plan). Coordonatele sale locale apar lângă el.
3. Tastați E și N **grid** ale sale, sau latitudinea și longitudinea sale în a treia casetă (de exemplu `30.2672, -97.7431`).
4. Procedați la fel pentru **Punctul de control 2**, cât mai departe de primul posibil.
5. CivilCraft afișează **Scara** și **Rotația** găsite și vă reamintește: **Două puncte se potrivesc mereu exact — verificați un al treilea.**
6. Dați un **Punct de verificare** la fel. CivilCraft arată cât de departe pune potrivirea punctul față de coordonatele grid tastate (eroarea sa de închidere, în unitățile proiectului și în părți pe milion). O eroare de închidere mare înseamnă un punct greșit, o greșeală de tastare sau coordonate într-o altă unitate.
7. Alegeți {{ui:Aplicare}}.

O scară departe de 1 (peste 0.5 până la 2) este refuzată: verificați punctele și unitățile lor.

## Ce a fost verificat

- Factorul de scară și convergența se potrivesc cu PROJ (pyproj 3.7.1 cu PROJ 9.5.1), biblioteca de coordonate pe care o folosesc majoritatea programelor GIS, până la o parte din miliard, pe peste 300 de sisteme cu proiecții conforme (state plane, UTM, Mercator transversal, conică conformă Lambert), iar în browser într-un punct ales pe plan.
- Pașii de teren și cei locali se convertesc înapoi și înainte până la o parte din miliard; două puncte de control redau scara și rotația cu care au fost făcute; un punct de verificare aflat la 0.05 ft oferă o eroare de închidere de 0.05 ft.
