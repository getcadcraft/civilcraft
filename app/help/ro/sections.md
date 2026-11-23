---
title: Linii de profil și secțiuni transversale
summary: Tăiați secțiuni perpendicular pe un aliniament, vedeți terenul, proiectul și debleul și rambleul la fiecare pichet și obțineți volume prin metoda ariilor medii la capete.
keywords: diagrama maselor, curba masei, punct de echilibru, contracție, umflare, distanță de transport, împrumut, depozit, planșe de secțiuni, planșe de secțiuni transversale, secțiuni pdf, secțiuni, secțiuni transversale, linii de profil, vizualizarea secțiunii, debleu, rambleu, arii, volum prin arii medii la capete, terasamente, pichet, decalaj, csv
from: 09639ce2
---

O secțiune transversală arată drumul așa cum va fi construit: perpendicular pe aliniament, la un pichet, terenul existent, proiectul (coridorul sau platforma nivelată) și debleul și rambleul dintre ele.

## Adăugarea liniilor de profil

1. Selectați un aliniament. În **Proprietăți**, sub **Linii de profil**, faceți clic pe {{ui:Adăugare linii de profil}}.
2. Setați **La fiecare** (spațierea: 50 ft sau 20 m la început), **Lățimea stângă** și **Lățimea dreaptă** (cât de departe ajunge fiecare secțiune de la axul drumului).
3. Pentru a tăia o secțiune la un anumit pichet, introduceți-l în **Adăugare pichet** (de exemplu `2+35`) și apăsați {{key:Enter}}.

Secțiunile se taie la fiecare multiplu întreg al spațierii, la ambele capete ale aliniamentului, la începutul și sfârșitul fiecărei curbe (PC și PT) și la pichetele pe care le adăugați. Liniile de profil apar în plan ca linii gri peste aliniament; ele merg și în DXF, DWG și PDF, pe stratul C-ROAD-SCTN. Fiecare modificare este un singur pas: {{key:Mod+Z}} îl anulează.

## Vizualizarea secțiunii

Deschideți-o cu {{ui:Vizualizarea profilului}} din **Proprietăți** ale aliniamentului, cu {{ui:Profile}} sub **{{ui:Model de teren}}** › {{ui:Mai multe}}, sau cu {{key:X}}. Ea ia locul vizualizării profilului de sub plan.

- Parcurgeți secțiunile cu săgețile din bară, din lista de pichete sau cu {{key:Left}} și {{key:Right}} cu vizualizarea secțiunii activă ({{key:Home}} și {{key:End}} pentru prima și ultima).
- Linia gri este terenul existent, linia roșie proiectul. Debleul este hașurat portocaliu, rambleul verde. Punctele coridorului sunt marcate: CL (axul), EOP (marginea părții carosabile), SH (acostamentul) și DL (intersecția cu terenul).
- Antetul dă pichetul, ariile de debleu și de rambleu ale acestei secțiuni și exagerarea verticală. **Potrivire** umple panoul; alegeți 1× pentru a vedea secțiunea la scară reală.
- Linia groasă din plan arată ce secțiune este pe ecran.
- **Zoom și deplasare:** rotița face zoom în jurul indicatorului, iar tragerea mută vizualizarea. {{ui:Potrivire}} (sau {{key:F}}, sau un dublu clic) potrivește din nou întreaga secțiune.

## Măsurarea într-o secțiune

1. Faceți clic pe {{ui:Măsurare}} din bara secțiunii sau apăsați {{key:M}}. Indicația spune „Faceți clic pe primul punct, apoi pe al doilea.”
2. Faceți clic pe două puncte. Fiecare se agață de capătul unei linii sau de un punct al coridorului (CL, EOP, SH, DL); țineți apăsat {{key:Alt}} pentru un punct liber.
3. Afișajul dă distanța orizontală (ΔH), distanța verticală (ΔV), panta în procente cu raportul ei și lungimea dreaptă, în unitățile proiectului.

Faceți clic din nou pentru a începe o nouă măsurare. {{key:Esc}} o șterge, iar {{key:M}} dezactivează măsurarea.

## Planșele de secțiuni

{{ui:Planșe de profile (PDF)}} sub **Linii de profil** pune fiecare secțiune pe pagini PDF, în rânduri de la stânga la dreapta și de sus în jos, în ordinea pichetelor. Alegeți **Hârtia**, **Scara planului** (scara orizontală a secțiunilor) și **Exagerarea profilului** (1×, 2×, 5× sau 10×); caseta de dialog spune câte secțiuni încap pe o pagină și câte pagini rezultă.

Fiecare secțiune arată o grilă cu decalaje și cote, terenul (întrerupt), proiectul, debleul și rambleul hașurate (portocaliu și verde), punctele coridorului și, sub ea, pichetul și ariile sale de debleu și de rambleu. Fiecare secțiune de pe planșe este desenată la aceeași dimensiune, suficient de înaltă pentru cea mai mare; când aceasta nu încape în pagină la exagerarea aleasă, CivilCraft folosește cea mai mare care încape și o spune. Banda-titlu dă numele aliniamentului, pichetele de pe pagină, scările și „Planșa 1 din 3”.

## Până la ce se măsoară debleul și rambleul

Un coridor poate avea straturi sub îmbrăcăminte: straturi de îmbrăcăminte, componente de șablon, traseu. Selectorul **Volume măsurate până la** din bara secțiunii alege până unde merg debleul și rambleul:

- **Suprafața de jos** (implicită): până la baza acelor componente, astfel încât debleul include adâncimea stratificației îmbrăcămintei.
- **Suprafața de sus**: doar până la partea de sus a proiectului, cum se socoteau înainte componentele.

Ariile din antet, volumele de dedesubt, CSV-ul și diagrama maselor urmează toate această alegere, iar ea se salvează cu proiectul.

## Volume prin ariile medii la capete

Între două secțiuni vecine, volumul este media celor două arii înmulțită cu distanța dintre pichetele lor. Bara arată totalurile pentru aliniament, iar {{ui:CSV}} descarcă ariile și volumele fiecărei secțiuni, cu totaluri cumulate (iarzi cubi pentru proiectele în picioare, metri cubi pentru cele metrice).

**Proprietăți** arată aceleași totaluri alături de volumele metodei rețelei din [Volume de terasamente](topic:volumes). Cele două sunt aproximări diferite: secțiunile mai apropiate le aduc mai aproape, iar pe un drum drept, pe teren plat, sunt identice.

:::note
Debleul și rambleul se socotesc doar în interiorul zonelor nivelate (liniile de intersecție cu terenul ale unui coridor sau ale unei platforme), ca în metoda rețelei. Fără coridor sau platformă, proiectul este terenul, deci o secțiune nu arată debleu sau rambleu.
:::

## Diagrama maselor

**Diagrama maselor** sub **Linii de profil** trasează diagrama maselor din aceleași volume prin arii la capete: de-a lungul pichetelor, totalul cumulat al debleului minus rambleul.

- **Contracția (−) sau umflarea (+) a debleului** arată ce devine un iard cub de debleu odată așezat ca rambleu: −10 % (valoarea de pornire, provizorie) înseamnă că se contractă la 0.9; roca ce se umflă poate fi +5 %. Folosiți cifra din raportul geotehnic.
- Acolo unde linia urcă, drumul este în debleu; acolo unde coboară, în rambleu. Deasupra zeroului (hașurat portocaliu), pământul se mută spre pichetele mai mari; sub zero (verde), spre cele mai mici.
- **Punctele de echilibru** sunt acolo unde linia taie zero: între două dintre ele, debleul și rambleul se echilibrează. Tabelul listează fiecare porțiune echilibrată, volumul deplasat (cel mai înalt sau cel mai jos punct al său) și distanța medie de transport (aria hașurată împărțită la acel volum).
- Acolo unde linia se termină departe de zero, surplusul este **depozit** (deasupra) sau **împrumut** (dedesubt). În ultima porțiune, doar pământul dincolo de nivelul la care se termină se socotește ca deplasat.

**CSV** salvează ordonata masei la fiecare secțiune, porțiunile și factorul.
