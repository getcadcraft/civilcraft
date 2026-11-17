---
title: Kućni plato na nagnutim parcelama
summary: Nivelacija plata na padini, potporni zidovi kao ivice plata, karta iskopa i nasipa osjenčena prema dubini sa tačkastim nivoima (plan i 3D), presjek nacrtan bilo gdje kroz teren i projekt, te rampe ili nagnuti platoi za prilaze.
keywords: plato, plato za kuću, nagnuta parcela, padina, potporni zid, iskop i nasip, karta iskopa i nasipa, tačkasti nivoi, slobodan presjek, linija presjeka, crteži za općinu, prilaz, rampa, nagnuti plato, nivelacija, faktor nabubrenja, zemljani radovi
from: daa08a3f
---

Kućna platforma je **plato** (**Projekt** › {{ui:Plato}}): ravan poligon na jednom nivou, nivelisan u teren. Četiri stvari pomažu na padini.

## Potporni zidovi kao ivice plata

Odaberite plato i postavite stranu na {{ui:Vertikalno (potporni zid)}} umjesto nagiba (**Svojstva** › {{ui:Strane i potporni zidovi}}, ili {{ui:Vertikalno: potporni zidovi}} za sve strane odjednom). Visina zida se čita iz terena duž njega: vrh na terenu, dno na platou, prikazana na oba kraja i na njegovoj najvišoj tački na planu, uz upozorenje kada je viši od granice koju postavite. Zidovi i nagibi mogu se mješati jedan pored drugog.

## Karta iskopa i nasipa

Označite {{ui:Karta iskopa i nasipa}} pod **Prikaži**. Plan je osjenčen prema tome koliko je duboki iskop ili nasip, u jednakim koracima (iskop tople boje, nasip plave, gotovo ravno blijedo) uz legendu, a **tačkasti nivoi** su ispisani na platou: promjena nivoa u tačkama na mreži, a najdublji iskop i najviši nasip označeni su sa ▲. Ćelije su iste one koje koriste zapremine zemljanih radova, pa se karta i brojevi uvijek slažu.

U 3D prikazu izaberite **Iskop i nasip** s liste boja da preko terena i projekta navučete iste boje.

Faktor nabubrenja ili skupljanja nalazi se u alatu dijagrama transporta mase (**Projekt** › {{ui:Dijagram transporta mase}}); ne primjenjuje se na zapremine plata.

## Slobodan presjek

Pod **Površ** › {{ui:Više}}, izaberite {{ui:Slobodan presjek}}, kliknite tačke linije presjeka bilo gdje (može biti savijena) i pritisnite {{key:Enter}}. Dijalog crta presjek: postojeći teren, nivelisani projekt (isprekidano) i iskop i nasip između njih, osjenčene, sa njihovim površinama (projekt se računa samo unutar platoa i puteva). {{ui:Vertikalno preuveličavanje}} je zadano tako da stane u crtež; {{ui:Sačuvaj kao SVG}} i {{ui:Spasi kao CSV}} daju crtež za općinu i brojeve.

## Rampe i nagnuti platoi

Pod **Površ** › {{ui:Više}}, izaberite {{ui:Rampa ili nagnuti plato}}, kliknite nizak kraj pa visoki kraj, pritisnite {{key:Enter}}, i unesite širinu, nivo na niskom kraju i nagib. Plato je traka čiji uglovi nose te nivoe (ivica između dva ugla ide konstantnim nagibom), i nivelira se u teren kao i svaki plato. Uglovi bilo kojeg plata mogu također nositi sopstvene nivoe, pa su prilaz, rampa ili nagnuta terasa plato sa nivoom na svakom uglu.
