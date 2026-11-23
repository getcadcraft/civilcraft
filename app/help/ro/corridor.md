---
title: Baleierea unui coridor rutier
summary: Activați un coridor pentru un aliniament, setați valorile benzii, acostamentului și pantei laterale și citiți secțiunile, liniile de intersecție cu terenul și terasamentele pe care le produce.
keywords: intersecție, întretăiere, drum care întâlnește drum, drum lateral, intersecție în T, traversare, cotă de platformă, îmbinare, racordare, dever, devers, înclinare, tronson de racordare, tronson de dezvoltare, tabel de rate, pantă transversală, rotire, coridor, ansamblu, subansamblu, secțiune tip, drum, bandă, acostament, pantă transversală, pantă laterală, intersecție cu terenul, debleu, rambleu, secțiuni, ținte, țintă de lățime, țintă de cotă, țintă de decalaj, lărgire, marginea părții carosabile, urmărire alt coridor
from: 6dcb92b3
---

Un coridor baleiază o secțiune tip simplă (un ansamblu) de-a lungul unui aliniament și al profilului său de proiectare, o racordează la terenul existent și adaugă rezultatul la suprafața proiectată. Un aliniament poate avea mai multe coridoare pe intervale de kilometraj diferite, iar un coridor poate fi construit din șabloane reutilizabile pe kilometraj ([Șabloane de coridor](topic:corridor-templates)). Ansamblul simplu de mai jos este același pe ambele părți; pentru a da fiecărei părți propriile componente, vedeți [Construirea fiecărei părți din componente](topic:corridor#build-each-side-from-parts).

## Ansamblul

De la axul drumului spre exterior, pe fiecare parte:

1. o **bandă** de o lățime dată, care coboară de la axul drumului cu **panta benzii**
2. un **acostament** de o lățime dată, cu **panta acostamentului**
3. o **pantă laterală** de la marginea acostamentului până la întâlnirea cu terenul: **panta de debleu** acolo unde terenul este deasupra, **panta de rambleu** acolo unde este dedesubt

Valorile de pornire sunt valori provizorii, nu un standard de proiectare:

| Valoare | Picioare SUA | Metri |
|---|---|---|
| Lățimea benzii | 12 ft | 3.6 m |
| Panta benzii | 2% | 2% |
| Lățimea acostamentului | 4 ft | 1.2 m |
| Panta acostamentului | 4% | 4% |
| Panta de debleu | 2 : 1 | 2 : 1 |
| Panta de rambleu | 3 : 1 | 3 : 1 |
| Secțiune la fiecare | 10 ft | 5 m |

Pantele laterale se exprimă orizontal la vertical (H:V): 3 : 1 înseamnă 3 pe orizontală la 1 pe verticală.

## Construirea coridorului

Aveți nevoie de un aliniament fără erori și de un profil de proiectare cu cel puțin două PVI și fără erori.

1. Selectați aliniamentul.
2. În panoul din dreapta, sub **Coridor**, bifați **Baleiere a unui ansamblu de-a lungul profilului de proiectare**.
   Câmpurile apar, iar coridorul se construiește imediat. Planul arată marginile benzii și ale acostamentului și liniile de intersecție cu terenul; cu {{ui:Proiectat (gradat)}} ales la **Afișare**, curbele de nivel arată terenul nou.
3. Modificați orice valoare: **Lățimea benzii**, **Panta benzii**, **Lățimea acostamentului**, **Panta acostamentului**, **Panta de debleu**, **Panta de rambleu**, **Secțiune la fiecare**. Apăsați {{key:Enter}} după fiecare. Pantele de debleu și de rambleu și distanța dintre secțiuni trebuie să fie mai mari decât 0.
4. Citiți linia de sub câmpuri, de exemplu „39 secțiuni de la 0+00.00 la 3+86.36; debleu 240.2 cu yd, rambleu 556.0 cu yd.”

Secțiunile se taie la fiecare pas al **Secțiune la fiecare**, la capete și la începutul și sfârșitul fiecărei curbe orizontale și verticale. Fiecare secțiune și liniile care trec prin ele (axul, marginile benzii și ale acostamentului, intersecțiile cu terenul) devin linii de rupere ale suprafeței proiectate.

Pentru a dezactiva coridorul, debifați caseta. Valorile sale se păstrează pentru data următoare.

## Când nu se construiește

O casetă roșie de sub câmpuri explică motivul:

| Mesaj | Ce trebuie făcut |
|---|---|
| „Coridorul are nevoie de un profil de proiectare fără erori.” | Adăugați PVI sau corectați curbele verticale care se suprapun (vedeți [Proiectarea unui profil vertical](topic:profile)). |
| „Profilul de proiectare nu se suprapune cu aliniamentul.” | Mutați PVI pe intervalul de kilometraj al aliniamentului. |
| „Coridorul are nevoie de cel puțin două secțiuni pe suprafață.” | Cea mai mare parte a coridorului se află în afara terenului existent. |
| „4 pante laterale ies de pe suprafață înainte de a întâlni terenul.” | Aproape de marginea suprafeței, panta nu ajunge la teren. Țineți drumul departe de margine sau coborâți înălțimea rambleului ori a debleului acolo. |
| „Liniile de intersecție cu terenul ale coridorului se intersectează (secțiunile se suprapun, de exemplu pe interiorul unei curbe strânse). Folosiți o rază mai mare sau un ansamblu mai îngust.” | Secțiunile de pe interiorul unei curbe strânse se suprapun. Măriți raza sau îngustați ansamblul. |

Un coridor cu o problemă nu este nivelat în teren și nu intră în calculul terasamentelor.

## Coridoare și platforme împreună

Suprafața proiectată se construiește în ordine: mai întâi toate coridoarele, apoi toate platformele. Acolo unde nivelarea unei platforme se suprapune cu un coridor, câștigă platforma. Acolo unde un element ulterior se suprapune cu un drum, se înlocuiește doar partea drumului din interiorul liniei de intersecție cu terenul a elementului ulterior; restul drumului și orice linie de rupere a terenului pe care o traversează rămân cu forma lor. Volumele se calculează împreună în interiorul tuturor liniilor de intersecție cu terenul; vedeți [Volumele de terasamente](topic:volumes).

## Devers

Pe o curbă, drumul se poate înclina spre interior, astfel încât traficul este împins mai puțin spre exterior. Bifați **Aplicare devers curbelor** sub **Dever** în **Proprietăți** ale aliniamentului:

- Fiecare curbă circulară primește o valoare **e** din tabelul de rate: primul rând a cărui rază o atinge curba (un rând fără valoare păstrează bombamentul normal). Tabelul și **Gradientul relativ maxim** (0.5 % la început) sunt valori provizorii, nu un standard: stabiliți-le după propriile criterii de proiectare. Adăugați sau eliminați rânduri după nevoie.
- Benzile se rotesc în jurul axului drumului. Înaintea curbei, banda exterioară se aplatizează pe parcursul **tronsonului de dezvoltare** (bombament normal ÷ e × tronsonul de racordare), apoi pe **tronsonul de racordare** (lățimea benzii × e ÷ gradient) banda exterioară continuă să se rotească până când întregul drum are panta e spre interior; două treimi din tronsonul de racordare se află înaintea curbei și o treime pe ea. După curbă, același lucru se întâmplă invers.
- Un acostament de pe partea joasă nu este niciodată mai plat decât banda sa; pe partea înaltă își păstrează propria pantă (se răstoarnă).
- Tabelul de sub el listează raza, valoarea, tronsoanele de racordare și de dezvoltare ale fiecărei curbe și locul unde începe și se termină deversul complet. **Diagrama deversului** desenează pantele transversale ale ambelor benzi de-a lungul kilometrajului (banda din stânga cu linie continuă, cea din dreapta cu linie întreruptă).
- O curbă prea scurtă pentru a ajunge la devers complet, sau două curbe ale căror tronsoane se suprapun, este semnalată într-o casetă deasupra tabelului.

Secțiunile, volumele, vizualizarea 3D și planșele arată toate drumul înclinat. Fiecare modificare este un singur pas: {{key:Mod+Z}} o anulează.

## Ținte

O țintă mută un punct de pe o parte a drumului până la o linie: **Marginea părții carosabile** sau **Marginea acostamentului**, pe **Stânga** sau pe **Dreapta**. Fiecare secțiune întâlnește linia perpendicular pe axul drumului, ieșind doar pe partea respectivă, astfel încât o țintă de pe dreapta nu mută niciodată partea stângă.

| Setează | Ce se întâmplă acolo unde o secțiune întâlnește linia |
|---|---|
| **Lățime** | Punctul se așează pe linie: banda (sau acostamentul) se lărgește sau se îngustează până la ea, păstrându-și panta transversală. |
| **Cotă** | Punctul ia cota liniei acolo, la propria distanță de ax: panta transversală a benzii (sau a acostamentului) urmează. |

Linia poate fi o linie caracteristică (oricare ar fi **Utilizarea** ei) sau o linie a altui coridor: axul, marginile părții carosabile, marginile acostamentelor sau liniile de intersecție cu terenul ale acestuia. Linia unui coridor urmărește acel coridor: modificați celălalt drum și acesta îl urmează. CivilCraft construiește mai întâi celălalt coridor; două coridoare care ar viza una pe alta într-o buclă sunt refuzate pe o parte, iar tabelul arată care.

1. Selectați aliniamentul și activați coridorul său.
2. Sub **Ținte**, faceți clic pe {{ui:Adăugare țintă}}.
3. Alegeți **Partea**, **Punctul**, ce **Setează** și **Până la linie**. Fiecare modificare este un pas de anulare.

**Rezultat** arată la câte secțiuni a fost atinsă linia. Secțiunile care nu o ating (dincolo de capetele ei sau acolo unde se află în spatele axului) păstrează valorile ansamblului. O linie care este ștearsă lasă coridorul așa cum era înainte de țintă, iar tabelul o spune. O parte poate avea o țintă de lățime și una de cotă pentru fiecare punct.

## Construirea fiecărei părți din componente

Activați **Construire fiecare parte din componente** în setările coridorului. Fiecare parte are atunci propria listă, de la axul drumului spre exterior: benzi, un acostament, o rigolă, o bordură, o fâșie plantată, un trotuar și, la urmă, panta laterală până la teren (cu propriile rapoarte de debleu și de rambleu). Porniți de la {{ui:Drum rural}} sau {{ui:Stradă urbană}}, adăugați și eliminați componente, mutați-le cu săgețile și folosiți {{ui:Copiere}} pentru a copia o parte pe cealaltă. Fiecare modificare este un pas de anulare.

Panta transversală este coborârea în afara drumului, deci un trotuar care se scurge spre drum are valoare negativă. O bordură este o față de înălțimea pe care o dați, o parte superioară de lățimea pe care o dați și o coborâre opțională în spate. Deversul întoarce fiecare bandă din primul rând; rigola, bordura, fâșia și trotuarul atârnă de marginea benzilor așa cum au fost construite. Țintele mută în continuare capătul benzilor și ultima componentă. Secțiunile transversale marchează linia de scurgere a rigolei, partea de sus și spatele bordurii, precum și restul. Pe o curbă cu clotoide, tronsonul de racordare este clotoida: bombament nul în TS, devers complet în SC.

## Straturi de îmbrăcăminte

O bandă, un acostament, o rigolă, o fâșie plantată sau un trotuar își pot avea stratificația: sub componentă, {{ui:Adăugare strat}} adaugă un strat cu un nume, un material, o grosime și tipul său (uzură, legătură, bază, fundație, strat de formă sau altul), de sus în jos. Straturile nu mută suprafața drumului (partea sa de sus este suprafața de proiectare); fiecare se află sub componenta sa, adâncimea fiind măsurată drept în jos. Secțiunile transversale desenează baza fiecărui strat ca linie întreruptă, iar {{ui:Straturi de îmbrăcăminte: cantități}} listează aria în plan și volumul fiecărui strat (aria de-a lungul coridorului din secțiunile sale, volum = arie × grosime). Exportul IFC scrie fiecare strat ca element propriu, cu grosimea și materialul său (vedeți [Export și import IFC](topic:ifc)). Grosimea pe care o introduceți vă aparține: CivilCraft nu dimensionează îmbrăcămințile.

## Unde drumurile întâlnesc drumuri, platforme și alei

Cu {{ui:Îmbinare cu drumurile și platformele întâlnite}} activat (este activat pentru fiecare coridor), CivilCraft îmbină un coridor cu ceea ce întâlnește în plan:

- **Un drum care se termină pe alt drum** (capătul aliniamentului său se află pe celălalt drum sau la cel mult aproximativ jumătate din lățimea propriei părți carosabile de marginea acelui drum) este drumul lateral al unei intersecții. Drumul pe care îl întâlnește își deschide marginea pentru partea carosabilă a drumului lateral: pe gura intersecției, acostamentul, bordura, fâșia și trotuarul sunt așezate pe panta transversală a benzii și desenate ca parte carosabilă. Drumul lateral este așezat pe suprafața drumului principal acolo unde se suprapun și este racordat la aceasta, în sus sau în jos, pe parcursul apropierii.
- **Două drumuri care se intersectează** sunt îmbinate în același fel pe ambele părți. Drumul trecut primul sub Aliniamente este drumul principal; celălalt urmează suprafața acestuia pe toată lărgimea.
- **Un drum care se termină la o platformă** (în interiorul ei sau la cel mult aproximativ jumătate din lățimea părții carosabile de marginea ei) ajunge la cota platformei și este racordat la aceasta pe parcursul apropierii.
- **O alee** (Peisaj › Amenajări dure) se oprește la marginea exterioară a unui drum, la cota trotuarului sau a acostamentului de acolo, în loc să se așeze peste drum. O alee care traversează un drum devine două bucăți. Un capăt desenat puțin înainte de un drum (la cel mult de două ori lățimea aleii) este prelungit până la marginea acestuia.

**Proprietăți** arată ce a îmbinat fiecare coridor, cu cât a fost ridicat sau coborât acolo și pe ce lungime. Această lungime este cea mai mare dintre 10 m (30 ft) și de douăzeci de ori schimbarea și nu depășește niciodată 45% din coridor. **Profilul de proiectare nu se modifică**: vizualizarea profilului arată în continuare linia de pantă pe care ați desenat-o, iar secțiunile, suprafața proiectată, volumele și vizualizarea 3D arată drumul așa cum a fost îmbinat. Pentru ca îmbinarea să fie exactă prin proiectare, mutați ultimul PVI la cota pe care o indică Proprietăți.

Dezactivați comutatorul de pe un coridor pentru a-l lăsa exact așa cum spun profilul și ansamblul său; atunci nu participă la nicio intersecție, nici ca drum lateral, nici ca drum principal. Drumurile care se întâlnesc aproape în linie (sub aproximativ 20°) sunt lăsate neatinse, la fel și traseele neamenajate.

Ce nu face încă o intersecție: nu există racordări de bordură în plan (colțurile sunt drepte), nici benzi de virare sau insule; capătul drumului lateral este tăiat drept față de propriul aliniament; iar un coridor construit din șabloane își deschide marginea în același mod simplu (un șanț sau un zid din condiția de capăt este nivelat peste gură, fără podeț). Pentru racordări de bordură în plan, triunghiuri de vizibilitate și marcaje, vedeți [Soluri, drumuri, topografie, mine și legături](topic:soils-roads-survey-mines-links).

## Ce este încă nerealizat

Țintele pentru panta de intersecție cu terenul nu sunt încă disponibile. Pentru un coridor care se schimbă de-a lungul drumului, cu stânga și dreapta separate, folosiți [Șabloane de coridor](topic:corridor-templates). Vedeți [Încă nerealizat](topic:not-built-yet).
