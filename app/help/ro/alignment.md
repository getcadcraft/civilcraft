---
title: Trasarea unui ax orizontal
summary: Desenați un ax după PI-urile sale, setați razele curbelor și stația de început, mutați PI-urile și citiți datele curbelor, precum și stația și decalajul.
keywords: ax, fără soluție, curbă nu încape, rază maximă, rază minimă, rază minimă de proiectare, viteză de proiectare, suprapunere, axă, pi, curbă orizontală, rază, staționare, tangentă, creare ax, aranjare ax, pc, pt, decalaj stație
from: 8c5df4aa
---

Un ax în CivilCraft este un lanț de tangente prin punctele de intersecție (PI), cu o curbă circulară în orice PI interior care are o rază. Este staționat dintr-o stație de început pe care o alegeți. Un proiect poate conține mai multe axe.

## Desenarea axului

1. Apăsați {{key:A}} sau faceți clic pe {{ui:Axul traseului}} din grupul **Proiectare**.
   Sugestia spune „Axul traseului: faceți clic pe PI-uri în ordine. Enter sau dublu clic încheie, Backspace elimină ultimul, Esc anulează.”
2. Faceți clic pe primul PI (începutul axului).
3. Faceți clic pe fiecare PI următor, în ordine. O linie roșie urmărește cursorul și arată lungimea și orientarea tangentei pe care o desenați, de exemplu „212.40 ft  N 63°12'05" E”.
4. Faceți clic pe ultimul PI (sfârșitul axului).
5. Apăsați {{key:Enter}}.
   Axul este desenat cu staționare și este selectat. Bara de stare spune, de exemplu, „Ax 1: 386.36 ft, curbe de rază 100 ft acolo unde încap. Editați razele în Proprietăți; Profil longitudinal (R) pentru a proiecta panta sa.”

În timpul desenării: {{key:Backspace}} elimină ultimul PI, {{key:Esc}} anulează, iar tragerea pe spațiul gol deplasează vederea fără să adauge un PI.

:::warning
Încheiați cu {{key:Enter}}. Dublu clicul încheie și el, dar în această versiune elimină PI-ul pe care l-ați făcut dublu clic. Faceți clic o dată pe ultimul PI, apoi apăsați {{key:Enter}}.
:::

Fiecare PI interior primește o curbă de 100 ft (30 m într-un proiect în metri), sau cea mai mare rază întreagă care încape în jumătate din fiecare tangentă, dacă 100 ft nu încape. PI-urile foarte ascuțite sau cele care trec drept nu primesc nicio curbă.

## Setarea razelor și a coordonatelor

Cu axul selectat, panoul din dreapta arată **Ax**:

1. **Nume** și **Stație de început**. Scrieți o stație ca `10+00` (picioare) sau `0+500` (metri), ori ca număr simplu. Vezi [Unități, stații și formate de număr](topic:units-and-stations).
2. **Lungimea** și **Stația de sfârșit** sunt calculate automat.
3. Tabelul **PI-uri** listează **Est** și **Nord** pentru fiecare PI, precum și o **Rază** pentru fiecare PI interior. Scrieți o valoare nouă și apăsați {{key:Enter}}.
   - O rază de 0 face un punct de unghi fără curbă.
   - Primul și ultimul PI nu au niciodată rază.
   - Mica x de la capătul unui rând elimină acel PI (un ax păstrează cel puțin două).
4. Citiți lista **Curbe**: pentru fiecare curbă, stațiile PC și PT, raza R, deviația Δ și sensul (stânga sau dreapta), lungimea L, tangenta T, externa E și coarda.
5. Linia de sub curbe dă orientarea primei tangente.

## Când o curbă nu încape

Dacă curbele au nevoie de mai multă tangentă decât există între PI-urile lor, axul nu are soluție: nu este desenat corect până nu îl corectați și este exclus din exporturile LandXML. O casetă roșie spune de ce, în cifre, și oferă ce ar încăpea:

- „Curbele de la PI 2 și PI 3 au nevoie de 240.00 ft de tangentă între ele (130.00 + 110.00), dar PI-urile sunt la 180.00 ft distanță.” — sau, când doar una dintre ele are curbă, „Curba de la PI 2 are nevoie de 240.00 ft de tangentă spre PI 1 …”.
- Un buton pentru fiecare PI setează **cea mai mare rază care încape** acolo, cu cealaltă curbă păstrată așa cum este (trebuie să încapă și în cealaltă tangentă a PI-ului). Când ambele PI-uri au curbe, **Ambele** micșorează cele două raze proporțional, astfel încât să se atingă exact.
- Când o singură curbă este mai lungă decât tangenta, caseta spune că nicio curbă de la celălalt PI nu poate încăpea cât timp aceasta este atât de mare.
- Un PI care se întoarce direct înapoi nu poate primi o curbă; caseta oferă **Fără curbă la PI n**.

Fiecare buton este un singur pas: {{key:Mod+Z}} readuce razele. Razele oferite sunt rotunjite în jos la 0.01, astfel încât să încapă mereu.

### O rază minimă de proiectare

Scrieți o **Rază minimă de proiectare** (de exemplu, din viteza de proiectare) pentru ca fiecare curbă să fie verificată față de ea; lăsați-o goală dacă nu doriți nimic. O curbă sub ea este listată cu un buton pentru **cea mai mică rază care îndeplinește minimul**, când acea rază încape. Când nu încape, caseta spune asta și dă cea mai mare rază permisă de tangente, ca să știți că trebuie să mutați un PI sau să coborâți minimul.

## Mutarea PI-urilor pe plan

1. Cu {{ui:Selectare}} activ, faceți clic pe ax pentru a-l selecta. Apar mânere pătrate la PI-urile sale.
2. Trageți un mâner. Axul, stațiile sale, profilul și coridorul urmează.
3. Eliberați. Mutarea este un singur pas de anulare.

Adăugarea unui PI între două existente nu este disponibilă încă: ștergeți axul și desenați-l din nou sau scrieți coordonate noi pentru PI-urile pe care le aveți.

## Citirea stației și a decalajului

Mutați cursorul peste plan. Bara de stare arată axul cel mai apropiat (sau pe cel selectat), cu stația și decalajul, **S** sau **D** privind spre stațiile crescătoare, de exemplu „Ax 1: Pichet 2+15.30, decalaj 18.42 D”. Dincolo de oricare capăt adaugă „(dincolo de capăt)”.

## Ce este desenat

Pe plan, în DXF și în PDF: axul (tangentele ca linii, curbele ca arce adevărate), o gradație la fiecare 50 ft (20 m), cu o gradație mai lungă și o etichetă de stație la fiecare 100 de unități, iar gradațiile PC și PT etichetate cu stațiile lor.

## Ștergerea unui ax

Selectați-l și apăsați {{key:Delete}}, sau faceți clic pe {{ui:Ștergere}} din bara de instrumente sau de la baza panoului din dreapta. Profilul și coridorul său dispar odată cu el. {{key:Mod+Z}} îl readuce.

:::mac
Pe o tastatură Mac, tasta etichetată **delete** este {{key:Backspace}} pentru browser și nu șterge o selecție. Apăsați {{key:Delete}} (Fn și delete) sau folosiți butonul {{ui:Ștergere}}.
:::

## Mai departe

- [Proiectarea unui profil vertical](topic:profile).
## Viteza și clasa de proiectare

Sub Proprietățile axului, **Viteza de proiectare** (km/h sau mph) și **Clasa de proiectare** sunt păstrate cu axul, salvate în proiect și scrise în IFC (Pset_RoadDesignCriteriaCommon). CivilCraft nu are un tabel care să lege o viteză de o rază minimă, deci nimic nu se verifică din ele: setați **Rază minimă** după propriul standard de proiectare.

## Spirale

O curbă poate avea o spirală clotoidă la oricare capăt: tangentă, spirală, curbă, spirală, tangentă. În tabelul PI, scrieți o lungime la **Spirală la intrare** și **Spirală la ieșire** pentru un PI care are rază. PI-ul rămâne unde este; curba se mută spre interior ca să facă loc, astfel încât distanța de tangentă crește cu decalajul spiralei. Cele două lungimi pot diferi, iar un PI cu o singură lungime primește spirală doar la acel capăt.

Lista curbelor citește apoi TS, SC, CS și ST (tangentă la spirală, spirală la curbă, curbă la spirală, spirală la tangentă), cu unghiul spiralei θs, distanțele de tangentă și distanța externă. Stațiile merg de-a lungul spiralelor ca peste tot. Spiralele care împreună întorc mai mult decât curba sunt refuzate, cu PI-ul numit; o spirală mai lungă decât permite tangenta este o suprapunere, ca pentru orice curbă. Supraînălțarea folosește spirala drept zonă de tranziție (vezi [Coridor](topic:corridor)).
