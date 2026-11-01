---
title: Aranjarea panourilor și utilizarea unui al doilea monitor
summary: Ancorați panourile laterale la stânga, la dreapta sau jos, suprapuneți-le, grupați-le ca file, fixați-le sau ascundeți-le, plutiți-le peste desen, faceți aspectul mai dens, alegeți câte rânduri folosește bara de instrumente sau mutați-le în fereastra lor proprie pe alt ecran.
keywords: panouri, ancorare, plutire, mutare panou, glisare, aspect, file, grup de file, suprapunere, fixare, ascundere automată, ascundere panou, închidere panou, compact, densitatea aspectului, dens, rânduri ale barei de instrumente, încadrare, 1 rând, 2 rânduri, al doilea monitor, două ecrane, monitor dublu, mai multe monitoare, fereastră, pop-up, resetare aspect
from: 32a8dae2
---

Panourile de lângă desen pot fi mutate. Așezați-le unde vă convine sau dați-le o fereastră proprie pe un al doilea monitor, astfel încât desenul să ocupe tot primul monitor.

:::note
Fiecare panou are o bară de titlu: o bandă subțire cu numele panoului, un meniu {{ui:⋯}}, un buton de fixare și un buton de închidere în partea de sus a panoului. Versiunile dinainte de 0.7 au doar numele și meniul {{ui:⋯}}.
:::

## Mutarea unui panou în fereastră

1. Trageți panoul de numele său din partea de sus.
2. În timp ce trageți, apar zone conturate în stânga, în dreapta și jos al desenului. Lăsați panoul pe una dintre ele pentru a-l ancora acolo. Zona peste care vă aflați se întunecă.
3. Lăsați-l în alt loc peste desen pentru a-l face plutitor.

Panourile pot împărți aceeași latură: se suprapun, iar fiecare linie dintre două dintre ele se trage pentru a împărți spațiul (cu o linie activată, tastele săgeți o mută, iar dublu clic pe ea împarte spațiul în mod egal). Trageți marginea interioară a unei laturi ancorate pentru a o face mai lată sau mai îngustă; faceți dublu clic pe margine pentru a o readuce.

Un panou plutitor rămâne peste desen. Mutați-l de numele său și redimensionați-l trăgând de colțul din dreapta jos (sau treceți cu {{key:Tab}} la colț și folosiți tastele săgeți). Faceți dublu clic pe numele său pentru a-l ancora din nou acolo unde era.

:::touch
Trageți cu un deget de numele panoului. Trageți cu un deget colțul din dreapta jos al unui panou plutitor pentru a-l redimensiona, iar marginile dintre panourile ancorate la fel. Pentru a-l face plutitor sau a-l ancora fără a trage, folosiți meniul {{ui:⋯}}.
:::

## Gruparea panourilor în file

Două panouri pot împărtăși același cadru și pot afișa câte unul pe rând. Trageți un panou de numele său pe bara de titlu a altui panou (bara este conturată cât timp sunteți deasupra ei) și lăsați-l: cadrul are acum o filă pentru fiecare panou, în bara de titlu. Faceți clic pe o filă pentru a afișa panoul respectiv. Cu o filă activată, {{key:Left}} și {{key:Right}} comută între file, iar {{key:Home}} și {{key:End}} duc la prima și la ultima.

Pentru a scoate un panou din grup, alegeți {{ui:Move out of the tab group}} din meniul său {{ui:⋯}}, sau trageți-l în altă parte. Alegeți {{ui:Grupare în filă cu}} și numele unui panou pentru a le grupa fără a trage.

## Fixare, ascundere și readucere

- Butonul de fixare din bara de titlu a unui panou îl face **ascundere automată**: panoul iese din ancorarea sa și devine o filă mică la acea margine. Îndreptați cursorul spre filă, activați-o sau faceți clic pe ea, iar panoul glisează peste desen; îndepărtați-vă (sau apăsați {{key:Esc}}) și panoul revine. Apăsați din nou butonul de fixare sau alegeți {{ui:Dezfixare}}, pentru a-l ancora definitiv.
- Butonul de închidere sau {{ui:Ascundere a acestui panou}} din meniu ascunde panoul și închide ancorarea sa. O filă punctată la margine îl readuce: faceți clic pe ea sau activați-o și apăsați {{key:Enter}}.

## Facerea aspectului mai dens

{{ui:Setări}} › {{ui:General}} › {{ui:Densitatea aspectului}} oferă două opțiuni. {{ui:Confortabilă}} este implicită. {{ui:Compactă}} strânge înălțimea rândurilor, marginile panourilor, butoanele barei de instrumente și textul panourilor din acea aplicație, astfel încât să încapă mai mult pe ecran. Setarea se păstrează pentru fiecare aplicație. Un ecran tactil păstrează butoanele mari în ambele cazuri, iar un telefon își păstrează propriul aspect. {{ui:Resetare aspect}} lasă densitatea așa cum ați setat-o.

## Alegerea numărului de rânduri ale barei de instrumente

{{ui:Setări}} › {{ui:General}} › {{ui:Rânduri ale barei de instrumente}} oferă trei opțiuni. {{ui:Încadrare}} este implicită: fiecare grup de instrumente apare, pe câte rânduri are nevoie. {{ui:2 rânduri}} păstrează bara de instrumente la două rânduri, iar {{ui:1 rând}} la unul, astfel încât desenul primește înălțime; grupurile care nu încap se derulează lateral în interiorul barei (folosiți rotița mouse-ului, un gest cu două degete sau {{key:Tab}} până la un instrument). O bară de instrumente care încape deja în două rânduri rămâne așa cum este la {{ui:2 rânduri}}, deoarece o grilă ar face-o doar mai înaltă. Alegerea se păstrează pentru fiecare aplicație. Un ecran tactil și un telefon își păstrează propriul aspect. CadCraft are propria setare pentru bara sa de instrumente, în {{ui:Setări}} › {{ui:CadCraft}}.

## Utilizarea tastaturii

Butonul {{ui:⋯}} al fiecărui panou deschide un meniu: {{ui:Ancorare la stânga}}, {{ui:Ancorare la dreapta}}, {{ui:Ancorare jos}}, {{ui:Plutire peste desen}}, {{ui:Fixare la margine}}, {{ui:Ascundere a acestui panou}}, {{ui:Grupare în filă cu}} alt panou, {{ui:Mutare într-o fereastră nouă}} și {{ui:Readucere la loc}}. Treceți cu {{key:Tab}} la buton, apăsați {{key:Enter}}, mutați-vă cu tastele săgeți și apăsați din nou {{key:Enter}}. {{key:Esc}} închide meniul.

## Punerea panourilor pe al doilea monitor

1. Alegeți {{ui:⋯}} de pe un panou, apoi {{ui:Mutare a tuturor panourilor într-o fereastră nouă}}. Puteți alege și {{ui:Mutare panouri într-o fereastră nouă}} în {{ui:Setări}}.
2. Se deschide o fereastră mică, cu panourile în ea. Trageți-o pe celălalt monitor și faceți-o cât de mare doriți.
3. Continuați să lucrați: panourile acționează asupra desenului ca înainte, iar desenul umple fereastra principală.

Scurtăturile funcționează în continuare cât timp fereastra panourilor este în față: tastele apăsate acolo, în afara scrierii într-o casetă, ajung la desen. Întrebările și casetele de dialog pe care le cere aplicația se deschid tot în fereastra principală, așa că uitați-vă acolo când apare una. Tema și dimensiunea textului panourilor urmează fereastra principală.

:::chromium
Chrome și Edge pot plasa singure fereastra pe celălalt ecran. Cu un al doilea ecran conectat, alegeți {{ui:Mutați-o pe celălalt ecran}} în fereastra panourilor (sau {{ui:Mutați panourile pe celălalt ecran}} în meniul {{ui:⋯}} al unui panou). Browserul întreabă o singură dată dacă acest site poate vedea ecranele; după ce permiteți, fereastra panourilor se deschide pe acel ecran de fiecare dată.
:::

:::firefox safari
Trageți fereastra panourilor pe celălalt monitor. Data viitoare se deschide în același loc și la aceeași dimensiune.
:::

## Mai multe ferestre de panouri

Fiecare panou poate avea o fereastră proprie: până la patru ferestre de panouri, de exemplu una pentru fiecare monitor.

- În meniul {{ui:⋯}} al unui panou, {{ui:Mutare într-o fereastră nouă}} deschide o altă fereastră pentru acel panou, iar {{ui:Mutare în fereastra panourilor 2}} (și așa mai departe) îl mută într-una deschisă. A doua fereastră se numește „panouri 2”.
- Trageți un panou de numele său dintr-o fereastră în alta: lăsați-l peste fereastra principală pentru a-l ancora acolo (zonele conturate apar cât timp sunteți deasupra) sau pentru a-l face plutitor, iar peste o altă fereastră de panouri pentru a-l muta în ea. Lăsați-l oriunde altundeva și rămâne unde era.
- O fereastră de panouri fără panouri rămase se închide singură.

După o reîncărcare, aplicația vă oferă din nou ferestrele de panouri. Browserele deschid câte o fereastră pe clic, așa că alegeți {{ui:Deschidere următoarea}} o dată pentru fiecare fereastră.

## Mutarea unei casete de dialog

Fiecare casetă de dialog poate fi mutată din calea desenului: apăsați și trageți bara ei de titlu. Caseta reține locul în care ați lăsat-o, fiecare casetă separat, și revine în acel loc data următoare când se deschide. Faceți dublu clic pe bara de titlu pentru a o centra din nou.

Din tastatură, apăsați {{key:Alt}}+{{key:Shift}}+o tastă săgeată cu focalizarea în caseta de dialog pentru a o muta câte 16 pixeli; adăugați {{key:Ctrl}} pentru 64. O casetă de dialog ajunsă în afara ecranului (după o fereastră sau un ecran mai mic) este readusă.

Pe telefon, casetele de dialog rămân foi pe toată lățimea și nu se mută.

În CadCraft Studio, caseta {{ui:Trasare în PDF}} a CadCraft, pe care o puteți lăsa deschisă cât lucrați, are un buton în bara de titlu: {{ui:Deschidere într-o fereastră proprie}}. Caseta se mută într-o fereastră proprie pe care o puteți pune pe alt monitor. Închiderea casetei închide fereastra, iar închiderea ferestrei închide caseta.

## Readucerea panourilor

- Alegeți {{ui:Readucere a panourilor}} în fereastra panourilor sau pur și simplu închideți-o. Panourile revin acolo unde erau.
- Închiderea sau reîncărcarea ferestrei principale închide și fereastra panourilor. Când aplicația se deschide din nou, spune că panourile erau într-o fereastră proprie; alegeți {{ui:Deschidere}} pentru a aduce fereastra înapoi sau {{ui:Păstrați-le aici}}.
- {{ui:Setări}} › {{ui:General}} › {{ui:Resetare aspect}} readuce fiecare panou acolo unde a început.

:::tip
Dacă nu se deschide nimic când mutați panourile într-o fereastră nouă, browserul a blocat fereastra pop-up. Aplicația spune asta și lasă panourile unde erau. Permiteți ferestrele pop-up pentru getcadcraft.com, apoi încercați din nou.
:::

Aspectul se păstrează pentru fiecare aplicație în acest browser, împreună cu celelalte setări.
