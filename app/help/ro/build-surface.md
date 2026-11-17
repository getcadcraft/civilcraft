---
title: Construirea și rafinarea suprafeței
summary: Cum triangulează CivilCraft terenul natural și cum îl modelați cu grupuri de linii de rupere, linii de rupere desenate, o limită exterioară și cea mai lungă muchie exterioară.
keywords: tin, suprafață, triangulare, linie de rupere, limită, teren natural, eg, creare suprafață, delaunay, triunghiuri, muchie maximă, limită exterioară
from: b9eea3f3
---

CivilCraft are o singură suprafață de teren natural per proiect. Este un TIN (rețea neregulată triangulată) construit din punctele proiectului și se reconstruiește automat de fiecare dată când se schimbă o intrare. Nu există comandă de „reconstruire” și nicio suprafață învechită.

## Ce intră în suprafață

- Fiecare punct cu altitudine dintr-un grup setat la {{ui:Puncte}}.
- Fiecare grup setat la {{ui:Linie de rupere}}, unit în ordinea numerelor de punct.
- Fiecare linie de rupere desenată cu instrumentul {{ui:Linie de rupere}}.
- Limita exterioară, dacă desenați una.
- Setarea **Cea mai lungă muchie exterioară**.

Triunghiurile nu traversează niciodată o linie de rupere: suprafața este forțată să o urmeze, apoi făcută cât mai uniform posibil în jurul ei (Delaunay în rest).

## Transformarea liniilor codificate în linii de rupere

1. În panoul din stânga, sub **Puncte**, găsiți grupul (de exemplu FL).
2. Setați alegerea sa **Suprafață** la {{ui:Linie de rupere}}.
   Suprafața se reconstruiește, linia este desenată în portocaliu (cu {{ui:Linii de rupere}} activat sub **Afișare**), iar **Linii de rupere** din datele suprafeței crește cu unu.
3. Verificați linia pe plan. Trebuie să treacă punct cu punct, în ordinea în care a fost măsurată. Dacă face zigzaguri, grupul conține mai multe linii sau punctele nu sunt numerotate în ordine: setați grupul înapoi la {{ui:Puncte}} și desenați liniile manual (secțiunea următoare).

## Desenarea unei linii de rupere prin puncte

1. Apăsați {{key:B}} sau faceți clic pe {{ui:Linie de rupere}} din grupul **Suprafață**.
   Sugestia spune „Linie de rupere: faceți clic pe punctele de releveu în ordine (ia altitudinile lor). Enter termină.”
2. Mutați cursorul aproape de un punct. Un mic pătrat portocaliu marchează punctul pe care îl va lua.
3. Faceți clic pe punctele liniei unul după altul. Fiecare clic numește punctul și altitudinea sa în bara de stare.
4. Apăsați {{key:Enter}} pentru a termina.
   Bara de stare spune „Linia de rupere 1 adăugată; suprafața a fost reconstruită.”

Clicurile trebuie să cadă pe un punct de releveu cu altitudine; un clic în altă parte este refuzat cu „Faceți clic pe un punct de releveu cu altitudine: o linie de rupere ia altitudinile punctelor.” {{key:Backspace}} elimină ultimul punct; {{key:Esc}} anulează întreaga linie.

:::warning
Încheiați cu {{key:Enter}}. Dublu clicul încheie și el, dar în această versiune elimină punctul pe care l-ați făcut dublu clic. Faceți clic o dată pe ultimul punct, apoi apăsați {{key:Enter}}.
:::

Pentru a elimina toate liniile de rupere desenate deodată, faceți clic pe {{ui:Eliminare linii de rupere desenate}} din secțiunea **Suprafață**. Pentru a elimina doar ultima, folosiți {{key:Mod+Z}}. Liniile de rupere desenate nu pot fi încă selectate sau editate una câte una.

## Desenarea limitei exterioare

O limită taie suprafața la zona în care aveți încredere, de exemplu limitele releveului, astfel încât triunghiurile lungi peste colțurile nerelevate să dispară.

1. Apăsați {{key:O}} sau faceți clic pe {{ui:Limită}}.
2. Faceți clic pe colțurile în ordine în jurul zonei. O linie punctată arată forma.
3. Apăsați {{key:Enter}}.
   Bara de stare spune „Limită setată; triunghiurile din afara ei au dispărut.” **Limită** din datele suprafeței spune „Da” și numărul de colțuri.

Lucruri de știut:

- Există o singură limită. Desenarea alteia o înlocuiește. {{ui:Eliminare limită}} o înlătură.
- Poate doar să taie: o limită care depășește punctele este redusă până la conturul lor, cu nota „Limita depășește punctele; a fost redusă până la conturul lor.”
- Colțurile sale își iau altitudinile din suprafață, astfel încât marginea urmează exact terenul.
- Limitele ascunse (interioare) nu sunt disponibile încă.

## Tăierea triunghiurilor lungi exterioare

Fără limită, suprafața umple întregul contur al punctelor, inclusiv triunghiurile lungi și subțiri peste muchii concave.

1. În **Suprafață**, scrieți o lungime la **Cea mai lungă muchie exterioară** și apăsați {{key:Enter}}. Începeți cu aproximativ de două-trei ori distanța tipică dintre puncte.
2. Triunghiurile exterioare a căror muchie exterioară este mai lungă decât atât sunt eliminate, lucrând spre interior până când fiecare muchie exterioară este suficient de scurtă. O muchie care este linie de rupere nu este niciodată eliminată.
3. Scrieți 0 pentru a păstra din nou fiecare triunghi.

## Citirea raportului suprafeței

Sub datele suprafeței, o casetă listează ce a făcut constructorul. Cu o bară ocru în stânga, este informație; cu o bară roșie conține o eroare și nu există suprafață.

| Mesaj | Înțeles |
|---|---|
| „3 puncte erau în același loc cu altul și s-au unit cu el.” | Punctele mai apropiate de 0.0001 în plan au devenit un singur vârf (primul păstrat). |
| „2 locuri au două altitudini diferite …” | Puncte unul peste altul sau linii de rupere care se intersectează nu se potrivesc în înălțime. Altitudinea liniei de rupere câștigă, apoi prima. |
| „1 bucată de linie de rupere nu a putut fi forțată în suprafață.” | O bucată foarte scurtă sau aproape suprapusă de linie de rupere nu a încăput; verificați acel loc. |
| „O suprafață are nevoie de cel puțin trei puncte cu altitudini.” | Prea puține puncte: verificați ordinea coloanelor și grupurile. |
| „Punctele sunt toate pe o singură linie: niciun triunghi.” | Punctele nu au lățime, de exemplu o singură linie de drumuire. |
| „Limita nu se suprapune cu punctele.” | Limita este în alt loc, adesea din cauza unei confuzii de unități sau de sistem de coordonate. |
| „Nu mai rămân triunghiuri în interiorul limitei.” | Limita este prea mică sau așezată greșit. |

## O suprafață citită dintr-un LandXML

Când deschideți un LandXML, primul său TIN de suprafață este folosit ca atare: titlul **Suprafață** spune „Suprafață (din LandXML)”, iar **Cea mai lungă muchie exterioară** este estompată. Cât timp această suprafață este folosită, grupurile de linii de rupere, liniile de rupere desenate și o limită nouă nu o schimbă. Pentru a construi suprafața din punctele fișierului, faceți clic pe {{ui:Reconstruire model de teren din puncte}}. {{key:Mod+Z}} readuce suprafața LandXML.

## Înrudite

- [Citirea curbelor de nivel, a altitudinilor și a pantelor](topic:contours).
- [Importul punctelor de releveu](topic:import-points).
