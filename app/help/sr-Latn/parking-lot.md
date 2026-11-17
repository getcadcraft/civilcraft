---
title: Raspored parkinga
summary: Rasporedite parking mesta, prolaze, mesta za osobe sa invaliditetom i za kombije te ostrva unutar obrisa, izravnajte parking sa padovima ka slivnicima u odnosu na postojeći teren, pa ga popločajte i zasadite. Takođe dostupno asistentu.
keywords: parking, parking lot, parking mesto, prolaz, pristupačno, ada, kombi, ostrvo, slivnik, pad, nivelacija, iskop, nasip, popločavanje, pločice, sadnja, drveće, teren, oblak tačaka, mcp, asistent
from: 06c14da9
---

Smestite parking u parcelu, plato ili zatvorenu liniju objekta, i dobijete brojeve, izravnanje i popločavanje u jednom koraku.

## Rasporedite ga

1. Izaberite parcelu, plato ili zatvorenu liniju objekta na planu.
2. Otvorite **Površ, Više, Parking...**
3. Izaberite pravila, ugao parking mesta (90, 75, 60, 45, 30 stepeni ili paralelno) i jednosmerne ili dvosmerne prolaze. Veličine parking mesta, prolaza i ostrva polaze iz tabele, a svaka se može prepisati.
4. Kliknite **Rasporedi**.

Redovi idu duž ivice obrisa koja daje najviše parking mesta (ili pod uglom koji ukucate). Parking mesto se računa samo ako leži u potpunosti unutar obrisa. Gde ima prostora za jedan red i prolaz, dodaje se jednostrani pojas. Prozor navodi prostore, prostore za osobe sa invaliditetom i za kombije, ostrva, slivnike i površinu po prostoru, a plan prikazuje parking mesta, pristupačne prostore sa šrafiranim prilaznim prolazima, ostrva, osovine prolaza i slivnike na sopstvenim slojevima (C-PARK-...), pa stižu u PDF, DXF i DWG.

## Mesta za osobe sa invaliditetom

Sa pravilima Sjedinjenih Država broj prati tabelu 208.2 iz ADA standarda 2010. za obezbeđene prostore (jedan na šest, zaokruženo naviše, jeste mesto za kombi), postavljen najbliže prvom uglu obrisa (ulazu), svaki sa prilaznim prolazom; dva dele jedan prolaz. Parking mesto uže od pristupačne širine, ili pad strmiji od 1:48 na pristupačnim prostorima, prikazuje se kao problem. **Ovi brojevi su upisani iz standarda kako se sećamo i nisu provereni u odštampanom standardu.** Tipične veličine parking mesta i prolaza potiču iz vodiča za projektovanje parkinga i takođe nisu provereni. Proverite oba, kao i vaš lokalni propis, pre nego što se na njih oslonite. Izaberite **Prilagođeno** da unesete sopstveni broj pristupačnih mesta.

## Padovi ka slivnicima, iskop i nasip

Ako to ne isključite, parking postaje područje nivelacije u radnom prostoru Pejzaž. Slivnici se postavljaju na osovine prolaza otprilike na svakih 100 stopa (30 m); površ se uzdiže od svakog slivnika pri padu koji zadate (1.5 procenata na početku), tako da svaka tačka pada ka svom najbližem slivniku. Nivo se bira tako da iskop i nasip parkinga budu u ravnoteži sa postojećim terenom. Postojeći teren je postojeća površ projekta, a može poticati iz tačaka premera, LandXML-a, lidar ili skeniranog oblaka tačaka pretvorenog u površ, ili izohipsi. Prozor prikazuje procenu iskopa i nasipa; tačnu brojku posle daju zapremine projekta. Područje nivelacije zadržava svoju ivicu na postojećem terenu, pa gde se nova površ razlikuje od terena na ivici dobijate stepenik, a prozor kaže koliko je velik.

## Popločavanje i sadnja

Ceo obris dobija popločavanje pločicama (obrazac sa uzdužnim slaganjem koji možete promeniti u Pejzaž, Tvrdo uređenje), a svako ostrvo dobija leju za žbunje i, ako je dovoljno široko, drvo, uzeto sa spiska biljaka. Posle toga sve je običan objekat Pejzaža: izmenite ga, ili izaberite **Rasporedi ponovo** da zamenite ono što je parking napravio. Uklanjanje parkinga uklanja ono što je napravio.

## Od asistenta

Isti parking može se tražiti preko MCP-a: `parking_layout` pravi pregled, `parking_build` upisuje, a `parking_remove` uklanja parking. Tražite po nazivu parcele ili pošaljite obris.

## Šta nije urađeno

Da li prolazi dolaze do ulice se ne proverava. Popločavanje pokriva ceo obris, pa njegova površina uključuje i ostrva. Izbori materijala za popločavanje iz Biblioteke i tip iz Biblioteke za parking mesta nisu napravljeni; obrazac popločavanja je onaj iz Tvrdog uređenja. Pravila nijedne druge zemlje nisu napravljena.
