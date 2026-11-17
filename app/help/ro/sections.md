---
title: Linii de profil și secțiuni transversale
summary: Tăiați secțiuni perpendicular pe un ax, vedeți terenul, proiectarea și debleul și rambleul din fiecare pichet și obțineți volumele prin metoda ariilor la capete medii.
keywords: diagrama maselor, diagrama de compensare, punct de echilibru, contracție, umflare, distanță de transport, împrumut, depozit, planșe de secțiuni, planșe transversale, pdf secțiuni, secțiuni, secțiuni transversale, linii de profil, vizualizarea profilului, debleu, rambleu, arii, metoda ariilor la capete medii, volume de terasamente, pichet, decalaj, csv
from: 5060173c
---

O secțiune transversală arată drumul așa cum va fi construit: perpendicular pe ax, într-un singur pichet, terenul existent, proiectarea (coridorul sau platforma nivelată) și debleul și rambleul dintre ele.

## Adăugarea liniilor de profil

1. Selectați un ax. În **Proprietăți**, sub **Linii de profil**, faceți clic pe {{ui:Add sample lines}}.
2. Setați **La fiecare** (distanța: 50 ft sau 20 m la început), **Lățimea stângă** și **Lățimea dreaptă** (cât de departe ajunge fiecare secțiune de la axă).
3. Pentru a tăia o secțiune la un anumit pichet, scrieți-l în **Adăugare pichet** (de exemplu `2+35`) și apăsați {{key:Enter}}.

Secțiunile sunt tăiate la fiecare multiplu întreg al distanței, la ambele capete ale axului, la începutul și sfârșitul fiecărei curbe (PC și PT) și la pichetele pe care le adăugați. Liniile de profil apar pe plan ca linii gri peste ax; ies și în DXF, DWG și PDF, pe stratul C-ROAD-SCTN. Fiecare modificare este un pas: {{key:Mod+Z}} o anulează.

## Vizualizarea profilului

Deschideți-o cu {{ui:Section view}} din Proprietățile axului, cu {{ui:Sections}} sub **Suprafață** › {{ui:More}}, sau cu {{key:X}}. Ține locul vederii profilului de sub plan.

- Parcurgeți secțiunile cu săgețile din bara sa, cu lista de pichete sau cu {{key:Left}} și {{key:Right}} cât timp vederea secțiunii are focusul ({{key:Home}} și {{key:End}} pentru prima și ultima).
- Linia gri este terenul existent, linia roșie este proiectarea. Debleul este umbrit cu portocaliu, rambleul cu verde. Punctele coridorului sunt marcate: CL (axa), EOP (marginea părții carosabile), SH (umărul) și DL (punctul de intersecție cu terenul).
- Antetul dă pichetul, ariile de debleu și rambleu ale acestei secțiuni și exagerarea verticală. **Fit** umple panoul; alegeți 1× ca să vedeți secțiunea la scară reală.
- Linia groasă de pe plan arată ce secțiune este pe ecran.

## Planșele de secțiuni

{{ui:Section sheets (PDF)}} sub **Linii de profil** pune fiecare secțiune pe pagini PDF, în rânduri de la stânga la dreapta și de sus în jos, în ordinea pichetelor. Alegeți **Hârtia**, **Scara planului** (scara orizontală a secțiunilor) și **Exagerarea profilului** (1×, 2×, 5× sau 10×); caseta spune câte secțiuni încap pe o pagină și câte pagini rezultă.

Fiecare secțiune arată o grilă cu decalaje și cote, terenul (punctat), proiectarea, debleul și rambleul umbrite (portocaliu și verde), punctele coridorului și, sub ea, pichetul și ariile sale de debleu și rambleu. Fiecare secțiune de pe planșe este desenată la aceeași dimensiune, suficient de înaltă pentru cea mai mare; când aceasta nu încape pe pagină la exagerarea dvs., CivilCraft folosește cea mai mare care încape și o spune. Banda de titlu numește axul, pichetele de pe pagina respectivă, scările și „Foaia 1 din 3”.

## Volume prin metoda ariilor la capete medii

Între două secțiuni vecine, volumul este media celor două arii ale lor înmulțită cu distanța dintre pichete. Bara arată totalurile pentru ax, iar {{ui:CSV}} descarcă ariile și volumele fiecărei secțiuni, cu totaluri parțiale (iarzi cubi pentru proiectele în picioare, metri cubi pentru cele metrice).

**Proprietățile** arată aceleași totaluri alături de volumele metodei pe grilă din [Volume de terasamente](topic:volumes). Cele două sunt aproximări diferite: secțiunile mai apropiate le aduc mai aproape, iar pe un drum drept, pe teren plat, sunt identice.

:::note
Debleul și rambleul sunt numărate doar în interiorul suprafețelor nivelate (liniile de ieșire la lumină ale unui coridor sau ale unei platforme), ca în metoda pe grilă. Fără coridor sau platformă, proiectarea este terenul, deci o secțiune nu arată debleu sau rambleu.
:::

## Diagrama maselor

**Diagrama maselor** sub **Linii de profil** desenează diagrama de compensare din aceleași volume prin metoda ariilor la capete: de-a lungul pichetelor, totalul cumulat al debleului minus rambleul.

- **Contracția (−) sau umflarea (+) a debleului** spune ce face un iard cub de debleu odată pus ca rambleu: −10 % (valoarea de pornire, un substituent) înseamnă că se contractă la 0.9; roca care se umflă poate fi +5 %. Folosiți cifra din raportul dvs. geotehnic.
- Unde linia urcă, drumul este în debleu; unde coboară, în rambleu. Peste zero (umbrit cu portocaliu), pământul se mută spre pichetul mai mare; sub zero (verde), spre pichetul mai mic.
- **Punctele de echilibru** sunt locurile unde linia taie zero: între două dintre ele debleul și rambleul se compensează. Tabelul listează fiecare porțiune echilibrată, volumul mutat (punctul său cel mai înalt sau cel mai jos) și distanța medie de transport (aria umbrită împărțită la acel volum).
- Unde linia se termină departe de zero, ce rămâne este **depozit** (deasupra) sau **împrumut** (dedesubt). În ultima porțiune contează doar pământul de dincolo de nivelul la care se termină.

**CSV** salvează ordonata de masă la fiecare secțiune, porțiunile și factorul.
