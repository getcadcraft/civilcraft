---
title: Referință pentru bara de instrumente
summary: Fiecare buton din bara de instrumente a CivilCraft, ce face, tasta lui și când este inactiv sau refuză.
keywords: bară de instrumente, butoane, comenzi, instrumente, fișier, export, suprafață, proiectare, editare, vizualizare, meniu
from: 4c4352bc
---

Bara de instrumente se întinde pe partea de sus a aplicației, în șapte grupuri. Fiecare buton arată sfatul și tasta când treceți cursorul peste el.

## Fișier

| Buton | Tastă | Ce face |
|---|---|---|
| {{ui:Nou}} | fără | Pornește un proiect gol. Întreabă mai întâi dacă există modificări nesalvate. |
| {{ui:Deschidere}} | {{key:Mod+O}} | Deschide un fișier de puncte (CSV, TXT), LandXML sau un proiect CivilCraft. |
| {{ui:Salvare}} | {{key:Mod+S}} | Descarcă proiectul ca `<name>.civilcraft.json`. |

## Export

| Buton | Tastă | Ce face |
|---|---|---|
| {{ui:LandXML}} | fără | Descarcă `<name>.xml`: puncte, suprafețe, axe de traseu, profile și rețeaua de conducte în LandXML 1.2. „Nimic de exportat încă.” când proiectul este gol. |
| {{ui:DXF}} | fără | Descarcă `<name>.dxf`: liniile planului ca DXF R12. |
| {{ui:PDF}} | {{key:Mod+P}} | Deschide **Trasarea planului în PDF**. „Nimic de trasat încă.” când proiectul este gol. |

## Suprafață

| Buton | Tastă | Ce face |
|---|---|---|
| {{ui:Linie de rupere}} | {{key:B}} | Faceți clic pe punctele topografice în ordine, {{key:Enter}} pentru a încheia. Linia de rupere preia cotele punctelor. |
| {{ui:Limită}} | {{key:O}} | Faceți clic pe colțurile limitei exterioare, {{key:Enter}} pentru a încheia. Înlocuiește orice limită. |

Ambele afișează „Nu există încă o suprafață: deschideți mai întâi punctele topografice.” când nu există suprafață.

## Proiectare

| Buton | Tastă | Ce face |
|---|---|---|
| {{ui:Axul traseului}} | {{key:A}} | Faceți clic pe PI-uri în ordine, {{key:Enter}} pentru a încheia. |
| {{ui:Platformă}} | {{key:G}} | Faceți clic pe colțurile platformei, {{key:Enter}} pentru a încheia. Ca instrumentele de suprafață, avertizează când nu există suprafață; o platformă se nivelează doar pe una. |
| {{ui:Conducte}} | {{key:P}} | Faceți clic pe structuri de la amonte spre aval (faceți clic pe una existentă ca să o alăturați), {{key:Enter}} pentru a încheia. |
| {{ui:Profil longitudinal}} | {{key:R}} | Afișează sau ascunde vizualizarea profilului sub plan. |

## Editare

| Buton | Tastă | Ce face |
|---|---|---|
| {{ui:Anulare}} | {{key:Mod+Z}} | Anulează ultima modificare (până la 200). Inactiv când nu există nimic de anulat. |
| {{ui:Refacere}} | {{key:Mod+Y}} | Refă ce a fost anulat. Inactiv când nu există nimic de refăcut. |
| {{ui:Copiere}} | {{key:Mod+C}} | Copiază punctele topografice selectate și le pune în clipboard ca rânduri de puncte, pe care le poate prelua o foaie de calcul. Inactiv până când sunt selectate puncte. |
| {{ui:Lipire}} | {{key:Mod+V}} | Lipește puncte: urmează indicatorul, iar un clic le plasează cu numere pe care nu le are alt punct. Rândurile de puncte copiate într-o foaie de calcul se lipesc și ele. |
| {{ui:Mai multe}} | fără | Deschide meniul de mai jos. |

Meniul {{ui:Mai multe}}:

| Element | Tastă | Ce face |
|---|---|---|
| {{ui:Decupare}} | {{key:Mod+X}} | Copiază punctele selectate și le șterge (un singur pas de anulare). |
| {{ui:Copiere}} | {{key:Mod+C}} | Ca butonul {{ui:Copiere}}. |
| {{ui:Lipire}} | {{key:Mod+V}} | Ca butonul {{ui:Lipire}}. |
| {{ui:Lipire în aceeași poziție}} | {{key:Mod+Shift+V}} | Lipește punctele la propriile coordonate, cu numere pe care nu le are alt punct. |
| {{ui:Duplicare}} | {{key:Mod+D}} | O copie a punctelor selectate urmează indicatorul; faceți clic unde trebuie să ajungă. Clipboardul rămâne neschimbat. |
| {{ui:Ștergere}} | {{key:Delete}} | Șterge punctele topografice selectate sau axul de traseu, platforma, structura (cu conductele ei), conducta ori PVI-ul selectat. |
| {{ui:Selectarea tuturor punctelor}} | {{key:Mod+A}} | Selectează toate punctele topografice. |
| {{ui:Anularea selecției}} | {{key:Esc}} | Golește selecția. |

Un element care nu poate acționa acum este inactiv, iar sfatul lui spune de ce. Detalii: [Selectarea, copierea și lipirea punctelor topografice](topic:copy-paste-points).

Anularea acoperă modificările proiectului, setările suprafeței și punctele topografice (lipire, decupare, duplicare, ștergere). Nu acoperă setările de afișare, iar deschiderea sau importul oricărui fișier o golește.

## GIS

| Buton | Tastă | Ce face |
|---|---|---|
| {{ui:Coordonate}} | fără | Deschide caseta de dialog **Sistem de coordonate**: indicați în ce sistem se află proiectul sau folosiți coordonate ale terenului ori locale. Vezi [Stabilirea sistemului de coordonate al proiectului](topic:coordinate-systems) și [Coordonate ale terenului și locale](topic:ground-and-local-coordinates). |
| {{ui:Import}} | fără | Importă date GIS: shapefile, GeoJSON, GeoPackage, grile de altitudini și LiDAR. Vezi [Importul datelor GIS](topic:gis-import). |
| {{ui:Export}} | fără | Exportă datele as-built pentru un departament GIS. Vezi [Exportul datelor as-built pentru GIS](topic:gis-export). |
| {{ui:Analiză}} | fără | Deschide panoul de analiză GIS: zonă tampon, suprapunere, îmbinare spațială, selectare după atribut, măsurare. Vezi [Analiza straturilor GIS](topic:gis-analysis). |
| {{ui:Tabel de atribute}} | fără | În Suprafață › Mai multe. Deschide tabelul de atribute al unui strat GIS: sortare, filtrare, selectare, editare, adăugare de câmpuri, calcul, salvare ca CSV. Vezi [Lucrul cu tabelul de atribute al unui strat](topic:gis-table). |
| {{ui:Hartă}} | fără | Deschide caseta de dialog **Straturi de hartă**: o imagine georeferențiată sau servere de hărți pe care le adăugați, desenate sub plan. Vezi [Afișarea straturilor de hartă sub plan](topic:map-layers). |

Instrumentele GIS se încarcă prima dată când folosiți unul dintre aceste butoane, deschideți un fișier GIS sau deschideți un proiect care are un sistem de coordonate ori straturi GIS.

## Vizualizare

| Buton | Tastă | Ce face |
|---|---|---|
| {{ui:Selectare}} | {{key:V}} sau {{key:Esc}} | Faceți clic pentru a selecta axe de traseu, platforme, structuri, conducte și puncte ({{key:Shift}} și un clic sau o trăgere adaugă puncte); trageți mânerele pentru a muta PI-urile, colțurile platformelor și structurile. |
| {{ui:Potrivire}} | {{key:F}} | Mărește planul pentru a arăta suprafața, punctele, axele de traseu și platformele (în vizualizarea 3D: arată tot). |
| {{ui:3D}} | {{key:D}} | Afișează amplasamentul în 3D peste plan sau revine la plan. Bara de deasupra vizualizării 3D stabilește vederea, exagerarea, colorarea și ce se afișează, și exportă GLB sau OBJ. Vezi [Vizualizarea amplasamentului în 3D](topic:site-3d). |

## Butoane din panouri

| Buton | Unde | Ce face |
|---|---|---|
| {{ui:Deschidere amplasament de exemplu}} | Caseta de pe un plan gol | Încarcă topografia de exemplu (are nevoie de conexiune, cu excepția cazului în care CivilCraft este salvat pentru utilizare offline) |
| {{ui:Eliminare limită}} | Panoul din stânga, Suprafață | Elimină limita exterioară |
| {{ui:Eliminare linii de rupere desenate}} | Panoul din stânga, Suprafață | Elimină toate liniile de rupere desenate cu instrumentul (nu grupurile de linii de rupere) |
| {{ui:Reconstruire model de teren din puncte}} | Panoul din stânga, Suprafață (doar suprafața LandXML) | Renunță la TIN-ul LandXML și construiește din puncte; nu poate fi anulat |
| {{ui:Pornire din teren}} | Panoul din dreapta, Axul traseului | Pornește un profil de proiect cu un PVI pe teren la fiecare capăt |
| {{ui:Vizualizarea profilului}} | Panoul din dreapta, Axul traseului | Deschide vizualizarea profilului pentru acest ax de traseu |
| {{ui:Adăugare PVI}} | Bara profilului | Cât timp este apăsat, un clic în profil adaugă un PVI |
| {{ui:Stabilirea fiecărui radier din reguli}} | Panoul din dreapta, Rețeaua de conducte | Stabilește radierele tuturor conductelor din reguli |
| {{ui:Stabilirea radierelor ei din reguli}} | Panoul din dreapta, Conductă | Stabilește radierele acestei conducte din reguli |
