---
title: Studijske datoteke za drugi program za dalekovode (.DON)
summary: Sačuvajte jedan nadzemni vod kao studijsku datoteku .DON ili pročitajte stubove jednog voda u novi vod. Nije testirano s programom koji ih čita.
keywords: don, .don, studijska datoteka, xml, izvoz, uvoz, program za nadzemne vodove, zatezanje, canton
from: 1abc4d07
---

Neki programi za nadzemne vodove čuvaju studiju u datoteci `.DON` (XML tekst). CivilCraft može zapisati jedan vod u takvu datoteku i pročitati stubove jednog.

:::warning
**Nije testirano.** Napravili smo ovo prema popisu naziva polja formata koji je jedan korisnik podijelio, a ne prema pravoj datoteci, i nismo otvorili naše datoteke u programu koji ih čita. Otvorite datoteku tamo i provjerite svaku vrijednost prije nego što se oslonite na nju. Ako možete podijeliti `.DON` datoteku (uz uklonjene podatke klijenta), to nam pomaže da ovo ispravimo.
:::

## Spasi studijsku datoteku

1. Dodijelite vodu vodič i provjerite da ima rezultate (nema "nije izračunato" u njegovim Svojstvima).
2. {{ui:Više}} › {{ui:Spasi studijsku datoteku (.DON)…}}, odaberite vod, dodajte opis i broj posla.
3. {{ui:Spasi datoteku studije}}.

Datoteka sadrži stubove voda (koordinate, teren, visine, uloge, poprečnu traverzu, stub koji je zadržan ili predložen, opterećenja po slučaju opterećenja, temelj), jednu dionicu za svaki dio između krajnjih vezivanja (vodič, napon, merodavni raspon, rasponi, napetost i parametar lančanice, najveća napetost po slučaju opterećenja) i tablice zatezanja. Dužine su u metrima, a sile u daN; tekst se zapisuje u Latin-1, pa znak van njega postaje `?`.

## Učitaj studijsku datoteku

{{ui:Više}} › {{ui:Otvori studijsku datoteku (.DON)…}} učitava stubove u novi vod. Vodič, stubovi i poprečne traverze se povezuju s vašom bibliotekom po nazivu; ono što nije pronađeno ostavlja se da odaberete u Svojstvima.
