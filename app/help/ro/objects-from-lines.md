---
title: Obiecte din linii, păstrate legate
summary: Creați pavaj, o zonă plantată, o rabată, un gard viu, o alee, un zid, o bordură, trepte, o rampă, o platformă, un șanț vegetal sau o linie caracteristică dintr-o linie; urmează linia când aceasta se mută, până rupeți legătura.
keywords: dintr-o linie, linii de desen, DWG, DXF, legătură, legat, urmărire, regenerare, rupere legătură, linie caracteristică, linie caracteristică din linii de desen, strat importat, contur, supercad studio, linie de desen
from: eb67a0c6
---

{{ui:Dintr-o linie}} (Peisaj › {{ui:Mai multe}}): faceți clic pe o linie caracteristică, sau pe o linie ori un contur al unui strat DWG/DXF importat. O linie închisă poate face pavaj, un gazon, o rabată plantată, o pajiște, un acoperământ vegetal, o rabată sau o platformă; o linie deschisă, o alee, un zid, o bordură, trepte (primul și ultimul punct), o rampă, un gard viu sau un șanț vegetal. Oricare dintre tipuri poate face o **linie caracteristică**, cu excepția unei linii caracteristice în sine.

## O linie caracteristică dintr-o linie

O linie caracteristică făcută dintr-o linie preia punctele ei, închise dacă linia era închisă. Cotele ei se așază pe terenul existent (0 unde nu există încă), iar utilizarea ei este **Inactiv**: nu modelează teren până nu alegeți o utilizare și nu stabiliți cotele în Proprietăți. Când linia se mută, o linie caracteristică cu același număr de puncte păstrează fiecare cotă stabilită; când linia câștigă sau pierde puncte, cotele se așază din nou pe teren. Vedeți [Linii caracteristice](topic:feature-lines).

Obiectul nou păstrează o **legătură** cu linia sa. Când linia se mută (trageți punctele ei, sau desenul este mutat ori recitit), obiectul preia noua formă în același pas de anulare, iar prin modificatorii de teren, terenul proiectat urmează. Proprietăți arată la ce este legat; {{ui:Rupere legătură}} îl face liber.

Liniile sunt verificate primele: o linie are nevoie de cel puțin 2 puncte (3 pentru un contur), cel mult 5000, numere reale; un contur trebuie să fie închis și să nu se intersecteze. O linie care nu trece verificarea nu este folosită: obiectul rămâne cum era, iar panoul Probleme spune de ce. Dacă linia este ștearsă, obiectul rămâne, iar panoul Probleme notează asta.

## În SuperCad Studio

Deschideți amplasamentul și desenul 2D în același proiect. Alegeți o linie sau o polilinie din desenul 2D, apăsați Ctrl+K și rulați {{ui:Obiect de peisaj din linia desenului selectat}}: CivilCraft întreabă ce să creeze, ca mai sus, iar obiectul rămâne legat de acea linie a desenului. După ce modificați liniile din desen, Ctrl+K {{ui:Actualizare peisaj din desen}} face ca obiectele să urmeze, cu câte un pas de anulare pentru fiecare linie. Fișierul de legături al proiectului înregistrează ce obiect urmează ce linie. Ajutorul SuperCad Studio are un subiect despre Peisaj.
