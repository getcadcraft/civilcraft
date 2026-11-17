---
title: Raspored parkirališta
summary: Rasporedi parking mjesta, prilaze, mjesta za osobe s invaliditetom i kombije te ostrva unutar obrisa, izravnaj parking s padovima ka slivnicima u odnosu na postojeći teren, zatim ga popločaj i zasadi. Dostupno i asistentu.
keywords: parking, parkiralište, parking mjesto, prilaz, invalidi, ada, kombi, ostrvo, slivnik, pad, nagib, iskop, nasip, popločavanje, sadnja, drveće, teren, oblak tačaka, mcp, asistent
from: 06c14da9
---

Smjesti parkiralište u parcelu, plato ili zatvorenu liniju elementa i dobij brojanje, izravnanje i popločavanje u jednom koraku.

## Rasporedi ga

1. Odaberi parcelu, plato ili zatvorenu liniju elementa na planu.
2. Otvori **Površ, Više, Parkiralište...**
3. Odaberi pravila, ugao parkinga (90, 75, 60, 45, 30 stepeni ili paralelno) i jednosmjerne ili dvosmjerne prilaze. Veličine parking mjesta, prilaza i ostrva počinju iz tabele i svaka se može prepisati.
4. Odaberi **Rasporedi**.

Redovi idu duž ivice obrisa koja daje najviše parking mjesta (ili pod uglom koji upišeš). Parking mjesto se broji samo ako leži u potpunosti unutar obrisa. Gdje ostane prostora za jedan red i prilaz, dodaje se pojas s parkiranjem na jednoj strani. Prozor navodi prostore, mjesta za osobe s invaliditetom i kombije, ostrva, slivnike i površinu po prostoru. Plan prikazuje parking mjesta, mjesta za osobe s invaliditetom sa šrafiranim pristupnim prilazima, ostrva, osovine prilaza i slivnike na njihovim slojevima (C-PARK-...), pa idu u PDF, DXF i DWG.

## Mjesta za osobe s invaliditetom

Uz pravila Sjedinjenih Država broj prati tabelu 208.2 ADA Standarda iz 2010. za obezbijeđene prostore (jedan od šest, zaokružen naviše, je mjesto za kombi), smješteno najbliže prvom uglu obrisa (ulazu), svako sa pristupnim prilazom; dva dijele jedan. Parking mjesto uže od pristupne širine, ili pad strmiji od 1:48 na mjestima za invalide, prikazuje se kao problem. **Ovi brojevi su uneseni iz standarda onako kako se pamte i nisu provjereni u odnosu na štampani standard.** Tipične veličine parking mjesta i prilaza potiču iz vodiča za projektovanje parkinga i također nisu provjerene. Provjeri oboje i svoj lokalni propis prije oslanjanja. Odaberi **Prilagođeno** da upišeš svoj broj mjesta za osobe s invaliditetom.

## Padovi ka slivnicima, iskop i nasip

Ako ne isključiš, parking postaje područje izravnanja u radnom prostoru Pejzaž. Slivnici se stavljaju na osovine prilaza otprilike svakih 100 feet (30 m); površ se diže od svakog slivnika pod padom koji zadaš (1,5 posto za početak), pa svaka tačka pada ka najbližem slivniku. Nivo se bira tako da iskop i nasip parkinga budu u ravnoteži s postojećim terenom. Postojeći teren je postojeća površ projekta, koja može doći iz tačaka premjera, LandXML-a, lidara ili skeniranog oblaka tačaka pretvorenog u površ, ili iz kota. Prozor pokazuje procjenu iskopa i nasipa; tačna brojka projekta pokazuje se kasnije u zapreminama projekta. Područje izravnanja zadržava svoju ivicu na postojećem terenu, pa gdje se nova površ razlikuje od terena na ivici dobijaš stepenicu, a prozor kaže koliko je velika.

## Popločavanje i sadnja

Cijeli obris dobija popločanje (uzorak nizanja koji možeš promijeniti pod Pejzaž, Tvrdo uređenje), a svako ostrvo dobija leju za žbunje i, ako je dovoljno široko, drvo, uzeto sa spiska biljaka. Nakon toga sve je obični objekat Pejzaža: uredi ga ili odaberi **Rasporedi ponovo** da zamijeniš ono što je parking napravio. Uklanjanje parkinga uklanja ono što je napravio.

## Od asistenta

Isti parking se može zatražiti preko MCP-a: `parking_layout` pregleda, `parking_build` piše, `parking_remove` uklanja parking. Traži po nazivu parcele ili pošalji obris.

## Šta nije urađeno

Nije provjereno dopiru li prilazi do ulice. Popločavanje pokriva cijeli obris, pa njegova površina uključuje i ostrva. Izbori materijala za popločavanje iz Biblioteke i tip iz Biblioteke za parking mjesta nisu napravljeni; uzorak popločavanja je onaj iz Tvrdog uređenja. Pravila drugih država nisu napravljena.
