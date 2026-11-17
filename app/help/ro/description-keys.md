---
title: Chei de descriere și coduri de linie
summary: Transformați codurile de teren în grupuri de puncte cu descrieri și uniți punctele codificate în linii (început, sfârșit, închidere) care devin linii de rupere.
keywords: chei de descriere, coduri de teren, coduri de linie, figuri, desen liniar, început, sfârșit, închidere, grupuri de puncte, coduri, coduri de măsurătoare, colector de date, linii de rupere, bordură, marginea părții carosabile
from: b3d1af8d
---

Echipele de teren codifică fiecare măsurătoare din teren: `EP` pentru marginea părții carosabile, `TC` pentru partea de sus a bordurii, `BLDG` pentru colțul unei clădiri. Codul este primul cuvânt al descrierii punctului. CivilCraft grupează punctele după el și transformă în linii codurile de linie care urmează.

## Coduri de linie

Un cod de linie este cuvântul care urmează imediat după codul de teren:

| Descriere | Înseamnă |
|---|---|
| `EP B` | Începe o linie nouă a marginii părții carosabile în acest punct |
| `EP` | Continuă linia EP curentă |
| `EP E` | Încheie linia EP curentă în acest punct |
| `BLDG C` | Închide clădirea: unește acest punct înapoi cu primul punct al liniei |

Punctele cu același cod sunt unite în ordinea numerelor de punct. Coduri diferite sunt linii diferite, chiar dacă împart un grup, deci `EP1` și `EP2` dau două margini simultan. Un cod care nu folosește niciodată un cod de linie este unit prin toate punctele sale, ca în versiunile anterioare.

Liniile dintr-un grup folosit drept **Linie de rupere** devin linii de rupere, câte una pentru fiecare linie, astfel încât o bordură cu un gol nu este întinsă peste gol. Liniile din alte grupuri sunt desenate pe plan (stratul V-NODE-LINE) și ies în DXF, DWG și PDF.

Cuvintele pentru început, sfârșit și închidere sunt `B`, `BEG`, `START`; `E`, `END`; și `C`, `CLO`, `CLOSE`. Schimbați-le sau dezactivați codurile de linie în caseta de dialog de mai jos.

## Chei de descriere

O cheie de descriere transformă un cod într-un grup de puncte, o utilizare și o descriere lungă.

1. La **Puncte**, faceți clic pe {{ui:Chei de descriere și coduri de linie}}.
2. Faceți clic pe {{ui:Adăugare cheie}} și completați rândul:
   - **Cod**: codul de teren de potrivit. `*` înseamnă orice caractere, iar `?` înseamnă unul singur, deci `EP*` prinde EP, EP1 și EP12.
   - **Grup**: grupul de puncte la care se alătură aceste puncte (gol = codul în sine). `EP*` cu grupul `EP` pune EP1 și EP2 într-un singur grup, deși rămân linii separate.
   - **Utilizare**: Puncte, Linie de rupere sau Exclus, pentru momentul în care grupul apare prima dată (sau lăsați-o pe seama tabelului **Puncte**).
   - **Descriere**: numele lung, afișat în **Proprietățile** unui punct.
3. Coloana **Puncte** numără punctele pe care le prinde fiecare cheie pe măsură ce scrieți. Prima cheie care se potrivește unui cod câștigă.
4. Faceți clic pe {{ui:Aplicare}}. Grupurile, modelul de teren și planul urmează într-un singur pas: {{key:Mod+Z}} îl anulează.

Un grup păstrează utilizarea pe care i-ați dat-o în tabelul **Puncte**; utilizarea unei chei o setează doar pentru un grup nou. Cheile și codurile de linie sunt salvate în fișierul proiectului.
