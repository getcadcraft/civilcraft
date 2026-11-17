---
title: Înregistrări de plante, soiuri și dimensiuni livrate
summary: Lista proprie de plante a proiectului, ca tabel: soiuri, dimensiuni livrate (recipient, bal de rădăcini, circumferință, trunchi liber), densitate, note de specificație, CSV la intrare și la ieșire; fiecare plantă plasată indică o dimensiune; simboluri de plante după scară și propriile simboluri și modele 3D.
keywords: tabel de plante, baza de date de plante, soi, varietate, dimensiune livrată, recipient, bal de rădăcini, rădăcină goală, circumferință, trunchi liber, densitate, plante pe metru pătrat, specificație, note de specificație, simbol de plantă, bloc, simbol propriu, plantă 3D, nivel de detaliu, scară
from: 12251beb
---

Deschideți {{ui:Tabel plante}} din meniul {{ui:Mai multe}} al grupului Peisaj sau din secțiunea Plante. Fiecare rând este o înregistrare de plantă din lista proprie a acestui proiect (o înregistrare din lista de plante este copiată atunci când o adăugați). Fiecare modificare este verificată ca un fișier importat și constituie un singur pas de anulare.

## Coloanele

- **Nume botanic**, **Nume comun**, **Tip**, **Înălțime** și **Extindere** la maturitate (metri).
- **Distanță** (de la centru la centru) sau **Densitate** (plante pe m²). Un strat al unei înregistrări cu densitate și fără distanță este umplut la acea densitate, după modelul propriu (triunghiular sau pătrat).
- **Dimensiuni livrate**: câte o intrare pentru fiecare dimensiune, separate prin `;`. Fiecare intrare are un identificator, un tip (`container`, `rootball`, `wrapped`, `bareroot`, `plug`, `seed`) și apoi oricare dintre: un volum `10L`, o înălțime `h0.6`, o extindere `s0.4`, o circumferință `g14-16` (cm), un trunchi liber `st1.8`. Exemplu: `c10 container 10L h0.6; rb rootball h3 g14-16 st1.8`.
- **Soiuri**: nume separate prin `;`. Un soi își păstrează propriile dimensiuni și note atunci când fișierul importat le avea.
- **Note de specificație**.

{{ui:Duplicare}} copiază un rând sub o cheie nouă; {{ui:Salvare ca CSV}} și {{ui:Salvare ca fișier de plante}} scriu lista (rândurile CSV pentru soiuri stau sub specia lor, cu `cultivar_of`). Importarea unui fișier CSV sau de plante îl combină cu lista existentă.

## Lista dvs. de plante din Bibliotecă

Conectați-vă la contul CadCraft (Setări, Suplimentele dvs., Conectare) și tabelul de plante poate folosi lista pe care o păstrați în Bibliotecă:

- {{ui:Din lista mea din Bibliotecă}} aduce elementele dvs. de plante (inclusiv cele care așteaptă încă verificarea). O plantă pe care o aveți deja aici este actualizată din Bibliotecă; soiurile, dimensiunile livrate, densitatea și specificația adăugate aici sunt păstrate.
- {{ui:Salvare ca listă de plante}} salvează fiecare rând ca element de plantă propriu în Bibliotecă, câte un element pentru fiecare specie: o plantă nouă devine un element nou, o plantă modificată devine o versiune nouă, iar una nemodificată rămâne neatinsă. Bifați mai întâi căsuța: salvarea pune plantele la dispoziția publicului sub CC0. Prima încărcare publică a unei persoane care nu este încă de încredere este verificată de o persoană înainte de a apărea, ca orice încărcare.

Biblioteca păstrează înregistrarea de bază a plantei. Soiurile, dimensiunile livrate, densitatea și notele de specificație rămân în proiect și în fișierul de plante ({{ui:Salvare ca fișier de plante}}); caseta de dialog indică de fiecare dată câte rânduri sunt afectate la salvare.

## O plantă plasată indică o dimensiune

Selectați o plantă, un gard viu sau un rând de amestec al unui strat ori al unei suprafețe plantate: când înregistrarea are soiuri sau dimensiuni livrate, {{ui:Soi și dimensiune}} alege una. Tabelul de plante numără apoi după specie, soi și dimensiune, iar o etichetă le poate afișa: `{botanical} '{cultivar}' {size}` sau `{full}`.

## Simboluri ale plantelor după scară

{{ui:Grafică pentru plante}} (Peisaj › Mai multe) stabilește cum sunt desenate plantele în plan: **automat** (mai grosier decât 1:500 un cerc la extindere, între 1:200 și 1:500 un contur cu centrul său, mai fin simbolul detaliat; ambele scări pot fi schimbate) sau un nivel pentru fiecare scară. Caseta Planșe are propriul **Detaliul plantelor în plan** pentru acel set.

Pe o înregistrare din secțiunea Plante, {{ui:Simbol propriu…}} citește un SVG sau un bloc dintr-un desen DXF/DWG și îl desenează la extinderea plantei, la nivelul detaliat. {{ui:Model 3D propriu…}} citește un OBJ, STL sau GLB; în Grafica plantelor alegeți **Modelul propriu al fiecărei înregistrări** pentru a-l vedea în 3D. Fișierele au limite (512 KB de SVG, 2000 de forme, 50 000 de triunghiuri) și sunt păstrate în proiect. Transformările SVG nu se aplică (vi se semnalează când un fișier le conține). Vezi [Grafica plantelor, simboluri proprii și plante 3D](topic:plant-graphics) pentru niveluri, limite și ce poate conține un GLB.
