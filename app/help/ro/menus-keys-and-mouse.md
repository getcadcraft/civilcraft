---
title: Meniuri, taste și mouse
summary: Alegeți un stil de meniu care se potrivește modului în care lucrați deja, atribuiți oricărei comenzi propria tastă, mutați comenzile între filele panglicii și stabiliți ce fac rotița și butoanele mouse-ului în plan și în 3D.
keywords: stil de meniu, meniuri, panglică, panglică civilă, bară de instrumente, linie de comandă, desenare clasică, taste de scurtătură, taste rapide, taste, personalizare, reatribuire, mouse, rotiță, inversare, direcția zoomului, buton din mijloc, buton din dreapta, pan, orbitare, export, import, comutare, familiar
from: 07ac73a0
---

Comenzile CivilCraft sunt aceleași, indiferent de modul în care ajungeți la ele. Un **stil de meniu** decide doar unde se află pe ecran, cum se numesc acolo și ce taste le execută, ca să vă păstrați obiceiurile. Alegeți-l din {{ui:Setări}} ({{key:Mod+,}}) › {{ui:CivilCraft}} › {{ui:Meniuri, taste și mouse}}; schimbarea are efect imediat, iar acest browser o reține.

## Cele trei stiluri

| Stil | Ce obțineți |
|---|---|
| {{ui:CivilCraft}} | Bara de instrumente proprie CivilCraft (Fișier, Export, Model de teren, Proiectare, Editare, GIS, Vizualizare) și taste individuale: {{key:A}} aliniament, {{key:G}} platformă, {{key:P}} conducte, {{key:B}} linie de rupere, {{key:O}} contur, {{key:L}} linie caracteristică, {{key:R}} profil, {{key:X}} secțiuni, {{key:E}} sistematizare, {{key:D}} 3D, {{key:F}} potrivire, {{key:V}} selectare. Punctul de plecare. |
| {{ui:Desenare clasică}} | O panglică mică ({{ui:Acasă}}, {{ui:Inserare}}, {{ui:Ieșire}}) și o linie de comandă, pentru cei care tastează comenzile: ALIGNMENT, PAD, PIPE, FEATURELINE, BREAKLINE, PROFILE, SECTIONS, U (anulare), ZOOM, 3D, PLOT, LANDXML, XATTACH, MAPIMPORT, HELP. Începeți să tastați oriunde și literele merg la linia de comandă; {{key:Enter}} execută, {{key:Enter}} pe nimic repetă ultima comandă, {{key:Esc}} o șterge. Butonul din mijloc face pan. |
| {{ui:Panglică civilă}} | File de butoane mari, grupate cum grupează programele de proiectare civilă uneltele: {{ui:Acasă}} (date despre teren, creare proiect, vederi de profil și secțiune), {{ui:Modele de teren}}, {{ui:Modificare}}, {{ui:Geolocalizare}}, {{ui:Vizualizare}} și {{ui:Ieșire}}, cu un meniu {{ui:Fișier}} și butoane rapide în dreapta. Tastele individuale rămân. Butonul din mijloc face pan în plan; în 3D, butonul din mijloc face pan, iar {{key:Shift}} cu butonul din mijloc orbitează. |

Fiecare stil păstrează tastele {{key:Mod}}: {{key:Mod+Z}}, {{key:Mod+Y}}, {{key:Mod+S}}, {{key:Mod+O}}, {{key:Mod+P}}, {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}}, {{key:Mod+D}}, {{key:Mod+A}}.

:::tip
O tastă care aparține layout-ului propriu CivilCraft, dar pe care stilul dvs. o atribuie altei comenzi, nu face nimic, iar linia de stare spune unde a ajuns comanda („În Tastele mele, Pad este Ctrl+Alt+G”). {{key:Delete}}, {{key:Esc}}, {{key:Enter}}, {{key:Tab}}, {{key:Space}} și săgețile își păstrează întotdeauna sensul, iar cât desenați o linie, punctele ei își păstrează tastele ({{key:Backspace}}, {{key:Enter}}).
:::

## Personalizați-l

1. Alegeți stilul cel mai apropiat de ce doriți, apoi faceți clic pe {{ui:Personalizare…}}.
2. La {{ui:Taste și meniuri}}, găsiți o comandă (caseta de căutare ajută). Faceți clic pe {{ui:Adăugare cheie}} și apăsați tasta, sau două taste una după alta pentru o tastă de două litere. Faceți clic pe o tastă ca s-o eliminați.
3. Cu o panglică, {{ui:Unde se află}} mută comanda pe alt tab și panou, în meniul {{ui:Fișier}} sau la {{ui:Doar taste}}.
4. La {{ui:Mouse}}, stabiliți rotița, butoanele care fac pan în plan și ce face fiecare buton în vederea 3D.
5. Dați-i un nume și faceți clic pe {{ui:Salvare}}.

Salvarea unui stil integrat creează propria copie („Panglica mea civilă”); cel integrat nu se modifică niciodată. O tastă atribuită la două comenzi, sau una care ar rula înainte ca o tastă de două litere să poată fi tastată, apare cu roșu și trebuie corectată înainte de salvare.

## Mouse

- **Rotița mouse-ului**: {{ui:Derularea în sus mărește}} (punctul de plecare) sau {{ui:Derularea în sus micșorează}}, și cât de repede, în plan și în 3D. Gestul de ciupire de pe touchpad mărește întotdeauna în direcția în care se mișcă degetele.
- **Pan în plan cu**: butonul din mijloc, butonul din dreapta sau ambele. {{key:Space}} și tragerea fac de asemenea pan. Butonul stâng selectează și desenează întotdeauna.
- **Tragere în vederea 3D**: {{ui:Propriul fiecărei vederi}} păstrează butoanele CivilCraft (stânga orbitează, dreapta face pan). Sau setați fiecare buton să orbiteze, să facă pan, zoom sau nimic; {{key:Shift}} cu un buton inversează orbitarea și panul. Un clic fără tragere tot selectează.

## Luați-le cu dvs.

{{ui:Export}} salvează stilul în uz ca un fișier `.ccinput.json` mic; {{ui:Import…}} adaugă unul, de pe alt calculator sau de la un coleg. Un fișier importat poate indica doar comenzile CivilCraft: orice altceva din el se omite și se numără în linia de stare. {{ui:Ștergeți acest stil}} elimină unul dintre stilurile dvs.

:::note
Aceste setări rămân în acest browser. {{ui:Folosește acest stil în toate aplicațiile}} de sub cardurile de stil face ca fiecare aplicație să se deschidă în stilul corespunzător (propria bară de instrumente, o panglică sau Desenare clasică), cu modificările făcute în fiecare aplicație. CivilCraft nu are stil cu bară de meniu: când bara de meniu a altei aplicații este aleasă pentru toate aplicațiile, CivilCraft își păstrează propria bară de instrumente.
:::

Înrudite: [Tastatură și mouse](topic:keyboard) · [Setările CivilCraft](topic:settings) · [Venind de la alt software de proiectare civilă](topic:coming-from)
