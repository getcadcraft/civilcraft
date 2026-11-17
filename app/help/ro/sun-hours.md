---
title: Calcularea orelor de soare pe un amplasament
summary: Alegeți o zi (sau un sezon) și un fus orar și vedeți orele de soare direct pe fiecare perete al fiecărui volum și pe terenul din jurul lor, cu terenul desenat pe plan și cifrele ca CSV.
keywords: soare, ore de soare, umbră, umbrire, acces la soare, ore de lumină, fațadă, perete, sezon, solstițiu, echinocțiu, fus orar, ora de vară, latitudine, longitudine, CSV, raster
from: 4e32a314
---

**Ore de soare** numără orele de soare direct care ajung la fiecare perete al fiecărui volum de clădire și la terenul din jurul lor, într-o zi pe care o alegeți sau medie pe un sezon. Volumele și terenul însuși aruncă umbră; nimic altceva nu (fără copaci, fără vecini pe care nu i-ați desenat). Lumina cerului care nu este soare direct nu se numără.

## Înainte de a începe

Poziția soarelui provine din latitudinea și longitudinea amplasamentului, care vin din **sistemul de coordonate** al proiectului. Un proiect fără unul este refuzat cu un mesaj: setați-l mai întâi (**Coordonate** din grupul GIS). O latitudine și o longitudine introduse manual ar fi o estimare, de aceea nu există câmpuri pentru ele.

## Calcularea

În **Proprietăți**, sub **Volume de clădire**, **Ore de soare**:

1. Alegeți **Ziua**. Pornește de la ziua în care soarele este cel mai jos pentru amplasament (21 decembrie, sau 21 iunie în emisfera sudică). Pentru un sezon, bifați **Pe un sezon**, alegeți **Ultima zi** și din câte în câte zile să se facă eșantionarea.
2. Tastați **Fusul orar**: un nume, de exemplu `America/Mexico_City`, sau o diferență față de UTC, de exemplu `-6`. Un nume urmează regulile de ora de vară ale acelui fus pentru ziua respectivă; o diferență tastată este folosită exact cum este scrisă, deci folosiți-o pe cea valabilă în ziua aceea. Rândul de sub câmp arată ce diferență a găsit.
3. Alegeți cât de des să se plaseze soarele (la fiecare 5, 10, 15 sau 30 de minute), apoi **Calculare ore de soare**. Un sezon rulează în procese de fundal; **Oprire** îl anulează.

## Ce obțineți

- Un tabel pe volum: **cel mai puțin favorabil perete**, **media** și **cel mai favorabil perete**, în ore pe zi, și un tabel cu fiecare perete, cu orientarea lui și orele pe fiecare etaj.
- Terenul din jurul volumelor, desenat pe plan de la întunecat (fără soare) la galben (cel mai mult pe care îl primește o celulă), cu o legendă. Celulele de sub un volum rămân goale. **Afișare teren pe plan** îl dezactivează.
- **Pereți ca CSV** și **Teren ca CSV** salvează cifrele.

Pentru un sezon, cifrele sunt media pe zi a zilelor eșantionate. Nimic nu se salvează în proiect: rezultatul este pentru a fi privit, iar o nouă rulare îl reface.

## Bine de știut

- Un perete numără un moment ca însorit doar când este orientat spre soare și nimic nu stă în cale. Un perete orientat în sens opus nu primește nimic.
- Terenul este eșantionat pe o grilă care depinde de mărimea amplasamentului, iar poziția soarelui este luată în mijlocul fiecărui pas de timp; orele sunt corecte cu aproximația pasului ales.
- Poziția soarelui este o formulă astronomică publicată, precisă la aproximativ un minut de arc.
