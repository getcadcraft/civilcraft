---
title: Proverite IFC izvoz prema IDS-u klijenta
summary: Učitajte .ids datoteku koju vam je dao klijent ili putni organ i vidite svaki izvezeni element koji je ne ispunjava u Problemima.
keywords: ids, specifikacija isporuke informacija, buildingsmart, zahtevi, isporuka, provera, validacija, qa, izvoz ifc, ifc 4.3, trasa, put, javna nabavka
from: 183d9a0e
---

## Šta ćete uraditi

IDS (Information Delivery Specification, buildingSMART standard) je spisak onoga što IFC mora da sadrži. Javne nabavke često pošalju jedan uz posao. CivilCraft proverava IFC ovog projekta, u verziji IFC-a koju ste izabrali za izvoz, prema njemu i navodi svaki element koji ne ispunjava zahtev.

## Koraci

1. Otvorite svoj projekat.
2. Kliknite {{ui:IFC}} u grupi **Izvoz** na traci sa alatkama. U dijalogu izaberite verziju IFC-a koju ćete isporučiti.
3. Kliknite {{ui:Proveri prema IDS-u…}}.
4. Kliknite {{ui:Učitaj .ids datoteku…}} i izaberite datoteku. Ništa se ne otprema.
5. Pročitajte rezultat: svaku specifikaciju sa {{ui:Prolazi}} ili {{ui:Ne prolazi}} i koliko elemenata se na nju odnosi.
6. Otvorite Probleme ({{key:Ctrl+Shift+M}}) i kliknite neuspeh da izaberete trasu, plato, cev, konstrukciju ili masu zgrade iz koje potiče.

## Šta treba da vidite

- Jedno upozorenje po izvezenom elementu i zahtevu koji ne ispunjava, sa nazivom specifikacije, onim što IDS traži i onim što izvoz ima.
- Izveštaj o proveri (u Problemima) počinje IDS-om: njegovim naslovom, verzijom, autorom i brojevima za svaku specifikaciju.

## Dobro je znati

- IDS se čuva u datoteci projekta, pa se ponovo proverava kada otvorite projekat. Učitavanje ili zaboravljanje je jedan korak koji možete poništiti.
- Svaka promena se ponovo proverava malo kasnije. Velike površine se duže zapisuju, pa provera tada čeka malo duže između pokretanja.
- Provera koristi istu datoteku koju piše izvoz {{ui:IFC}}, u verziji poslednje izabranoj tamo (IFC 4.3 kada niste izabrali nijednu).
- Brojevi se upoređuju u SI jedinicama: projekat u stopama se prvo pretvara u metre.

- Šabloni u IDS-u se čitaju kao cela vrednost. `^` na početku i `$` na kraju takođe se uzimaju kao „cela vrednost“, kao što većina IDS datoteka to i misli.

## Dalje

- [Izvezite IFC](topic:ifc)
