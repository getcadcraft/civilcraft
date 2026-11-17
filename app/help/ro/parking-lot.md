---
title: Amenajarea parcării
summary: Amplasați locuri de parcare, culoare, locuri pentru persoane cu dizabilități și pentru furgonete, precum și insule în interiorul unui contur, nivelați parcarea cu pante spre guri de scurgere față de terenul existent, apoi pavați-o și plantați-o. Disponibil și pentru un asistent.
keywords: parcare, loc de parcare, culoar, dizabilități, ada, furgonetă, insulă, gură de scurgere, pantă, nivelare, debleu, rambleu, pavaj, pavele, plantare, copaci, teren, nor de puncte, mcp, asistent
from: 06c14da9
---

Încadrați o parcare într-o parcelă, o platformă sau o linie caracteristică închisă, și obțineți numărătorile, nivelarea și pavajul dintr-un singur pas.

## Amenajarea

1. Selectați pe plan o parcelă, o platformă sau o linie caracteristică închisă.
2. Deschideți **Model de teren, Mai multe, Parcare...**
3. Alegeți regulile, unghiul locurilor (90, 75, 60, 45, 30 de grade sau paralel) și culoarele cu sens unic sau cu dublu sens. Dimensiunile locurilor, culoarelor și insulelor pornesc de la tabel, iar fiecare poate fi suprascris prin scriere.
4. Alegeți **Amenajare**.

Rândurile merg de-a lungul marginii conturului care dă cele mai multe locuri (sau la unghiul pe care îl scrieți). Un loc se numără doar dacă se află în întregime în interiorul conturului. Dacă rămâne spațiu pentru un singur rând și un culoar, se adaugă o fâșie cu locuri pe o singură parte. Fereastra listează locurile, locurile pentru persoane cu dizabilități și pentru furgonete, insulele, gurile de scurgere și suprafața pe loc. Planul arată locurile, locurile pentru persoane cu dizabilități cu culoarele lor de acces hașurate, insulele, axele culoarelor și gurile de scurgere, fiecare pe propriul strat (C-PARK-...), astfel încât ajung în PDF, DXF și DWG.

## Locuri pentru persoane cu dizabilități

Cu regulile Statelor Unite, numărul urmează tabelul 208.2 din Standardele ADA 2010 pentru locurile prevăzute (unul din șase, rotunjit în sus, este loc pentru furgonetă), amplasate cel mai aproape de primul colț al conturului (intrarea), fiecare cu un culoar de acces; două pot împărți unul. Un loc mai îngust decât lățimea pentru persoane cu dizabilități, sau o pantă mai abruptă de 1:48 la locurile pentru persoane cu dizabilități, apare ca problemă. **Aceste cifre au fost introduse de mână din standard, așa cum le reținem, și nu au fost verificate față de standardul tipărit.** Dimensiunile tipice ale locurilor și culoarelor provin din ghiduri de proiectare a parcărilor și nici ele nu sunt verificate. Verificați ambele, precum și reglementările locale, înainte de a vă baza pe ele. Alegeți **Personalizat** pentru a introduce propriul număr de locuri pentru persoane cu dizabilități.

## Pante spre guri de scurgere, debleu și rambleu

Dacă nu o dezactivați, parcarea devine o zonă de nivelare în spațiul de lucru Peisagistică. Gurile de scurgere se pun pe axele culoarelor, la aproximativ 100 de picioare (30 m); suprafața urcă de la fiecare gură cu panta pe care o dați (1.5 la sută la început), astfel încât fiecare punct coboară spre cea mai apropiată gură. Nivelul se alege astfel încât debleul și rambleul parcării să se echilibreze pe terenul existent. Terenul existent este suprafața existentă a proiectului, care poate veni din puncte topografice, LandXML, dintr-un nor de puncte lidar sau de scanare transformat în suprafață, ori din curbe de nivel. Fereastra arată estimarea debleului și rambleului; volumele proiectului arată apoi cifra exactă. Zona de nivelare își păstrează marginea pe terenul existent, astfel încât, unde noua suprafață diferă de teren la margine, apare o treaptă, iar fereastra spune cât de mare este.

## Pavaj și plantare

Întregul contur primește un pavaj cu pavele (un model cu rosturi decalate, pe care îl puteți schimba la Peisagistică, Amenajări dure) și fiecare insulă primește un strat de arbuști și, dacă este destul de lată, un copac, luați din lista de plante. După aceea, totul este un obiect obișnuit de peisagistică: îl puteți edita, sau puteți alege **Reamenajare** pentru a înlocui ce a creat parcarea. Eliminarea parcării elimină ce a creat.

## De la un asistent

Aceeași parcare poate fi cerută prin MCP: `parking_layout` previzualizează, `parking_build` scrie, `parking_remove` înlătură o parcare. Cereți după numele parcelei sau trimiteți conturul.

## Ce nu este realizat încă

Nu se verifică dacă culoarele ajung la o stradă. Pavajul acoperă întregul contur, deci suprafața sa include și insulele. Alegerile de materiale de pavaj din Bibliotecă și un tip din Bibliotecă pentru locuri nu sunt realizate; modelul de pavaj este cel din Amenajări dure. Nu sunt realizate reguli pentru alte țări.
