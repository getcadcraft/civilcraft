---
title: Straturi de plan
summary: Denumirile fixe ale straturilor, culorile și grosimile de linie pe care CivilCraft le folosește pe ecran, în DXF și în PDF, și setarea de afișare care controlează fiecare.
keywords: straturi, denumiri de straturi, ncs, culori, aci, grosimi de linie, straturi dxf, pdf, setări de afișare, linii
from: c2aa8475
---

Tot ce se află în plan aparține unui strat. Denumirile urmează modelul comun al straturilor civile (disciplină, grup major, grup minor). Straturile sunt fixe în această versiune: nu le puteți redenumi, nu le puteți schimba culorile și nu puteți adăuga straturi proprii. În DXF, fiecare strat are numărul de culoare indicat; în PDF, cu {{ui:Culorile straturilor}}, se folosesc aceleași culori, iar cu {{ui:Negru}} totul se tipărește negru.

| Strat | Conține | Culoare (număr DXF) | Afișat când |
|---|---|---|---|
| C-TOPO-MINR | Curbe de nivel secundare | Gri (8) | {{ui:Curbe de nivel}} |
| C-TOPO-MAJR | Curbe de nivel principale | Alb sau negru (7) | {{ui:Curbe de nivel}} |
| C-TOPO-TEXT | Etichete ale curbelor de nivel | Alb sau negru (7) | {{ui:Curbe de nivel}} și {{ui:Etichete ale curbelor de nivel}} |
| C-TOPO-TINN | Muchiile triunghiurilor | Gri (8) | {{ui:Triunghiuri}} |
| C-TOPO-BRKL | Linii de rupere și limita | Portocaliu (30) | {{ui:Linii de rupere}} |
| C-TOPO-BNDY | Marginea modelului de teren | Alb sau negru (7) | {{ui:Marginea modelului de teren}} |
| C-TOPO-SLOP | Săgeți de pantă | Cyan (4) | {{ui:Săgeți de pantă}} |
| V-NODE | Puncte topografice | Verde (3) | {{ui:Puncte}} |
| V-NODE-TEXT | Etichete de puncte: număr, cotă, descriere | Verde (3) | {{ui:Puncte}} și {{ui:Etichete de puncte}} |
| V-NODE-LINE | Linii din codurile de linie (grupuri care nu sunt linii de rupere) | Verde (3) | {{ui:Puncte}} |
| C-ROAD-CNTR | Axele traseelor | Roșu (1) | Întotdeauna |
| C-ROAD-STAN | Marcaje și etichete de pichet, PC și PT | Roșu (1) | Întotdeauna |
| C-ROAD-CORR | Marginile coridoarelor | Galben (2) | Întotdeauna |
| C-ROAD-SCTN | Linii de profil (unde se taie secțiunile) | Gri (8) | Când traseul are linii de profil |
| C-GRAD-PADS | Contururi de platforme | Albastru (5) | Întotdeauna |
| C-GRAD-DAYL | Linii de intersecție cu terenul | Magenta (6) | Întotdeauna |
| C-GRAD-SLOP | Linii de pantă ale sistematizării verticale | Magenta (6) | Întotdeauna |
| C-GRAD-FEAT | Linii caracteristice (3D) | Verde (3) | Întotdeauna |
| C-ROAD-SWPT | Traiectorii de manevră: contur, urmele cele mai exterioare ale roților, nume | Portocaliu (30) | Întotdeauna |
| C-STRM-PIPE | Conducte | Albastru (5) | {{ui:Conducte}} |
| C-STRM-STRC | Structuri | Albastru (5) | {{ui:Conducte}} |
| C-STRM-TEXT | Etichete de conducte și structuri | Albastru (5) | {{ui:Conducte}} |
| C-STRM-PROB | Conducte și structuri cu probleme | Roșu (1) | {{ui:Conducte}} |

Liniile de rupere sunt desenate doar cât timp **Suprafața** din **Afișare** este {{ui:Teren natural}}; limita este desenată cu oricare dintre suprafețe.

## Grosimi de linie în PDF

| Grosime | Straturi |
|---|---|
| 0.50 mm | Axele traseelor, platformele, conductele, conductele cu probleme |
| 0.35 mm | Curbe de nivel principale, linii de intersecție cu terenul, structuri |
| 0.25 mm | Linii de rupere |
| 0.13 mm | Curbe de nivel secundare |
| 0.09 mm | Muchiile triunghiurilor, liniile de pantă ale sistematizării |
| 0.18 mm | Tot restul |

Fișierele DXF nu conțin grosimi de linie; setați-le pe strat în programul CAD.

## Dimensiuni ale etichetelor

Etichetele au dimensiuni pe hârtie: etichetele curbelor de nivel 2.0 mm, etichetele de pichet 1.8 mm, etichetele PC și PT și ale conductelor și structurilor 1.6 mm, etichetele de puncte 1.5 mm. Etichetele de conducte indică numele, diametrul și panta; cele de structuri indică numele și cota capacului. Pe ecran rămân de aceeași dimensiune la zoom. În DXF, sunt scalate pentru scara indicată în mesajul de export; vezi [Exportul planului în DXF](topic:dxf-export).

## Neafișate pe niciun strat

Benzile de altitudine sunt desenate sub liniile desenului, doar pe ecran. Vederea profilului nu face parte din plan.
