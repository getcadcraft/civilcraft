---
title: Modificatori de teren și niveluri în timp real
summary: Tot ce modelează terenul amenajat, într-o listă ordonată (cel de după câștigă acolo unde se suprapun), debleu și rambleu pentru fiecare modificator, verificări de îmbinare în panoul Probleme, cote de punct și săgeți de pantă care citesc terenul în timp real.
keywords: modificatori de teren, stivă, ordine, teren amenajat, teren natural, suprapunere, debleu și rambleu, îmbinare, zid de sprijin, margine de pavaj, cota patului, palier de treaptă, cotă de punct, cotă de nivel, săgeată de pantă, etichetă de pantă, scurgeri
from: 3998a5b0
---

Terenul amenajat = terenul natural + modificatorii, în ordine. Terenul natural nu se modifică niciodată.

## Lista

{{ui:Niveluri}} › {{ui:Modificatori de teren…}} listează fiecare obiect care modelează terenul: platforme, berme, șanțuri înierbate, zone de sistematizare, pavaje și alei, suprafețe plantate cu un nivel finit, precum și trepte și rampe la care este bifată caseta **Modelează terenul** (cu nivelurile lor de bază și de sus). Acolo unde două se suprapun, **cel de după** câștigă. Trageți un rând sau folosiți săgețile pentru a schimba ordinea; terenul se reconstruiește imediat. Fiecare rând arată debleul și rambleul său (ce modelează după cele de deasupra), iar totalul se află sub listă.

## Verificări de îmbinare

Panoul Probleme listează, cu **Mergi la**:

- un zid a cărui latură înaltă este deasupra vârfului său (pământ peste zid) sau a cărui latură joasă arată talpa de fundare;
- o suprafață plantată al cărei nivel finit este deasupra marginii pavajului cu care se întâlnește sau mai jos de ea cu mai mult decât cei 150 mm tipici;
- trepte a căror bază sau vârf nu se leagă de pavajul pe care aterizează;
- doi modificatori care se suprapun (cel de după câștigă acolo).

Un zid de sprijin poate avea vârful care urmează latura înaltă a terenului: înălțimea lui se recalculează ori de câte ori se schimbă terenul.

## Un zid de sprijin care modelează terenul

Selectați un zid de sprijin și bifați **Modelează terenul**. Fâșia de sub zid (la fel de lată ca grosimea zidului) se alătură listei ca modificator:

- marginea de pe **latura înaltă** este menținută la nivelul terenului de acolo, stație cu stație, astfel încât vârful zidului urmează latura înaltă (cu coronamentul deasupra). Introduceți un nivel **Vârf** și atunci latura înaltă este menținută la acel nivel minus coronamentul;
- marginea de pe **latura joasă** este menținută la nivelul **Teren menținut pe latura joasă** pe care îl introduceți sau, dacă este gol, la terenul de acolo;
- latura înaltă este cea a cărei teren este mai sus pe toată lungimea zidului, deci nu se inversează niciodată de-a lungul zidului;
- terenul de dincolo de fâșie nu se modifică, iar terenul natural nu se modifică niciodată.

Ca orice modificator, se află în listă, iar un modificator plasat după el câștigă acolo unde se suprapun. Un zid al cărui nivel menținut la un capăt este mai mult decât cei 150 mm tipici față de terenul natural de acolo primește un avertisment în panoul Probleme (cu **Mergi la**). Un zid liber nu modelează terenul. Caseta este dezactivată în fișierele din versiuni anterioare, deci acestea se deschid așa cum erau.

## Cote de punct și săgeți de pantă

{{ui:Cotă de punct}} (un clic) și {{ui:Săgeată de pantă}} (două clicuri) citesc terenul de fiecare dată când sunt desenate: mutați sau reniveliați un obiect și etichetele urmează. În Proprietăți alegeți dacă o etichetă citește terenul amenajat sau pe cel natural; etichetele pentru terenul natural sunt afișate între paranteze. Săgețile arată în jos pe pantă și afișează `1:20 (5.0 %)`.
