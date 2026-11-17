---
title: Raspored parkirališta
summary: Rasporedite parkirna mjesta, prolaze, mjesta za osobe s invaliditetom i za kombije te otoke unutar obrisa, izvedite nagibe prema slivnicima u odnosu na postojeći teren, zatim popločajte i zasadite. Dostupno i pomoćniku.
keywords: parkiralište, parkiranje, parkirno mjesto, prolaz, invalidi, ada, kombi, otok, slivnik, nagib, iskop, nasip, popločavanje, ploče, sadnja, drveće, teren, oblak točaka, mcp, pomoćnik
from: 06c14da9
---

Smjestite parkiralište u česticu, podlogu ili zatvorenu značajnu liniju te dobijte brojeve, izvedbu terena i popločavanje u jednom koraku.

## Rasporedite ga

1. Odaberite česticu, podlogu ili zatvorenu značajnu liniju na tlocrtu.
2. Otvorite **Teren, Više, Parkiralište...**
3. Odaberite pravila, kut parkirnih mjesta (90, 75, 60, 45, 30 stupnjeva ili paralelno) i jednosmjerne ili dvosmjerne prolaze. Veličine parkirnih mjesta, prolaza i otoka polaze iz tablice i svaku možete prepisati upisom.
4. Odaberite **Rasporedi**.

Redovi idu uz rub obrisa koji daje najviše parkirnih mjesta (ili pod kutom koji upišete). Parkirno mjesto se računa samo ako leži u cijelosti unutar obrisa. Ako ostane prostor za jedan red i prolaz, dodaje se pojas s jednostrukim redom. Okvir navodi prostore, mjesta za osobe s invaliditetom i za kombije, otoke, slivnike i površinu po prostoru, a tlocrt prikazuje parkirna mjesta, mjesta za osobe s invaliditetom sa šrafiranim prilaznim prolazima, otoke, središnje linije prolaza i slivnike na njihovim slojevima (C-PARK-...), pa idu u PDF, DXF i DWG.

## Mjesta za osobe s invaliditetom

Uz pravila Sjedinjenih Američkih Država broj slijedi tablicu 208.2 iz ADA Standards 2010 za predviđene prostore (jedan na šest, zaokruženo naviše, a jedan je mjesto za kombi), smješteni najbliže prvom kutu obrisa (ulazu), svaki s prilaznim prolazom; dva dijele jedan. Parkirno mjesto uže od pristupačne širine ili nagib strmiji od 1:48 na mjestima za osobe s invaliditetom prikazuje se kao problem. **Ti brojevi su upisani iz standarda po sjećanju i nisu provjereni u tiskanom standardu.** Uobičajene veličine parkirnih mjesta i prolaza potječu iz vodiča za projektiranje parkirališta i također nisu provjerene. Provjerite oboje i svoj lokalni propis prije nego što se oslonite na njih. Odaberite **Prilagođeno** da upišete vlastiti broj mjesta za osobe s invaliditetom.

## Nagibi prema slivnicima, iskop i nasip

Osim ako to isključite, parkiralište postaje područje izvedbe terena u radnom prostoru Krajobraz. Slivnici se postavljaju na središnje linije prolaza otprilike svakih 100 feet (30 m); površina se diže od svakog slivnika nagibom koji zadate (u početku 1,5 posto), pa se svaka točka spušta prema najbližem slivniku. Razina se bira tako da iskop i nasip parkirališta budu u ravnoteži s postojećim terenom. Postojeći teren je postojeća površina projekta, a može nastati iz geodetskih točaka, LandXML-a, oblaka točaka lidara ili skeniranja pretvorenog u površinu, ili iz izohipsi. Okvir prikazuje procjenu iskopa i nasipa; točne vrijednosti volumena projekta pokazuju kasnije. Područje izvedbe zadržava svoj rub na postojećem terenu, pa tamo gdje se nova površina razlikuje od terena na rubu dobijete stepenicu, a okvir kaže koliko je velika.

## Popločavanje i sadnja

Cijeli obris dobiva popločavanje pločama (uzorak slaganja koji možete promijeniti u Krajobrazu, Tvrda podloga), a svaki otok dobiva leju za grmlje i, ako je dovoljno širok, stablo, uzeto s popisa biljaka. Nakon toga sve je obični objekt Krajobraza: uredite ga ili odaberite **Rasporedi ponovno** da zamijenite ono što je parkiralište izradilo. Uklanjanje parkirališta uklanja ono što je izradilo.

## Od pomoćnika

Isto parkiralište može se zatražiti preko MCP-a: `parking_layout` prikazuje pregled, `parking_build` zapisuje, `parking_remove` uklanja parkiralište. Zatražite po nazivu čestice ili pošaljite obris.

## Što nije izrađeno

Nije provjereno dosežu li prolazi ulicu. Popločavanje pokriva cijeli obris, pa njegova površina uključuje otoke. Izbor materijala za popločavanje iz knjižnice i tip iz knjižnice za parkirna mjesta nisu izrađeni; uzorak popločavanja je onaj iz Tvrde podloge. Pravila drugih država nisu izrađena.
