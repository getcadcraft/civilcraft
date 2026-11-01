---
title: Primii pași cu CivilCraft
summary: Ce face CivilCraft, cum se deschide și primele zece minute cu amplasamentul demonstrativ, de la puncte la curbe de nivel, un drum și un proiect salvat.
keywords: start, prima rulare, amplasament demonstrativ, introducere, pornire rapidă, tutorial, început, proiect nou
from: c9b6dd8e
---

CivilCraft este aplicația de proiectare civilă și a amplasamentelor din familia CadCraft. Ia puncte de releveu și le transformă într-un model de teren (un TIN) cu curbe de nivel, apoi permite trasarea axelor traseelor cu profile de proiectare, construirea unui coridor simplu de drum, sistematizarea platformelor până la intersecția cu terenul, verificarea unei rețele de conducte gravitaționale față de regulile dumneavoastră și vizualizarea volumelor de debleu și rambleu. Citește și scrie LandXML, exportă planul în DXF și îl trasează în PDF.

Dacă ați lucrat cu Civil 3D, ideile vor fi familiare: puncte, grupuri de puncte, linii de rupere, axe ale traseelor după PI, profiluri după PVI, coridoare, sistematizare, rețele de conducte. Modul de lucru este diferit și mult mai simplu: nu există linie de comandă, stiluri sau fișier de desen. Citiți o dată [Venind de la alte programe civile](topic:coming-from) înainte de prima lucrare reală.

## Ce vă trebuie

- Un browser desktop recent: Chrome, Edge, Firefox sau Safari. Vedeți [Browsere](common:browsers).
- Un mouse sau touchpad și o tastatură, sau un ecran tactil: desenarea are butoanele de pe ecran {{ui:Finish}}, {{ui:Undo point}} și {{ui:Cancel}} (vedeți [Mouse, touchpad și tactil](topic:keyboard#mouse-trackpad-and-touch)).
- Planul se desenează în 2D cu pânza browserului. [Vizualizarea 3D](topic:site-3d) folosește grafica WebGL a browserului; dacă nu poate porni, bara de stare spune de ce, iar planul funcționează în continuare.
- Fără cont și fără încărcare. Fișierele se deschid pe calculator și se salvează ca descărcări. Vedeți [Fișierele](common:your-files).

:::note
CivilCraft rulează astăzi ca o versiune timpurie pentru browser, încă în lucru. Versiunile pentru desktop nu sunt disponibile încă, iar salvarea în cloud nu este disponibilă încă. Tot ce creați rămâne pe calculator până când îl salvați sau exportați.
:::

## Deschiderea CivilCraft

1. Deschideți CivilCraft în browser.
2. Așteptați până se umple ecranul: o bară de instrumente în partea de sus, un panou în stânga, planul în mijloc și un panou **Proprietăți** în dreapta.
3. Pe un plan gol vedeți o casetă intitulată **Începeți cu punctele de releveu**. Ea listează primii pași și are un link, {{ui:Open the sample site}}.

Pentru a folosi CivilCraft mai târziu fără conexiune, faceți clic pe {{ui:Save for offline}} din bara aplicației și așteptați {{ui:Offline ready}}. Include acest ajutor, amplasamentul demonstrativ și bibliotecile 3D și GIS. Vedeți [Offline](common:offline). Apăsați {{key:F1}} sau faceți clic pe {{ui:Help}} oricând, pentru a deschide acest ajutor lângă aplicație.

## Primele zece minute: amplasamentul demonstrativ

Amplasamentul demonstrativ este un mic releveu în picioare SUA: 276 de puncte în coordonate State Plane, o creastă, un șanț de scurgere cu linie de curgere și două muchii de mal. Vine odată cu aplicația, deci puteți urmări fără un fișier propriu.

1. Faceți clic pe {{ui:Open the sample site}} din caseta de pe plan.
   Se deschide dialogul **Import puncte**. Spune „Citite 276 de puncte ca PNEZD (din rândul de antet), separate prin virgule.” și arată primele rânduri.
2. Faceți clic pe {{ui:Import}}.
   Planul se umple cu puncte, curbe de nivel și marginea modelului de teren. Bara de stare de jos spune că punctele au fost importate și câte triunghiuri are modelul de teren (546).
3. Uitați-vă în panoul din stânga, sub **Puncte**. Punctele sunt grupate după primul cuvânt din descriere: CP, FL, GRD, RIDGE, TBN, TBS și TREE.
4. În coloana **Model de teren** a acelui tabel, setați **FL**, **RIDGE**, **TBN** și **TBS** la {{ui:Breakline}}.
   Modelul de teren se reconstruiește imediat. Datele despre **Model de teren** arată acum „Linii de rupere: 4”, iar curbele de nivel se îndoaie brusc de-a lungul liniei de curgere și al crestei, în loc să le taie transversal.
5. Mutați indicatorul peste plan. Bara de stare arată coordonatele estică și nordică sub indicator și cota terenului acolo.
6. La **Afișare**, setați {{ui:Contours every}} la 0.5 ft și activați {{ui:Elevation bands}}. Apare o scară de culori cu o legendă sub casetele de bifare. Dezactivați din nou benzile când terminați.

Acum aveți un model al terenului natural. Urmează un drum.

## Trasarea unui drum scurt

1. Apăsați {{key:A}} (sau faceți clic pe {{ui:Alignment}} din grupul **Proiectare**).
2. Faceți clic pe trei puncte pe amplasament, unul după altul. O linie roșie urmează indicatorul și arată lungimea și orientarea următoarei tangente.
3. Apăsați {{key:Enter}} pentru a încheia.
   Axul traseului apare cu kilometrajul. Panoul din dreapta afișează **Axul traseului**: lungimea, tabelul PI și curba din PI-ul din mijloc (rază de 100 ft sau mai mică, dacă 100 ft nu încape).
4. În panoul din dreapta, la **Profil de proiectare**, faceți clic pe {{ui:Start from the ground}}.
   Vizualizarea profilului se deschide sub plan, cu terenul natural și o pantă de proiectare dreaptă de la un capăt la altul.
5. Apăsați {{key:I}} pentru a activa {{ui:Add PVIs}}, apoi faceți clic o dată în vizualizarea profilului, aproape de mijloc. Apare un PVI.
6. În tabelul PVI din dreapta, scrieți o lungime a curbei (de exemplu 100) în caseta **Lungime curbă L** a PVI-ului din mijloc și apăsați {{key:Enter}}. Profilul are acum o curbă verticală, cu valoarea K notată.
7. La **Coridor**, bifați **Baleiere ansamblu de-a lungul profilului de proiectare**.
   Drumul este sistematizat în teren: benzi de circulație, banchete și taluzuri laterale până la punctul de intersecție cu terenul. Blocul **Terasamente** arată debleul și rambleul.

Nu este nevoie să căutați valori exacte. Fiecare cifră poate fi modificată în panoul din dreapta, iar {{key:Mod+Z}} anulează ultima modificare.

## Salvarea lucrării

1. Scrieți un nume în câmpul **Nume** din partea de sus a panoului din stânga.
2. Apăsați {{key:Mod+S}} (sau faceți clic pe {{ui:Save}}).
   Browserul descarcă un fișier cu numele amplasamentului, care se termină în `.civilcraft.json`. Conține punctele, setările modelului de teren, axele traseelor, profilele, coridoarele, platformele și conductele.
3. Pentru a continua mai târziu, faceți clic pe {{ui:Open}} (sau apăsați {{key:Mod+O}}) și alegeți acel fișier, sau trageți-l pe plan.

:::warning
Nu există salvare automată. Dacă închideți fila cu modificări nesalvate, browserul întreabă dacă doriți să plecați; dacă plecați, modificările se pierd. Salvați des.
:::

## Unde mergeți mai departe

- [Importul punctelor de releveu](topic:import-points) cu fișierele proprii.
- [Construirea și rafinarea modelului de teren](topic:build-surface) cu linii de rupere și o limită.
- [Ecranul, pe părți](topic:workspace).
- [Taste și mouse](topic:keyboard).
