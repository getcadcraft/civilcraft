---
title: Desenarea parcelelor și scrierea descrierilor cadastrale
summary: Desenați o parcelă după colțurile ei sau introduceți măsurătorile dintr-un act sau dintr-un plan cadastral, verificați cât de bine se închid măsurătorile, etichetați orientările și distanțele în plan, transformați orice segment într-o curbă și copiați un proiect de descriere cadastrală.
keywords: parcele, loturi, limite de proprietate, limită, act, plan cadastral, măsurători, orientare, distanță, închidere, eroare de închidere, precizie, descriere cadastrală, punct de început, curbă, rază, arie, acri
from: 6793d6ce
---

Parcelele stau pe plan, cu orientarea și distanța pe fiecare segment drept (o curbă arată raza, lungimea și unghiul la centru), iar numele și aria lor la mijloc. Ele intră în trasarea PDF și în exporturile DWG și DXF, pe straturile `V-PROP` (linii) și `V-PROP-TEXT` (etichete). Totul se găsește sub **Parcele** în panoul din dreapta, când nimic nu este selectat.

## Desenarea unei parcele

1. Faceți clic pe **Desenare parcelă**.
2. Faceți clic pe colțuri, începând cu punctul de început. Un clic lângă un punct topografic preia exact poziția acelui punct.
3. Faceți clic din nou pe primul colț sau apăsați {{key:Enter}}, pentru a încheia. {{key:Backspace}} anulează ultimul colț; {{key:Esc}} renunță la colțurile de până acum; apăsați din nou pentru a ieși din instrument.

## Introducerea măsurătorilor dintr-un act

1. Faceți clic pe **Introducere măsurători din act**.
2. Spuneți de unde încep măsurătorile: numărul unui punct topografic sau o coordonată nord și est.
3. Scrieți sau lipiți măsurătorile, câte una pe rând:
   - un segment: o orientare și o distanță, cum ar fi `N 45°30'15" E 125.50`. Sunt acceptate și `N45-30-15E`, `N 45 30 15 E`, `N 45.5 E` și azimuturi (`AZ 45°30'15"`); cuvintele „thence”, virgulele și „feet” sunt ignorate.
   - o curbă: `C R 300 L 52.36 right` (raza și lungimea arcului) sau `C R 300 D 10°00'00" left` (raza și unghiul la centru). O curbă urmează segmentului de dinaintea ei; când nu urmează, adăugați orientarea coardei: `C R 300 L 52.36 right CB N 50 00 00 E`.
   - `#` începe un rând de comentariu.
4. Pe măsură ce scrieți, caseta afișează lungimea măsurătorilor, **eroarea de închidere** (cât de departe de început se termină și în ce direcție), **precizia** (lungimea împărțită la eroarea de închidere, 1 : 10,000 și așa mai departe) și aria. Rândurile pe care nu le poate citi sunt listate cu numerele lor.
5. Faceți clic pe **Adăugare parcelă**. Când măsurătorile nu se închid, parcela se închide cu un segment drept peste gol: verificați măsurătorile față de act. Pentru a împărți eroarea unei poligonale de teren pe segmentele ei, ajustați-o mai întâi.

## Curbe

În **Proprietățile** unei parcele, fiecare segment are o **Rază**. Scrieți una pentru a face acel segment o curbă între aceleași două colțuri (o rază mai mică decât jumătate din distanța dintre colțuri nu poate fi atinsă și este refuzată), apoi alegeți **Dreapta** sau **Stânga** la **Curbe**: o curbă spre dreapta are centrul în dreapta sensului de parcurs, ca într-un act. Ștergeți raza pentru a face segmentul din nou drept. Fiecare modificare este un pas: {{key:Mod+Z}} o anulează.

## Descrierea cadastrală

Proprietățile unei parcele se încheie cu descrierea sa cadastrală, scrisă după desen:

- „Beginning at” (început la) **Punctul de început** pe care îl scrieți (de exemplu „colțul de nord-est al Lotului 4”), altfel coordonata nord și est a primului colț, sau punctul topografic de la care au început măsurătorile.
- „thence” (apoi) fiecare segment: o orientare și o distanță, sau o curbă cu raza, lungimea arcului, unghiul la centru, orientarea și distanța coardei.
- „Containing” (având o suprafață de) aria sa în picioare pătrate și acri (metri pătrați și hectare într-un proiect în metri).

**Copiere** pune descrierea în clipboard; **Descărcare ca text** o salvează ca fișier `.txt`.

:::warning
Descrierea cadastrală este un proiect realizat după desen, nu un plan topografic. Un topograf autorizat trebuie să o verifice față de documentele de evidență și să o semneze înainte ca cineva să se bazeze pe ea.
:::

Faceți clic în interiorul unei parcele de pe plan pentru a o selecta; {{key:Delete}} o elimină. Parcelele se salvează în fișierul de proiect.
