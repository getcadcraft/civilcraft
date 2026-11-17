---
title: Odabir, kopiranje i lijepljenje geodetskih točaka
summary: Odaberite geodetske točke klikom, Shiftom i okvirom ili sve odjednom; kopirajte, izrežite, zalijepite, zalijepite na isto mjesto, dupliciraj i izbrišite ih s novim brojevima točaka koji se nikad ne sukobe; lijepite retke točaka u tablicu i iz nje.
keywords: kopiraj, zalijepi, izreži, dupliciraj, izbriši točke, odaberi točke, odaberi sve, odabir okvirom, prozor, međuspremnik, tablica, csv, preimenuj brojeve, brojevi točaka, zalijepi na isto mjesto, klon, iskolčenje
from: 78a6aea7
---

Geodetske točke mogu se kopirati i lijepiti unutar projekta, između projekata u dvije kartice preglednika te u tablicu i iz nje. Svaka promjena je jedan korak poništavanja, a teren se odmah ponovno gradi iz novih točaka.

## Odabir točaka

Uz {{ui:Select}} ({{key:V}}):

- **Kliknite** točku da je odaberete (samo nju). Njeni brojevi prikazuju se pod **Svojstva**.
- {{key:Shift}} + **klik** dodaje točku u odabir ili je uklanja iz njega.
- {{key:Shift}} + **povlačenje** crta okvir: točke unutar njega dodaju se u odabir. Ako povlačite oko točaka bez toga, postaje laso; vidi [Odabir lasom geodetskih točaka](topic:lasso-selection). Povlačenje bez {{key:Shift}} pomiče prikaz, kao i uvijek.
- {{key:Mod+A}} (ili {{ui:More}} › {{ui:Select all points}}) odabire svaku točku.
- {{key:Esc}} (ili {{ui:More}} › {{ui:Select none}}) poništava odabir.

Odabrane točke imaju prsten. Kad je odabrano više od jedne, **Svojstva** prikazuju koliko ih je, njihove brojeve, raspon kota i njihove skupine.

## Kopiranje, rezanje i brisanje

- {{ui:Copy}} ili {{key:Mod+C}} kopira odabrane točke. CivilCraft zadržava kopiju i stavlja je i na međuspremnik sustava kao retke točaka, pa je možete zalijepiti izravno u tablicu ili tekstualnu datoteku.
- {{ui:More}} › {{ui:Cut}} ili {{key:Mod+X}} kopira ih i briše, u jednom koraku.
- {{ui:More}} › {{ui:Delete}} ili {{key:Delete}} briše ih. {{key:Mod+Z}} ih vraća.

Retci su: točka, sjever, istok, kota, opis (P,N,E,Z,D), odvojeni zarezima, s tri decimale. Da istok dođe prije sjevera, postavite **Retci točaka** u [CivilCraft postavkama](topic:settings). Opis koji bi tablica shvatila kao formulu (počinje s =, +, - ili @) dobiva apostrof ispred, pa ostaje tekst.

## Lijepljenje

1. Pritisnite {{key:Mod+V}} ili kliknite {{ui:Paste}}. Točke prate pokazivač kao mali križići, s isprekidanom linijom natrag do mjesta s kojeg su došle.
2. Kliknite gdje idu. Sredina kopiranih točaka pada na klik.
3. Ili pritisnite {{key:Enter}} da ih stavite na njihove vlastite koordinate, ili {{key:Esc}} za odustajanje.

{{ui:More}} › {{ui:Paste in place}} ili {{key:Mod+Shift+V}} lijepi na vlastite koordinate točaka odmah. Zalijepljene točke se nakon toga odabiru, pa ih možete ponovno kopirati, pomaknuti ili izbrisati.

:::note
Klik na {{ui:Paste}} na alatnoj traci čita međuspremnik sustava. Prvi put preglednik može pitati smije li CivilCraft vidjeti međuspremnik. Ako odbijete, gumb na alatnoj traci lijepi samo CivilCraftovu vlastitu kopiju; {{key:Mod+V}} i dalje lijepi retke iz tablice bez pitanja.
:::

## Brojevi točaka se nikad ne sukobe

Dvije točke nikad ne dijele broj. Pri lijepljenju:

- Zalijepljena točka zadržava broj ako ga nijedna točka u projektu nema. Tako se nakon **Izreži** točke vraćaju s vlastitim brojevima, a točke kopirane iz drugog projekta zadržavaju svoje tamo gdje su slobodne.
- Zalijepljena točka čiji je broj zauzet dobiva novi cijeli broj: jedan više od najvećeg broja u uporabi, brojeći prema gore.
- Statusna traka kaže što se dogodilo, na primjer „1 točka zadržala je svoj broj; 9 ih je dobilo nove brojeve: 10–18 postalo je 277–285“.

U [CivilCraft postavkama](topic:settings) možete odabrati **Uvijek novi brojevi** i broj od kojeg novi brojevi počinju, na primjer 5000 za projektne točke.

:::warning
Skupine točaka koje grade teren kao **prijelomnicu** spajaju svoje točke po redu brojeva. Zalijepljene kopije točaka prijelomnice (na primjer FL snimke) dobivaju nove, veće brojeve i spajaju se na kraj te prijelomnice, možda uz dugački skok. Provjerite plan nakon lijepljenja takvih točaka ili postavite njihovu skupinu na {{ui:Points}}.
:::

## Dupliciranje

{{ui:More}} › {{ui:Duplicate}} ili {{key:Mod+D}} pravi kopiju odabranih točaka koja prati pokazivač: kliknite gdje ide. Kopije uvijek dobivaju nove brojeve, a CivilCraftov međuspremnik ostaje kakav je bio.

## Iz tablice ili tekstualne datoteke

Odaberite retke točaka u tablici (točka, sjever, istok, kota, opis) i kopirajte ih. U CivilCraftu pritisnite {{key:Mod+V}} i kliknite gdje idu, ili pritisnite {{key:Mod+Shift+V}} da ih stavite na vlastite koordinate, što je obično ono što želite za stvarne geodetske podatke.

Retci se čitaju točno kao [datoteka točaka](topic:point-file-formats): zarezi, tabulatori ili razmaci, redak zaglavlja ako postoji. Bez zaglavlja redoslijed stupaca dolazi iz **Retci točaka** u [CivilCraft postavkama](topic:settings).

Kad su oba prisutna, CivilCraft odlučuje prema tome što je novije: retci na međuspremniku sustava koji se razlikuju od posljednje CivilCraftove kopije kopirani su kasnije, pa se lijepe. Tekst koji ne sadrži točke se zanemaruje i umjesto toga lijepi se CivilCraftova vlastita kopija.

## Između projekata i kartica

Kopija se čuva u ovom pregledniku, pa je druga kartica CivilCrafta može zalijepiti, čak i nakon što se prva zatvori. Točke kopirane iz projekta u metrima i zalijepljene u projekt u stopama zadržavaju svoje brojeve kakvi jesu: ništa se ne pretvara, a statusna traka to kaže.

## Što se ne kopira

Za sada se kopiraju samo geodetske točke. Osi trase, platoi, mreže cijevi, prijelomnice i granice još se ne mogu kopirati ni lijepiti. Lijepljenje ne može pomicati postojeće točke: koristite {{ui:Cut}} i lijepljenje, ili pomičite po jednu točku ([Uređivanje geodetske točke](topic:edit-points)).
