---
title: Provjera IFC izvoza prema IDS-u klijenta
summary: Učitajte .ids datoteku koju vam je dao klijent ili cestovna uprava i u Problemima pogledajte svaki izvezeni element koji joj ne odgovara.
keywords: ids, specifikacija isporuke informacija, buildingsmart, zahtjevi, isporuka, provjera, validacija, kontrola kvalitete, ifc izvoz, ifc 4.3, os trase, cesta, javna nabava
from: 183d9a0e
---

## Što ćete raditi

IDS (Information Delivery Specification, buildingSMART norma) je popis onoga što IFC mora sadržavati. Javna nabava često ga pošalje uz posao. CivilCraft provjerava IFC ovog projekta, u verziji IFC koju ste odabrali za izvoz, prema njemu i navodi svaki element koji ne zadovoljava.

## Koraci

1. Otvorite projekt.
2. Kliknite {{ui:IFC}} u grupi **Izvoz** na alatnoj traci. U dijaloškom okviru odaberite verziju IFC-a koju ćete isporučiti.
3. Kliknite {{ui:Provjeri prema IDS-u…}}.
4. Kliknite {{ui:Učitaj .ids datoteku…}} i odaberite datoteku. Ništa se ne učitava na poslužitelj.
5. Pročitajte rezultat: svaku specifikaciju s {{ui:Prolazi}} ili {{ui:Ne prolazi}} i koliko elemenata se na nju odnosi.
6. Otvorite Probleme ({{key:Ctrl+Shift+M}}) i kliknite neuspjeh da odaberete os trase, plato, cijev, građevinu ili građevnu masu iz kojih dolazi.

## Što biste trebali vidjeti

- Jedno upozorenje po izvezenom elementu i zahtjevu koji ne ispunjava, s nazivom specifikacije, onim što IDS traži i onim što izvoz ima.
- Izvješće o provjeri (u Problemima) počinje IDS-om: njegovim naslovom, verzijom, autorom i brojkama svake specifikacije.

## Dobro je znati

- IDS se sprema u datoteku projekta, pa se ponovno provjerava kad otvorite projekt. Učitavanje ili zaboravljanje je jedan korak koji možete poništiti.
- Svaka promjena se ponovno provjerava malo kasnije. Velike plohe duže se zapisuju, pa provjera tada čeka malo duže između pokretanja.
- Provjera koristi istu datoteku koju zapisuje izvoz {{ui:IFC}}, u verziji zadnje odabranoj tamo (IFC 4.3 ako niste ništa odabrali).
- Brojevi se uspoređuju u SI jedinicama: projekt u stopama prvo se pretvara u metre.

- Uzorci u IDS-u čitaju se kao cijela vrijednost. `^` na početku i `$` na kraju također se shvaćaju kao „cijela vrijednost“, kao što to većina IDS datoteka i misli.

## Dalje

- [Izvoz IFC-a](topic:ifc)
