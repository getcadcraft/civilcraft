---
title: Șabloane de coridor și șabloane de teren
summary: Creați șabloane mici refolosibile (bordură și rigolă, trotuar, zid, șanț), construiți un coridor din ele pe kilometraj, cu stânga și dreapta separate, împărțiți un traseu în mai multe coridoare și așezați straturi de materiale pe un teren.
keywords: șablon, șabloane, bibliotecă de șabloane, crearea șabloanelor, secțiune tip, ansamblu, subansamblu, componente, coduri de punct, condiție de capăt, intersecție cu terenul, șanț, zid de sprijin, bordură, rigolă, trotuar, regiuni, interval de kilometraj, mai multe coridoare, stânga și dreapta, șablon de teren, strat vegetal, îmbrăcăminte, așezare pe teren, materiale, cantități
from: ce70e58b
---

Un **șablon** este o mică secțiune transversală pe care o desenați o dată și o refolosiți: puncte cu decalaje, pante și coduri de punct, și componente cu materiale. Un coridor poate fi construit din șabloane pe kilometraj, fiecare parte cu propriile șabloane de îmbrăcăminte și propria condiție de capăt, iar aceleași șabloane pot fi așezate pe un teren.

:::warning
Șabloanele de exemplu sunt marcaje de pornire. Valorile lor nu sunt luate dintr-un standard sau de la o agenție. Un inginer trebuie să verifice fiecare șablon și fiecare valoare pe care i-o dați înainte ca acesta să fie folosit într-un proiect.
:::

## Deschiderea șabloanelor

Deschideți {{ui:Model de teren}} › {{ui:Mai multe}} › {{ui:Șabloane de coridor…}} (sau scrieți {{cmd:TEMPLATES}}). Fereastra are trei liste:

- **În acest proiect**: șabloanele pe care le folosesc coridoarele și șabloanele de teren ale proiectului. Sunt salvate în fișierul proiectului.
- **Biblioteca mea**: șabloane păstrate în acest browser și oferite în fiecare proiect. Folosiți {{ui:Salvare în Biblioteca mea}} pe un șablon de proiect ca să-l păstrați.
- **Exemple**: două benzi cu straturi, bordură și rigolă, trotuar, intersecție cu terenul, șanț, zid de sprijin, strat vegetal sub teren și îmbrăcăminte pe teren. Fiecare este marcat „Pentru verificare de către un inginer”.

{{ui:Folosire în acest proiect}} copiază un șablon din bibliotecă sau din exemple în proiect. {{ui:Exportare șabloane ale acestui proiect}} le salvează într-un fișier `.cctemplates.json`, iar {{ui:Importare fișier}} citește unul în proiect și în Biblioteca mea. Folosiți fișierul ca să partajați șabloane sau să le mutați pe alt calculator.

## Crearea unui șablon

{{ui:Șablon nou}} (sau {{ui:Editare}} pe un șablon de proiect) deschide editorul de șabloane. Desenați partea dreaptă, spre exterior din punctul 0,0 al șablonului; partea stângă folosește același șablon spre exterior, spre stânga.

1. Dați-i un nume și un tip: **Îmbrăcăminte** (următorul șablon se atașează la capătul ei), **Condiție de capăt** (se întâlnește cu terenul) sau **Șablon de teren**.
2. Adăugați **valori**: numere cu nume, cum ar fi o lățime `w` sau o pantă `s`. O casetă de număr oriunde în șablon acceptă un număr sau numele unei valori; `-t` este valoarea `t` făcută negativă. Un coridor poate da fiecărei utilizări a șablonului propriile valori, astfel încât un singur șablon de bordură servește fiecărei înălțimi de bordură.
3. Adăugați **puncte** în ordine. Fiecare este plasat dintr-un punct anterior (sau din punctul 0,0) după constrângerea sa:

| Constrângere | Plasează punctul |
|---|---|
| Decalaj la o pantă | Un decalaj spre exterior și o pantă (ridicare pe rulare; −0.02 coboară 2%) |
| Decalaj și ridicare | Un decalaj și o ridicare |
| Drept în sus sau în jos | Doar o ridicare |
| Pantă laterală până la teren | Spre exterior din punctul său, până la teren, la raportul de debleu unde terenul este deasupra și la raportul de rambleu unde este dedesubt |
| Până la teren | Un decalaj, apoi drept în sus sau în jos până la teren |
| Zid de sprijin | Un zid de grosimea pe care o dați: în debleu, partea lui de sus atinge terenul la fața drumului; în rambleu, drumul trece peste el, iar fața lui exterioară coboară până la teren |

   Bifați **Sus** pentru punctele prin care trece suprafața finită. Ultimul punct de sus este locul unde începe următorul șablon de pe acea parte. O **Țintă** lasă un coridor să mute punctul: decalajul sau cota lui vine dintr-o linie.
4. Adăugați **componente**: forme închise prin coduri de punct (`0` este punctul 0,0), fiecare cu un nume, un material și un tip. Suprafețele lor dau volumele.

Desenul urmează fiecare modificare la scară reală, iar lista de sub el spune ce nu este în regulă (un punct care atinge terenul înainte de capăt, o valoare pe care șablonul nu o are, o componentă fără suprafață). {{ui:Adăugare la acest proiect}} sau {{ui:Salvare}} îl păstrează, ca un singur pas de anulare.

## Construirea unui coridor din șabloane

Selectați un traseu cu un coridor și, în Proprietățile lui, activați {{ui:Construire din șabloane pe kilometraj}}. Coridorul pornește cu exemplele cu două benzi și intersecție cu terenul pe ambele părți.

- **Regiuni.** Fiecare regiune începe la un kilometraj și merge până la începutul regiunii următoare. {{ui:Adăugare regiune}} adaugă una; schimbați kilometrajul ei de început în caseta ei.
- **Stânga și dreapta separate.** Fiecare parte a fiecărei regiuni are propria listă de **Îmbrăcăminte**, de la axul drumului spre exterior, și propria **Condiție de capăt**: intersecție cu terenul, un șanț, un zid sau orice șablon care se întâlnește cu terenul. Fără condiție de capăt, partea se intersectează cu terenul la pantele de debleu și rambleu ale coridorului. {{ui:Copiere de la stânga la dreapta}} copiază o parte.
- **Valori și ținte.** Sub fiecare șablon de pe o parte, o casetă pentru fiecare valoare (goală = valoarea proprie a șablonului) și, pentru un punct care primește o țintă, linia caracteristică sau linia altui coridor care îl mută.
- **De la și Până la** limitează coridorul la o parte din traseu.

Secțiunile, liniile din plan pentru fiecare cod de punct, modelul de teren nivelat, trasarea pe teren și lucrările de terasamente urmează toate. Proprietățile arată volumul fiecărei componente pe parte și pe regiune (metoda suprafețelor medii de-a lungul axului). Supraînălțarea și țintele de margine ale coridorului nu sunt folosite cât timp coridorul este construit din șabloane.

## Mai multe coridoare pe un traseu

Sub **Coridoare pe acest traseu**, {{ui:Adăugare coridor}} adaugă un coridor pe restul traseului: primul coridor primește un kilometraj de capăt la mijloc (sau își păstrează pe al lui), iar cel nou începe acolo cu ultima regiune de șabloane a primului. Fiecare coridor are propriul nume, interval de kilometraj, șabloane și lucrări de terasamente. Opriți unul cu caseta lui {{ui:Activ}}. Acolo unde două intervale se suprapun, coridorul mai târziu nivelează peste cel anterior.

## Șabloane de teren

Un șablon de teren așază straturile unui șablon pe un teren, pornind din punctul său 0,0: un strat sub punctul 0,0 intră în teren (stratul vegetal de decopertat), iar un strat deasupra lui stă pe teren (fundație și îmbrăcăminte pe un parcaj). Lățimile și pantele nu contează, contează doar adâncimea fiecărei componente deasupra sau sub punctul 0,0.

Deschideți {{ui:Model de teren}} › {{ui:Mai multe}} › {{ui:Șabloane de teren…}} (sau scrieți {{cmd:TERRAINTEMPLATES}}); blocul se află și în Proprietățile proiectului. {{ui:Adăugare șablon de teren}} adaugă unul cu exemplul de strat vegetal. Pentru fiecare alegeți:

- **șablonul** (valorile lui pot fi schimbate pentru acesta),
- **terenul**: terenul natural sau modelul de teren proiectat,
- **forma** care îl decupează: întregul teren, o parcelă, o platformă sau o linie caracteristică închisă. Mai multe șabloane de teren pot folosi forme diferite pe același teren.

Fiecare strat arată grosimea, aria în plan și volumul. Volumul este aria în plan înmulțită cu grosimea, grosimea măsurată drept în jos; aria se măsoară pe o grilă, iar aria așezată (înclinată) este dată și ea. Formele sunt desenate pe plan pe stratul C-TOPO-TMPL. Șabloanele de teren nu modifică modelul de teren proiectat.

## Materiale și cantități

Blocul Terasamente al proiectului listează **Materiale din șabloane**: fiecare componentă de coridor și fiecare strat de șablon de teren, cu volumul lui. {{ui:Trimitere la TakeoffCraft}} le scrie în fișierul de cantități după debleu și rambleu, câte un articol fiecare, în yarzi cubi (proiecte în picioare) sau în metri cubi.

## Fișiere

Șabloanele, regiunile, coridoarele suplimentare și șabloanele de teren sunt salvate în fișierul proiectului. Un proiect care nu folosește niciunul este salvat exact ca înainte, iar versiunile mai vechi de CivilCraft deschid un proiect care le folosește (ignoră șabloanele și construiesc ansamblul propriu al coridorului).
