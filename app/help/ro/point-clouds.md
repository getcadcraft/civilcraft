---
title: Nori de puncte de la o dronă sau un scaner
summary: Cu suplimentul Nor de puncte, deschideți un fișier LAS sau LAZ cu milioane de puncte, vizualizați tot norul, îl curățați, îl sortați în teren, vegetație și clădiri și construiți din el terenul, curbele de nivel și volumele.
keywords: nor de puncte, las, laz, dronă, fotogrametrie, recap, lidar, scanare, teren, clasificare, zgomot, depozit de material, volum, debleu și rambleu, curbe de nivel, linie de rupere, eye-dome, ortomozaic, ortho, drapare, strat de hartă, export las, export laz, comprimare
from: e4a4901f
---

Cei mai mulți oameni nu au nevoie de asta, de aceea este un supliment. Activați {{ui:Nor de puncte}} în {{ui:Setări}} › {{ui:Suplimente}}; apare o filă {{ui:Nor de puncte}} în panoul din dreapta. Fișierul este citit în browser și împărțit în plăci (tiles) care sunt păstrate în spațiul de stocare al browserului (sau într-un dosar pe care îl alegeți). **Nimic nu este încărcat.**

:::warning
Tot ce raportează această filă este un număr calculat din date, nu un certificat. A fost testată pe un amplasament fictiv, încă nu pe un zbor real cu dronă: citiți primele rezultate cu atenție și spuneți-ne ce găsiți. Specialistul autorizat decide ce valoare au terenul, curbele de nivel și volumele.
:::

## Deschiderea unui nor

Sub {{ui:Deschidere nor}} alegeți un fișier LAS sau LAZ. Filă spune câte puncte conține, sistemul său de coordonate și unitățile, și cât spațiu necesită o construcție; apăsați {{ui:Construire nor}}. O construcție poate fi oprită și reluată cu {{ui:Reluare}} (alegeți din nou același fișier). Fișierul nu este modificat niciodată. Un fișier de 100 de milioane de puncte se construiește în câteva minute pe o stație de lucru și ocupă cam cât fișierul.

Sub {{ui:Nori pe acest computer}} deschideți sau eliminați un nor. {{ui:Păstrare nori într-un dosar…}} (Chrome, Edge și aplicația Studio) păstrează plăcile într-un dosar ales, de exemplu un dosar CadCraft clouds în Documente, astfel încât un nor de 10 GB nu trebuie să încapă în spațiul de stocare al browserului; norii construiți mai devreme rămân unde au fost construiți. Browserul cere din nou permisiunea după o repornire: apăsați {{ui:Utilizare din nou a dosarului …}}.

## Vizualizarea lui

{{ui:Vizualizare în 3D}} desenează norul din plăci grosiere și îl rafinează pe măsură ce vă apropiați, fără a depăși niciodată {{ui:Cele mai multe puncte desenate}} deodată (2.5 milioane; 500 de mii pe un telefon). Colorare după culoarea fișierului, înălțime, clasă, intensitate sau reziduu. {{ui:Iluminare eye-dome}} umbrește marginile după adâncime, astfel încât forma se citește fără normale (dezactivată pe telefon); {{ui:Punctele se micșorează cu distanța}} face punctele îndepărtate mai mici și pe cele apropiate mai mari; {{ui:Dimensiunea punctului}} stabilește mărimea. Planul arată norul ca o rastră sub desen și **se rafinează la apropiere** de o parte a sa.

## Curățarea lui

Sub {{ui:Curățare}} desenați un lasou, o casetă sau un poligon în plan (sau în 3D din vederea de sus: în 3D conturul este proiectat direct în jos, deci este exact doar din vederea de sus). Filă arată câte puncte se află înăuntru **înainte** de a aplica: {{ui:Ștergere puncte}}, {{ui:Schimbare clasă}}, {{ui:Restaurare puncte șterse}} sau {{ui:Decupare la acest contur}}. {{ui:Anulare}} și {{ui:Refacere}} parcurg jurnalul de modificări; fișierul în sine nu este modificat niciodată. {{ui:Filtru de zgomot…}} marchează punctele rătăcite ca puncte joase (clasa 7) sau zgomot înalt (clasa 18).

## Sortarea lui

{{ui:Găsire teren}} lucrează placă cu placă și marchează terenul (clasa 2) și punctele joase; toleranța este de 0.15 m, sau 0.08 m cu comutatorul de precizie pentru topografie. Raportează cusăturile dintre plăci care nu se potrivesc. {{ui:Clasificare vegetație și clădiri}} marchează apoi vegetația joasă, medie și înaltă și clădirile, după înălțimea față de teren și după cât de plate sunt împrejurimile. Nu există învățare automată, deci un șopron cu acoperiș plat sub copaci poate fi greșit: verificați.

## Teren, curbe de nivel, linii de rupere

{{ui:Construire teren}} face terenul existent din punctele de teren și îl adaugă în proiect la fel ca un import LAS (un singur pas de anulare). Apoi compară punctele cu el: media, RMS, percentila 95, proporția în toleranță și cele zece locuri care diferă cel mai mult, fiecare cu {{ui:Localizare}}. Colorarea după {{ui:Reziduu}} arată unde terenul și norul nu concordă.

O **linie de rupere** (bordură, șanț sau creasta unui mal) se alege pe nor: {{ui:Alegere linie de rupere pe nor}} în vederea 3D ia cel mai apropiat punct desenat la fiecare clic, iar {{ui:Alegere linie de rupere în plan}} ia cel mai apropiat punct al norului (întâi teren) sub fiecare clic; dublu clic sau Enter încheie linia. Următoarea {{ui:Construire teren}} o folosește. {{ui:Afișare curbe de nivel}} desenează curbele de nivel peste nor, într-o imagine mică, și stabilește echidistanța proiectului.

## Volume

{{ui:Volum depozit de material…}} calculează volumul suprafeței de deasupra unei baze în interiorul unui contur desenat. Desenați conturul pe teren plat în jurul grămezii și alegeți baza: cel mai jos punct al conturului, un plan, o bază curbă netedă, o suprafață care trece prin contur sau un nivel pe care îl introduceți. Pe teren înclinat sau curb folosiți planul sau baza curbă; cel mai jos punct citește prea sus. Punctele conturului care se ridică peste celelalte (un copac pe linie) sunt lăsate afară din bază. {{ui:De la un zbor la altul}} dă debleu și rambleu între doi nori. Ambele pot fi salvate ca CSV.

## Ortomozaic

Sub {{ui:Ortomozaic (imagine de sus)}} alegeți ortomozaicul dronei împreună cu fișierul său de lume și `.prj`, atunci când le are: un GeoTIFF, sau un PNG ori JPEG. Devine un **strat de hartă** al proiectului, astfel încât planul îl arată sub desen, iar vederea 3D (culoarea {{ui:Hartă}}) îl pictează pe terenul construit, deci construiți mai întâi {{ui:Construire teren}}. Filă arată cât din nor acoperă imaginea și avertizează când nu acoperă deloc: cauza obișnuită este un alt sistem de coordonate, deci dați și fișierul `.prj`. Când nu există `.prj`, programul întreabă unde sunt coordonatele. Imaginea este păstrată în fișierul proiectului; un GeoTIFF peste 200 MB este refuzat, iar un mozaic foarte mare este redus la 16 megapixeli, deci pentru un releveu mare decupați mai întâi mozaicul la amplasament.

## Export

{{ui:Export}} scrie norul curățat și clasificat ca un fișier nou (toate punctele, clasele curate sau doar terenul). Sub {{ui:Tip fișier}} alegeți:

- **LAS 1.4 (necomprimat)**: formatul de punct 6, sau 7 cu culoare.
- **LAZ (comprimat)**: aceleași puncte, comprimate fără pierderi, deci fiecare punct revine exact. Este scris ca formatul de punct 0, sau 2 cu culoare, într-un fișier LAS 1.4. Pe amplasamentul fictiv de 300 m, LAZ a fost cam a cincea parte din mărimea fișierului LAS 1.4. Formatele LAZ 0 și 2 păstrează doar clasele 0 până la 31: un punct cu o clasă mai mare este refuzat cu un mesaj, deci exportați acel nor ca LAS 1.4.

LAZ este scris de compresorul propriu CadCraft, realizat după specificația LAZ publicată. S-a verificat că propriul nostru cititor și doi cititori LAZ independenți (laz-perf, pe care aplicația îl folosește pentru a deschide fișiere LAZ, și laspy cu lazrs) citesc fiecare punct exact, iar fișierele LAZ făcute cu laspy ies identice octet cu octet când le scriem din nou punctele. Alte programe nu au fost încă încercate, deci dacă unul nu deschide un fișier, spuneți-ne care.

Acolo unde browserul poate scrie un fișier pe parcurs, alegeți mai întâi fișierul, iar un nor foarte mare este scris în el placă cu placă, în loc să fie strâns în memorie; altfel fișierul este strâns și descărcat, ceea ce merge până la câteva sute de megabyți.

## Ce nu face

Citește doar LAS și LAZ (E57, PLY și PCD nu sunt conectate încă la această filă, iar mai multe fișiere ale unui zbor nu sunt unite), nu reproiectează un nor (se presupun sistemul și metrii proiectului), nu citește fișiere RCP sau RCS ale Autodesk, nu face o suprafață din fotografii și nu găsește singur stâlpi, bordури sau conducte.
