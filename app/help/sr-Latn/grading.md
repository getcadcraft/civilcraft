---
title: Nivelacija plata za objekat
summary: Nacrtajte ravan plato, podesite mu visinsku kotu i nagibe iskopa i nasipa, pa neka CivilCraft ga poveže sa postojećim terenom i doda u projektovanu površ.
keywords: potporni zid, potporni zidovi, vertikalna strana, zid umesto nagiba, nagib po strani, nasip, nivelacija, plato, plato za objekat, linija izlaza, grupa nivelacija, nagib iskopa, nagib nasipa, konačna kota, projektovana površ, nivelacija terena
from: 482319a6
---

Plato je ravna površina na jednoj visinskoj koti. Od njegove ivice CivilCraft nivelše prema spolja, pod vašim nagibom iskopa tamo gde je teren viši od platoa, i pod nagibom nasipa tamo gde je niži, sve dok nagib ne sretne postojeći teren. Ta linija susreta je linija izlaza. Plato i njegovi nagibi zamenjuju postojeći teren unutar linije izlaza i tako prave projektovanu površ.

## Crtanje platoa

Najpre su potrebne postojeće površi terena.

1. Pritisnite {{key:G}}, ili kliknite {{ui:Plato}} u grupi **Projekat**.
   Savet kaže „Plato: klikni njegove uglove. Enter ili dvoklik završava, Backspace uklanja poslednji, Esc otkazuje.“
2. Kliknite uglove platoa redom, u bilo kom smeru. Plava ivica prati pokazivač.
3. Pritisnite {{key:Enter}} posle poslednjeg ugla (najmanje tri).
   Plato se crta i bira. Počinje na visini terena u njegovoj sredini, zaokružen na 0,1, sa nagibom iskopa 2 : 1 i nagibom nasipa 3 : 1. Statusna traka kaže, na primer, „Plato 1 na visini 254,3 (teren u njegovoj sredini), iskop 2:1, nasip 3:1. Promenite ih u Svojstvima.“

:::warning
Završite sa {{key:Enter}}. Dvoklik takođe završava, ali u ovoj verziji odbacuje ugao na koji ste dvoklikli. Kliknite poslednji ugao jednom, pa pritisnite {{key:Enter}}.
:::

Kontura platoa ne sme da se ukršta sa samom sobom („Kontura platoa se ukršta sa samom sobom.“).

## Podešavanje visine i nagiba

Kada je plato izabran, desni panel prikazuje **Plato**:

1. **Naziv**.
2. **Visinska kota**: ravna visina platoa.
3. **Nagib iskopa** i **Nagib nasipa**, kao H:V (2 znači 2 : 1). Oba moraju biti veća od 0.
4. **Površina platoa** i **Uglovi** prikazani su za referencu.

Pritisnite {{key:Enter}} posle svake vrednosti. Linija izlaza, projektovana površ i zapremine odmah se ažuriraju.

Ispod polja piše, na primer, „Linija izlaza: 48 linija nagiba (20 u iskopu, 28 u nasipu), najdalje 31,20 ft napolje.“ Osnova prikazuje liniju izlaza i linije nagiba u magenti.

## Kako se nalazi izlaz

- Linije nagiba polaze sa svake ivice upravno na nju, otprilike na svakoj dvadesetoj veličine platoa.
- Na spoljašnjim uglovima šire se na svakih 10°, pa nagib obilazi ugao.
- Na unutrašnjim uglovima jedna linija ide duž simetrale, gde se susreću nagibi sa dve ivice.
- Svaka linija se penje pod nagibom iskopa ili spušta pod nagibom nasipa dok ne dođe do terena.

## Nagibi po stranama i potporni zidovi

Pod **Strane i potporni zidovi** u Svojstvima platoa, platforme ili nasipa, svaka strana može da se nivelše na svoj način. Strana 1 ide od prvog ugla koji ste kliknuli do drugog, strana 2 od drugog do trećeg, i tako dalje.

- **Sve strane**: **Nagib** koristi gore navedene nagibe iskopa i nasipa na svakoj strani; **Vertikalno: potporni zidovi** stavlja zid na svaku stranu.
- Po strani: **Nagibi gore**, **Sopstveni nagibi** (ukucajte nagib iskopa i nasipa za tu stranu) ili **Vertikalno (potporni zid)**.
- Nagib upisujte kao `3` ili `3:1` (horizontalno prema 1 vertikalno), `33%` ili `18.4°`; prikazuje se kao H:1. Sopstveni **Nagib iskopa** i **Nagib nasipa** platoa prihvataju isto.
- Vertikalna strana nema nasip: potporni zid ide duž ivice, od platoa dole do postojećeg terena (u nasipu) ili od terena dole do platoa (u iskopu). **Debljina zida** (za početak 0,3 m ili 1 ft) je koliko se teren stepenasto spušta od ivice platoa do postojećeg terena. Zapremine iskopa i nasipa ne uključuju nasip koji ta strana više nema.
- Gde se zid sastaje sa nagnutom stranom, nagib obilazi kraj zida; dva zida se spajaju uglovnim spojem.
- Pod poljima: dužina zidova, izložena površina (visina × dužina), najviša i prosečna visina.

Osnova crta spoljnu stranu svakog zida kratkim crticama preko nje i njegovu visinu na oba kraja i na najvišem mestu (na sloju potpornih zidova, koji takođe ide u DXF i DWG). Prikaz 3D pokazuje zidove kao tela (Prikaz › Potporni zidovi), a izvozi GLB, OBJ i USD ih uključuju. Preseci preko ivice pokazuju stepenik.

**Upozorenja** (u Svojstvima i u panelu Problemi): zid viši od **Upozori iznad visine zida od** (za početak 1,0 m ili 3,3 ft) „može zahtevati projektovani zid ili dozvolu; proverite lokalna pravila“, i, kada upišete **Najstrmiji nagib koji tlo izdržava**, svaka strana čiji je nagib iskopa ili nasipa strmiji od toga. To su upozorenja: nivelacija se i dalje gradi. Svaka promena je jedan korak za {{key:Mod+Z}}.

## Pomeranje uglova

Izaberite plato, pa prevucite kvadratnu ručicu na uglu. Svako prevlačenje je jedan korak opozivanja. Dodavanje ili uklanjanje ugla još nije dostupno: obrišite plato i nacrtajte ga ponovo.

## Kada ne nivelše

Crveni okvir pod **Zemljani radovi** navodi plato i problem:

| Poruka | Šta uraditi |
|---|---|
| „3 linije nagiba izlaze van površi pre nego što je sretnu: plato je previše blizu ivice površi ili previsoko/prenisko.“ | Pomerite plato dalje od ivice površi, ili približite njegovu visinu terenu. |
| „Linija izlaza se ukršta sa samom sobom (nagibi sa različitih strana platoa upadaju jedni u druge). Preoblikujte plato ili promenite nagibe.“ | Tipično za uske ili L-oblike platoa u dubokom iskopu ili visokom nasipu. Proširite plato, smanjite razliku, ili zastrmite nagibe. |
| „Kontura platoa se ukršta sa samom sobom.“ | Ponovo nacrtajte uglove redom oko platoa. |

Plato sa problemom se izostavlja iz projektovane površi i zapremina dok se ne popravi.

## Pogled na rezultat

1. Pod **Prikaz**, postavite **Površ** na {{ui:Predloženo (sa nagibom)}}.
   Izohipse sada prolaze ravno preko platoa i prate nagibe do linije izlaza.
2. Pređite pokazivačem preko platoa: statusna traka prikazuje visine **Tlo** i **Nivelisano**.
3. Pročitajte iskop i nasip pod **Zemljani radovi**; vidi [Zapremine zemljanih radova](topic:volumes).

Platoi se nivelišu posle koridora, redom kojim su nacrtani. Kasniji plato zamenjuje sve što je ranije bilo unutar sopstvene linije izlaza.

## Brisanje platoa

Izaberite ga i pritisnite {{key:Delete}} (na Mac-u, Fn i delete), ili kliknite {{ui:Izbriši}}.

## Još nije napravljeno

Platoi su ravni: nagnuti platoi, linije sa promenljivim padom, terase i nivelacija do zadate udaljenosti ili visine još nisu dostupni. Vidi [Još nije napravljeno](topic:not-built-yet).
