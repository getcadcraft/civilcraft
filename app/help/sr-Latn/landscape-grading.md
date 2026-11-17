---
title: Nivelacija za pejzaž
summary: Platoi, nasipi, odvodni jarci i slobodna nivelacija sa tačkastim kotama i izohipsama koje prevlačiš, iskop i nasip uživo, analiza nagiba, strelice tečenja i zadržavanje vode — sve u projektovanoj površi CivilCraft-a.
keywords: potporni zid, potporni zidovi, vertikalna strana, zid umesto kosine, kosina po strani, nasip, nivelacija, nivelacija za pejzaž, plato, terasa, humak, odvodni jarak, tačkasta kota, kota tačke, izohipse, izmena izohipsi, iskop i nasip, zemljani radovi, analiza nagiba, pristupačnost, strme padine, strelice tečenja, odvodnjavanje, zadržavanje vode, lokve
from: e1559eb9
---

Sve ovde se nivelše u **projektovanu površ** istom nivelacijom kao platoi i koridori. **Postojeći teren** se nikad ne menja, a Zemljani radovi ga sve broje. Meni nivelacije je u grupi Pejzaž.

## Platoi

{{ui:Nivelacija}} › {{ui:Platforma}}, pa klikni uglove i pritisni {{key:Enter}}. Platforma počinje na srednjoj koti terena ispod nje; upiši **Kota** da je postaviš, ili je isprazni da ponovo prati teren. **Pad** u % i **Pad prema** u stepenima (0 = istok, 90 = sever) je naginju. Njene strane se nivelišu do terena na **Kosini iskopa** i **Kosini nasipa** (horizontalno prema 1).

## Kosine po strani i potporni zidovi

Pod **Strane i potporni zidovi** u Svojstvima platoa, platforme ili nasipa, svaka strana može biti nivelisana na svoj način. Strana 1 ide od prvog ugla koji si kliknuo do drugog, strana 2 od drugog do trećeg, i tako dalje.

- **Sve strane**: **Nagnuto** koristi gore navedene kosine iskopa i nasipa na svakoj strani; **Vertikalno: potporni zidovi** stavlja zid na svaku stranu.
- Po strani: **Kosine iznad**, **Sopstvene kosine** (upiši kosinu iskopa i nasipa za tu stranu) ili **Vertikalno (potporni zid)**.
- Upiši kosinu kao `3` ili `3:1` (horizontalno prema 1 vertikalno), `33%` ili `18.4°`; prikazuje se kao H:1. Sopstvene **Kosina iskopa** i **Kosina nasipa** platoa uzimaju isto.
- Vertikalna strana nema nasip: potporni zid ide duž ivice, od platoa dole do postojećeg terena (u nasipu) ili od terena dole do platoa (u iskopu). **Debljina zida** (za početak 0.3 m ili 1 ft) je koliko teren stepenasto prelazi od ivice platoa do postojećeg terena. Zapremine iskopa i nasipa izostavljaju nasip koji ta strana više nema.
- Tamo gde zid dodiruje nagnutu stranu, kosina obilazi kraj zida; dva zida se spajaju u kosom spoju.
- Ispod polja: dužina zidova, izloženo lice (visina × dužina), najviša i prosečna visina.

Plan crta spoljašnje lice svakog zida kratkim crticama preko njega i njegovu visinu na oba kraja i na najvišoj tački (na sloju potpornih zidova, koji ide i u DXF i DWG). 3D pregled prikazuje zidove kao tela (Prikaži › Potporni zidovi), a izvozi GLB, OBJ i USD ih uključuju. Preseci preko ivice pokazuju stepenicu.

**Upozorenja** (u Svojstvima i u panelu Problemi): zid viši od **Upozori iznad visine zida od** (za početak 1.0 m ili 3.3 ft) „može zahtevati inženjerski zid ili dozvolu; proveri lokalna pravila“, i, kad upišeš **Najstrmija kosina koju tlo drži**, svaka strana čiji je iskop ili nasip strmiji od toga. To su upozorenja: nivelacija se i dalje gradi. Svaka promena je jedan korak za {{key:Mod+Z}}.

## Nasipi

{{ui:Nivelacija}} › {{ui:Nasip}}: humak čiji je vrh **Visina** iznad srednjeg terena ispod njega, sa nivelisanim stranama.

## Odvodni jarci

{{ui:Nivelacija}} › {{ui:Odvodni jarak}}, pa klikni duž jarka **kako teče voda** i pritisni {{key:Enter}}. Podesi **Dubinu**, **Širinu dna** (0 za V) i **Bočnu kosinu**. Bez **Pada**, njegovo dno prati teren, na svojoj dubini ispod njega, i nikad ne ide uzbrdo; upiši pad da mu daš stalan od svog početka.

## Tačkaste kote i izohipse

1. {{ui:Nivelacija}} › {{ui:Površina za nivelaciju}}: klikni obris oblasti koju želiš da oblikuješ.
2. {{ui:Nivelacija}} › {{ui:Tačkasta kota}}: klikni unutar oblasti. Upiši njenu kotu u Svojstvima, ili koristi dugmad ▲ ▼.
3. {{ui:Nivelacija}} › {{ui:Izmeni izohipsu}}: klikni izohipsu unutar oblasti da je uzmeš kao liniju koju možeš preoblikovati.

Izaberi tačkastu kotu ili izohipsu i **prevuci** je (ili njene tačke) na planu: površ prati kad pustiš, jedan korak opoziva. Unutar oblasti teren se ponovo gradi od svoje ivice (gde se sastaje sa postojećim terenom), tačkastih kota i izmenjenih izohipsi.

## Iskop i nasip uživo

Svaka svojstva objekta nivelacije prikazuju svoj **Iskop** i **Nasip** i zbir cele lokacije, metodom mreže koju koristi Zemljani radovi, dok to menjaš. Problemi (van površi, obris koji seče sam sebe) su navedeni tu.

## Provere nivelacije

U odeljku **Provere nivelacije** na levoj strani:

- **Analiza nagiba** boji površ prema nagibu: do blage granice, između, i strmije od granice strmine (5 % i 33.3 % za početak: uobičajeno 1:20 za pristupačne staze i 1:3 za košenje). Legenda kaže koliko površine pada u svaki. Strme oblasti se štampaju i na listovima.
- **Strelice tečenja i zadržavanje vode** crtaju kuda voda teče i obeležavaju svako mesto gde bi se zadržala, sa njenom dubinom; odeljak kaže koliko je tih mesta, najdublje i koliko vode zadržavaju.

Provere čitaju projektovanu površ kad je bilo šta nivelisano, inače postojeći teren.
