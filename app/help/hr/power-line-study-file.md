---
title: Datoteke studije za drugi program za dalekovode (.DON)
summary: Spremite jedan nadzemni vod kao datoteku studije .DON ili pročitajte stupove jednog voda u novi vod. Nije testirano s programom koji ih čita.
keywords: don, .don, datoteka studije, xml, izvoz, uvoz, program za nadzemne vodove, zatezanje, canton
from: 1abc4d07
---

Neki programi za nadzemne vodove čuvaju studiju u datoteci `.DON` (XML tekst). CivilCraft može zapisati jedan vod kao takvu datoteku i pročitati stupove jednog.

:::warning
**Nije testirano.** Izradili smo to iz popisa naziva polja formata koji je jedan korisnik podijelio, a ne iz stvarne datoteke, i nismo otvorili naše datoteke u programu koji ih čita. Otvorite datoteku tamo i provjerite svaku vrijednost prije nego se oslonite na nju. Ako možete podijeliti datoteku `.DON` (s uklonjenim podacima o klijentu), pomoći će nam da to ispravimo.
:::

## Spremanje datoteke studije

1. Dajte vodu vodič i provjerite da ima rezultate (u njegovim Svojstvima nema „nije izračunato“).
2. {{ui:Više}} › {{ui:Spremi datoteku studije (.DON)…}}, odaberite vod, dodajte opis i broj posla.
3. {{ui:Spremi datoteku studije}}.

Datoteka sadrži stupove voda (koordinate, teren, visine, uloge, traverzu, stup zadržan ili predložen, opterećenja po slučaju opterećenja, temelj), jedno poglavlje za svaku dionicu između zateznih stupova (vodič, napon, mjerodavni raspon, rasponi, napetost i parametar lančanice, najveća napetost po slučaju opterećenja) i tablice zatezanja. Duljine su u metrima, sile u daN; tekst se zapisuje u Latin-1, pa znak izvan njega postaje `?`.

## Čitanje datoteke studije

{{ui:Više}} › {{ui:Otvori datoteku studije (.DON)…}} čita stupove u novi vod. Vodič, stupovi i traverze pridružuju se vašoj knjižnici prema nazivu; što se ne nađe ostavlja se da odaberete u Svojstvima.
