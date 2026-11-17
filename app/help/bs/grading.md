---
title: Nivelacija građevinskog platoa
summary: Nacrtaj ravni plato, postavi njegovu kotu i nagibe iskopa i nasipa, i pusti CivilCraft da ga presiječe sa postojećim terenom i doda ga projektovanoj površi.
keywords: potporni zid, potporni zidovi, vertikalna strana, zid umjesto kosine, nagib po strani, nasip, nivelacija, plato, građevinski plato, linija presijecanja, linija karakteristike, grupa nivelacije, nagib iskopa, nagib nasipa, konačna kota, projektovana površ, nivelacija terena
from: 482319a6
---

Plato je ravna površina na jednoj koti. Od njegove ivice CivilCraft nivelira prema van po tvom nagibu iskopa tamo gdje je teren viši od platoa, a po nagibu nasipa gdje je niži, sve dok kosina ne sretne postojeći teren. Ta linija sastajanja je linija presijecanja s terenom. Plato i njegove kosine zamjenjuju postojeći teren unutar linije presijecanja i čine projektovanu površ.

## Nacrtaj plato

Prvo ti treba postojeća površ terena.

1. Pritisni {{key:G}}, ili klikni {{ui:Plato}} u grupi **Dizajn**.
   Nagovještaj kaže "Plato: klikni njegove uglove. Enter ili dvostruki klik završava, Backspace briše posljednji, Esc otkazuje."
2. Klikni uglove platoa redom, bilo kojim smjerom. Plava kontura prati pokazivač.
3. Pritisni {{key:Enter}} nakon posljednjeg ugla (najmanje tri).
   Plato se crta i odabire. Počinje na koti terena u njegovoj sredini, zaokruženoj na 0.1, sa nagibom iskopa 2 : 1 i nagibom nasipa 3 : 1. Statusna traka kaže, na primjer, "Plato 1 na koti 254.3 (teren u njegovoj sredini), iskop 2:1, nasip 3:1. Promijeni ih u Svojstvima."

:::warning
Završi sa {{key:Enter}}. Dvostruki klik takođe završava, ali u ovoj verziji odbacuje ugao na koji si dvaput kliknuo. Klikni posljednji ugao jednom, pa pritisni {{key:Enter}}.
:::

Kontura platoa ne smije sama sebe presijecati ("Kontura platoa presijeca samu sebe.").

## Postavi kotu i nagibe

Kad je plato odabran, desni panel prikazuje **Plato**:

1. **Naziv**.
2. **Kota**: ravna kota platoa.
3. **Nagib iskopa** i **Nagib nasipa**, kao H:V (2 znači 2 : 1). Oba moraju biti veća od 0.
4. **Površina platoa** i **Uglovi** su prikazani radi informacije.

Pritisni {{key:Enter}} nakon svake vrijednosti. Linija presijecanja, projektovana površ i zapremine se odmah ažuriraju.

Ispod polja piše, na primjer, "Linija presijecanja: 48 linija kosine (20 u iskopu, 28 u nasipu), najdalje 31.20 ft van." Plan prikazuje liniju presijecanja i linije kosina magentom.

## Kako se nalazi presijecanje

- Linije kosina izlaze iz svake ivice okomito na nju, otprilike na svakoj dvadesetini veličine platoa.
- Na vanjskim uglovima se šire svakih 10°, pa kosina obilazi ugao.
- Na unutrašnjim uglovima jedna linija ide duž simetrale, gdje se kosine iz dvije ivice sastaju.
- Svaka linija se penje po nagibu iskopa ili spušta po nagibu nasipa dok ne dođe do terena.

## Nagibi po stranama i potporni zidovi

Pod **Strane i potporni zidovi** u Svojstvima platoa, platforme ili nasipa, svaka strana može biti nivelisana na svoj način. Strana 1 ide od prvog ugla koji si kliknuo do drugog, strana 2 od drugog do trećeg, i tako dalje.

- **Sve strane**: **Kosina** koristi gore navedene nagibe iskopa i nasipa na svakoj strani; **Vertikalno: potporni zidovi** stavlja zid na svaku stranu.
- Po strani: **Kosine gore**, **Sopstvene kosine** (upiši nagib iskopa i nasipa za tu stranu) ili **Vertikalno (potporni zid)**.
- Upiši nagib kao `3` ili `3:1` (horizontalno prema 1 vertikalno), `33%` ili `18.4°`; prikazuje se kao H:1. Vlastiti **Nagib iskopa** i **Nagib nasipa** platoa prihvataju isto.
- Vertikalna strana nema nasipa: potporni zid ide duž ivice, od platoa dolje do postojećeg terena (u nasipu) ili od terena dolje do platoa (u iskopu). **Debljina zida** (na početku 0.3 m ili 1 ft) je koliko se teren stepenasto spušta od ivice platoa do postojećeg terena. Zapremine iskopa i nasipa izostavljaju nasip koji ta strana više nema.
- Gdje se zid sastaje sa kosom stranom, kosina obilazi kraj zida; dva zida se sastaju u spoju pod uglom.
- Ispod polja: dužina zidova, izložena površina (visina × dužina), najviša i prosječna visina.

Plan crta vanjsku stranu svakog zida kratkim crticama preko nje i njenu visinu na oba kraja i na najvišoj tački (na sloju potpornih zidova, koji također ide u DXF i DWG). 3D prikaz prikazuje zidove kao tijela (Prikaz › Potporni zidovi), a izvozi GLB, OBJ i USD ih uključuju. Presjeci preko ivice prikazuju stepenicu.

**Upozorenja** (u Svojstvima i u panelu Problemi): zid viši od **Upozori iznad visine zida od** (na početku 1.0 m ili 3.3 ft) "može zahtijevati projektovani zid ili dozvolu; provjeri lokalna pravila", i, kad upišeš **Najstrmiji nagib koji tlo drži**, svaka strana čiji je nagib iskopa ili nasipa strmiji od toga. To su upozorenja: nivelacija se ipak gradi. Svaka promjena je jedan korak za {{key:Mod+Z}}.

## Pomjeranje uglova

Odaberi plato, pa prevuci kvadratnu ručku na uglu. Svaki prevlak je jedan korak poništavanja. Dodavanje ili uklanjanje ugla još nije dostupno: obriši plato i nacrtaj ga ponovo.

## Kad ne nivelira

Crveni okvir pod **Zemljani radovi** imenuje plato i problem:

| Poruka | Šta uraditi |
|---|---|
| "3 linije kosine izlaze van površi prije nego je sretnu: plato je preblizu ivici površi ili previsoko/prenisko." | Pomjeri plato unutar ivice površi, ili približi njegovu kotu terenu. |
| "Linija presijecanja presijeca samu sebe (kosine iz različitih strana platoa se sudaraju). Preoblikuj plato ili promijeni nagibe." | Tipično za uske ili L-oblike platoa u dubokom iskopu ili visokom nasipu. Proširi plato, izravnaj razliku ili strmiji nagibe. |
| "Kontura platoa presijeca samu sebe." | Ponovo nacrtaj uglove redom oko platoa. |

Plato sa problemom se izostavlja iz projektovane površi i zapremina dok se ne popravi.

## Pogledaj rezultat

1. Pod **Prikaz** postavi **Površ** na {{ui:Projektovano (nivelisano)}}.
   Izohipse sada prolaze ravno preko platoa i prate nagibe do linije presijecanja.
2. Pređi pokazivačem preko platoa: statusna traka prikazuje kote **Teren** i **Nivelisano**.
3. Pročitaj iskop i nasip pod **Zemljani radovi**; vidi [Zapremine zemljanih radova](topic:volumes).

Platoi se nivelišu nakon koridora, redom kojim su nacrtani. Kasniji plato zamjenjuje sve što je ranije unutar sopstvene linije presijecanja.

## Obriši plato

Odaberi ga i pritisni {{key:Delete}} (na Mac-u Fn i delete), ili klikni {{ui:Izbriši}}.

## Još nije urađeno

Platoi su ravni: kosi platoi, linije karakteristika sa promjenljivim nagibom, berme i nivelacija do zadane udaljenosti ili kote još nisu dostupni. Vidi [Još nije urađeno](topic:not-built-yet).
