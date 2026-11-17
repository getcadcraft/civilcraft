---
title: Linii caracteristice
summary: Desenați linii 3D pe care le amenajați vârf cu vârf, faceți decalaje în trepte ale acestora și folosiți-le ca linii de rupere ale terenului sau ca platforme înclinate în proiect.
keywords: arc, curbă, rază, arc 3D, elice, bordură curbată, suprapunere pante, suprapunere cote, săgeți de pantă, linie caracteristică, pantă, cotă, decalaj în trepte, decalaj, linie de rupere, bordură, șanț, banchetă, platformă înclinată, intersecția cu terenul, amenajare verticală, polilinie 3D
from: d55b25fb
---

O linie caracteristică este o linie cu o cotă în fiecare vârf: o bordură, linia de scurgere a unui șanț, partea de sus a unei banchete, marginea unei platforme înclinate. Îi stabiliți cotele după număr sau după pantă, o copiați lateral cu un pas în sus sau în jos și alegeți ce fac suprafețele cu ea.

## Desenarea unei linii

1. Alegeți **Suprafață** › {{ui:Mai multe}} › {{ui:Linie caracteristică}}, sau apăsați {{key:L}}.
2. Faceți clic pe vârfurile sale în plan. Un clic pe un punct topografic preia locul și cota punctului; în orice alt loc, vârful preia cota terenului existent din acel loc.
3. Apăsați {{key:Enter}} pentru a termina o linie deschisă sau faceți din nou clic pe primul vârf pentru a o închide.

Noua linie este selectată și pornește ca linie de rupere a terenului existent, așezată pe teren.

## Arce

Un segment poate fi un arc în plan ale cărui capete au cote diferite: o curbă de colț de bordură, un șanț curbat, o rampă care se întoarce. Panta sa se distribuie uniform pe arc, iar lungimea sa se măsoară pe curbă.

- **În timpul desenării:** apăsați {{key:C}} (pe ecran tactil, {{ui:Arc}} din bara de deasupra planului) ca să activați arcele. După un vârf, faceți clic pe un punct de pe curbă, apoi faceți clic unde se termină arcul. Apăsați din nou {{key:C}} pentru segmente drepte. {{key:Backspace}} elimină mai întâi punctul de pe curbă.
- **Ulterior:** în **Proprietăți**, tastați o rază și sensul de virare în câmpul **Arc** al vârfului, de exemplu `50 L` sau `50 R` (stânga sau dreapta când parcurgeți linia), apoi apăsați {{key:Enter}}. Goliți câmpul ca segmentul să redevină drept. O rază mai mică decât jumătate din segment este refuzată.

Linia selectată arată raza fiecărui arc lângă panta sa. **Lungime** este pe arcele din plan; **Lungime 3D** include și urcarea și coborârea. Decalajele în trepte păstrează arcele: un arc de pe exteriorul unei curbe crește, unul de pe interior scade, iar un decalaj care trece de centrul unui arc este refuzat.

Modelele de teren, vizualizarea 3D, DXF și DWG preiau fiecare arc ca bucăți scurte drepte care rămân în limita de 0.01 față de curbă. LandXML le păstrează ca arce (vezi mai jos **Arce în alte fișiere**).

## Stabilirea cotelor și a pantelor

**Proprietăți** listează vârfurile cu distanța lor de-a lungul liniei, **Cota** lor și **Panta până la următorul** (în procente). Tastați oricare și apăsați {{key:Enter}}:

- O cotă mută doar acel vârf.
- O pantă stabilește cota la capătul îndepărtat al segmentului; vârfurile de după ea rămân pe loc, deci panta segmentului următor se schimbă.

De asemenea, în **Proprietăți**:

| Acțiune | Ce face |
|---|---|
| **Ridicare sau coborâre totală cu** | Adaugă înălțimea pe care o tastați la fiecare vârf. |
| {{ui:Cote din teren}} | Readuce fiecare vârf pe terenul existent (vârfurile în afara modelului își păstrează cota și sunt enumerate). |
| {{ui:O singură pantă, de la primul la ultimul}} | Păstrează cotele primului și ultimului vârf și așază vârfurile dintre ele pe o singură pantă uniformă. |

Linia selectată arată cotele sale în vârfuri și pantele pe segmente, în plan. Trageți un vârf cu {{ui:Selectare}} pentru a-l muta; cota sa rămâne.

## Decalaje în trepte

Sub **Decalaj în trepte**, tastați o **Distanță** (pozitivă în dreapta direcției liniei, negativă în stânga), apoi o înălțime (cu cât urcă sau coboară) sau o pantă în procente, și faceți clic pe {{ui:Creare linie decalată}}. Copia este o linie caracteristică nouă: de exemplu spatele unei bordurii la 0.5 ft lateral și cu 0.5 ft mai sus, sau marginea unui șanț la 6 ft în afară, cu 2 %. O distanță care ar suprapune copia peste ea însăși la o curbă strânsă este refuzată.

## Pante și cote pe ecran

Apăsați {{key:E}}, sau bifați **Pante și cote pe liniile caracteristice** sub **Afișare**, ca să vedeți panta fiecărei linii caracteristice pe fiecare segment (cu o săgeată mică orientată în jos) și cota ei în vârfuri. Se afișează doar pe ecran: nimic nu este adăugat în desen, iar PDF, DXF și DWG rămân neschimbate. Segmentele scurte și vârfurile înghesuite rămân fără etichete până măriți. Linia selectată arată întotdeauna propriile pante și cote.

## În vizualizarea profilului

O linie caracteristică ce intersectează un traseu apare în vizualizarea profilului acelui traseu, cu numele și cota la intersecție; liniile care merg alături pot fi afișate și ele. Vezi [Proiectarea profilului longitudinal](topic:profile).

## Ce fac suprafețele cu ea

Alegeți **Utilizare**:

| Utilizare | Ce se întâmplă |
|---|---|
| Linie de rupere a terenului existent | Terenul existent trece prin linie la cotele sale, ca o linie de rupere desenată. |
| Amenajată în proiect | O linie **închisă** devine o platformă înclinată: modelul proiectat din interiorul ei este amenajat până la margine. Activați **Intersecția cu terenul** ca să duceți taluzuri de debleu și rambleu (orizontal la 1 vertical) din margine până la teren, cum face o platformă; fiecare taluz pornește de la cota proprie a marginii acolo. |
| Doar desenată | Rămâne în plan și se exportă în DXF, DWG și PDF (stratul C-GRAD-FEAT, polilinii 3D), dar modelele de teren o ignoră. |

Volumele, secțiunile și vizualizarea 3D includ liniile caracteristice amenajate în proiect, ca platformele. Fiecare modificare este un singur pas: {{key:Mod+Z}} o anulează.

## Partajarea liniilor cu echipa

Într-un desen deschis din fișierele dvs. din cloud în CadCraft Studio, pe un plan de echipă, **Proprietățile** proiectului (fără nimic selectat) au o secțiune **Echipă** cu {{ui:Linii ale echipei…}}: liniile pe care echipa dvs. le-a partajat, fiecare cu revizia sa, fără a selecta mai întâi o linie caracteristică. Selectați o linie ca s-o partajați, să trimiteți o revizie nouă, să preluați revizia echipei sau să opriți partajarea. În afara acestui context, secțiunea spune ce îi trebuie.

## Arce în alte fișiere

| Fișier | Ce se întâmplă cu o linie caracteristică cu arce |
|---|---|
| Proiect CivilCraft | Păstrată exact. |
| LandXML | Scrisă ca element de plan din linii și arce cu cotele lor și citită înapoi cu arcele sale. O linie caracteristică dintr-un alt program intră ca **Doar desenată**: alegeți **Utilizare** pentru a o pune într-un model de teren. |
| DWG și DXF | O polilinie 3D nu poate conține un arc, deci linia este scrisă ca bucăți scurte, în limita a 0.01 față de fiecare arc. CivilCraft notează și în desen ce bucăți erau arce: când deschideți desenul ca linii, {{ui:Linii caracteristice}} aduce liniile înapoi ca linii caracteristice cu arcele lor. Celelalte programe văd o polilinie 3D obișnuită. |
