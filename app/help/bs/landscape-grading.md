---
title: Nivelacija za pejzaž
summary: Platforme, nasipi, jarci za odvodnju i slobodna nivelacija sa tačkastim kotama i izohipsama koje prevlačite, iskop i nasip uživo, analiza nagiba, strelice toka i zadržavanje vode — sve u projektovanoj površini CivilCraft-a.
keywords: potporni zid, potporni zidovi, vertikalna strana, zid umjesto nagiba, nagib po strani, nasip, nivelacija, nivelacija za pejzaž, platforma, terasa, plato, gomila, jarak za odvodnju, tačkasta kota, tačkasti nivo, izohipse, uredi konturu, iskop i nasip, zemljani radovi, analiza nagiba, pristupačnost, strmi nagibi, strelice toka, odvodnja, zadržavanje vode, lokve
from: e1559eb9
---

Sve ovdje se nivelira u **projektovanu površinu** istom nivelacijom kao platoi i koridori. **Postojeći teren** se nikada ne mijenja, a Zemljani radovi ga sve broje. Meni Nivelacija je u grupi Pejzaž.

## Platforme

{{ui:Nivelacija}} › {{ui:Platforma}}, zatim kliknite uglove i pritisnite {{key:Enter}}. Platforma počinje na srednjoj koti terena ispod nje; upišite **Kota** da je postavite, ili ostavite prazno da ponovo prati teren. **Pad** u % i **Pad prema** u stepenima (0 = istok, 90 = sjever) je naginju. Njene strane nivelisane su do terena na **Nagibu iskopa** i **Nagibu nasipa** (horizontalno prema 1).

## Nagibi po stranama i potporni zidovi

Pod **Strane i potporni zidovi** u Svojstvima plata, platforme ili nasipa, svaka strana može biti nivelisana na svoj način. Strana 1 ide od prvog ugla koji ste kliknuli do drugog, strana 2 od drugog do trećeg, i tako dalje.

- **Sve strane**: **Nagnuto** koristi gore navedene nagibe iskopa i nasipa na svakoj strani; **Vertikalno: potporni zidovi** postavlja zid na svaku stranu.
- Po strani: **Nagibi iznad**, **Sopstveni nagibi** (upišite nagib iskopa i nasipa za tu stranu) ili **Vertikalno (potporni zid)**.
- Upišite nagib kao `3` ili `3:1` (horizontalno prema 1 vertikalno), `33%` ili `18.4°`; prikazuje se kao H:1. Sopstveni **Nagib iskopa** i **Nagib nasipa** plata primaju isto.
- Vertikalna strana nema nasip: potporni zid ide duž ivice, od plata dole do postojećeg terena (u nasipu) ili od terena dole do plata (u iskopu). **Debljina zida** (u početku 0.3 m ili 1 ft) je koliko se teren spušta od ivice plata do postojećeg terena. Zapremine iskopa i nasipa ne uključuju nasip koji ta strana više nema.
- Gdje zid dodiruje nagnutu stranu, nagib se obavija oko kraja zida; dva zida se spajaju u ugaonom spoju.
- Ispod polja: dužina zidova, izložena površina lica (visina × dužina), najveća i prosječna visina.

Plan crta vanjsku površinu svakog zida kratkim crticama preko nje i njegovu visinu na oba kraja i na najvišoj tački (na sloju potpornih zidova, koji ide i u DXF i DWG). 3D prikaz prikazuje zidove kao tijela (Prikaži › Potporni zidovi), a izvozi GLB, OBJ i USD ih uključuju. Presjeci preko ivice prikazuju stepenicu.

**Upozorenja** (u Svojstvima i u panelu Problemi): zid viši od **Upozori iznad visine zida od** (u početku 1.0 m ili 3.3 ft) "može zahtijevati projektovani zid ili dozvolu; provjerite lokalne propise", i, kada upišete **Najstrmiji nagib koji tlo drži**, svaka strana čiji je nagib iskopa ili nasipa strmiji od toga. To su upozorenja: nivelacija se i dalje izrađuje. Svaka promjena je jedan korak za {{key:Mod+Z}}.

## Nasipi

{{ui:Nivelacija}} › {{ui:Nasip}}: gomila čiji je vrh na **Visini** iznad srednjeg terena ispod nje, sa nivelisanim stranama.

## Jarci za odvodnju

{{ui:Nivelacija}} › {{ui:Jarak za odvodnju}}, zatim kliknite duž jarka **smjerom kojim voda teče** i pritisnite {{key:Enter}}. Postavite njegovu **Dubinu**, **Širinu dna** (0 za V) i **Nagib strane**. Bez **Pada**, njegovo dno prati teren, na svojoj dubini ispod njega, i nikada ne teče uzbrdo; upišite pad da mu dodijelite stalan od njegovog početka.

## Tačkaste kote i izohipse

1. {{ui:Nivelacija}} › {{ui:Područje nivelacije}}: kliknite obris područja koje želite oblikovati.
2. {{ui:Nivelacija}} › {{ui:Kota tačke}}: kliknite unutar područja. Upišite njenu kotu u Svojstvima, ili upotrijebite dugmad ▲ ▼.
3. {{ui:Nivelacija}} › {{ui:Uredi konturu}}: kliknite izohipsu unutar područja da je uzmete kao liniju koju možete oblikovati.

Odaberite tačku ili izohipsu i **prevucite** je (ili njene tačke) na planu: površina prati kada pustite, jedan korak poništavanja. Unutar područja teren se ponovo izrađuje od svoje ivice (gdje dodiruje postojeći teren), tačkastih kota i uređenih izohipsa.

## Iskop i nasip uživo

Svojstva svakog objekta nivelacije prikazuju njegov **Iskop** i **Nasip** i cijele lokacije, metodom mreže koju koristi Zemljani radovi, kako mijenjate. Problemi (van površine, obris koji siječe sam sebe) su navedeni tamo.

## Provjere nivelacije

U odjeljku **Provjere nivelacije** lijevo:

- **Analiza nagiba** boji površinu prema nagibu: do blage granice, između, i strmije od strme granice (5 % i 33.3 % u početku: uobičajenih 1:20 za pristupačne staze i 1:3 za košenje). Legenda kaže koliki dio područja pada u svaku. Strma područja se ispisuju i na listovima.
- **Strelice toka i zadržavanje vode** crta kuda voda teče i obilježava krugom svako mjesto gdje bi se zadržala, sa njenom dubinom; odjeljak kaže koliko ima mjesta, najdublje i koliko vode ona drže.

Provjere čitaju projektovanu površinu kada je išta nivelisano, inače postojeći teren.
