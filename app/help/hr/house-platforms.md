---
title: Platoi za kuće na nagnutom terenu
summary: Planiranje platoa na padini: potporni zidovi kao rubovi platoa, karta iskopa i nasipa osjenčana dubinom s visinskim kotama (tlocrt i 3D), slobodni presjek nacrtan bilo gdje kroz teren i projekt, te rampe ili nagnuti platoi za prilaze.
keywords: plato, plato za kuću, nagnuto zemljište, padina, potporni zid, iskop i nasip, karta iskopa i nasipa, visinske kote, slobodni presjek, linija presjeka, nacrti za lokalnu upravu, prilaz, rampa, nagnuti plato, planiranje, faktor nabubrenja, zemljani radovi
from: daa08a3f
---

Platforma za kuću je **plato** (**Projektiranje** › {{ui:Plato}}): ravni poligon na jednoj koti, planiran u teren. Četiri stvari pomažu na padini.

## Potporni zidovi kao rubovi platoa

Odaberite plato i postavite stranu na {{ui:Vertikalno (potporni zid)}} umjesto nagiba (**Svojstva** › {{ui:Strane i potporni zidovi}}, ili {{ui:Vertikalne: potporni zidovi}} za sve strane odjednom). Visina zida čita se s terena uz njega: vrh na terenu, dno na platou, prikazano na oba kraja i na najvišoj točki na tlocrtu, s upozorenjem kad je viši od granice koju postavite. Zidovi i nagibi mogu se miješati jedan uz drugi.

## Karta iskopa i nasipa

Označite {{ui:Karta iskopa i nasipa}} pod **Prikaz**. Tlocrt se osjenčava prema dubini iskopa ili nasipa, u jednakim koracima (iskop toplim, nasip plavim, gotovo ravno blijedim tonom), s legendom, a **visinske kote** ispisane su na platou: promjena kote u točkama mreže, a najdublji iskop i najviši nasip označeni su ▲. Ćelije su iste one koje koriste volumeni zemljanih radova, pa se karta i brojevi uvijek slažu.

U 3D prikazu odaberite **Iskop i nasip** s popisa boja da iste boje prekrijete preko terena i projekta.

Faktor nabubrenja ili skupljanja nalazi se u alatu za masu (**Projektiranje** › {{ui:Dijagram masa}}); ne primjenjuje se na volumene platoa.

## Slobodni presjek

Pod **Teren** › {{ui:Više}} odaberite {{ui:Slobodni presjek}}, kliknite točke linije presjeka bilo gdje (može se lomiti) i pritisnite {{key:Enter}}. Dijaloški okvir crta presjek: postojeći teren, projektirani teren (isprekidano) i iskop i nasip između njih, osjenčano, s njihovim površinama (projekt se računa samo unutar platoa i cesta). {{ui:Vertikalno povećanje}} zadano se prilagođava crtežu; {{ui:Spremi kao SVG}} i {{ui:Spremi kao CSV}} daju crtež za lokalnu upravu i brojeve.

## Rampe i nagnuti platoi

Pod **Teren** › {{ui:Više}} odaberite {{ui:Rampa ili nagnuti plato}}, kliknite nizak kraj pa visoki kraj, pritisnite {{key:Enter}} i upišite širinu, kotu na niskom kraju i nagib. Plato je traka čiji kutovi nose te kote (rub između dva kuta ide stalnim nagibom) i planira se u teren kao svaki plato. Kutovi bilo kojeg platoa mogu također nositi vlastite kote, pa su prilaz, rampa ili nagnuta terasa plato s kotom na svakom kutu.
