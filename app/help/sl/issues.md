---
title: Zadeve in BCF
summary: Pripnite težavo na tloris, na stacionažo trase, na točko površja ali na cev, dodelite ji stanje in komentarje ter izmenjujte zadeve kot datoteke BCF 2.1 ob datoteki LandXML.
keywords: zadeva, zadeve, bcf, komentar, označba, pomanjkljivost, napaka, gradbišče, pripni, stanje, odprto, rešeno, zaprto, bim collaboration format, landxml, težave
from: e44153b1
---

Zadeva je opomba, pripeta na mesto v vaši risbi CivilCraft, z naslovom, stanjem in komentarji. Uporabite jo, da gradbiščnemu osebju ali drugemu programu sporočite, kaj naj pregleda, in da preberete njihove odgovore.

## Dodajanje zadeve

1. Odprite **Površje, Več, Zadeve (BCF)...**
2. Vnesite naslov in opišite, kaj ni v redu.
3. Izberite, kam jo pripeti: središče tlorisnega pogleda, točko površja v središču, stacionažo izbrane trase (vnesite stacionažo in odmik; desno je pozitivno) ali izbrano cev, objekt ali karakteristično črto.
4. Pritisnite **Dodaj zadevo**. Oznaka se prikaže na tlorisu kot majhen romb s številko.

Kliknite naslov zadeve, da se povečate nanjo, spremenite njeno stanje na seznamu (Odprto, Aktivno, Rešeno, Zaprto) in dodajte komentarje. Vsaka sprememba je en korak razveljavitve, zadeve pa se shranijo v projektno datoteko.

## Izmenjava prek BCF

- **Izvozi BCF** zapiše datoteko BCF 2.1 z eno temo na zadevo: naslov, stanje, komentarji in en pogled z ortogonalno tlorisno kamero ter oznako.
- **Uvozi BCF** prebere datoteko BCF (datoteke 2.0 in 3.0 se berejo, kolikor ustrezajo različici 2.1). Tema z guid-om, ki ga že imate, posodobi to zadevo (stanje, novi komentarji), namesto da bi dodala drugo.
- **Iz težav** ustvari zadevo iz vsakega odprtega vnosa v podoknu Težave, ki navaja, kje je.

BCF prenaša metre v lastnih koordinatah tega projekta, brez premika. Drugi program mora biti v istem koordinatnem sistemu kot vaša datoteka LandXML, da oznake pristanejo na pravem mestu. Element, na katerega kaže oznaka (trasa, stacionaža, odmik, cev), se prenese kot oznake, ki se začnejo z „cc:“, in jih CivilCraft prebere nazaj.

## Kaj ni preverjeno

Oznake in pogledi so bili preizkušeni le tako, da smo datoteko zapisali in jo nato prebrali v CivilCraft. Nobeden drug program BIM je še ni odprl, pa tudi ni enotno, ali BCF »view to world scale« pomeni polno ali polovično višino pogleda; CivilCraft zapiše polno višino.
