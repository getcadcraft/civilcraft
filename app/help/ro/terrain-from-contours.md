---
title: Terenul din curbele de nivel
summary: Construiți suprafața terenului dintr-o hartă cu curbe de nivel: alegeți straturile de linii, indicați de unde vine cota fiecărei linii, verificați intersecțiile și duplicatele și construiți. Curbele devin linii de rupere, cu triunghiurile plate de pe creste și văi corectate. O hartă trasată după o imagine sau un PDF poate fi scalată și plasată după două puncte cunoscute.
keywords: curbe de nivel, linii de nivel, teren din curbe de nivel, suprafață din curbe de nivel, hartă topografică, fără coordonate, linii de rupere, triunghiuri plate, creastă, vale, vârf de deal, curbe care se intersectează, curbe duplicate, echidistanță, scalare hartă, două puncte, plasare hartă, DXF, DWG, shapefile
from: e6161653
---

Un topograf trimite uneori o hartă cu curbe de nivel: linii cu cote, dar fără puncte. CivilCraft construiește terenul existent din aceste linii.

## Aducerea curbelor de nivel

Deschideți harta ca linii: un desen DXF sau DWG, un shapefile sau GeoJSON (**GIS** › {{ui:Import}}, sau trageți fișierul pe plan). Liniile intră ca **straturi de hartă**. Sub Suprafață › {{ui:Mai multe}}, alegeți {{ui:Teren din curbe de nivel}}.

## Indicarea sursei fiecărei cote

Bifați straturile care conțin curbe de nivel, apoi alegeți **Cota din**:

- {{ui:Cotele proprii ale liniilor}}: o linie ale cărei vârfuri au toate aceeași cotă (o polilinie 3D sau o polilinie cu cotă). O linie la 0 este desen în plan și nu are cotă.
- Un **câmp numeric** al stratului (de exemplu ELEV), când harta a venit cu unul.
- {{ui:Un început și un interval, în ordinea în care sunt listate liniile}}: pentru linii fără nicio cotă. Prima linie listată primește **Cota primei linii**, următoarea primește aceeași cotă plus **Echidistanța curbelor de nivel**, și așa mai departe. Listați liniile de jos în sus (sau reordonați-le în strat).

## Verificare, apoi construire

{{ui:Verificare}} enumeră, în cuvinte, ce este greșit înainte ca ceva să se modifice:

- o linie **fără cotă** sau cu mai puțin de două puncte;
- o linie **duplicată** (aceeași formă de două ori, chiar desenată în sens invers);
- două linii care se **intersectează**, la cote diferite sau la aceeași cotă (și o linie care se intersectează cu ea însăși), cu locul;
- o cotă care **nu este pe echidistanță** (o greșeală de tastare, de exemplu 105.5 pe o hartă la 1 m).

Bifați {{ui:Omiterea liniilor care se intersectează cu altele}} ca să eliminați linia care intersectează cele mai multe altele (apoi următoarea, până când nu se mai intersectează niciuna): se elimină o linie rătăcită care taie fiecare curbă de nivel, nu curbele de nivel. **Simplificarea liniilor în limita** subțiază vârfurile aflate mai aproape de un traseu drept decât această distanță.

{{ui:Construire teren}} adaugă liniile la terenul existent ca linii de rupere (un singur pas de anulare), astfel că suprafața trece exact prin fiecare curbă de nivel. Cu {{ui:Remedierea triunghiurilor plate de pe creste, văi și vârfuri de deal}} bifat și o echidistanță dată, CivilCraft adaugă și un punct în fiecare triunghi plat (un triunghi ai cărui colțuri se află toate pe aceeași curbă de nivel), la înălțimea la care continuă panta de lângă el, niciodată la mai mult de o jumătate de echidistanță de curba de nivel. Fără aceasta, vârfurile crestelor, fundurile văilor și vârfurile dealurilor ies ca plăci plate. Pe un deal de test, eroarea față de suprafața reală a scăzut cu un sfert; pe o creastă, cu 40 %.

## O hartă fără coordonate

Pentru o hartă cu curbe de nivel trasată după o imagine sau un PDF, deschideți **Scalarea și plasarea straturilor după două puncte cunoscute**. Indicați două puncte de pe hartă și unde se află ele în realitate; straturile bifate sunt scalate, rotite și mutate ca să se potrivească (un singur pas de anulare; cotele nu se modifică). Aceleași două puncte dau scara (afișată în mesaj) și rotația.

Suprafața este la fel de bună ca harta: între două curbe de nivel este un plan, deci terenul real dintre ele nu este cunoscut. Verificați rezultatul față de cotele punctuale înainte de a vă baza pe el.
