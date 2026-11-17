---
title: Provjera IFC izvoza prema IDS-u klijenta
summary: Učitaj .ids datoteku koju ti je dao klijent ili putna uprava i vidi svaki izvezeni element koji je ne ispunjava, u Problemima.
keywords: ids, information delivery specification, buildingsmart, zahtjevi, isporuka, provjera, validacija, qa, ifc izvoz, ifc 4.3, trasa, put, nabavka
from: 183d9a0e
---

## Šta ćeš uraditi

IDS (Information Delivery Specification, buildingSMART standard) je spisak onoga što IFC mora sadržavati. Javne nabavke ga često pošalju uz posao. CivilCraft provjerava IFC koji ovaj projekt izvozi, u verziji IFC-a koju si izabrao za izvoz, prema njemu i navodi svaki element koji ne ispunjava.

## Koraci

1. Otvori svoj projekt.
2. Klikni {{ui:IFC}} u grupi Izvoz na traci sa alatima. U dijalogu izaberi verziju IFC-a koju ćeš isporučiti.
3. Klikni {{ui:Provjeri prema IDS…}}.
4. Klikni {{ui:Učitaj .ids datoteku…}} i izaberi datoteku. Ništa se ne otprema.
5. Pročitaj rezultat: svaku specifikaciju sa {{ui:Prolazi}} ili {{ui:Ne prolazi}} i koliko elemenata se na nju odnosi.
6. Otvori Probleme ({{key:Ctrl+Shift+M}}) i klikni neku neuspjelu stavku da izabereš trasu, plato, cijev, konstrukciju ili građevinsku masu iz koje potiče.

## Šta bi trebalo da vidiš

- Jedno upozorenje po izvezenom elementu i zahtjevu koji promaši, sa nazivom specifikacije, šta IDS traži i šta izvoz ima.
- Izvještaj o provjeri (u Problemima) počinje sa IDS-om: njegovim naslovom, verzijom, autorom i brojevima svake specifikacije.

## Dobro je znati

- IDS se čuva u datoteci projekta, pa se ponovo provjerava kad otvoriš projekat. Učitavanje ili zaboravljanje njega je jedan korak koji možeš poništiti.
- Svaka promjena se ponovo provjerava malo kasnije. Velike površine traju duže da se zapišu, pa provjera tada čeka malo duže između pokretanja.
- Provjera koristi istu datoteku koju piše izvoz {{ui:IFC}}, u verziji koja je zadnja izabrana tamo (IFC 4.3 kad nisi izabrao nijednu).
- Brojevi se upoređuju u SI jedinicama: projekat u stopama se prvo pretvara u metre.

- Obrasci u IDS-u čitaju se kao cijela vrijednost. `^` na početku i `$` na kraju također se uzimaju kao „cijela vrijednost”, kako većina IDS datoteka to i misli.

## Dalje

- [Izvoz IFC-a](topic:ifc)
