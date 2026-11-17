---
title: Kućne platforme na kosom terenu
summary: Nivelacija platoa na padini: potporni zidovi kao ivice platoa, karta iskopa i nasipa nijansirana po dubini sa tačkastim kotama (plan i 3D), presek nacrtan bilo gde kroz teren i projekat, i rampe ili nagnuti platoi za prilaze.
keywords: platforma, plato, plato za kuću, kosi teren, padina, potporni zid, iskop i nasip, karta iskopa i nasipa, tačkaste kote, slobodan presek, linija preseka, građevinski crteži, prilaz, rampa, nagnuti plato, nivelacija, koeficijent nabreknuća, zemljani radovi
from: daa08a3f
---

Kućna platforma je **plato** (**Projektovanje** › {{ui:Plato}}): ravan poligon na jednoj koti, nivelisan u teren. Četiri stvari pomažu na padini.

## Potporni zidovi kao ivice platoa

Izaberi plato i postavi stranu na {{ui:Vertikalno (potporni zid)}} umesto kosine (**Svojstva** › {{ui:Strane i potporni zidovi}}, ili {{ui:Vertikalno: potporni zidovi}} za sve strane odjednom). Visina zida čita se iz terena uz njega: vrh na terenu, dno na platou, prikazano na oba kraja i na njegovoj najvišoj tački na planu, uz upozorenje kad je viši od granice koju podesiš. Zidovi i kosine mogu biti pomešani jedni pored drugih.

## Karta iskopa i nasipa

Označi {{ui:Karta iskopa i nasipa}} pod **Prikaži**. Plan je nijansiran prema dubini iskopa ili nasipa, u jednakim koracima (iskop topao, nasip plav, skoro ravno blago), sa legendom, a **tačkaste kote** su ispisane na platou: promena kote u tačkama mreže, a najdublji iskop i najviši nasip obeleženi su ▲. Ćelije su iste one koje koriste zapremine zemljanih radova, pa se karta i brojevi uvek slažu.

U 3D pregledu izaberi **Iskop i nasip** iz liste boja da preko terena i projekta prebaciš iste boje.

Koeficijent nabreknuća ili skupljanja je u alatu za masni transport (**Projektovanje** › {{ui:Masni transport}}); ne primenjuje se na zapremine platoa.

## Slobodan presek

Pod **Površ** › {{ui:Više}}, izaberi {{ui:Slobodan presek}}, klikni tačke linije preseka bilo gde (može da se savija) i pritisni {{key:Enter}}. Dijalog crta presek: postojeći teren, projektovani teren (isprekidano) i iskop i nasip između njih, nijansirani, sa svojim površinama (projekat se računa samo unutar platoa i puteva). {{ui:Vertikalno preuveličavanje}} je podrazumevano prilagođeno crtežu; {{ui:Sačuvaj kao SVG}} i {{ui:Sačuvaj kao CSV}} daju crtež za opštinu i brojeve.

## Rampe i nagnuti platoi

Pod **Površ** › {{ui:Više}}, izaberi {{ui:Rampa ili nagnuti plato}}, klikni niži kraj pa viši kraj, pritisni {{key:Enter}}, i zadaj širinu, kotu na nižem kraju i nagib. Plato je traka čiji uglovi nose te kote (ivica između dva ugla ide konstantnim nagibom), i nivelše se u teren kao svaki plato. Uglovi bilo kog platoa mogu takođe da nose sopstvene kote, pa su prilaz, rampa ili nagnuta terasa plato sa kotom na svakom uglu.
