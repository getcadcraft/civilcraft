---
title: Calcularea debitelor pluviale, a diametrelor conductelor și a liniei piezometrice
summary: Desenați bazinele care se scurg în fiecare structură, adunați debitele pe rețea cu metoda rațională, dimensionați conductele cu ecuația lui Manning și vedeți unde linia piezometrică este plină sau ajunge la suprafață.
keywords: scurgere pluvială, bazin de colectare, metoda rațională, coeficient de scurgere, timp de concentrare, intensitatea ploii, idf, manning, dimensionare conducte, linie piezometrică, hgl, linia energiei, egl, supraîncărcare, inundare, nivel aval
from: e44872ec
---

Scurgerea pluvială funcționează pe [rețeaua de conducte](topic:pipe-network): desenați mai întâi rețeaua, apoi suprafețele care se scurg în ea. Totul apare sub **Scurgere pluvială** în panoul din dreapta când nu este selectat nimic.

## Desenarea unui bazin de colectare

1. Faceți clic pe **Desenare bazin de colectare** sub **Scurgere pluvială**.
2. Faceți clic pe colțurile zonei care se scurge spre o structură. {{key:Enter}} sau un dublu clic încheie; {{key:Backspace}} șterge ultimul colț, {{key:Esc}} oprește.
3. Bazinul se scurge într-o structură aflată în interiorul lui, altfel în cea mai apropiată. Se deschid proprietățile lui: stabiliți numele, **Coeficientul de scurgere C** (partea din ploaie care se scurge, de la 0 la 1), **Timpul de concentrare** în minute și structura în care **Se scurge în**.

**Desenare alt bazin** în proprietățile sale pornește următorul. Faceți clic în interiorul unui bazin pe plan pentru a-l selecta; {{key:Delete}} îl elimină. Fiecare modificare este un pas: {{key:Mod+Z}} o anulează.

## Stabilirea furtunii de proiectare

Intensitatea ploii este i = a ÷ (tc + b) la puterea c, în in/h pentru un proiect în ft și în mm/h pentru un proiect în m. Ajustați **Intensitatea a**, **b** și **c** după propria curbă intensitate-durată-frecvență pentru perioada de revenire pentru care proiectați.

:::warning
Curba de intensitate inițială, coeficientul Manning n (0.013) și pierderea la joncțiune (0.5) sunt valori provizorii, nu un standard. Stabiliți-le după propriile date pluviometrice și criterii de proiectare.
:::

- **Cel mai scurt timp de concentrare**: nicio conductă nu se calculează la un timp mai scurt (10 minute la început).
- **Manning n**: rugozitatea conductelor.
- **Pierderea la joncțiune**: energia pierdută în fiecare structură, ca fracțiune din înălțimea de viteză V²/2g a conductei care pleacă din ea.
- **Nivelul apei la evacuare**: nivelul din aval, unde se golește ultima conductă. Lăsați-l gol când evacuarea este liberă.

## Cum se adună debitele

Fiecare conductă transportă toate bazinele aflate deasupra ei. Q = C × i × A, unde C × A este însumat pe rețea, iar i este intensitatea la cel mai lung timp de concentrare al apei care ajunge: timpul propriu al bazinului sau timpul din amonte plus timpul de parcurs prin conducte (lungime ÷ viteza la secțiune plină). Q este în ft³/s (A în acri) sau în m³/s (A în hectare).

## Dimensionarea conductelor

Tabelul de sub **Debite și linii de nivel** arată, pentru fiecare conductă, debitul, ce transportă la secțiune plină pe panta ei, viteza, linia piezometrică la capul și piciorul ei și cât de adânc curge.

**Dimensionare conducte pentru aceste debite** dă fiecărei conducte cea mai mică dimensiune standard care transportă debitul la propria pantă (de la 12 la 72 in, sau de la 300 la 1800 mm). Este un singur pas. Radierele rămân unde sunt: dacă dimensiunile se schimbă, folosiți **Stabilirea fiecărui radier din reguli** pentru a păstra acoperirea, apoi verificați din nou tabelul.

## Citirea liniilor de nivel

Linia piezometrică (HGL) se calculează din ieșire spre amonte:

- O conductă care curge parțial plină are linia piezometrică la suprafața apei: radierul plus adâncimea normală.
- Când apa de dedesubt este mai sus decât generatoarea superioară sau transportă mai mult decât poate la secțiune plină, conducta curge plină (supraîncărcată), iar linia ei piezometrică urcă cu panta de frecare pe lungimea ei.
- La fiecare structură, linia piezometrică este linia de la nivelul superior al conductei care pleacă plus pierderea la joncțiune.
- Linia energiei (EGL) este linia piezometrică plus înălțimea de viteză.

Conductele care curg pline sunt listate, la fel și orice structură unde linia piezometrică este peste cota marginii: apa ajunge acolo la suprafață, iar structura este încercuită cu roșu pe plan. Selectați o conductă sau o structură ca să vedeți debitul, adâncimea, viteza și ambele linii în proprietățile ei.

## Dirijarea unei furtuni

Metoda rațională dă un singur vârf pentru fiecare conductă. {{ui:Dirijare furtună}} (sub rezultate, în Proprietățile rețelei) calculează în schimb întreaga furtună: scurgerea fiecărui bazin în timp, dusă pe conducte cu timpul lor de parcurs și cu acumularea, și adunată acolo unde se întâlnesc.

1. Lăsați goale {{ui:Ploaia durează}} și {{ui:Intensitatea ploii}} pentru a folosi cel mai lung timp de concentrare și curba de ploaie de mai sus, sau introduceți valori proprii.
2. Apăsați {{ui:Dirijare furtună}}. Tabelul arată, pentru fiecare conductă, debitul maxim de intrare și de ieșire, cu cât este mai mic vârful de ieșire, ce parte din capacitatea plină a conductei folosește și minutul în care atinge vârful.
3. Fiecare ieșire primește un mic grafic debit-timp și {{ui:Descărcare hidrogramă (CSV)}}.

Un bazin trimite mai departe ploaia medie pe timpul său de concentrare, deci o furtună mai scurtă decât acesta are un vârf mai mic decât C × i × A. Fiecare conductă este dirijată cu metoda Muskingum–Cunge, folosind adâncimea de curgere deja determinată prin metoda rațională. Două ramuri cu timpi de concentrare diferiți nu ating vârful împreună, deci suma lor este mai mică decât suma vârfurilor.

Aceasta nu modelează supraîncărcarea, remuul, stocarea în structuri sau inundarea. O conductă al cărei vârf dirijat depășește capacitatea plină este listată, iar apa ei este trecută mai departe ca și cum ar încăpea. Folosiți-o pentru a vedea momentul și atenuarea, nu pentru a dimensiona conducta. Este un instrument de calcul auxiliar: îl verifică un inginer.

## Salvat împreună cu proiectul

Bazinele și setările de furtună sunt salvate în fișierul proiectului. Nu sunt încă în trasarea PDF, în DWG sau DXF ori în LandXML: vezi [Încă nerealizat](topic:not-built-yet).
