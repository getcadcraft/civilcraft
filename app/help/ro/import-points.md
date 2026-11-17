---
title: Importul punctelor topografice
summary: Deschideți un fișier de puncte CSV sau text, verificați ordinea coloanelor în caseta de dialog Import puncte, corectați rândurile care nu pot fi citite și sortați punctele în grupuri.
keywords: import puncte, csv, txt, pnezd, penzd, fișier de puncte, topografie, puncte cogo, grupuri de puncte, coloane, coordonate X Y
from: ad33d88a
---

Un fișier de puncte este un fișier text cu câte un punct pe rând: numărul punctului, X (Nord), Y (Est), cota și descrierea, într-o ordine oarecare, separate prin virgule, tabulatori, punct și virgulă sau spații. CivilCraft îl citește în browser și construiește imediat o suprafață din el.

## Înainte de a începe

- Aflați ordinea coloanelor fișierului, dacă puteți (PNEZD și PENZD arată la fel pentru un calculator).
- Aflați unitățile sale. CivilCraft nu le convertește: setați **Unități** în panoul din stânga potrivit fișierului (vezi [Unități, pichete și formate de număr](topic:units-and-stations)).
- Coordonatele pot fi mari (X și Y din proiecția de stat, în milioane, sunt în regulă).

## Importul fișierului

1. Faceți clic pe {{ui:Deschidere}} din bara de instrumente sau apăsați {{key:Mod+O}} și alegeți fișierul. Îl puteți trage și pe plan.
   Se deschide caseta de dialog **Import puncte**, cu numele fișierului, o listă **Coloane** setată pe {{ui:Detectare}}, o linie de sumar și primele șase puncte.
2. Citiți linia de sumar. Ea spune câte puncte au fost citite, în ce ordine a coloanelor, cum a fost găsită ordinea și ce separă coloanele. Cele trei moduri în care este găsită ordinea:
   - „din rândul de antet”: prima linie numește coloanele (Point, Northing, Easting, Elevation, Description, sau X, Y, Z …). Este cel mai sigur.
   - „cum ați ales”: ați ales o ordine în **Coloane**.
   - „ghicită din numărul de coloane și din setarea rândului de puncte (PNEZD) — verificați ca X și Y să nu fie inversate”: nu a existat un antet utilizabil. Dacă fișierele au de obicei estul primul, setați **Rândurile de puncte** la P, E, N, Z, D în [Setările CivilCraft](topic:settings).
3. Verificați tabelul de previzualizare. Coloanele sale sunt mereu **Punct**, **X (Nord)**, **Y (Est)**, **Cotă**, **Descriere**, indiferent de ordinea din fișier. Coordonatele X și Y ale unui sit real au de obicei mărimi clar diferite: dacă par inversate, ghicirea a fost greșită.
4. Dacă ordinea este greșită, alegeți-o pe cea corectă în **Coloane** (de exemplu {{ui:PENZD — punct, Y (Est), X (Nord), cotă, descriere}}). Sumarul și previzualizarea se actualizează imediat.
5. Priviți sub previzualizare pentru **Rânduri necitite**. Fiecare linie numește numărul liniei din fișier, motivul și începutul rândului. Vezi [Rândurile care nu sunt citite](topic:import-points#rows-that-are-not-read).
6. Faceți clic pe {{ui:Import}}.
   Punctele apar pe plan, vederea se apropie de ele și suprafața se construiește. Bara de stare spune, de exemplu, „Importate 276 de puncte din site.csv; suprafață: 546 de triunghiuri.”

Dacă proiectul nu avea încă un nume, va lua numele fișierului.

## Verificarea grupurilor

Fiecare punct aparține unui grup denumit după **primul cuvânt al descrierii sale**, cu majuscule: „GRD”, „FL 12” și „fl” sunt grupurile GRD, FL și FL. Punctele fără descriere merg în „(fără descriere)”.

1. Uitați-vă la tabelul de sub **Puncte** din panoul din stânga: grup, numărul de puncte și o alegere de **Suprafață**.
2. Fiecare grup începe ca {{ui:Puncte}}. Schimbați liniile de curgere, marginile de pavaj, vârfurile și piciorul taluzelor, culmile și liniile codificate asemănător în {{ui:Linie de rupere}}. Setați grupurile care nu trebuie să modeleze terenul (puncte de control, vârfuri de copaci, stâlpi de utilități măsurați de sus) la {{ui:Omis}}.
3. Faceți clic pe un punct de pe plan (cu {{ui:Selectare}}) ca să vedeți numărul, coordonatele, cota, descrierea și grupul lui în panoul din dreapta.

:::warning
Un grup de linii de rupere unește **toate** punctele sale într-o **singură** linie, în ordinea numerelor de punct. Asta funcționează când fiecare linie codificată a fost măsurată în ordine, cu codul ei propriu. Două linii de curgere separate, ambele codificate „FL”, devin o linie în zig-zag între ele. Dacă codurile sunt comune, folosiți instrumentul {{ui:Linie de rupere}} ca să faceți clic pe punctele fiecărei linii (vezi [Construirea și rafinarea suprafeței](topic:build-surface)).
:::

## Rândurile care nu sunt citite

| Motiv afișat | Ce înseamnă | Ce de făcut |
|---|---|---|
| „X or Y is not a number” | O coloană de coordonate conține text | Verificați ordinea coloanelor sau un rând cu text rătăcit la mijlocul fișierului |
| „elevation is not a number” | Coloana cotei conține text | Ordine greșită a coloanelor sau o descriere în coloana cotei |
| „no point number” | Coloana punctului este goală | Numerotați punctul sau alegeți o ordine fără P (NEZD, NEZ …): punctele sunt atunci numerotate 1, 2, 3 … |
| „point 12 appears twice (the first one is kept)” | Două rânduri au același număr | Renumerotați unul dintre ele în fișier, dacă ambele sunt măsurători reale |
| „3 columns, expected 5 (PNEZD)” | Rândul este scurt | O linie ruptă sau ordinea greșită a coloanelor |

Un punct cu cota goală este păstrat, dar nu este folosit în suprafață. Datele din **Puncte** arată câte puncte au cotă.

Liniile care încep cu `#`, `;` sau `//` sunt comentarii și sunt sărite. Rândurile goale sunt sărite.

## Înlocuirea sau adăugarea punctelor

Importul din nou **înlocuiește** toate punctele; nu le adaugă la cele existente. Aliniamentele, platformele, conductele, liniile de rupere desenate și limita rămân. Istoricul de anulare este șters, deci salvați proiectul mai întâi dacă ați putea dori înapoi punctele vechi. Pentru a combina două fișiere, uniți-le într-un editor de text sau de tabele înainte de import (aveți grijă la numerele de punct repetate).

Punctele nu pot fi mutate, editate sau șterse încă în CivilCraft. Corectați-le în fișier și importați din nou.

## Înrudite

- [Formatele fișierelor de puncte](topic:point-file-formats): fiecare ordine a coloanelor și cum sunt recunoscute antetele.
- [Construirea și rafinarea suprafeței](topic:build-surface).
