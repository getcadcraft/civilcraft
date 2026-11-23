---
title: Proiectarea unui profil vertical
summary: Deschideți vizualizarea profilului, începeți un profil de proiectare de la teren, adăugați și trageți PVI, setați lungimile curbelor verticale și citiți pantele, valorile K și punctele înalte și joase.
keywords: profil, aliniament vertical, pvi, curbă verticală, pantă, valoare k, convexă, concavă, bvc, evc, vizualizare profil, cotă finită, fg, profilul terenului existent, linii caracteristice în profil, intersecții, proiectate, bordură, șanț, etichete
from: dbb1f32d
---

Fiecare aliniament are un profil de proiectare: o listă de PVI (pichet și cotă) unite prin pante drepte, cu o curbă verticală parabolică simetrică la orice PVI interior care are o lungime. Profilul terenului existent este prelevat automat din suprafață.

## Deschiderea vizualizării profilului

1. Selectați aliniamentul (faceți clic pe el cu {{ui:Selectare}}).
2. Apăsați {{key:R}}, sau faceți clic pe {{ui:Profil longitudinal}} în bara de instrumente, sau pe {{ui:Vizualizarea profilului}} la baza panoului din dreapta.
   Vizualizarea profilului se deschide sub plan, cu terenul existent de-a lungul aliniamentului. Cu două sau mai multe aliniamente, alegeți unul din lista din stânga barei de profil.

Vizualizarea începe prin a arăta tot aliniamentul și prin întinderea cotelor pentru a umple panoul; exagerarea este afișată în colțul din stânga jos, de exemplu „Exagerare verticală 10×”.

## Zoom și deplasare în profil

- **Zoom:** rotiți rotița mouse-ului (sau ciupiți pe touchpad) și vizualizarea face zoom în jurul indicatorului. Țineți apăsat {{key:Shift}} pentru a face zoom doar pe pichete sau {{key:Alt}} pentru a face zoom doar pe cote (asta schimbă exagerarea). Cu vizualizarea profilului activă, tastele plus și minus fac zoom din mijloc.
- **Deplasare:** trageți cu butonul din dreapta sau cu cel din mijloc al mouse-ului, sau glisați cu două degete pe touchpad.
- **Potrivire:** faceți dublu clic pe profil sau apăsați {{key:F}} pentru a arăta din nou tot aliniamentul.

Editarea unui PVI păstrează zoomul ales; nu revine la potrivire.

Mutați indicatorul de-a lungul profilului: bara arată pichetul, cotele terenului și de proiect, panta și debleul sau rambleul de acolo, iar un punct urmărește aliniamentul în plan.

## Începerea profilului de proiectare

1. În panoul din dreapta, sub **Profil de proiectare**, faceți clic pe {{ui:Pornire din teren}}.
   Două PVI sunt plasate pe teren la cele două capete ale aliniamentului, unite printr-o singură pantă dreaptă. Bara de stare spune „Profil de proiectare pornit de la teren la ambele capete. Activați Adăugare PVI și faceți clic pentru a adăuga schimbări de pantă; dați-le o lungime de curbă în tabel.”

Dacă aliniamentul nu traversează suprafața, apare mesajul „Acest aliniament nu are teren sub el de la care să pornească.” Atunci adăugați PVI prin clic (secțiunea următoare).

## Adăugarea PVI-urilor

1. Apăsați {{key:I}}, sau faceți clic pe {{ui:Adăugare PVI}} din bara de profil. Rămâne apăsat.
2. Faceți clic în profil acolo unde doriți o schimbare de pantă. Un PVI este adăugat la pichetul și cota respectivă, rotunjite la 0.01, și este selectat.
3. Adăugați cât aveți nevoie, apoi apăsați {{key:I}} din nou pentru a opri adăugarea.

Un clic acolo unde există deja un PVI este refuzat („Există deja un PVI la …”). PVI-urile rămân mereu în ordinea pichetelor.

## Agățarea la adăugare sau tragere

Butonul **Agățare** din bara de profil este activat din start. Cât timp este activ, un PVI pe care îl adăugați sau îl trageți se așază pe cel mai apropiat PVI, punct de teren, pichetul unui PVI sau linia terenului, iar o etichetă de lângă marcaj spune care. Țineți apăsat {{key:Alt}} pentru un punct liber, oriunde.

## Ajustarea PVI-urilor

- **Trageți** un PVI în profil pentru a-l muta. Nu poate trece de vecinii săi. Mutarea este un singur pas de anulare.
- **Introduceți** valori exacte în tabelul PVI din panoul din dreapta: **Pichet**, **Cotă**, **Pantă %** și **Curbă L** (lungimea curbei verticale). Apăsați {{key:Enter}} după fiecare.
- **Alegeți** o valoare din profil: butonul mic de lângă pichetul sau cota unui PVI așteaptă un clic în vizualizarea profilului și completează valoarea. Clicul se agață ca la Adăugare PVI; țineți apăsat {{key:Alt}} pentru un punct liber; {{key:Esc}} anulează.
- **Pantă %** este panta tangentei care pornește de la acel PVI și ajunge la următorul. Introducerea ei mută cota **următorului** PVI (pichetul său nu se mută niciodată). Dacă următorul PVI este blocat, se mută în schimb cota PVI-ului precedent.
- **Blocați** un PVI cu lacătul de la capătul rândului său. Un PVI blocat nu se trage, iar o modificare a pantei nu îl mută. Dacă ambele capete ale unei tangente sunt blocate, panta sa nu se poate schimba: bara de stare o spune, iar mai întâi deblocați un capăt. Blocarea se salvează în fișier.
- **Eliminați** un PVI cu x de la capătul rândului sau selectați-l (faceți clic pe el) și apăsați {{key:Delete}}. Când vizualizarea profilului are focusul, {{key:Backspace}} îl elimină de asemenea.

Primul și ultimul PVI nu primesc niciodată o curbă.

## Curbe verticale

1. Introduceți o lungime în **Curbă L** pentru un PVI interior, de exemplu 200.
2. Curba este desenată centrată pe PVI. Profilul și panoul din dreapta arată tipul său (convexă sau concavă), L și K, pichetele și cotele BVC și EVC și punctul său înalt sau jos atunci când are unul în interiorul curbei.

K se calculează din L (K = L împărțit la diferența algebrică a pantelor, în procente). Introduceți L; introducerea directă a lui K nu este disponibilă încă.

Dacă o curbă verticală nu încape, o casetă roșie spune de ce: intră înapoi în PVI-ul sau curba dinaintea sa, sau dincolo de următorul PVI, și cât spațiu este pe acea parte (o curbă are nevoie de jumătate din lungimea sa pe fiecare parte a PVI-ului său). Butonul ei setează **cea mai lungă curbă care încape**, cu K-ul său, ca un singur pas ({{key:Mod+Z}} îl anulează). Sau depărtați PVI-urile.

## Citirea datelor

Sub tabelul PVI, o listă dă fiecare pantă în procente („Pantă 1: +1.25%”) și fiecare curbă, de exemplu „Convexă la 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)”, apoi „Punct înalt 1+62.40, 254.12”.

Dacă PVI-urile nu ajung la ambele capete ale aliniamentului, o notă o spune. Un coridor se construiește doar acolo unde profilul și aliniamentul se suprapun.

## Liniile caracteristice în profil

Liniile caracteristice apar și în vizualizarea profilului, astfel încât puteți vedea o bordură, un șanț sau cota superioară a unui zid față de profilul drumului.

- Acolo unde o linie caracteristică **intersectează** aliniamentul, profilul arată un romb mic la acel pichet și cotă, etichetat cu numele liniei și cu cota ei de acolo (cota proprie a liniei, calculată de-a lungul segmentului care intersectează).
- Introduceți o distanță în {{ui:Alături, în limita}} pentru a desena și liniile caracteristice care **trec alături** de aliniament în acea distanță, ca linii întrerupte la propriile cote. Gol sau 0 arată doar intersecțiile.
- Marcajele și etichetele urmăresc fiecare modificare: mutați un vârf, introduceți o pantă sau ridicați linia, iar profilul arată imediat noile cote.
- Faceți clic pe rombul unei intersecții pentru a selecta linia caracteristică; linia selectată este desenată în culoarea de evidențiere.
- {{ui:Linii caracteristice}} din bara de profil ascunde sau arată toate liniile. Ambele setări se salvează cu proiectul.

Vedeți [Linii caracteristice](topic:feature-lines).

## Continuare

- [Baleierea unui coridor rutier](topic:corridor) de-a lungul aliniamentului și al acestui profil.
- Profilul se scrie în LandXML împreună cu aliniamentul; vedeți [Schimbul LandXML](topic:landxml).
