---
title: Platforme pentru case pe terenuri înclinate
summary: Nivelarea unei platforme pe o pantă: ziduri de sprijin ca margini ale platformei, harta de debleu și rambleu colorată după adâncime, cu cote de punct (plan și 3D), o secțiune trasată oriunde prin teren și proiect, și rampe sau platforme înclinate pentru accese.
keywords: platformă, platformă pentru casă, teren înclinat, deal, zid de sprijin, debleu și rambleu, hartă debleu rambleu, cote de punct, secțiune liberă, linie de secțiune, desene pentru primărie, acces carosabil, rampă, platformă înclinată, nivelare, factor de umflare, terasamente
from: daa08a3f
---

O platformă pentru casă este un **pad** (**Proiectare** › {{ui:Platformă}}): un poligon plat, la un singur nivel, nivelat în teren. Patru lucruri ajută pe o pantă.

## Ziduri de sprijin ca margini ale platformei

Selectați platforma și setați o latură pe {{ui:Vertical (zid de sprijin)}} în loc de pantă (**Proprietăți** › {{ui:Laturi și ziduri de sprijin}}, sau {{ui:Verticale: ziduri de sprijin}} pentru toate laturile deodată). Înălțimea zidului se citește din terenul de-a lungul lui: vârful la teren, baza la platformă, afișate la ambele capete și în punctul cel mai înalt pe plan, cu un avertisment când depășește limita pe care ați setat-o. Zidurile și pantele pot fi combinate una lângă alta.

## Harta debleului și rambleului

Bifați {{ui:Hartă de debleu și rambleu}} sub **Afișare**. Planul este umbrit după adâncimea debleului sau a rambleului, în trepte egale (debleul cu tonuri calde, rambleul albastru, aproape nivelul cu tonuri pale), cu o legendă. **Cotele de punct** sunt tipărite pe platformă: schimbarea nivelului în punctele unei grile, iar cel mai adânc debleu și cel mai înalt rambleu marcate cu ▲. Celulele sunt aceleași cu cele folosite de volumele de terasamente, deci harta și cifrele se potrivesc întotdeauna.

În vederea 3D, alegeți **Debleu și rambleu** din lista de culori ca să aplicați aceleași culori peste teren și proiect.

Un factor de umflare sau de tasare se află în instrumentul de diagrama maselor (**Proiectare** › {{ui:Diagrama maselor}}); el nu se aplică volumelor unei platforme.

## O secțiune liberă

Sub **Suprafață** › {{ui:Mai multe}}, alegeți {{ui:Profil liber}}, faceți clic pe punctele liniei de secțiune oriunde (poate fi frântă) și apăsați {{key:Enter}}. O casetă de dialog desenează secțiunea: terenul natural, proiectul nivelat (cu linie întreruptă) și debleul și rambleul dintre ele, umbrite, cu ariile lor (proiectul se ia în calcul doar în interiorul platformelor și al drumurilor). {{ui:Exagerare verticală}} este implicit potrivită desenului; {{ui:Salvare ca SVG}} și {{ui:Salvare ca CSV}} vă dau un desen pentru primărie și cifrele.

## Rampe și platforme înclinate

Sub **Suprafață** › {{ui:Mai multe}}, alegeți {{ui:Rampă sau platformă înclinată}}, faceți clic pe capătul de jos și apoi pe cel de sus, apăsați {{key:Enter}} și introduceți lățimea, nivelul de la capătul de jos și panta. Platforma este o fâșie ale cărei colțuri poartă aceste niveluri (muchia dintre două colțuri merge la o pantă constantă) și se nivelează în teren ca orice platformă. Colțurile oricărei platforme pot purta, de asemenea, propriile niveluri, deci o alee carosabilă, o rampă sau o terasă înclinată este o platformă cu un nivel pe fiecare colț.
