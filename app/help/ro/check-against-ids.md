---
title: Verificarea exportului IFC față de IDS-ul clientului
summary: Încărcați fișierul .ids pe care vi l-a dat un client sau o autoritate rutieră și vedeți în Probleme fiecare element exportat care nu îl îndeplinește.
keywords: ids, information delivery specification, buildingsmart, cerințe, livrare, verificare, validare, control al calității, export ifc, ifc 4.3, ax, drum, achiziții
from: 183d9a0e
---

## Ce veți face

Un IDS (Information Delivery Specification, un standard buildingSMART) este lista a ceea ce trebuie să conțină un IFC. Achizițiile publice trimit adesea unul odată cu lucrarea. CivilCraft verifică IFC-ul pe care îl exportă acest proiect, în versiunea IFC aleasă pentru export, față de el și listează fiecare element care nu îl îndeplinește.

## Pași

1. Deschideți proiectul.
2. Faceți clic pe {{ui:IFC}} din grupul **Export** al barei de instrumente. În caseta de dialog, alegeți versiunea IFC pe care o veți livra.
3. Faceți clic pe {{ui:Verificare față de IDS…}}.
4. Faceți clic pe {{ui:Încărcare fișier .ids…}} și alegeți fișierul. Nimic nu este încărcat în altă parte.
5. Citiți rezultatul: fiecare specificație cu {{ui:Trece}} sau {{ui:Nu trece}} și câte elemente o privesc.
6. Deschideți Probleme ({{key:Ctrl+Shift+M}}) și faceți clic pe un eșec pentru a selecta axul, platforma, conducta, structura sau masa de construcție din care provine.

## Ce ar trebui să vedeți

- O avertizare pentru fiecare element exportat și cerință pe care o ratează, cu numele specificației, ce cere IDS-ul și ce are exportul.
- Raportul de verificare (în Probleme) începe cu IDS: titlul, versiunea, autorul și numărul fiecărei specificații.

## De reținut

- IDS-ul este salvat în fișierul proiectului, deci este verificat din nou când deschideți proiectul. Încărcarea sau uitarea lui este un pas pe care îl puteți anula.
- Fiecare modificare este verificată din nou puțin mai târziu. Suprafețele mari durează mai mult de scris, deci verificarea așteaptă atunci puțin mai mult între rulări.
- Verificarea folosește același fișier pe care îl scrie exportul {{ui:IFC}}, în versiunea aleasă ultima dată acolo (IFC 4.3 dacă nu ați ales una).
- Numerele sunt comparate în unități SI: un proiect în picioare este convertit mai întâi în metri.

- Șabloanele (pattern) din IDS sunt citite ca întreaga valoare. Un `^` la început și un `$` la sfârșit sunt luate tot ca „întreaga valoare”, cum înțeleg de cele mai multe ori fișierele IDS.

## Mai departe

- [Exportul IFC](topic:ifc)
