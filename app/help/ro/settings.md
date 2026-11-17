---
title: Setările CivilCraft
summary: Alegeți ordinea coloanelor pentru rândurile de puncte copiate și lipite și pentru ghicirea coloanelor unui fișier, cum sunt numerotate punctele lipite, ce arată etichetele punctelor, indicatorul de colț, exagerarea verticală 3D, cum apar latitudinea și longitudinea și dacă straturile de hartă vin de pe internet.
keywords: setări, preferințe, pnezd, penzd, ordinea coloanelor, rânduri de puncte, renumerotare, numere de puncte, număr de start, etichete de puncte, etichete, descriere, cotă, ViewCube, pictogramă de axe, indicator de colț, busolă, exagerare verticală, 3d, latitudine, longitudine, grade minute secunde, grade zecimale, straturi de hartă, internet, confidențialitate
from: 64b9cb92
---

Deschideți {{ui:Settings}} cu roata din bara de aplicație sau cu {{key:Mod+,}}. Prima filă, {{ui:CivilCraft}}, cuprinde setările care aparțin acestei aplicații; {{ui:General}} cuprinde cele pe care le împart toate aplicațiile CadCraft (temă, bară de instrumente, panouri). Setările CivilCraft există doar în aplicație: le schimbați aici, iar acest browser le ține minte. {{ui:Reset CivilCraft settings}} readuce fiecare setare la valoarea de pornire.

## Rânduri de puncte

**P, N, E, Z, D** (la început) sau **P, E, N, Z, D**: punct, nord, est, cotă, descriere, sau est înaintea nordului. Este folosită în trei locuri:

- **Copiere**: rândurile pe care CivilCraft le pune pe clipboardul sistemului pentru o foaie de calcul.
- **Lipire**: rândurile lipite dintr-o foaie de calcul sau dintr-un fișier text, care nu au rând de antet.
- **Import**: ghicirea din caseta **Importare puncte**, atunci când un fișier nu are rând de antet (un fișier cu patru coloane se citește ca PENZ, cu trei ca ENZ). Vezi [Formatele fișierelor de puncte](topic:point-file-formats).

Un rând de antet care își numește coloanele câștigă întotdeauna, și la fel o alegere din lista **Coloane** a casetei de import.

## Numere pentru punctele lipite

- **Păstrarea numerelor libere** (la început): un punct lipit își păstrează numărul când niciun punct nu-l are; doar punctele care se ciocnesc primesc numere noi.
- **Întotdeauna numere noi**: fiecare punct lipit primește un număr nou, chiar dacă al său este liber.

**Numerele noi încep de la**: lăsați-l gol ca să numărați de la unu mai mult decât cel mai mare număr folosit. Scrieți un număr, de exemplu 5000, ca să dați punctelor noi numere de la 5000 în sus; numerele deja folosite sunt sărite. Două puncte nu au niciodată același număr, în niciun caz. Vezi [Selectarea, copierea și lipirea punctelor topografice](topic:copy-paste-points#point-numbers-never-clash).

## Etichete de puncte

Ce arată o etichetă de punct când {{ui:Point labels}} este activată, sub **Afișare**: **Număr**, **Număr și cotă** sau **Număr, cotă și descriere** (la început). Exporturile DXF, DWG și PDF arată aceleași etichete ca ecranul.

## Indicatorul de colț

Ce stă în colțul planului și al vederii 3D: **ViewCube** (la început), **Pictogramă de axe** sau **Niciuna**.

- **ViewCube** (dreapta sus). Pe plan arată partea de sus, cu inelul busolei: N este nordul grilei (în sus pe plan). Faceți clic pe orice altă latură, muchie sau colț al cubului, sau trageți-l, iar [vederea 3D](topic:site-3d) se deschide privind de acolo. {{ui:Home}} pe cubul planului încadrează planul.
- În vederea 3D cubul se rotește cu vederea: faceți clic pe o latură, muchie sau colț ca să priviți de acolo, trageți cubul ca să orbitați, trageți inelul busolei ca să rotiți în jurul verticalei, faceți clic pe o literă ca să priviți de pe acea latură și folosiți {{ui:Home}} pentru vederea izometrică a întregului amplasament. Privind direct o latură, săgețile mici trec la următoarea latură, iar săgețile curbe rotesc vederea cu un sfert de rotație.
- **Pictogramă de axe** (stânga jos): un mic marcaj X (est) și Y (nord) pe plan, X, Y și Z (în sus) în 3D.

## Exagerarea verticală 3D

Cât de mult întinde vederea 3D cotele: **1×**, **2×** (la început), **3×**, **5×** sau **10×**. Lista din bara vederii 3D este aceeași setare, deci schimbarea uneia le schimbă pe amândouă. Volumele, profilele și exporturile 3D rămân la scară reală.

## Latitudine și longitudine

Cum arată bara de stare latitudinea și longitudinea indicatorului, când proiectul are un sistem de coordonate: **grade, minute și secunde** (la început, de exemplu `30°18′00.00″ N`) sau **grade zecimale** (`30.300000° N`). Vezi [Stabilirea sistemului de coordonate al proiectului](topic:coordinate-systems#latitude-and-longitude-in-the-status-bar).

## Straturi de hartă de pe internet

**Dezactivat** (la început) sau **Activat**. Când este activat, CivilCraft cere serverelor de hartă pe care le adăugați imagini ale zonei de pe ecran. Desenul dvs. rămâne pe acest calculator; serverul vede zona și adresa dvs. de internet. Cât timp este dezactivat, niciun server de hartă nu este întrebat nimic, chiar dacă un proiect deschis numește unul; o imagine georeferențiată dintr-un fișier funcționează în orice caz. Vezi [Afișarea straturilor de hartă sub plan](topic:map-layers).

## Asistenți

**Permiteți asistenților AI și scripturilor să folosească CivilCraft** (dezactivat la început) lasă un asistent de pe calculatorul dvs. să ajungă la amplasamentul deschis prin CadCraft Studio: **Citire** descrie amplasamentul și dă puncte, cote ale suprafeței, pichete, profile, volume și parcele; **Editare** îi permite să selecteze și să adauge puncte topografice; **Salvare** și **Export** îi permit să salveze proiectul sau să scrie LandXML ori DWG. **Dosarele pe care le poate folosi** (în Studio) sunt cele în care poate salva și exporta. **Activitatea** listează apelurile sale. Vezi [Lăsați un asistent AI să lucreze cu amplasamentul dvs.](topic:assistants).
