---
title: Editarea unui punct topografic
summary: Modificați numărul, coordonatele, cota sau descrierea unui singur punct ori trageți-l într-un loc nou pe plan.
keywords: editare punct, mutare punct, modificare cotă, renumerotare, număr de punct, descriere, tragere, X (nord), Y (est), fixare punct, eroare de măsurare
from: 375ae2e9
---

O greșeală de măsurare, o înălțime greșită a mirei, o descriere scrisă greșit: corectați un singur punct, iar modelul de teren urmează.

## Modificarea valorilor unui punct

1. Cu {{ui:Selectare}}, faceți clic pe punct în plan. **Proprietăți** arată numărul, Y (est), X (nord), cota și descrierea, în câmpuri.
2. Tastați noua valoare și apăsați {{key:Enter}} (sau faceți clic în altă parte). Lăsați **Cota** necompletată pentru un punct fără cotă.
3. Modelul de teren, curbele de nivel și tot ce s-a construit pe ele se actualizează imediat.

Fiecare modificare este un singur pas: {{key:Mod+Z}} o anulează, iar {{key:Mod+Y}} o refface. O valoare pe care CivilCraft nu o poate folosi (un număr pe care îl are deja alt punct, litere într-o coordonată) este refuzată: caseta este conturată, iar bara de stare arată motivul.

O descriere nouă de cod creează un nou grup de puncte, la fel ca un import (vezi [Construirea unui model de teren](topic:build-surface)).

## Mutarea unui punct pe plan

1. Selectați punctul (primește un inel).
2. Trageți inelul. Bara de stare arată Y (est) și X (nord) unde va ajunge.
3. Eliberați pentru a muta punctul; cota sa rămâne. Apăsați {{key:Esc}} înainte de a elibera ca să-l readuceți.

## Liniile de rupere urmează punctul

O linie de rupere desenată cu instrumentul {{ui:Linie de rupere}} copiază punctele prin care trece. Când mutați un punct sau îi schimbați cota, colțurile liniei de rupere din el se mută odată cu el, în același pas. Grupurile de linii de rupere făcute din descrieri sunt întotdeauna reconstruite din puncte.

:::note
Un model de teren citit dintr-un fișier LandXML își păstrează propriile triunghiuri: modificările punctelor îl schimbă doar după {{ui:Reconstruire model de teren din puncte}}.
:::
