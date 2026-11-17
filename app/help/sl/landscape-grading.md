---
title: Niveliranje za krajinsko ureditev
summary: Ploščadi, nasipi, jarki in prosto niveliranje s točkovnimi kotami in plastnicami, ki jih povlečete, izkop in nasip sproti, analiza naklona, puščice toka in zajezitve — vse v predvidenem površju CivilCraft.
keywords: podporni zid, podporni zidovi, navpična stran, zid namesto brežine, nakloni po straneh, nasip, niveliranje, krajinsko niveliranje, ploščad, terasa, gomila, zatravljen jarek, višinska kota, točkovna kota, plastnice, uredi plastnice, izkop in nasip, zemeljska dela, analiza naklona, dostopnost, strmi nakloni, puščice toka, odvodnjavanje, zajezitev, luže
from: e1559eb9
---

Vse tukaj je nivelirano v **predvideno površje** z istim niveliranjem kot ploščadi in koridorji. **Obstoječi teren** se nikoli ne spremeni, orodje Zemeljska dela pa vse to šteje. Meni Niveliranje je v skupini Landscape.

## Ploščadi

{{ui:Niveliranje}} › {{ui:Ploščad}}, nato kliknite vogale in pritisnite {{key:Enter}}. Ploščad se začne na povprečni koti terena pod njo; vpišite **Kota**, da jo nastavite, ali jo izpraznite, da znova sledi terenu. **Padec** v % in **Smer padca** v stopinjah (0 = vzhod, 90 = sever) jo nagneta. Njene stranice se nivelirajo do terena pri **Naklonu izkopa** in **Naklonu nasipa** (vodoravno proti 1).

## Nakloni po straneh in podporni zidovi

Pod **Strani in podporni zidovi** v **Lastnostih** ploščadi, nasipa ali jarka se lahko vsaka stran nivelira na svoj način. Stran 1 teče od prvega vogala, ki ste ga kliknili, do drugega, stran 2 od drugega do tretjega itd.

- **Vse strani**: **Nagnjeno** uporabi zgoraj navedene naklone izkopa in nasipa na vseh straneh; **Navpično: podporni zidovi** postavi zid na vsako stran.
- Po stranicah: **Enako kot zgoraj**, **Lastni nakloni** (vpišite naklon izkopa in nasipa za to stran) ali **Navpično (podporni zid)**.
- Naklon vpišite kot `3` ali `3:1` (vodoravno proti 1 navpično), `33%` ali `18.4°`; prikaže se kot H:1. Lastna **Naklona izkopa** in **nasipa** ploščadi sprejmeta enako.
- Navpična stran nima nasipa: podporni zid teče ob robu, od ploščadi navzdol do obstoječega terena (pri nasipu) ali od terena navzdol do ploščadi (pri izkopu). **Debelina zidu** (privzeto 0.3 m ali 1 ft) je, kako daleč teren stopi od roba ploščadi do obstoječega terena. Prostornine izkopa in nasipa ne upoštevajo nasipa, ki ga ta stran več nima.
- Kjer se zid stakne z nagnjeno stranjo, se nakloni ovijejo okoli konca zidu; dva zidova se stakneta v zareznem spoju.
- Pod polji: dolžina zidov, izpostavljena površina čela (višina × dolžina), najvišja in povprečna višina.

Tloris nariše zunanje čelo vsakega zidu s kratkimi črticami čez njega in njegovo višino na obeh koncih in na najvišji točki (na plasti podpornih zidov, ki gre tudi v DXF in DWG). 3D pogled prikaže zidove kot telesa (Prikaz › Podporni zidovi), izvozi GLB, OBJ in USD pa jih vključujejo. Prerezi čez rob prikazujejo stopničo.

**Opozorila** (v **Lastnostih** in v podoknu Težave): zid, višji od **Opozori nad višino zidu** (privzeto 1.0 m ali 3.3 ft), „morda potrebuje inženirsko zasnovan zid ali dovoljenje; preverite lokalne predpise“, in, ko vpišete **Najstrmejši naklon, ki ga zemljina zdrži**, vsaka stran, katere naklon izkopa ali nasipa je strmejši od tega. To so opozorila: niveliranje se kljub temu zgradi. Vsaka sprememba je en korak za {{key:Mod+Z}}.

## Nasipi

{{ui:Niveliranje}} › {{ui:Nasip}}: gomila, katere vrh je **Višina** nad povprečnim terenom pod njo, njene strani pa se nivelirajo do terena.

## Zatravljeni jarki

{{ui:Niveliranje}} › {{ui:Zatravljen jarek}}, nato kliknite vzdolž jarka **v smeri, v kateri teče voda**, in pritisnite {{key:Enter}}. Nastavite njegovo **Globino**, **Širino dna** (0 za V) in **Naklon stranice**. Brez **Padca** sledi njegovo dno terenu, njegova globina je pod njim in nikoli ne teče navzgor; vpišite padec, da dobi enakomerno padanje od začetka.

## Točkovne kote in plastnice

1. {{ui:Niveliranje}} › {{ui:Območje niveliranja}}: kliknite obris območja, ki ga želite oblikovati.
2. {{ui:Niveliranje}} › {{ui:Višinska kota}}: kliknite znotraj območja. Vpišite njeno koto v **Lastnostih** ali uporabite gumba ▲ ▼.
3. {{ui:Niveliranje}} › {{ui:Uredi plastnico}}: kliknite plastnico znotraj območja, da jo vzamete kot črto, ki jo lahko preoblikujete.

Izberite višinsko koto ali plastnico in jo na tlorisu **povlecite** (ali njene točke): površje sledi, ko spustite, kot en korak razveljavitve. Znotraj območja se teren ponovno izdela iz njegovega roba (kjer se stika z obstoječim terenom), višinskih kot in urejenih plastnic.

## Izkop in nasip sproti

Lastnosti vsakega objekta niveliranja prikazujejo njegov **Izkop** in **Nasip** ter skupna vrednost za celotno lokacijo, po metodi mreže, ki jo uporablja Zemeljska dela, in sicer sproti, ko jih spreminjate. Težave (izven površja, obris, ki seka sam sebe) so navedene tam.

## Preverjanja niveliranja

V razdelku **Preverjanja niveliranja** na levi:

- **Analiza naklona** pobarva površje po naklonu: do nežne meje, med njima in strmejše od meje strmine (privzeto 5 % in 33.3 %: običajno 1:20 za dostopne poti in 1:3 za košnjo). Legenda pove, kolikšen del območja pride v vsak razred. Strma območja se natisnejo tudi na listih.
- **Puščice toka in zajezitve** nariše, v katero smer teče voda, in obkroži vsako mesto, kjer bi se voda zajezila, z njegovo globino; razdelek pove, koliko je takih mest, najgloblje in koliko vode zadržijo.

Preverjanja berejo predvideno površje, kadar je karkoli nivelirano, sicer pa obstoječi teren.
