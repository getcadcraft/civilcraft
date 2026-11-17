---
title: Izbor, kopiranje i nalepljivanje geodetskih tačaka
summary: Izaberi geodetske tačke klikom, Shift-om i okvirom ili sve odjednom; kopiraj, iseci, nalepi, nalepi na mestu, dupliraj i obriši ih uz nove brojeve tačaka koji se nikad ne sudaraju; nalepi redove tačaka iz i u tabelu.
keywords: kopiraj, nalepi, iseci, dupliraj, obriši tačke, izaberi tačke, izaberi sve, izbor okvirom, prozor, međuspremnik, tabela, csv, preoznači, brojevi tačaka, nalepi na mestu, klon, iskolčavanje
from: 78a6aea7
---

Geodetske tačke mogu da se kopiraju i nalepljuju unutar projekta, između projekata u dve kartice pregledača i u tabelu i iz nje. Svaka promena je jedan korak za opozivanje, a površ se odmah ponovo gradi iz novih tačaka.

## Izbor tačaka

Sa {{ui:Izaberi}} ({{key:V}}):

- **Klikni** tačku da je izabereš (samo nju). Njeni brojevi se prikazuju pod **Svojstva**.
- {{key:Shift}} i **klik** dodaje tačku u izbor ili je izbacuje.
- {{key:Shift}} i **prevlačenje** crta okvir: tačke unutar njega dodaju se u izbor. Ako prevlačiš oko tačaka, postaje omča; videti [Izbor geodetskih tačaka omčom](topic:lasso-selection). Prevlačenje bez {{key:Shift}} pomera pogled, kao i uvek.
- {{key:Mod+A}} (ili {{ui:Više}} › {{ui:Izaberi sve tačke}}) bira sve tačke.
- {{key:Esc}} (ili {{ui:Više}} › {{ui:Poništi izbor}}) briše izbor.

Izabrane tačke imaju prsten. Kad je izabrano više od jedne, **Svojstva** pokazuje koliko ih je, njihove brojeve, opseg kota i njihove grupe.

## Kopiranje, sečenje i brisanje

- {{ui:Kopiraj}} ili {{key:Mod+C}} kopira izabrane tačke. CivilCraft čuva kopiju i takođe je stavlja u sistemski međuspremnik kao redove tačaka, pa je možeš odmah nalepiti u tabelu ili tekstualnu datoteku.
- {{ui:Više}} › {{ui:Iseci}} ili {{key:Mod+X}} kopira ih i briše, u jednom koraku.
- {{ui:Više}} › {{ui:Izbriši}} ili {{key:Delete}} ih briše. {{key:Mod+Z}} ih vraća.

Redovi su: tačka, sever, istok, kota, opis (P,N,E,Z,D), razdvojeni zarezima, sa tri decimale. Da istok dođe pre severa, podesi **Redovi tačaka** u [podešavanjima CivilCraft-a](topic:settings). Opis koji bi tabela shvatila kao formulu (počinje sa =, +, - ili @) dobija apostrof ispred, pa ostaje tekst.

## Nalepljivanje

1. Pritisni {{key:Mod+V}} ili klikni {{ui:Nalepi}}. Tačke prate pokazivač kao mali krstići, uz isprekidanu liniju do mesta odakle su došle.
2. Klikni gde idu. Sredina kopiranih tačaka pada na klik.
3. Ili pritisni {{key:Enter}} da ih staviš na sopstvene koordinate, ili {{key:Esc}} da otkažeš.

{{ui:Više}} › {{ui:Nalepi na mestu}} ili {{key:Mod+Shift+V}} nalepljuje na sopstvene koordinate tačaka odmah. Nalepljene tačke se posle izaberu, pa ih možeš ponovo kopirati, premestiti ili obrisati.

:::note
Klik na {{ui:Nalepi}} na traci sa alatkama čita sistemski međuspremnik. Prvi put pregledač može da pita da li CivilCraft sme da vidi međuspremnik. Ako odbiješ, dugme na traci nalepljuje samo CivilCraft-ovu kopiju; {{key:Mod+V}} i dalje nalepljuje redove iz tabele bez pitanja.
:::

## Brojevi tačaka se nikad ne sudaraju

Dve tačke nikad ne dele broj. Kad nalepljuješ:

- Nalepljena tačka zadržava svoj broj ako ga nijedna tačka u projektu nema. Zato posle **Iseci** tačke se nalepljuju nazad sa svojim brojevima, a tačke kopirane iz drugog projekta zadržavaju svoje brojeve tamo gde su slobodni.
- Nalepljena tačka čiji je broj zauzet dobija novi ceo broj: jedan više od najvećeg broja u upotrebi, brojeći naviše.
- Statusna traka kaže šta se desilo, na primer „1 je zadržao svoj broj; 9 je dobilo nove brojeve: 10–18 su postali 277–285“.

U [podešavanjima CivilCraft-a](topic:settings) možeš izabrati **Uvek novi brojevi** i broj od kog novi brojevi počinju, na primer 5000 za projektne tačke.

:::warning
Grupe tačaka koje površ grade kao **liniju loma** spajaju svoje tačke po redosledu brojeva. Nalepljene kopije tačaka linije loma (na primer FL snimci) dobijaju nove, veće brojeve i priključuju se na kraj te linije loma, eventualno uz dug skok. Proveri plan posle nalepljivanja takvih tačaka ili podesi njihovu grupu na {{ui:Tačke}}.
:::

## Dupliranje

{{ui:Više}} › {{ui:Dupliraj}} ili {{key:Mod+D}} pravi kopiju izabranih tačaka koja prati pokazivač: klikni gde ide. Kopije uvek dobijaju nove brojeve, a CivilCraft-ov međuspremnik ostaje kakav je bio.

## Iz tabele ili tekstualne datoteke

Izaberi redove tačaka u tabeli (tačka, sever, istok, kota, opis) i kopiraj ih. U CivilCraft-u pritisni {{key:Mod+V}} i klikni gde idu, ili pritisni {{key:Mod+Shift+V}} da ih staviš na sopstvene koordinate, što je obično ono što želiš za prave geodetske podatke.

Redovi se čitaju tačno kao [datoteka tačaka](topic:point-file-formats): zarezi, tabulatori ili razmaci, red zaglavlja ako postoji. Bez zaglavlja, redosled kolona dolazi iz **Redovi tačaka** u [podešavanjima CivilCraft-a](topic:settings).

Kad su oba prisutna, CivilCraft odlučuje po tome šta je novije: redovi u sistemskom međuspremniku koji se razlikuju od poslednje CivilCraft-ove kopije kopirani su kasnije, pa se nalepljuju. Tekst koji ne sadrži tačke se ignoriše, a umesto njega se nalepljuje CivilCraft-ova kopija.

## Između projekata i kartica

Kopija se čuva u ovom pregledaču, pa druga kartica CivilCraft-a može da je nalepi, čak i kad se prva zatvori. Tačke kopirane u projektu u metrima i nalepljene u projekat u stopama zadržavaju svoje brojeve kakvi jesu: ništa se ne pretvara, a statusna traka to kaže.

## Šta se ne kopira

Za sada se kopiraju samo geodetske tačke. Trase, plato, mreže cevi, linije loma i granice još ne mogu da se kopiraju ili nalepljuju. Nalepljivanje ne može da pomeri postojeće tačke: koristi {{ui:Iseci}} i nalepi, ili pomeraj jednu po jednu tačku ([Uređivanje geodetske tačke](topic:edit-points)).
