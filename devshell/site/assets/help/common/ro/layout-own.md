---
title: Aranjarea propriului aspect și salvarea configurărilor
summary: Alegeți ce panou arată browserul proiectului, Proprietățile sau propriul conținut al panoului, unde stă caseta de instrumente și ce conțin barele, salvați-l ca aspect propriu și păstrați configurări complete sub un nume, între care să comutați.
keywords: aspect, spațiu de lucru, aranjare, personalizare, aspect propriu, panouri, editoare, browserul proiectului, proprietăți, casetă de instrumente, bară rapidă, casetă de informații, mediu de lucru, configurare, profil, salvare configurare, comutare configurare, export configurare, import configurare, ccenv
from: 2a71af43
---

Pe lângă cele trei aspecte integrate, puteți aranja unul propriu și puteți salva întreaga configurare sub un nume, ca să reveniți la ea dintr-un singur pas.

## Aranjarea propriului aspect

1. Deschideți {{ui:Setări}} (rotița sau {{key:Mod+,}}), alegeți {{ui:Global}}, apoi {{ui:Aspect}}.
2. Alegeți {{ui:Aranjați propriul aranjament…}}. Caseta pornește de la aspectul pe care îl folosiți acum.
3. Dați-i un nume, apoi alegeți:
   - **Peste desen:** bara de instrumente a aplicației, o panglică sau niciuna; o bară de titlu; o casetă de informații și ce comenzi conține.
   - **Lângă desen:** caseta de instrumente la stânga, la dreapta sau deloc, cu sau fără {{ui:Instrumentele mele}}; ce panou conține paletele, care este deasupra (browserul proiectului sau Proprietăți, de exemplu) și care sunt file sub el.
   - **Zona desenului:** file de vizualizare, o bară rapidă și o bară de vizualizare cu comenzile bifate, paleta de editare, o bară de stare.
   - **Aspect vizual:** dimensiune, contururi ale butoanelor și stilul filelor.
4. Alegeți {{ui:Folosește acest aranjament}}. Aplicația trece la el imediat, iar fiecare aplicație care are aspecte îl folosește și ea.

Se oferă doar ce are această aplicație. Aspectul propriu este listat la {{ui:Din suplimente și fișiere}}; {{ui:Exportare acest aranjament}} îl salvează ca fișier pe care îl puteți da unui coleg, iar butonul de eliminare îl șterge. Panourile pe care le ocupă se pot ancora, plutesc și se mută în ferestre proprii, ca în [Aranjarea panourilor](common:arrange-panels).

## Salvarea configurării ca mediu de lucru

Un mediu de lucru este configurarea completă pentru fiecare aplicație din acest browser: aspectul, stilul meniului și tastele, stilul barei de instrumente, panourile și dimensiunile lor și {{ui:Instrumentele mele}}. Tema și limba nu fac parte din el.

- **Salvare:** scrieți un nume sub {{ui:Medii de lucru}} și alegeți {{ui:Salvare configurare proprie}}. Salvarea sub un nume existent înlocuiește acea configurare.
- **Comutare:** alegeți o configurare din listă și alegeți {{ui:Comutare la ea}}. Aplicația se reîncarcă în acea configurare; dacă aveți lucru nesalvat, aplicația întreabă mai întâi, ca la orice reîncărcare.
- **Partajare:** {{ui:Export}} salvează configurarea aleasă ca fișier `.ccenv.json`; {{ui:Importați o configurare…}} adaugă una dintr-un fișier. Un fișier setează doar aceste alegeri, nimic altceva.
- **Eliminare:** alegeți o configurare și alegeți {{ui:Eliminare}}.

Puteți păstra până la douăsprezece configurări.

Pentru a încerca mai întâi aspectele integrate, vezi [aspectul cu casetă de instrumente și casetă de informații](common:layout-toolbox) și [aspectul cu panglică și browserul proiectului](common:layout-ribbon).
