---
title: Ploščadi za hiše na nagnjenih zemljiščih
summary: Nivelirajte ploščad na pobočju: podporni zidovi kot robovi ploščadi, karta izkopa in nasipa, pobarvana glede na globino s točkovnimi kotami (tloris in 3D), prerez, narisan kjerkoli čez teren in načrt, ter klančine ali nagnjene ploščadi za dovozne poti.
keywords: ploščad, ploščad za hišo, nagnjeno zemljišče, pobočje, podporni zid, izkop in nasip, karta izkopa in nasipa, točkovne kote, prosti prerez, linija prereza, občinske risbe, dovozna pot, klančina, nagnjena ploščad, niveliranje, faktor nabrekanja, zemeljska dela
from: daa08a3f
---

Ploščad za hišo je **ploščad** (**Načrtovanje** › {{ui:Ploščad}}): ravni mnogokotnik na eni koti, nivelirana v teren. Na pobočju pomagajo štiri stvari.

## Podporni zidovi kot robovi ploščadi

Izberite ploščad in nastavite stran na {{ui:Navpično (podporni zid)}} namesto nagiba (**Lastnosti** › {{ui:Strani in podporni zidovi}}, ali {{ui:Navpično: podporni zidovi}} za vse strani naenkrat). Višina zidu se prebere iz terena vzdolž njega: vrh na terenu, spodaj na ploščadi, prikazano na obeh koncih in na najvišji točki na tlorisu, z opozorilom, kadar je višji od meje, ki ste jo nastavili. Zidovi in nakloni se lahko mešajo ob sebi.

## Karta izkopa in nasipa

Obkljukajte {{ui:Karta izkopa in nasipa}} pod **Prikaz**. Tloris je pobarvan glede na to, kako globok je izkop ali nasip, v enakih korakih (izkop toplih barv, nasip modro, skoraj raven bledo), z legendo, **točkovne kote** pa so izpisane na ploščadi: sprememba kote v točkah mreže, najgloblji izkop in najvišji nasip pa sta označena z ▲. Celice so iste, kot jih uporabljajo prostornine zemeljskih del, zato se karta in števila vedno ujemajo.

V 3D pogledu izberite **Izkop in nasip** iz seznama barv, da enake barve prelijete čez teren in načrt.

Faktor nabrekanja ali skrčenja je v orodju za masni diagram (**Načrtovanje** › {{ui:Masni diagram}}); pri prostornini ploščadi se ne upošteva.

## Prosti prerez

Pod **Površje** › {{ui:Več}} izberite {{ui:Prosti prerez}}, kliknite točke linije prereza kjerkoli (lahko se zvija) in pritisnite {{key:Enter}}. Pogovorno okno nariše prerez: obstoječi teren, nivelirani načrt (črtkano) in izkop in nasip med njima, pobarvana, s površinami (načrt šteje samo znotraj ploščadi in cest). {{ui:Navpična pretirava}} je privzeto prilagojena risbi; {{ui:Shrani kot SVG}} in {{ui:Shrani kot CSV}} vam dasta risbo za občino in števila.

## Klančine in nagnjene ploščadi

Pod **Površje** › {{ui:Več}} izberite {{ui:Klančina ali nagnjena ploščad}}, kliknite nižji konec in nato višji konec, pritisnite {{key:Enter}} ter vnesite širino, kota na nižjem koncu in naklon. Ploščad je pas, katerega vogali nosijo te kote (rob med dvema vogaloma teče pri stalnem naklonu), in se nivelira v teren kot katera koli ploščad. Vogali katere koli ploščadi lahko nosijo tudi svoje kote, zato je dovozna pot, klančina ali nagnjena terasa ploščad s koto na vsakem vogalu.
