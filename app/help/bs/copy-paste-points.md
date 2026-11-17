---
title: Odaberite, kopirajte i zalijepite geodetske tačke
summary: Odaberite geodetske tačke klikom, sa Shift i okvirom ili sve odjednom; kopirajte, izrežite, zalijepite, zalijepite na mjesto, dupliciraj i obrišite ih s novim brojevima tačaka koji se nikad ne sudaraju; zalijepite redove tačaka u tabelu i iz nje.
keywords: kopiraj, zalijepi, izreži, dupliciraj, izbriši tačke, odaberi tačke, odaberi sve, odabir okvirom, prozor, međuspremnik, tabela, csv, preimenuj brojeve, brojevi tačaka, zalijepi na mjesto, klon, iskolčavanje
from: 78a6aea7
---

Geodetske tačke mogu se kopirati i lijepiti unutar projekta, između projekata u dvije kartice preglednika, i iz i u tabelu. Svaka promjena je jedan korak poništavanja, a površina se odmah ponovo gradi iz novih tačaka.

## Odabir tačaka

Sa {{ui:Odaberi}} ({{key:V}}):

- **Kliknite** tačku da je odaberete (samo nju). Njeni brojevi se prikazuju pod **Svojstva**.
- {{key:Shift}} i **klik** dodaje tačku u odabir ili je izbacuje iz njega.
- {{key:Shift}} i **prevlačenje** crta okvir: tačke unutar njega dodaju se u odabir. Ako prevlačite oko tačaka, odabir postaje lasso; vidi [Lasso odabir geodetskih tačaka](topic:lasso-selection). Prevlačenje bez {{key:Shift}} pomjera pogled, kao i uvijek.
- {{key:Mod+A}} (ili {{ui:Više}} › {{ui:Odaberi sve tačke}}) odabire svaku tačku.
- {{key:Esc}} (ili {{ui:Više}} › {{ui:Poništi odabir}}) briše odabir.

Odabrane tačke imaju prsten. Kad je odabrano više od jedne, **Svojstva** prikazuju koliko ih je, njihove brojeve, raspon kota i njihove grupe.

## Kopiranje, izrezivanje i brisanje

- {{ui:Kopiraj}} ili {{key:Mod+C}} kopira odabrane tačke. CivilCraft zadržava kopiju i stavlja je i na sistemski međuspremnik kao redove tačaka, pa je možete odmah zalijepiti u tabelu ili tekstualnu datoteku.
- {{ui:Više}} › {{ui:Izreži}} ili {{key:Mod+X}} kopira ih i briše, u jednom koraku.
- {{ui:Više}} › {{ui:Izbriši}} ili {{key:Delete}} briše ih. {{key:Mod+Z}} ih vraća.

Redovi su: tačka, sjever, istok, kota, opis (P,N,E,Z,D), odvojeni zarezima, s tri decimale. Da dobijete istok prije sjevera, postavite **Redovi tačaka** u [Postavkama programa CivilCraft](topic:settings). Opis koji bi tabela tretirala kao formulu (počinje sa =, +, - ili @) dobija apostrof ispred, pa ostaje tekst.

## Lijepljenje

1. Pritisnite {{key:Mod+V}} ili kliknite {{ui:Zalijepi}}. Tačke prate pokazivač kao mali krstići, s isprekidanom linijom nazad do mjesta odakle su došle.
2. Kliknite gdje idu. Sredina kopiranih tačaka pada na mjesto klika.
3. Ili pritisnite {{key:Enter}} da ih stavite na njihove vlastite koordinate, ili {{key:Esc}} da otkažete.

{{ui:Više}} › {{ui:Zalijepi na mjesto}} ili {{key:Mod+Shift+V}} lijepi na vlastite koordinate tačaka odmah. Zalijepljene tačke se nakon toga odabiru, pa ih možete ponovo kopirati, premjestiti ili obrisati.

:::note
Klik na {{ui:Zalijepi}} na alatnoj traci čita sistemski međuspremnik. Prvi put, preglednik može pitati smije li CivilCraft vidjeti međuspremnik. Ako odbijete, dugme na alatnoj traci lijepi samo kopiju CivilCraft-a; {{key:Mod+V}} i dalje lijepi redove iz tabele bez pitanja.
:::

## Brojevi tačaka se nikad ne sudaraju

Dvije tačke nikad ne dijele broj. Kad lijepite:

- Zalijepljena tačka zadržava svoj broj kad nijedna tačka u projektu nema taj broj. Tako se, nakon **Izreži**, tačke vraćaju sa svojim brojevima, a tačke kopirane iz drugog projekta zadržavaju svoje brojeve tamo gdje su slobodni.
- Zalijepljena tačka čiji je broj zauzet dobija novi cijeli broj: jedan više od najvišeg broja u upotrebi, brojeći naviše.
- Statusna traka kaže šta se desilo, na primjer "1 zadržao svoj broj; 9 dobilo nove brojeve: 10–18 postalo 277–285".

U [Postavkama programa CivilCraft](topic:settings) možete odabrati **Uvijek novi brojevi**, i broj od kojeg novi brojevi počinju, na primjer 5000 za projektne tačke.

:::warning
Grupe tačaka koje površinu grade kao **liniju prijeloma** spajaju svoje tačke po redoslijedu brojeva. Zalijepljene kopije tačaka linije prijeloma (na primjer FL snimci) dobijaju nove, veće brojeve i spajaju se na kraj te linije prijeloma, moguće uz dug skok. Provjerite plan nakon lijepljenja takvih tačaka, ili postavite njihovu grupu na {{ui:Tačke}}.
:::

## Dupliciranje

{{ui:Više}} › {{ui:Dupliciraj}} ili {{key:Mod+D}} pravi kopiju odabranih tačaka koja prati pokazivač: kliknite gdje ide. Kopije uvijek dobijaju nove brojeve, a CivilCraft-ov međuspremnik ostaje onakav kakav je bio.

## Iz tabele ili tekstualne datoteke

Odaberite redove tačaka u tabeli (tačka, sjever, istok, kota, opis) i kopirajte ih. U CivilCraft-u pritisnite {{key:Mod+V}} i kliknite gdje idu, ili pritisnite {{key:Mod+Shift+V}} da ih stavite na njihove vlastite koordinate, što je obično ono što želite za stvarne geodetske podatke.

Redovi se čitaju tačno kao [datoteka tačaka](topic:point-file-formats): zarezi, tabulatori ili razmaci, red zaglavlja ako postoji. Bez zaglavlja, redoslijed kolona dolazi iz **Redovi tačaka** u [Postavkama programa CivilCraft](topic:settings).

Kad su oba prisutna, CivilCraft odlučuje prema tome što je novije: redovi na sistemskom međuspremniku koji se razlikuju od posljednje kopije CivilCraft-a kopirani su kasnije, pa se lijepe. Tekst koji ne sadrži tačke se ignoriše, a umjesto njega se lijepi kopija CivilCraft-a.

## Između projekata i kartica

Kopija se čuva u ovom pregledniku, pa je druga kartica CivilCraft-a može zalijepiti, čak i nakon što se prva kartica zatvori. Tačke kopirane iz projekta u metrima i zalijepljene u projekat u stopama zadržavaju svoje brojeve kakvi jesu: ništa se ne pretvara, a statusna traka to kaže.

## Šta se ne kopira

Za sada se kopiraju samo geodetske tačke. Trase, platoi, mreže cijevi, linije prijeloma i granice ne mogu se još kopirati ili lijepiti. Lijepljenje ne može pomjeriti postojeće tačke: koristite {{ui:Izreži}} i lijepljenje, ili pomjerajte jednu po jednu tačku ([Uređivanje geodetske tačke](topic:edit-points)).
