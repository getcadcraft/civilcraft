---
title: Aranjarea propriului aspect și salvarea configurărilor
summary: Alegeți ce panou arată browserul proiectului, Proprietățile sau propriul conținut al panoului, unde merge caseta de instrumente și ce conțin barele, salvați-l ca propriul aspect și păstrați configurări întregi sub un nume, între care să comutați.
keywords: aspect, spațiu de lucru, aranjare, personalizare, aspectul meu, aspect propriu, panouri, editoare, browserul proiectului, proprietăți, casetă de instrumente, bară rapidă, casetă de informații, mediu de lucru, configurare, profil, salvare configurare, comutare configurare, exportare configurare, import configurare, ccenv
from: 6af528e0
---

Pe lângă cele trei aspecte integrate, puteți aranja unul propriu și puteți salva întreaga configurare sub un nume, ca să reveniți la ea dintr-un singur pas.

## Aranjarea propriului aspect

1. Deschideți {{ui:Setări}} (rotița, sau {{key:Mod+,}}), alegeți {{ui:Global}}, apoi {{ui:Aspect}}.
2. Alegeți {{ui:Aranjați propriul aranjament…}}. Caseta pornește de la aspectul pe care îl folosiți acum.
3. Dați-i un nume, apoi alegeți:
   - **Peste desen:** bara de instrumente a aplicației, o panglică sau niciuna; o bară de titlu; o casetă de informații și ce comenzi conține.
   - **Lângă desen:** caseta de instrumente în stânga, în dreapta sau deloc, cu sau fără {{ui:Instrumentele mele}}; ce panou ține paletele, care este deasupra (browserul proiectului sau Proprietățile, de exemplu) și care sunt file sub el.
   - **Zona desenului:** filele de vizualizare, o bară rapidă și o bară de vizualizare cu comenzile pe care le bifați, paleta de editare, o bară de stare.
   - **Aspect:** dimensiune, contururile butoanelor și stilul filelor.
4. Alegeți {{ui:Folosește acest aranjament}}. Aplicația trece imediat la el, iar fiecare aplicație care are aspecte îl folosește și ea.

Se oferă doar ce are această aplicație. Aspectul propriu este listat sub {{ui:Din suplimente și fișiere}}; {{ui:Exportare acest aranjament}} îl salvează ca fișier pe care îl puteți trimite unui coleg, iar butonul de eliminare îl șterge. Panourile pe care le umple se ancorează, plutesc și se mută în propriile ferestre, ca în [Aranjarea panourilor](common:arrange-panels).

## Salvarea configurării ca spațiu de lucru

Un spațiu de lucru este întreaga configurare pentru fiecare aplicație din acest browser: aspectul, stilul meniului și tastele, stilul barei de instrumente, panourile și dimensiunile lor și {{ui:Instrumentele mele}}. Tema și limba nu fac parte din el.

- **Salvare:** scrieți un nume sub {{ui:Medii de lucru}} și alegeți {{ui:Salvare configurare proprie}}. Salvarea sub un nume existent înlocuiește acea configurare.
- **Comutare:** alegeți o configurare din listă și alegeți {{ui:Comutare la ea}}. Aplicația se reîncarcă în acea configurare; dacă aveți lucru nesalvat, aplicația întreabă mai întâi, ca la orice reîncărcare.
- **Partajare:** {{ui:Export}} salvează configurarea aleasă ca fișier `.ccenv.json`; {{ui:Importați o configurare…}} adaugă una dintr-un fișier. Un fișier stabilește doar aceste alegeri, nimic altceva.
- **Eliminare:** alegeți o configurare și alegeți {{ui:Eliminare}}.

Puteți păstra până la douăsprezece configurări.

Pentru a schimba un aspect fără să deschideți caseta (trageți un bloc, faceți clic dreapta pe un instrument), vedeți [Modificarea unui aspect pe ecran](common:layout-edit). Pentru a încerca mai întâi aranjamentele integrate, vedeți [aspectul cu casetă de instrumente și casetă de informații](common:layout-toolbox), [aspectul cu panglică și browserul proiectului](common:layout-ribbon) și [aspectul Drafting](common:layout-drafting).
