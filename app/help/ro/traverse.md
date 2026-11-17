---
title: Introducere drumuire și compensare prin regula busolei
summary: Introduceți unghiurile de teren sau orientările și distanțele, verificați închiderea unghiulară și liniară și precizia, compensați prin regula busolei și adăugați pichetele ca puncte topografice sau bucla ca parcelă.
keywords: drumuire, drumuire închisă, buclă, unghiuri la dreapta, vizare înapoi, orientări, distanțe, închidere, eroare de închidere, precizie, regula busolei, bowditch, compensare, topografie
from: 56ce5a8c
---

O drumuire este un șir de laturi măsurate: în fiecare pichet, un unghi (sau o orientare) și o distanță până la următorul. Faceți clic pe **Introducere drumuire** sub **Drumuire** în panoul din dreapta, când nu este selectat nimic.

## Unde începe și unde se termină

1. **Pornire din punct topografic**: numărul său. Sau introduceți X (nord) și Y (est).
2. **Laturile ca**: **Unghiuri la dreapta și distanțe** sau **Orientări și distanțe**.
3. Cu unghiuri, precizați de unde pornesc: un **Punct topografic de vizare înapoi** sau **azimutul său** (de la primul pichet spre vizarea înapoi, în sens orar de la nord).
4. **Capete**: **înapoi la început (o buclă)** sau **pe punct topografic** și numărul său (o drumuire deschisă între puncte cunoscute).

## Introduceți laturile

O latură pe un rând, apoi distanța, apoi un nume pentru pichetul la care ajunge, dacă doriți:

- Unghiuri la dreapta, măsurate în sens orar în pichetul de unde pleacă latura, de la pichetul din spate la următorul: `270°00'10" 125.50 B`. `270-00-10`, `270 00 10` și `270.0028` funcționează și ele.
- Orientări: `N 45°30'15" E 125.50 B`, sau un azimut ca un singur cuvânt: `AZ 45-30-15 125.50 B`.
- La o buclă cu unghiuri, încheiați cu `close` și unghiul din punctul de start din nou, măsurat de la ultimul pichet spre al doilea: `close 270°00'05"`. Acesta verifică unghiurile.

Liniile care nu pot fi citite sunt listate cu numerele lor de rând. „feet”, virgulele și liniile de comentariu cu `#` sunt în regulă.

## Citiți închiderea

Pe măsură ce scrieți, caseta arată:

- **Eroarea unghiulară de închidere**: cât de departe sunt unghiurile de a se închide și partea fiecărui unghi. Fără un unghi de închidere, unghiurile nu sunt verificate, iar orice eroare din ele apare în eroarea liniară de închidere.
- **Eroarea liniară de închidere**: cât de departe de locul unde ar trebui să se termine drumuirea se termină aceasta și în ce direcție.
- **Precizia**: lungimea drumuirii împărțită la eroarea liniară de închidere: 1 : 10,000 înseamnă 1 ft la 10,000 ft.
- Pichetele după compensare și cât de mult s-a deplasat fiecare.

## Compensarea

Întâi eroarea unghiulară de închidere se distribuie în mod egal între unghiuri. Apoi eroarea liniară se distribuie pe laturi prin regula busolei (Bowditch): fiecare pichet se deplasează împotriva erorii proporțional cu lungimea parcursă până la el, astfel încât drumuirea se termină exact unde trebuie.

:::note
Regula busolei este o compensare standard, nu una prin cele mai mici pătrate, și nu ponderează unghiurile față de distanțe. Dacă precizia este suficientă, hotărăsc standardele proprii și cele ale jurisdicției.
:::

## Folosiți rezultatul

- **Adăugare ca puncte topografice**: pichetele compensate devin puncte topografice cu numele date (altfel următoarele numere libere), cu descrierea `TRAV`, fără cotă. Ultimul pichet al unei bucle este cel de start, deci nu este adăugat de două ori. Pentru a o anula: {{key:Mod+Z}}.
- **Adăugare ca parcelă** (bucle): pichetele compensate devin o [parcelă](topic:parcels), cu etichetele și descrierea cadastrală ale sale.
- **Raport (CSV)**: liniile de închidere, apoi direcția, distanța, coordonatele necompensate și compensate și corecțiile fiecărui pichet.
