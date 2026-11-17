---
title: Exportarea planului în DXF
summary: Scrie liniile planului ca DXF R12 pe straturi denumite, cu curbele de nivel la cotele lor și liniile de rupere în 3D, pentru orice program CAD.
keywords: dxf, dwg, cad, export, linii, r12, 2000, 2004, 2007, 2010, 2013, 2018, straturi, curbe de nivel, schimb de desene, hartă de bază, fundal
from: f2d8ede9
---

{{ui:DXF}} scrie ce arată planul ca fișier DXF în formatul R12, versiunea pe care o deschide orice program CAD. Dacă ați folosit AutoCAD sau Civil 3D, deschideți-l sau inserați-l ca pe orice fișier DXF.

## Export

1. Pregătiți planul așa cum doriți desenul: la **Afișare**, alegeți modelul de teren (existent sau proiectat), echidistanța curbelor de nivel și ce anume este activat (curbe de nivel, etichete, puncte, etichete de punct, triunghiuri, linii de rupere, muchia modelului, conducte, structuri, săgeți de pantă).
2. Faceți clic pe {{ui:DWG/DXF}} din grupul **Export** și alegeți {{ui:DXF (R12, text) — fișierul simplu de schimb}}, apoi {{ui:Descărcare}}.
3. Browserul descarcă `<name>.dxf`. Bara de stare arată, de exemplu, „Exportat DXF R12: 2,140 de obiecte; etichete dimensionate pentru 1” = 40'. Benzile nu sunt exportate.”

Coordonatele sunt scrise în unitățile proiectului, la valorile lor reale (coordonatele state plane rămân cele originale). Nimic nu este scalat sau mutat.

## Ce conține fișierul

| Element | Entitate DXF | Strat |
|---|---|---|
| Curbe de nivel secundare și principale | Polilinii 2D la cota lor | C-TOPO-MINR, C-TOPO-MAJR |
| Etichete ale curbelor de nivel | Text | C-TOPO-TEXT |
| Triunghiuri | Polilinii | C-TOPO-TINN |
| Linii de rupere și contur | Polilinii 3D | C-TOPO-BRKL |
| Muchia modelului de teren | Polilinii | C-TOPO-BNDY |
| Săgeți de pantă | Polilinii | C-TOPO-SLOP |
| Puncte topografice și etichetele lor | Puncte (cu cotă), text | V-NODE, V-NODE-TEXT |
| Linii din coduri de linie | Polilinii 3D | V-NODE-LINE |
| Axele traseelor | Linii și arce | C-ROAD-CNTR |
| Repere de kilometraj și etichete | Polilinii, text | C-ROAD-STAN |
| Marginile coridorului | Polilinii | C-ROAD-CORR |
| Linii de profil transversal | Polilinii | C-ROAD-SCTN |
| Platforme, linii de intersecție cu terenul, linii de pantă | Polilinii | C-GRAD-PADS, C-GRAD-DAYL, C-GRAD-SLOP |
| Linii caracteristice | Polilinii 3D (arcele ca bucăți în limita a 0.01; vezi [Linii caracteristice](topic:feature-lines)) | C-GRAD-FEAT |
| Traiectorii de manevră | Polilinii, text | C-ROAD-SWPT |
| Conducte, structuri, etichete | Polilinii, text | C-STRM-PIPE, C-STRM-STRC, C-STRM-TEXT |
| Conducte și structuri cu probleme | Polilinii | C-STRM-PROB |

Fiecare strat are o culoare. Lista completă este în [Straturile planului](topic:plan-layers).

## Dimensiunea etichetelor

Textul trebuie să aibă o dimensiune în unitățile desenului. CivilCraft dimensionează etichetele pentru scara la care întregul plan încape pe o foaie Tabloid (feet) sau pe o foaie A3 (metri) și indică scara în mesajul de stare. Dacă trasați la o altă scară în programul dvs. CAD, scalați textul acolo.

## Ce nu se exportă

- Benzile de cote (doar pe ecran).
- Vizualizarea profilului. Profilurile se exportă ca LandXML, nu ca desen.
- Modelul de teren în sine ca obiect 3D. Folosiți LandXML pentru TIN sau activați {{ui:Triunghiuri}} ca să obțineți muchiile sale ca linii.
- Orice ați dezactivat la **Afișare**.

## DWG

{{ui:DWG/DXF}} scrie și aceleași linii ca desen DWG. Caseta de dialog cere formatul: DXF sau DWG din 2000, 2004, 2007, 2010, 2013 ori 2018. Formatul 2000 se deschide în aproape orice program CAD, vechi sau nou; alegeți unul mai nou atunci când cel care primește desenul o cere. Alegerea dvs. este reținută în acest browser.

1. Faceți clic pe {{ui:DWG}} din grupul **Export**.
2. Alegeți **Format** și faceți clic pe **Descărcare DWG**.
3. Browserul descarcă `<name>.dwg`. Bara de stare arată ce a intrat, de exemplu „Exportat DWG (format 2018): 12 polilinii, 40 de etichete pe 9 straturi”.

Desenul DWG are aceleași straturi, culori, curbe de nivel (ca polilinii la cota lor), linii de rupere 3D, etichete și puncte ca DXF, în aceleași coordonate. Numele de straturi pe care un DWG nu le poate păstra sunt schimbate, iar mesajul de stare o spune. CivilCraft scrie DWG cu propriul cod, deci nimic nu părăsește calculatorul dvs.

### Straturile de hartă din DWG

Un desen DWG nu poate conține o imagine în interiorul său: programele CAD afișează o imagine plasată lângă desen. Când straturile de hartă sunt afișate, caseta de dialog oferă **Straturile de hartă ca imagine lângă desen**. Dacă este bifată, descărcarea este un `.zip` care conține `<name>.dwg`, `<name>-map.png` (straturile de hartă peste întregul desen, până la 4,096 de pixeli pe lățime) și `<name>-map.pgw` (fișierul său de georeferențiere, pentru programele GIS). Desenul afișează imaginea ca o imagine pe stratul G-MAP-IMAG, la locul ei. Dezarhivați fișierele într-un singur dosar și păstrați-le împreună.
