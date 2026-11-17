---
title: Modelarea unui coridor de drum
summary: Activați un coridor pentru un traseu, setați valorile benzii, acostamentului și pantei laterale și citiți secțiunile, liniile de intersecție cu terenul și lucrările de terasamente pe care le produce.
keywords: super, supraînălțare, înclinare, rampă de racordare, lungime de tranziție, tabel de rate, pantă transversală, rotire, coridor, ansamblu, subansamblu, secțiune tip, drum, bandă, acostament, pantă laterală, intersecție cu terenul, debleu, rambleu, secțiuni, țintă, ținte, țintă de lățime, țintă de cotă, țintă de decalaj, lărgire, marginea părții carosabile, urmează alt coridor
from: 91303189
---

Un coridor parcurge o secțiune tip simplă (un ansamblu) de-a lungul unui traseu și al profilului său de proiectare, o nivelează în terenul existent și adaugă rezultatul la modelul de teren proiectat. Un traseu poate avea mai multe coridoare pe intervale diferite de kilometraj, iar un coridor poate fi construit din șabloane refolosibile pe kilometraj ([Șabloane de coridor](topic:corridor-templates)). Ansamblul simplu de mai jos este același pe ambele părți; pentru a da fiecărei părți propriile piese, vezi [Construirea fiecărei părți din piese](topic:corridor#build-each-side-from-parts).

## Ansamblul

De la axul drumului spre exterior, pe fiecare parte:

1. o **bandă** de o anumită lățime, care coboară de la coamă cu **panta benzii**
2. un **acostament** de o anumită lățime, la **panta acostamentului**
3. o **pantă laterală** de la marginea acostamentului până unde întâlnește terenul: **panta de debleu** unde terenul este deasupra și **panta de rambleu** unde este dedesubt

Valorile de pornire sunt marcaje, nu un standard de proiectare:

| Valoare | US feet | Metri |
|---|---|---|
| Lățimea benzii | 12 ft | 3.6 m |
| Panta benzii | 2% | 2% |
| Lățimea acostamentului | 4 ft | 1.2 m |
| Panta acostamentului | 4% | 4% |
| Panta de debleu | 2 : 1 | 2 : 1 |
| Panta de rambleu | 3 : 1 | 3 : 1 |
| Secțiune la fiecare | 10 ft | 5 m |

Pantele laterale sunt orizontal la vertical (H:V): 3 : 1 înseamnă 3 pe orizontală la 1 pe verticală.

## Construirea coridorului

Aveți nevoie de un traseu fără erori și de un profil de proiectare cu cel puțin două PVI și fără erori.

1. Selectați traseul.
2. În panoul din dreapta, la **Coridor**, bifați **Parcurgeți un ansamblu de-a lungul profilului de proiectare**.
   Câmpurile apar și coridorul este construit imediat. Planul arată marginile benzii și acostamentului și liniile de intersecție cu terenul; cu {{ui:Proiectat (gradat)}} ales la **Afișare**, curbele arată terenul nou.
3. Schimbați orice valoare: **Lățimea benzii**, **Panta benzii**, **Lățimea acostamentului**, **Panta acostamentului**, **Panta de debleu**, **Panta de rambleu**, **Secțiune la fiecare**. Apăsați {{key:Enter}} după fiecare. Debleul, rambleul și distanța dintre secțiuni trebuie să fie mai mari decât 0.
4. Citiți linia de sub câmpuri, de exemplu „39 de secțiuni de la 0+00.00 până la 3+86.36; debleu 240.2 cu yd, rambleu 556.0 cu yd.”

Secțiunile sunt tăiate la fiecare pas al **Secțiune la fiecare**, la capete și la începutul și sfârșitul fiecărei curbe orizontale și verticale. Fiecare secțiune și liniile care trec prin ele (axul, marginile benzii și acostamentului, intersecția cu terenul) devin linii de rupere ale modelului de teren proiectat.

Pentru a opri coridorul, debifați caseta. Valorile lui sunt păstrate pentru data următoare.

## Când nu se construiește

O casetă roșie sub câmpuri spune de ce:

| Mesaj | Ce de făcut |
|---|---|
| „Coridorul are nevoie de un profil de proiectare fără erori.” | Adăugați PVI sau reparați curbele verticale care se suprapun (vezi [Proiectarea unui profil vertical](topic:profile)). |
| „Profilul de proiectare nu se suprapune cu traseul.” | Mutați PVI pe intervalul de kilometraj al traseului. |
| „Coridorul are nevoie de cel puțin două secțiuni pe model.” | Cea mai mare parte a coridorului este în afara terenului existent. |
| „4 pante laterale ies de pe model înainte de a întâlni terenul.” | Aproape de marginea modelului, panta nu poate ajunge la teren. Țineți drumul departe de margine sau coborâți înălțimea rambleului ori a debleului acolo. |
| „Liniile de intersecție cu terenul ale coridorului se intersectează (de exemplu, secțiunile se suprapun pe interiorul unei curbe strânse). Folosiți o rază mai mare sau un ansamblu mai îngust.” | Secțiunile de pe interiorul unei curbe ascuțite se suprapun. Măriți raza sau îngustați ansamblul. |

Un coridor cu o problemă nu este nivelat în teren și nu contează în lucrările de terasamente.

## Coridoare și platforme împreună

Modelul de teren proiectat este construit în ordine: întâi fiecare coridor, apoi fiecare platformă. Acolo unde nivelarea unei platforme se suprapune cu un coridor, câștigă platforma. Volumele sunt calculate în interiorul tuturor liniilor de intersecție cu terenul împreună; vezi [Volumele de terasament](topic:volumes).

## Supraînălțare

Prin curbă, drumul se poate înclina spre interior, astfel încât traficul este împins mai puțin spre exterior. Bifați **Supraînălțați curbele** sub **Supraînălțare**, în **Proprietățile** traseului:

- Fiecare curbă circulară primește o rată **e** din tabelul de rate: primul rând a cărui rază o atinge curba (un rând cu o rată goală păstrează acoperișul normal). Tabelul și **Panta relativă maximă** (0.5 % la început) sunt marcaje, nu un standard: setați-le după propriile criterii de proiectare. Adăugați sau eliminați rânduri după nevoie.
- Benzile se rotesc în jurul axului. Înainte de curbă, banda exterioară se aplatizează pe **rampa de racordare** (acoperișul normal ÷ e × lungimea de tranziție), apoi pe **lungimea de tranziție** (lățimea benzii × e ÷ panta maximă) banda exterioară continuă să se rotească până când întregul drum coboară cu e spre interior; două treimi din lungimea de tranziție se află înainte de curbă, iar o treime pe ea. După curbă, același lucru se întâmplă invers.
- Un acostament de pe partea joasă nu este niciodată mai plat decât banda lui; pe partea înaltă își păstrează propria pantă (se rostogolește peste).
- Tabelul de sub el listează raza fiecărei curbe, rata, lungimea de tranziție și rampa de racordare și unde încep și se termină supraînălțarea completă. **Diagrama de supraînălțare** desenează pantele transversale ale ambelor benzi de-a lungul kilometrajelor (banda stângă plină, cea dreaptă punctată).
- O curbă prea scurtă pentru a atinge supraînălțarea completă, sau două curbe ale căror tranziții se suprapun, este semnalată într-o casetă deasupra tabelului.

Secțiunile, volumele, vizualizarea 3D și planșele arată toate drumul înclinat. Fiecare modificare este un pas: {{key:Mod+Z}} o anulează.

## Ținte

O țintă mută un punct al unei părți a drumului la o linie: **Marginea părții carosabile** sau **Marginea acostamentului**, pe **Stânga** sau pe **Dreapta**. Fiecare secțiune întâlnește linia perpendicular pe ax, mergând spre exterior doar pe acea parte, astfel încât o țintă pe dreapta nu mută niciodată partea stângă.

| Setează | Ce se întâmplă acolo unde o secțiune întâlnește linia |
|---|---|
| **Lățime** | Punctul stă pe linie: banda (sau acostamentul) se lărgește ori se îngustează până la ea, păstrându-și panta transversală. |
| **Cotă** | Punctul ia cota liniei acolo, la decalajul său propriu: panta transversală a benzii (sau a acostamentului) urmează linia. |

Linia poate fi o linie caracteristică (oricare ar fi **Utilizarea** ei) sau o linie a altui coridor: axul, marginile părții carosabile, marginile acostamentului sau liniile de intersecție cu terenul. Linia unui coridor urmează acel coridor: schimbați celălalt drum și acesta urmează. CivilCraft construiește mai întâi celălalt coridor; două coridoare care s-ar viza reciproc într-o buclă sunt refuzate pe o parte, iar tabelul spune care.

1. Selectați traseul și activați coridorul lui.
2. Sub **Ținte**, faceți clic pe {{ui:Adăugare țintă}}.
3. Alegeți **Partea**, **Punctul**, ce **Setează** și **Până la linie**. Fiecare modificare este un pas de anulare.

**Rezultat** spune la câte secțiuni a fost atinsă linia. Secțiunile care nu o ating (dincolo de capetele ei sau acolo unde se află în spatele axului) păstrează valorile ansamblului. O linie care este ștearsă lasă coridorul cum era înainte de țintă, iar tabelul spune asta. O parte poate avea o țintă de lățime și una de cotă pentru fiecare punct.

## Construirea fiecărei părți din piese

Activați **Construirea fiecărei părți din piese** sub setările coridorului. Fiecare parte are atunci propria listă, de la axul drumului spre exterior: benzi, un acostament, o rigolă, o bordură, o fâșie plantată, un trotuar și, la urmă, panta laterală până la teren (cu propriile rapoarte de debleu și rambleu). Porniți de la {{ui:Drum rural}} sau {{ui:Stradă urbană}}, adăugați și eliminați piese, mutați-le cu săgețile și copiați o parte pe cealaltă cu {{ui:Copiere}}. Fiecare modificare este un pas de anulare.

O pantă transversală este căderea de la drum, deci un trotuar care scurge spre drum are pantă negativă. O bordură este o față de înălțimea pe care o dați, o parte de sus de lățimea pe care o dați și o coborâre opțională în spate. Supraînălțarea înclină fiecare bandă din primul rând; rigola, bordura, fâșia și trotuarul atârnă de marginea benzilor construite. Țintele mută în continuare capătul benzilor și ultima piesă. Secțiunile transversale marchează linia de scurgere a rigolei, partea de sus și spatele bordurii și restul. Pe o curbă cu spirale, lungimea de tranziție este spirala: coamă plată la TS, supraînălțare completă la SC.

## Straturile de îmbrăcăminte

O bandă, un acostament, o rigolă, o fâșie plantată sau un trotuar pot avea structura lor: sub piesă, {{ui:Adăugare strat}} adaugă un strat cu un nume, un material, o grosime și tipul său (uzură, strat de legătură, fundație, strat de fundație, strat de acoperire sau altul), de sus în jos. Straturile nu mută suprafața drumului (partea lui de sus este suprafața de proiectare); fiecare se află sub piesa lui, adâncimea lui fiind măsurată drept în jos. Secțiunile transversale desenează baza fiecărui strat ca linie punctată, iar {{ui:Straturi de îmbrăcăminte: cantități}} listează aria în plan și volumul fiecărui strat (aria de-a lungul coridorului din secțiunile sale, volum = arie × grosime). Exportul IFC scrie fiecare strat ca element propriu, cu grosimea și materialul lui (vezi [Exportul și importul IFC](topic:ifc)). Grosimea pe care o tastați este a dumneavoastră: CivilCraft nu dimensionează îmbrăcămințile.

## Ce nu este construit încă

Țintele pentru panta de intersecție cu terenul nu sunt disponibile încă. Pentru un coridor care se schimbă de-a lungul drumului, cu stânga și dreapta separate, folosiți [Șabloane de coridor](topic:corridor-templates). Vezi [Încă nerealizat](topic:not-built-yet).
