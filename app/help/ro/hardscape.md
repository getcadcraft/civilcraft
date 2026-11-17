---
title: Pavaje, ziduri și trepte
summary: Pavaje cu pante către o gură de scurgere sau o pantă transversală, un model și stratificarea lui; alei care urmează terenul; ziduri de sprijin și ziduri libere cu tălpi de fundare în trepte; borduri; rampe și trepte verificate față de limitele lor; export IFC.
keywords: amenajări dure, pavaj, pavele, terasă, pante, scurgere, pantă transversală, spic, șiruri decalate, alee, drum pietonal, zid de sprijin, zid de grădină, talpă de fundare, coronament, bordură, margine, rampă, accesibilitate, trepte, scări, contratrepte, paliere
from: 51475877
---

Amenajarea dură se recalculează din teren de fiecare dată, deci urmează relieful și se regenerează când se modifică terenul sau linia lui. Trageți colțurile ei pe plan, ca orice linie. Deschideți-o din {{ui:Amenajări dure}} din grupul Peisagistică.

## Pavaj

Faceți clic pe colțuri și apăsați {{key:Enter}}. În Proprietăți:

- **Nivel**: gol = media terenului de sub el.
- **Pante**: nivel, o **pantă transversală** (un procent către o direcție) sau **către o gură de scurgere**: CivilCraft vă cere să faceți clic unde merge gura de scurgere, apoi fiecare colț se ridică de la gura de scurgere cu panta stabilită. Săgețile de pe plan arată pantele.
- **Model** (grilă, șiruri decalate, în spic) cu dimensiunea unității, rostul și unghiul; **Lățimea marginii**. Pe o planșă, rosturile mai mici de un milimetru sunt omise.
- Pavajul face parte din suprafața proiectată. Straturile lui (pavele, așternut, fundație) intră în IFC și în cantități.

## Alei

Faceți clic de-a lungul aleii și apăsați {{key:Enter}}. Ea urmează terenul, cu **Pantă transversală** spre partea sa dreaptă. O alee mai abruptă decât **Panta maximă admisă** este marcată cu `!` pe plan acolo unde se află, iar Proprietățile spun cât de abruptă devine.

## Ziduri

Faceți clic de-a lungul zidului și apăsați {{key:Enter}}. Un zid este **de sprijin** sau **liber**. Fără **Vârf**, el se ridică cu **Înălțimea** sa deasupra terenului pe toată lungimea; introduceți un vârf ca să-l mențineți la nivel. **Talpa de fundare** stă la o adâncime stabilită sub teren și coboară în trepte întregi, deci rămâne la nivel între ele. Proprietățile dau lungimea, înălțimile, aria fețelor și treptele tălpii; planul afișează vârful și baza zidului (TW / BW) la fiecare capăt.

:::warning
Un zid de sprijin mai înalt de 1.2 m (4 ft) este semnalat: îl proiectează un inginer.
:::

## Borduri

Faceți clic de-a lungul bordurii și apăsați {{key:Enter}}; setați lățimea și înălțimea ei de ieșire.

## Rampe

Faceți clic de jos în sus și apăsați {{key:Enter}}. Nivelurile vin din teren la fiecare capăt, dacă nu le introduceți. O rampă primește un palier la fiecare diferență de nivel de 750 mm (2.5 ft) și este verificată față de **Panta maximă admisă** (1:12 la început) și de o lățime minimă; Proprietățile spun cât de lungă ar trebui să fie.

## Trepte

Faceți clic pe marginea din față a primei trepte, apoi acolo unde treptele ajung sus, și apăsați {{key:Enter}}. Numărul de contratrepte vine din înălțime și din **Contratreapta cea mai mare**; lățimea treptei vine din regula de confort 2R + G ≈ 630 mm, niciodată sub **Cea mai mică lățime de treaptă**; un palier la fiecare **Cel mult contratrepte pe rampă**. Proprietățile spun dacă încap între cele două puncte sau cât de mult mai lungi trebuie să fie.

:::note
Limitele pentru rampe și trepte sunt valori implicite etichetate. Setați-le pe cele cerute de codul construcțiilor aplicabil.
:::

## În afara CivilCraft

- Mai multe › {{ui:Export IFC peisagistic}}: pavaje și alei ca `IfcPavement`, ziduri ca `IfcWall` (zidurile de sprijin ca RETAININGWALL) cu straturile lor, borduri ca `IfcKerb`, rampe ca `IfcRamp`, trepte ca `IfcStair` cu contratreptele și treptele lor.
- Tabelul plantelor, **Trimitere către TakeoffCraft**, transmite ariile pavajelor și volumele straturilor, ariile fețelor și lungimile zidurilor, lungimile bordurilor și numărul de trepte.
- Planșa de detalii desenează secțiunea fiecărui zid, stratificarea fiecărui pavaj și fiecare rampă de trepte. Vezi [Planșe de peisagistică](topic:landscape-sheets).
