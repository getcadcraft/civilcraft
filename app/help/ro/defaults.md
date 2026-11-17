---
title: Valori de pornire și marcaje
summary: Fiecare valoare cu care pornește CivilCraft, pentru proiecte noi, afișare, axul traseului, platforme, coridoare, rețele de conducte, volume și trasare, și care dintre ele sunt marcaje de înlocuit.
keywords: valori implicite, setări, valori de pornire, marcaje, criterii de proiectare, standarde, reguli, ipoteze
from: fbfc7432
---

CivilCraft nu are o casetă de setări sau un șablon. Acestea sunt valorile cu care pornesc lucrurile. Valorile marcate **marcaj** nu sunt luate dintr-un standard: înlocuiți-le cu criteriile proiectului dumneavoastră înainte de a vă baza pe o verificare sau pe o cantitate.

## Proiect nou

| Setare | Valoare |
|---|---|
| Nume | Amplasament nedenumit (numele primului fișier de puncte îl înlocuiește) |
| Unități | US feet |
| Nume model de teren | Teren natural |
| Grupuri de puncte | Fiecare grup pornește ca {{ui:Puncte}} |
| Cea mai lungă margine exterioară | 0 (păstrează fiecare triunghi) |
| Pași de anulare păstrați | 200 |

## Afișare

| Setare | Valoare |
|---|---|
| Model de teren | {{ui:Teren natural}} |
| Curbe de nivel la fiecare | 1 (ft sau m) |
| Curbe majore la fiecare | a 5-a curbă de nivel |
| Benzi | 8 |
| Activ | Curbe de nivel, etichete ale curbelor de nivel, puncte, linii de rupere, marginea modelului de teren, conducte |
| Inactiv | Triunghiuri, benzi de cote, săgeți de pantă, etichete de puncte |

## Axul traseului și profile

| Setare | Valoare |
|---|---|
| Nume | Axul traseului 1, Axul traseului 2 … |
| Kilometraj de pornire | 0+00 |
| Raza curbei la fiecare PI intermediar | 100 ft sau 30 m, mai mică dacă nu încape în jumătate din fiecare tangentă |
| Profil de proiectare | Niciunul până nu porniți unul; {{ui:Pornire din teren}} pune un PVI pe teren la fiecare capăt |
| Lungimea curbei verticale | 0 (fără curbă) până scrieți una |

## Platforme

| Setare | Valoare |
|---|---|
| Nume | Platformă 1, Platformă 2 … |
| Cotă | Terenul din mijlocul platformei, rotunjit la 0.1 (0 dacă mijlocul este în afara modelului) |
| Panta de debleu | 2 : 1 (marcaj) |
| Panta de rambleu | 3 : 1 (marcaj) |

## Ansamblul coridorului (marcaje)

| Setare | US feet | Metri |
|---|---|---|
| Lățimea benzii | 12 ft | 3.6 m |
| Panta benzii | 2% | 2% |
| Lățimea acostamentului | 4 ft | 1.2 m |
| Panta acostamentului | 4% | 4% |
| Panta de debleu | 2 : 1 | 2 : 1 |
| Panta de rambleu | 3 : 1 | 3 : 1 |
| Secțiune la fiecare | 10 ft | 5 m |

## Rețeaua de conducte

| Setare | US feet | Metri |
|---|---|---|
| Nume și tip | Pluvială, pluvială | Pluvială, pluvială |
| Panta minimă (marcaj) | 0.50% | 0.50% |
| Acoperirea minimă (marcaj) | 2 ft | 0.6 m |
| Cădere în structuri (marcaj) | 0.10 ft | 0.03 m |
| Diametrul structurii noi | 48 in | 1200 mm |
| Diametrul conductei noi | 12 in | 300 mm |
| Adâncimea gropii de colectare | 0 | 0 |
| Capacul gurii | De la suprafață | De la suprafață |

O rețea de conducte deschisă din LandXML folosește și ea aceste reguli, deoarece LandXML nu le conține.

## Volume

| Setare | Valoare |
|---|---|
| Metodă | Grilă, eșantionată în centrul celulelor din interiorul liniilor de intersecție cu terenul |
| Dimensiunea celulei | Aleasă astfel încât dreptunghiul de încadrare al ariei nivelate să conțină aproximativ 250,000 de celule (1, 2 sau 5 ori o putere a lui zece) |
| Umflare și contracție | Niciuna |

## Trasare

| Setare | Valoare |
|---|---|
| Suprafață | {{ui:Tot}} |
| Hârtie | Tabloid 11 × 17 in (proiecte în picioare), ISO A3 (proiecte în metri); întotdeauna pe orizontală |
| Scară | Cea mai mare scară listată care încape |
| Cerneală | {{ui:Culorile straturilor}} |

Etichetele DXF sunt dimensionate pentru scara la care totul încape pe Tabloid (picioare) sau pe A3 (metri).
