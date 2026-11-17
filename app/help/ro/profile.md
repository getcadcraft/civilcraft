---
title: Proiectarea profilului longitudinal
summary: Deschideți vederea profilului, începeți un profil de proiectare de la teren, adăugați și trageți PVI-uri, stabiliți lungimile curbelor verticale și citiți pantele, valorile K și punctele înalte și joase.
keywords: profil, aliniament vertical, pvi, curbă verticală, pantă, valoare k, creastă, concavă, bvc, evc, vizualizare profil, cotă finită, fg, profil al terenului existent, linii caracteristice în profil, intersecții, proiectat, bordură, șanț, etichete
from: e9182bfa
---

Fiecare aliniament are un profil longitudinal de proiectare: o listă de PVI (pichet și cotă) unite prin pante drepte, cu o curbă verticală parabolică simetrică în orice PVI interior care are o lungime. Profilul terenului existent este eșantionat automat din suprafață.

## Deschiderea vizualizării profilului

1. Selectați aliniamentul (faceți clic pe el cu {{ui:Selectare}}).
2. Apăsați {{key:R}}, sau faceți clic pe {{ui:Profil longitudinal}} în bara de instrumente, sau pe {{ui:Vizualizarea profilului}} în partea de jos a panoului din dreapta.
   Vizualizarea profilului se deschide sub plan, cu terenul existent de-a lungul aliniamentului. Cu două sau mai multe aliniamente, alegeți unul din lista din stânga barei profilului.

Vizualizarea arată mereu întregul aliniament și întinde cotele pentru a umple panoul; exagerarea este tipărită în colțul din stânga jos, de exemplu „Exagerare verticală 10×”. Nu face zoom și nu se deplasează.

Mutați indicatorul de-a lungul profilului: bara arată pichetul, cotele terenului și de proiect, panta și debleul sau rambleul de acolo, iar un punct urmează aliniamentul în plan.

## Începerea profilului de proiectare

1. În panoul din dreapta, sub **Profil de proiectare**, faceți clic pe {{ui:Pornire din teren}}.
   Două PVI sunt puse pe teren la cele două capete ale aliniamentului, unite printr-o singură pantă dreaptă. Bara de stare spune „Profil de proiectare pornit de la teren la ambele capete. Activați Adăugare PVI și faceți clic pentru a adăuga schimbări de pantă; dați-le o lungime de curbă în tabel.”

Dacă aliniamentul nu traversează suprafața, primiți „Acest aliniament nu are teren sub el de la care să pornească.” Atunci adăugați PVI-uri făcând clic (secțiunea următoare).

## Adăugarea PVI-urilor

1. Apăsați {{key:I}}, sau faceți clic pe {{ui:Adăugare PVI}} din bara profilului. Butonul rămâne apăsat.
2. Faceți clic în profil acolo unde doriți o schimbare de pantă. Un PVI este adăugat la acel pichet și cotă, rotunjit la 0.01, și selectat.
3. Adăugați câte aveți nevoie, apoi apăsați din nou {{key:I}} pentru a opri adăugarea.

Un clic acolo unde există deja un PVI este refuzat („Există deja un PVI la …”). PVI-urile rămân mereu în ordinea pichetelor.

## Ajustarea PVI-urilor

- **Trageți** un PVI în profil pentru a-l muta. Nu poate trece de vecinii săi. Mutarea este un singur pas de anulare.
- **Scrieți** valori exacte în tabelul PVI din panoul din dreapta: **Pichet**, **Cotă** și **Curba L** (lungimea curbei verticale). Apăsați {{key:Enter}} după fiecare.
- **Eliminați** un PVI cu x de la capătul rândului său, sau selectați-l (faceți clic pe el) și apăsați {{key:Delete}}. Când vizualizarea profilului are focusul, {{key:Backspace}} îl elimină de asemenea.

Primul și ultimul PVI nu primesc niciodată o curbă.

## Curbe verticale

1. Scrieți o lungime în **Curba L** pentru un PVI interior, de exemplu 200.
2. Curba este desenată centrată pe PVI. Profilul și panoul din dreapta îi arată tipul (creastă sau concavă), L și K, pichetele și cotele BVC și EVC și punctul său înalt sau jos, atunci când are unul în interiorul curbei.

K se calculează din L (K = L împărțit la diferența algebrică a pantelor, în procente). Introduceți L; introducerea directă a lui K nu este încă disponibilă.

Dacă o curbă verticală nu încape, o casetă roșie spune de ce: intră înapoi în PVI-ul sau curba dinaintea ei ori trece de următorul PVI, și cât spațiu există pe acea parte (o curbă are nevoie de jumătate din lungime pe fiecare parte a PVI-ului său). Butonul ei stabilește **cea mai lungă curbă care încape**, cu K-ul ei, ca un singur pas ({{key:Mod+Z}} anulează). Sau depărtați PVI-urile.

## Citirea datelor

Sub tabelul PVI, o listă dă fiecare pantă în procente („Panta 1: +1.25%”) și fiecare curbă, de exemplu „Creastă la 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)”, apoi „Punct înalt 1+62.40, 254.12”.

Dacă PVI-urile nu ajung până la ambele capete ale aliniamentului, o notă o spune. Un coridor este construit doar acolo unde profilul și aliniamentul se suprapun.

## Linii caracteristice în profil

Liniile caracteristice apar și în vizualizarea profilului, astfel încât puteți vedea o bordură, un șanț sau creasta unui zid în raport cu profilul drumului.

- Acolo unde o linie caracteristică **traversează** aliniamentul, profilul arată un mic romb la acel pichet și cotă, etichetat cu numele liniei și cu cota ei acolo (cota proprie a liniei, calculată pe segmentul care traversează).
- Scrieți o distanță în {{ui:Alături, în limita}} pentru a desena și liniile caracteristice care **trec alături** de aliniament, în acea distanță, ca linii întrerupte la cotele lor proprii. Gol sau 0 arată doar traversările.
- Marcajele și etichetele urmează fiecare modificare: mutați un vârf, scrieți o pantă sau ridicați linia, iar profilul arată imediat noile cote.
- Faceți clic pe romburile unei traversări pentru a selecta linia caracteristică; linia selectată este desenată în culoarea de evidențiere.
- {{ui:Linii caracteristice}} din bara profilului ascunde sau arată toate. Ambele setări sunt salvate cu proiectul.

Vezi [Linii caracteristice](topic:feature-lines).

## Următorii pași

- [Generați un coridor de drum](topic:corridor) de-a lungul aliniamentului și al acestui profil.
- Profilul este scris în LandXML împreună cu aliniamentul; vezi [Schimbul LandXML](topic:landxml).
