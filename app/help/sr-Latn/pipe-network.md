---
title: Izradi gravitacionu mrežu cevi
summary: Crtaj kišne ili fekalne deonice cevi objekat po objekat, postavi pravila za pad, nadsloj i pad u objektu, pusti CivilCraft da postavi dna cevi, i reši probleme koje navede.
keywords: graditelj objekata, tip objekta, pravougaoni objekat, slivnik, okvir, nadsloj, debljina zida, stavka iz biblioteke, mreža cevi, kišna, fekalna, kanalizacija, objekti, šahtovi, slivnici, dna cevi, pad, pad u objektu, gornja kota, taložnik, gravitacione cevi
from: 10a3c14d
---

Projekat sadrži jednu gravitacionu mrežu cevi, kišnu ili fekalnu. Sastoji se od objekata (šahtova, slivnika) i pravih cevi između njih. Tok ide u smeru u kom crtaš. CivilCraft proverava svaku cev i objekat prema tri pravila koja postaviš, i može postaviti sva dna iz tih pravila.

## Nacrtaj deonicu

Cevi možeš crtati bez površi, ali kote gornje kote, nadsloj i automatska dna zahtevaju je.

1. Pritisni {{key:P}}, ili klikni {{ui:Cevi}} u grupi **Projektovanje**.
   Savet kaže: „Cevi: klikni objekte od vrha deonice nadole (klikni postojeći da se spojiš). Enter završava.“
2. Klikni gde ide uzvodni objekat. Objekat je postavljen.
3. Klikni svaki sledeći objekat nizvodno. Da se spojiš na postojeći objekat, klikni na njega: statusna traka kaže „Spojeno sa S3.“
4. Pritisni {{key:Enter}}.
   Cevi se crtaju, njihova dna se postavljaju iz pravila, a statusna traka kaže, na primer, „Nacrtano 3 cevi, 12 dna postavljeno iz pravila; sve provere su prošle.“

Novi objekti dobijaju imena S1, S2 … sa prečnikom 48 in (1200 mm). Nove cevi dobijaju imena P1, P2 … sa prečnikom 12 in (300 mm). Prečnici su u inčima u projektu u stopama, a u milimetrima u projektu u metrima.

Završi sa {{key:Enter}}. Dvaput klik takođe radi, ali kada dvaput klikneš na postojeći objekat da završiš deonicu tamo, spajanje se odbacuje: klikni ga jednom, pa pritisni {{key:Enter}}.

## Postavi pravila

Kada ništa nije izabrano, desni panel (**Projekat**) ima blok **Mreža cevi**:

| Podešavanje | Početna vrednost | Značenje |
|---|---|---|
| Tip | Kišna | {{ui:Kišna}} ili {{ui:Fekalna}}; upisuje se u LandXML |
| Najmanji pad | 0.50% | Svaka cev mora da pada bar toliko |
| Najmanji nadsloj | 2 ft (0.6 m) | Od terena do tjemena cevi, duž cele cevi |
| Pad u objektima | 0.10 ft (0.03 m) | Dno izlaza mora biti bar toliko ispod svakog dna ulaza |

**Ove početne vrednosti su privremena mesta, a ne standard.** Postavi vrednosti koje zahteva tvoja agencija ili projekat. Nadsloj se meri od terena do tjemena (dno plus unutrašnji prečnik); debljina zida se ne računa. Gde su platoi ili koridori nivelisani, nivelisana površ je teren.

## Neka CivilCraft postavi dna

- {{ui:Postavi sva dna prema pravilima}} (u bloku **Mreža cevi**) postavlja sve cevi.
- {{ui:Postavi njena dna prema pravilima}} (sa jednom izabranom cevi) postavlja samo tu cev.

Radeći nizvodno, svaka deonica počinje sa najmanje nadslojem na svom gornjem objektu, pada bar za najmanji pad, pada bar za pad kroz svaki objekat, i ide dublje gde bi teren duž cevi ostavio manje od najmanjeg nadsloja. Dna se zaokružuju naniže na 0.01, nikad naviše. Statusna traka kaže „Dna postavljena: najmanji nadsloj na vrhu svake deonice, bar najmanji pad, bar pad u svakom objektu.“ ili navodi šta nije mogla da uradi.

## Uređivanje objekata i cevi

Klikni objekat ili cev alatkom {{ui:Izaberi}} da je vidiš u desnom panelu.

**Objekat**: **Naziv**, **Gornja kota**, **Dubina taložnika**, **Prečnik**, zatim **Korišćena gornja kota**, **Taložnik**, **Istok** i **Sever**, i cevi ulazne i izlazne sa njihovim dnima.

- Ostavi **Gornja kota** praznu da je uzme sa površi; kutija tada prikazuje vrednost površi sivom bojom. Upiši vrednost da fiksiraš gornju kotu.
- Prevuci hvataljku objekta na planu da ga pomeriš. Njegove cevi prate; njihova dna ostaju kakva su, pa proveri probleme posle.

**Tip**: izaberi jedan od tipova objekata mreže (dole), ili ništa za okrugli objekat sopstvenog prečnika.

**Cev**: **Naziv**, objekti između kojih ide, **Prečnik**, **Gornje dno**, **Donje dno**, zatim **Dužina**, **Pad** i **Najmanji nadsloj**.

Pritisni {{key:Enter}} posle svake vrednosti.

## Čitaj i reši probleme

Blok **Mreža cevi** navodi svaki problem (do 40); klikni jedan da izabereš cev ili objekat. Izabrana cev ili objekat navodi svoje. Kada ništa nije izabrano, piše „Sve cevi i objekti prolaze pravila.“

| Poruka (primeri) | Šta raditi |
|---|---|
| „P2 ide uzbrdo (-0.40%).“ ili „… ide ravno …“ | Zameni dna, ili ih postavi iz pravila. |
| „P2 sa 0.30% je ravnija od najmanjih 0.50%.“ | Spusti nizvodno dno ili podigni uzvodno. |
| „P3 ima 1.40 nadsloja duž sebe, manje od najmanjih 2.“ | Spusti cev; postavi njena dna iz pravila. |
| „U S3, P4 izlazi na 245.20, manje od 0.1 ispod P3 koja ulazi na 245.25.“ | Spusti gornje dno izlazne cevi. |
| „Tjeme P1 je iznad gornje kote S1.“ | Cev je previsoka za objekat. |
| „S2 ima 2 cevi koje izlaze iz njega; gravitaciona mreža treba da ima jedan izlaz iz svakog objekta.“ | Ukloni jednu izlaznu cev, ili je nacrtaj ponovo u ispravnom smeru. |
| „Cevi čine petlju; tok mora da se završi na izlazu.“ | Deonica je nacrtana nazad u sebe; obriši cev. |
| „S5 je van površi i nema gornju kotu.“ | Upiši gornju kotu, ili pomeri objekat na površ. |
| „P6 delom prolazi van površi; nadsloj tamo nije poznat.“ | Proširi površ, ili prihvati da se nadsloj tamo ne proverava. |
| „P7 još nema dna.“ | Upiši ih, ili postavi iz pravila. |

Problematične cevi i objekti su takođe označeni crveno na planu.

## Tipovi objekata

Tip objekta je objekat napravljen iz svojih parametara: šaht, slivnik, razvodna kutija ili izlaz, **okrugao** (unutrašnji prečnik) ili **pravougaoni** (unutrašnja širina i dužina), sa svojom **debljinom zida**, **pločom dna**, **taložnikom** ispod najniže cevi i **okvirom i poklopcem** (okrugli ili pravougaoni otvor, visina okvira). Tipovi pripadaju mreži, pod **Tipovi objekata** u Svojstvima projekta.

1. Klikni {{ui:Novi tip objekta}}. Dijalog crta objekat u planu i preseku dok kucaš.
2. Klikni {{ui:Dodaj tip}}.
3. Izaberi objekat i izaberi tip pod **Tip**. Preuzima veličinu tipa i taložnik; sopstveni taložnik može i dalje da se menja.

Izmeni tip i svaki objekat tog tipa prati njegove veličine. Ukloni tip i njegovi objekti ostaju okrugli objekti iste širine. Svaka promena je jedan korak: {{key:Mod+Z}} je poništava.

Pravougaoni objekat se crta na planu, u DXF, DWG i PDF, a u 3D kao pravougaonik sa dužinom duž svoje izlazne cevi; cevi počinju od njegovog zida. LandXML ga zapisuje kao pravougaoni objekat (`RectStruct`) sa svojom debljinom zida, i takve objekte čita nazad kao tipove.

### Deli tip kroz biblioteku

{{ui:Sačuvaj kao stavku biblioteke}} zapisuje tip kao CadCraft stavku biblioteke (`.json` datoteka): njegov simbol na planu, 3D telo do tipične dubine, i sve veličine. Otpremi ga u biblioteku da ga podeliš. {{ui:Otvori stavku biblioteke}} čita objekat sačuvan na ovaj način nazad u mrežu, pretvoren u jedinice projekta. Stavke biblioteke koje nisu objekti napravljeni u CivilCraft-u se odbijaju, uz razlog.

## Brisanje

Izaberi cev i pritisni {{key:Delete}} da je ukloniš. Brisanje objekta uklanja i cevi povezane sa njim. Na Mac-u pritisni Fn i Delete, ili klikni {{ui:Izbriši}}.

## Još nije izgrađeno

Tokovi, veličine cevi i hidraulička linija pritiska su u [Odvodnjavanje kišnice](topic:storm-drainage). Katalozi cevi, necilindrične cevi, krive cevi i više od jedne mreže po projektu nisu još dostupni. Vidi [Još nije izgrađeno](topic:not-built-yet).
