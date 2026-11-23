---
title: Pavaj, ziduri și trepte
summary: Pavaj cu pante spre un canal sau cu pantă transversală, un model și stratificația sa; alei care urmează terenul; ziduri de sprijin și ziduri libere cu fundații în trepte; borduri; rampe și trepte verificate față de limitele lor; export IFC.
keywords: amenajări dure, pavaj, dale, terasă, pante, canal de scurgere, pantă transversală, model în spic, așezare în lung, alee, zid de sprijin, zid de grădină, talpă de fundare, coronament, bordură, margine, rampă, accesibilitate, trepte, scări, contratrepte, treaptă, podest
from: d34b4466
---

Amenajarea dură se calculează din nou din teren de fiecare dată, astfel încât urmează relieful și se regenerează când se modifică terenul sau linia sa. Trageți colțurile sale în plan ca orice linie. Deschideți-o din {{ui:Amenajări dure}} din grupul Peisaj.

## Pavaj

Faceți clic pe colțuri și apăsați {{key:Enter}}. În **Proprietăți**:

- **Nivel**: gol = media terenului de sub el.
- **Pante**: orizontală, o **pantă transversală** (un procent spre o direcție) sau **spre un canal**: CivilCraft vă cere să faceți clic unde se află canalul, apoi fiecare colț urcă de la canal cu panta respectivă. Săgețile din plan arată pantele.
- **Model** (grilă, așezare în lung, în spic) cu dimensiunea unității, rostul și unghiul; lățimea **Margine**. Pe o planșă, rosturile mai mici de un milimetru sunt omise.
- Pavajul face parte din suprafața proiectată. Straturile sale (dale, pat de așezare, fundație) intră în IFC și în cantități.

## Alei

Faceți clic de-a lungul aleii și apăsați {{key:Enter}}. Urmează terenul, cu **Pantă transversală** spre partea din dreapta. O alee mai abruptă decât **Panta maximă admisă** este marcată cu `!` în plan acolo unde se află, iar **Proprietăți** spune cât de abruptă devine.

Acolo unde o alee întâlnește un drum construit de un coridor, se oprește la marginea exterioară a drumului, la același nivel cu trotuarul sau acostamentul de acolo, în suprafața proiectată și în vizualizarea 3D. O alee care traversează un drum este nivelată și arătată ca două bucăți, iar un capăt desenat până la de două ori lățimea aleii înainte de drum este prelungit până la marginea acestuia. Planul arată aleea așa cum ați desenat-o, iar lungimea și aria sa includ întreaga linie. Vedeți [Baleierea unui coridor rutier](topic:corridor).

## Ziduri

Faceți clic de-a lungul zidului și apăsați {{key:Enter}}. Un zid este **de sprijin** sau **liber**. Fără **Cota superioară**, el se ridică cu **Înălțimea** sa deasupra terenului pe toată lungimea; introduceți o cotă superioară pentru a-l menține orizontal. **Talpa de fundare** se află la o adâncime fixată sub teren și coboară în trepte întregi, astfel încât rămâne orizontală între ele. **Proprietăți** dau lungimea, înălțimile, aria feței și treptele de fundare; planul etichetează partea de sus și de jos a zidului (TW / BW) la fiecare capăt.

:::warning
Un zid de sprijin mai înalt de 1.2 m (4 ft) este semnalat: un inginer îl proiectează.
:::

## Bordurile

Faceți clic de-a lungul bordurii și apăsați {{key:Enter}}; setați lățimea și înălțimea de ieșire.

## Rampe

Faceți clic de jos în sus și apăsați {{key:Enter}}. Nivelurile vin din teren la fiecare capăt, dacă nu le introduceți. O rampă primește un podest la fiecare înălțime de urcare de 750 mm (2.5 ft) și este verificată față de **Panta maximă admisă** (1:12 la început) și o lățime minimă; **Proprietăți** spun cât de lungă ar trebui să fie.

## Trepte

Faceți clic pe muchia din față a treptei de jos, apoi acolo unde treptele ajung sus, și apăsați {{key:Enter}}. Numărul de contratrepte rezultă din înălțime și din **Cea mai mare contratreaptă**; adâncimea treptei din regula de confort 2R + G ≈ 630 mm, niciodată sub **Cea mai mică adâncime a treptei**; un podest la fiecare **Contratrepte per volată, cel mult**. **Proprietăți** spun dacă trepte încap între cele două puncte sau cu cât trebuie să fie mai lungi.

:::note
Limitele pentru rampe și trepte sunt valori implicite etichetate. Setați-le pe cele cerute de codul construcțiilor din zonă.
:::

## În afara CivilCraft

- Mai multe › {{ui:Export IFC peisagistic}}: pavajele și aleile ca `IfcPavement`, zidurile ca `IfcWall` (zidurile de sprijin ca RETAININGWALL) cu straturile lor, bordurile ca `IfcKerb`, rampele ca `IfcRamp`, treptele ca `IfcStair` cu contratreptele și treptele lor.
- **Trimitere către TakeoffCraft** din lista plantelor transmite ariile pavajelor și volumele straturilor, ariile și lungimile fețelor zidurilor, lungimile bordurilor și numărul de trepte.
- Planșa de detalii desenează secțiunea fiecărui zid, stratificația fiecărui pavaj și fiecare volată de trepte. Vedeți [Planșe de peisaj](topic:landscape-sheets).
