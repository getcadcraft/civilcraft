---
title: Stilizarea unui strat după un atribut
summary: Colorați elementele unui strat GIS după valorile unui câmp (o culoare pentru fiecare valoare sau pe intervale de numere), dimensionați punctele după un număr, nuanțați poligoanele și afișați o legendă pe plan.
keywords: simbolizare, stil, style, culoare, categorizat, gradat, valori unice, interval egal, cuantilă, pauze naturale, jenks, rampă, daltonism, legendă, dimensiune, puncte, cloropletă, clase, gis
from: a3a69add
---

Deschideți meniul cu **trei puncte** al unui strat din lista straturilor GIS și alegeți {{ui:Stil după atribut…}}.

## Trei stiluri

- **Simbol unic:** culoarea stratului, ca înainte.
- **Categorizat:** o culoare pentru fiecare valoare distinctă a oricărui câmp. Până la opt valori primesc cele opt culori Okabe-Ito (alese să rămână distincte pentru tipurile obișnuite de daltonism); cu mai multe valori, cele mai frecvente șapte primesc câte o culoare, iar restul împart o clasă gri **Altele**. Elementele fără valoare sunt gri.
- **Gradat:** un câmp numeric este tăiat în 2 până la 9 intervale, fiecare cu o culoare dintr-o rampă. O valoare aflată pe o limită intră în intervalul inferior.

## Cum sunt tăiate intervalele

| Metodă | Limite |
|---|---|
| Interval egal | Intervalul de la cea mai mică la cea mai mare valoare, împărțit în lățimi egale. Valorile de la 0 la 30 în trei intervale: 0, 10, 20, 30. |
| Cuantilă | Cam același număr de elemente în fiecare interval. Limitele sunt citite din valorile sortate, cu interpolarea liniară obișnuită: pentru 1 până la 10 în două intervale, limita este 5.5. |
| Pauze naturale (Jenks) | Tăieturile care lasă cea mai mică dispersie în fiecare interval, astfel încât grupurile de valori similare rămân împreună. La mai mult de 1,500 de valori lucrează pe 1,500 distribuite uniform și spune asta. |

## Culori

Viridis și Cividis merg de la închis la deschis, cu o schimbare constantă a luminozității, așa că ordinea intervalelor se poate citi chiar și în gri sau cu daltonism. Blues merge de la deschis la închis. Roșu–albastru este o rampă bidirecțională pentru valori în jurul unei valori de mijloc. **Inversare culori** răstoarnă oricare dintre ele. Caseta de dialog listează intervalele și numărul de elemente din fiecare înainte să aplicați.

## Dimensiune, umplere și legendă

- **Dimensiunea punctului după** un câmp numeric face pătratul fiecărui punct mai mare cu cât valoarea este mai mare, între cele două dimensiuni pe care le dați (jumătate din latură, în milimetri pe hârtie).
- **Nuanțarea interiorului poligoanelor** umple fiecare poligon cu culoarea clasei sale (găurile rămân goale). Nuanța este pe ecran; trasările, DXF și DWG arată conturele colorate.
- **Afișarea unei legende pe plan** desenează clasele, numărul lor de elemente și intervalul de dimensiuni în colțul din stânga jos al planului. Legenda este pe ecran; nu apare într-o trasare.
- Pentru a eticheta elementele cu un câmp, folosiți **Etichetare cu** din același meniu.

Stilul este salvat în fișierul de proiect. O versiune care nu cunoaște stilurile deschide fișierul cu culoarea stratului. Trasările, DXF și DWG poartă clasele ca straturi separate, numite după strat și clasă, în cea mai apropiată dintre cele nouă culori de bază CAD. Un strat cu mai mult de 200,000 de elemente este desenat într-o singură culoare.
