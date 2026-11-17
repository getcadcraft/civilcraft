---
title: Deschiderea unui DWG sau DXF ca linii
summary: Deschideți liniile unui desen pe plan, strat cu strat, folosiți conturile, polilinii 3D și conturile închise ale desenului pentru modelul de teren și transformați blocurile sale de puncte în puncte topografice.
keywords: verificare topografică, cote din text, dwg, dxf, cad, desen, linii, curbe de nivel, linii de rupere, contur, polilinie, polilinie 3D, straturi, plan de bază, topo, desen topografic, blocuri, referințe de bloc, puncte topografice din blocuri, atribute, blocuri de punct, punct de inserare
from: da0f4c58
---

Un releveu topografic sosește adesea ca desen: curbele de nivel ca polilinii la cota lor, liniile de rupere ca polilinii 3D, conturul amplasamentului ca polilinie închisă. CivilCraft deschide **spațiul model** al desenului ca straturi pe plan și poate transforma aceste linii direct în modelul de teren.

## Deschideți desenul

1. Faceți clic pe {{ui:Linii}} din grupul **Model de teren** (sau pe {{ui:Deschidere}}, ori trageți fișierul pe plan) și alegeți un fișier `.dwg` sau `.dxf`. Desenul se citește pe acest calculator; nimic nu se încarcă. Se citesc DWG din 2000 până în 2018 și DXF ASCII.
2. Caseta de dialog **Linii** listează straturile desenului care conțin linii, forme închise sau puncte și dacă au **cote**. Straturile oprite în desen pornesc debifate. Textul, hașurile, cotele și alte obiecte care nu sunt linii sunt numărate și omise (caseta spune care).
3. Verificați **Unitățile desenului**. Când desenul își spune unitățile, CivilCraft le convertește în cele ale proiectului (milimetri în metri, metri în picioare, țoli în picioare). Un desen în picioare se citește ca picioare topografice SUA, fără scalare: cele două diferă cu 2 părți la un milion, iar scalarea coordonatelor de stat plan cu acest factor le-ar muta cu picioare. Când desenul nu spune unitățile, numerele lui se citesc în unitățile proiectului; alegeți unitățile corecte din listă dacă nu sunt.
4. În **Utilizare pentru modelul de teren**, alegeți ce dă fiecare strat modelului (sau lăsați **Doar afișează-l**). Straturile numite ca niște curbe de nivel (TOPO, CONT, CNTR) care au cote pornesc ca linii de rupere.
5. Faceți clic pe {{ui:Adăugare}}. Straturile apar sub **Straturi GIS** în panoul din stânga; fiecare utilizare intră în model. Fiecare parte este un pas separat: {{key:Mod+Z}} le ia înapoi una câte una.

## Ce poate da fiecare tip de strat

| Stratul conține | Utilizare pentru modelul de teren |
|---|---|
| Curbe de nivel (polilinii la o cotă) | Linii de rupere la cota proprie a liniilor, sau la câmpul ELEV |
| Polilinii 3D | Linii de rupere la cotele lor proprii |
| Un contur închis | Limita modelului (cea mai mare formă închisă, sau cea pe care ați selectat-o) |
| Puncte cu o cotă | Puncte topografice, descrise cu numele stratului |
| Linii la cota 0 (linii de plan) | Nimic: rămân pe plan ca desen de bază |

Un desen scris de CivilCraft ține liniile caracteristice ca polilinii 3D care își amintesc arcele. Caseta de dialog arată atunci **Linii caracteristice**: lăsați-o bifată ca să le aduceți înapoi ca linii caracteristice, cu arcele și utilizările lor (un pas de anulare), sau debifați-o ca să fie citite ca linii obișnuite.

Ulterior, folosiți {{ui:Utilizare pentru modelul de teren}} din meniul stratului, sub **Straturi GIS**, pentru a face același lucru cu un strat doar afișat.

## Puncte topografice din blocuri

Desenele topografice poartă adesea punctele lor ca blocuri: un mic simbol la fiecare măsurătoare, cu atribute pentru numărul punctului, descriere și cotă. Când desenul are referințe de bloc, caseta de dialog are o secțiune **Puncte topografice din blocuri**:

1. Bifați blocurile de luat (tabelul spune câte referințe are fiecare, pe ce straturi și ce atribute), sau bifați straturi ca să luați toate referințele de bloc de pe ele.
2. Alegeți de unde vin **numărul**, **descrierea** și **cota** fiecărui punct: un atribut, numele blocului sau al stratului, următoarele numere libere sau Z-ul punctului de inserare. CivilCraft pornește de la atributele probabile (PT, DESC, ELEV și similare) și ia cota dintr-un atribut doar când blocurile stau la zero.
3. Debifați straturile de linii dacă vreți doar punctele, apoi faceți clic pe {{ui:Adăugare}}.

Fiecare referință devine un punct topografic în punctul ei de inserare. Se iau în calcul doar referințele plasate în spațiul model; blocurile incluse în alte blocuri nu. Numerele deja existente în proiect, sau folosite de două ori în desen, primesc numere noi după cel mai mare, iar un atribut de cotă care nu este număr lasă acel punct fără cotă; linia de stare numără ambele cazuri. Desenul nu se modifică niciodată, iar fiecare punct își amintește blocul: Proprietățile sale arată **Din bloc**, cu blocul, stratul și handle-ul. Adăugarea punctelor este un singur pas, deci {{key:Mod+Z}} le ia pe toate.

## Cote scrise ca text, și verificarea

Cotele de nivel scrise ca text (sau într-un atribut de bloc care nu este bloc de punct topografic) nu sunt linii. Secțiunea **Cote de nivel topografice și verificare** le poate lua ca puncte topografice și listează ce pare greșit în desen: unități, sistem de coordonate, distanța față de zero, curbe de nivel plate, cote ciudate, puncte dublate. Vedeți [Verificarea unui desen topografic la import](topic:survey-check).

## Cum se citește desenul

- Arcele, cercurile, elipsele, segmentele de polilinie bombate și spline-urile devin bucăți drepte scurte (cel mult la fiecare 5°).
- Referințele de bloc se desenează unde sunt plasate, la fel și blocurile imbricate; ce conține un bloc pe stratul 0 preia stratul referinței.
- Obiectele desenate într-un alt plan (altă direcție de extrudare) sunt plasate în coordonate globale.
- Fiecare obiect primește trei câmpuri: LAYER, TYPE (tipul obiectului) și ELEV (cota sa, când toate punctele au aceeași cotă).
- Coordonatele se iau așa cum sunt: desenul trebuie să folosească aceleași coordonate ca proiectul (de exemplu aceeași zonă de stat plan). Referințele externe (xref) nu se deschid: deschideți-le separat.

:::tip
Un desen cu curbe de nivel dă cel mai bun model cu câteva cote punctuale pe vârfuri și în depresiuni, unde doar curbele lasă triunghiuri plate. Adăugați-le ca puncte topografice, sau dintr-un strat de puncte din desen.
:::
