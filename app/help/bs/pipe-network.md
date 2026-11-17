---
title: Izrada gravitacione mreže cijevi
summary: Crtajte dionice oborinskih ili sanitarnih cijevi objekat po objekat, postavite svoja pravila nagiba, pokrova i pada, pustite CivilCraft da postavi dna, i ispravite probleme koje navodi.
keywords: graditelj objekata, tip objekta, pravougaoni objekat, kvadratni objekat, slivnik, okvir, pokrov, debljina zida, stavka biblioteke, mreža cijevi, oborinska, sanitarna, kanalizacija, objekti, šahtovi, slivnici, dna, nagib, pad, gornji rub, sabirnik, gravitacione cijevi
from: 10a3c14d
---

Projekat sadrži jednu gravitacionu mrežu cijevi, oborinsku ili sanitarnu. Sastoji se od objekata (šahtova, slivnika) i pravih cijevi između njih. Tok ide u smjeru u kojem crtate. CivilCraft provjerava svaku cijev i objekat prema tri pravila koja postavite, i može postaviti sva dna iz tih pravila.

## Nacrtajte dionicu

Cijevi možete crtati bez površi, ali gornji rubovi, pokrov i automatska dna trebaju površ.

1. Pritisnite {{key:P}}, ili kliknite {{ui:Cijevi}} u grupi **Dizajn**.
   Savjet kaže: "Cijevi: kliknite objekte od vrha dionice nadolje (kliknite postojeći da se spojite). Enter završava."
2. Kliknite gdje ide uzvodni objekat. Objekat se postavlja.
3. Kliknite svaki sljedeći objekat nizvodno. Da se spojite na postojeći objekat, kliknite na njega: statusna traka kaže "Spojeno S3."
4. Pritisnite {{key:Enter}}.
   Cijevi se crtaju, njihova dna se postavljaju iz pravila, a statusna traka kaže, na primjer, "3 cijevi nacrtane, 12 dna postavljena iz pravila; sve provjere prolaze."

Novi objekti se imenuju S1, S2 … s prečnikom 48 in (1200 mm). Nove cijevi se imenuju P1, P2 … s prečnikom 12 in (300 mm). Prečnici su u inčima u projektu u stopama, a u milimetrima u projektu u metrima.

Završite sa {{key:Enter}}. Dvostruki klik također radi, ali kad dvaput kliknete na postojeći objekat da završite dionicu tamo, spajanje se odbacuje: kliknite ga jednom, zatim pritisnite {{key:Enter}}.

## Postavite svoja pravila

Kad ništa nije odabrano, desni panel (**Projekat**) ima blok **Mreža cijevi**:

| Postavka | Početna vrijednost | Značenje |
|---|---|---|
| Tip | Oborinska | {{ui:Oborinska}} ili {{ui:Sanitarna}}; upisuje se u LandXML |
| Najmanji nagib | 0.50% | Svaka cijev mora padati najmanje toliko |
| Najmanji pokrov | 2 ft (0.6 m) | Od terena do tjemena cijevi, duž cijele cijevi |
| Pad u objektima | 0.10 ft (0.03 m) | Dno izlaza mora biti najmanje toliko ispod svakog dna ulaza |

**Ovo su početne vrijednosti, a ne standard.** Postavite vrijednosti koje zahtijeva vaša agencija ili projekat. Pokrov se mjeri od terena do tjemena (dno plus unutrašnji prečnik); debljina zida se ne računa. Gdje su platoi ili koridori nivelisani, nivelisana površ je teren.

## Neka CivilCraft postavi dna

- {{ui:Postavi sva dna iz pravila}} (u bloku **Mreža cijevi**) postavlja sve cijevi.
- {{ui:Postavi dna iz pravila}} (uz jednu odabranu cijev) postavlja samo tu cijev.

Radeći nizvodno, svaka dionica počinje s najmanje pokrova na svom gornjem objektu, pada najmanje za najmanji nagib, pada najmanje za pad kroz svaki objekat, i ide dublje gdje bi teren duž cijevi ostavio manje od najmanjeg pokrova. Dna se zaokružuju naniže na 0.01, nikad naviše. Statusna traka kaže "Dna postavljena: najmanji pokrov na vrhu svake dionice, najmanji nagib, najmanji pad u svakom objektu." ili navodi šta nije mogla da uradi.

## Uređivanje objekata i cijevi

Kliknite objekat ili cijev sa {{ui:Odaberi}} da je vidite u desnom panelu.

**Objekat**: **Naziv**, **Gornji rub**, **Dubina sabirnika**, **Prečnik**, zatim **Korišteni gornji rub**, **Sabirnik**, **Istok** i **Sjever**, te cijevi koje ulaze i izlaze, sa njihovim dnima.

- Ostavite **Gornji rub** prazan da ga uzme iz površi; kućica tada pokazuje vrijednost površi sivom bojom. Upišite vrijednost da fiksirate gornji rub.
- Povucite ručku objekta na planu da ga pomjerite. Njegove cijevi prate; njihova dna ostaju kakva su bila, pa provjerite probleme poslije.

**Tip**: izaberite jedan od tipova objekata mreže (dolje), ili ništa za okrugli objekat sopstvenog prečnika.

**Cijev**: **Naziv**, objekti između kojih ide, **Prečnik**, **Gornje dno**, **Donje dno**, zatim **Dužina**, **Nagib** i **Najmanji pokrov**.

Pritisnite {{key:Enter}} nakon svake vrijednosti.

## Čitanje i ispravljanje problema

Blok **Mreža cijevi** navodi svaki problem (do 40); kliknite jedan da odaberete cijev ili objekat. Odabrana cijev ili objekat navodi svoje. Kad nijedan nije odabran, kaže "Svaka cijev i objekat prolaze pravila."

| Poruka (primjeri) | Šta uraditi |
|---|---|
| "P2 teče uzbrdo (-0.40%)." ili "… teče ravno …" | Zamijenite dna, ili ih postavite iz pravila. |
| "P2 sa 0.30% je ravnija od najmanjeg 0.50%." | Spustite nizvodno dno ili podignite uzvodno. |
| "P3 ima 1.40 pokrova 35 duž sebe, manje od najmanjeg 2." | Spustite cijev; postavite njena dna iz pravila. |
| "U S3, P4 izlazi na 245.20, manje od 0.1 ispod P3 koji ulazi na 245.25." | Spustite gornje dno izlazne cijevi. |
| "Tjeme P1 je iznad gornjeg ruba S1." | Cijev je previsoka za objekat. |
| "S2 ima 2 cijevi koje izlaze iz njega; gravitaciona mreža treba imati jedan izlaz iz svakog objekta." | Uklonite jednu izlaznu cijev, ili je ponovo nacrtajte u ispravnom smjeru. |
| "Cijevi čine petlju; tok mora završiti na izlazu." | Dionica je nacrtana nazad u samu sebe; obrišite cijev. |
| "S5 je van površi i nema kotu gornjeg ruba." | Upišite gornji rub, ili pomjerite objekat na površ. |
| "P6 djelimično prolazi van površi; pokrov tamo je nepoznat." | Proširite površ, ili prihvatite da pokrov tamo nije provjeren. |
| "P7 još nema dna." | Upišite ih, ili ih postavite iz pravila. |

Problematične cijevi i objekti su takođe označeni crveno na planu.

## Tipovi objekata

Tip objekta je objekat izgrađen iz svojih parametara: šaht, slivnik, razvodna kutija ili izlaz, **okrugao** (unutrašnji prečnik) ili **pravougaon** (unutrašnja širina i dužina), sa svojom **debljinom zida**, **podnom pločom**, **sabirnikom** ispod najniže cijevi i **okvirom i poklopcem** (okrugao ili pravougaoni otvor, visina okvira). Tipovi pripadaju mreži, pod **Tipovi objekata** u Svojstvima projekta.

1. Kliknite {{ui:Novi tip objekta}}. Dijalog crta objekat u planu i u presjeku dok kucate.
2. Kliknite {{ui:Dodaj tip}}.
3. Izaberite objekat i izaberite tip pod **Tip**. Preuzima veličinu tipa i njegov sabirnik; sopstveni sabirnik se i dalje može mijenjati.

Uredite tip i svaki objekat tog tipa prati njegove veličine. Uklonite tip i njegovi objekti ostaju kao okrugli objekti iste širine. Svaka izmjena je jedan korak: {{key:Mod+Z}} je poništava.

Pravougaoni objekat se crta na planu, u DXF, DWG i PDF, a u 3D kao pravougaonik sa svojom dužinom uz izlaznu cijev; cijevi počinju na njegovom zidu. LandXML ga zapisuje kao pravougaoni objekat (`RectStruct`) sa svojom debljinom zida, i čita takve objekte natrag kao tipove.

### Podijelite tip kroz biblioteku

{{ui:Spasi kao stavku biblioteke}} zapisuje tip kao stavku biblioteke CadCraft (datoteka `.json`): njegov simbol na planu, 3D tijelo do tipične dubine, i svaku veličinu. Otpremite je u biblioteku da je podijelite. {{ui:Otvori stavku biblioteke}} čita objekat sačuvan na ovaj način natrag u mrežu, pretvoren u jedinice projekta. Stavke biblioteke koje nisu objekti napravljeni u CivilCraft-u se odbijaju, uz razlog.

## Brisanje

Odaberite cijev i pritisnite {{key:Delete}} da je uklonite. Brisanje objekta uklanja i cijevi povezane s njim. Na Macu pritisnite Fn i delete, ili kliknite {{ui:Izbriši}}.

## Još nije izrađeno

Protoci, prečnici cijevi i hidraulička linija gradijenta nalaze se u [Oborinska odvodnja](topic:storm-drainage). Katalozi cijevi, necilindrične cijevi, cijevi u prikazu profila, zakrivljene cijevi i više od jedne mreže po projektu nisu još dostupni. Pogledajte [Još nije izrađeno](topic:not-built-yet).
