---
title: Garduri
summary: Un gard de-a lungul unei linii, al unei parcele sau al unei platforme: stâlpi, rigle, panouri sau șipci, porți, în pantă sau în trepte pe teren, un tabel centralizator, simboluri în plan și elemente IFC. Disponibil și pentru un asistent.
keywords: gard, stâlpi, rigle, panouri, șipci, poartă, în pantă, în trepte, teren, tabel centralizator, ifc, balustradă, limită
from: c0e7b84a
---

Realizați un gard de-a lungul unei linii caracteristice, al unui aliniament, al unei parcele sau al unei platforme, cu stâlpii și porțile plasate automat.

## Realizarea unui gard

1. Selectați o linie, o parcelă sau o platformă.
2. Deschideți **Model de teren, Mai multe, Garduri...**
3. Alegeți stilul (panouri, rigle sau șipci), în pantă sau în trepte, înălțimea, distanța dintre stâlpi și lățimea porții, apoi **Gard de-a lungul selecției** sau **Cu o poartă**, pentru a pune o poartă la mijlocul celui mai lung segment drept.

Stâlpii se pun la capete, în fiecare colț (un vârf care virează cu 20 de grade sau mai mult), la ambele margini ale fiecărei porți și în travee egale între ele, niciuna mai lungă decât distanța setată. Panourile **în pantă** urmează terenul între stâlpi. Panourile **în trepte** rămân orizontale și se decalează la stâlpi; golul de sub un panou este cel mai mare la stâlpul din aval, iar fereastra avertizează când acest gol depășește limita sau când terenul urcă prin dreptul unui panou. Porțile de 6 picioare (1.8 m) și mai late au două canaturi; în plan, canaturile sunt desenate deschise, cu sensul de deschidere.

## Tabel centralizator și rezultate

Fiecare gard afișează lungimea, stâlpii pe tipuri, panourile, porțile și treptele, cu un tabel centralizator **CSV** al stâlpilor, panourilor, riglelor, șipcilor și porților. Planul are straturile de gard (C-FENC, C-FENC-POST, C-FENC-GATE) pentru PDF, DXF și DWG. Exportul IFC conține stâlpii (IfcMember, post), panourile (IfcRailing, user defined fence panel), riglele (IfcMember) și porțile (IfcDoor, gate), câte un sistem pentru fiecare gard.

## De la un asistent

`fence_build` realizează un gard (puncte sau o linie, o parcelă sau o platformă denumită, porți după kilometraj), iar `fence_list` enumeră gardurile împreună cu tabelul lor centralizator.

## Ce nu este realizat încă

Dimensiunile de pornire sunt alegeri uzuale, nu un cod normativ. Tipurile din Bibliotecă sunt preluate doar ca nume. Porțile trebuie să se afle pe un singur segment drept. BimCraft nu are încă acest instrument.
