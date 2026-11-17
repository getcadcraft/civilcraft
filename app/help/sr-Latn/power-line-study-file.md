---
title: Studijske datoteke za drugi program za vodove (.DON)
summary: Sačuvaj jedan nadzemni vod kao studijsku datoteku .DON, ili pročitaj stubove jednog u novi vod. Nije testirano sa programom koji ih čita.
keywords: don, .don, studijska datoteka, xml, izvoz, uvoz, program za nadzemne vodove, zatezanje, kanton
from: 1abc4d07
---

Neki programi za nadzemne vodove čuvaju studiju u datoteci `.DON` (XML tekst). CivilCraft može da upiše jedan vod u takvu datoteku i da pročita stubove iz jedne.

:::warning
**Nije testirano.** Napravili smo ovo prema spisku naziva polja formata koji je jedan korisnik podelio, a ne prema pravoj datoteci, i nismo otvarali naše datoteke u programu koji ih čita. Otvori datoteku tamo i proveri svaku vrednost pre nego što se oslanjaš na nju. Ako možeš da podeliš datoteku `.DON` (bez podataka o klijentu), to nam pomaže da ovo ispravimo.
:::

## Sačuvaj studijsku datoteku

1. Daj vodu provodnik i proveri da ima rezultate (bez „nije izračunato“ u njegovim Svojstvima).
2. {{ui:Više}} › {{ui:Sačuvaj studijsku datoteku (.DON)…}}, izaberi vod, dodaj opis i broj posla.
3. {{ui:Sačuvaj datoteku studije}}.

Datoteka sadrži stubove voda (koordinate, teren, visine, uloge, traverzu, stub koji je zadržan ili predložen, opterećenja po slučaju opterećenja, temelj), jedan odeljak po deonici između zateznih stubova (provodnik, napon, merodavni raspon, rasponi, zatezanje i parametar lančanice, najveće zatezanje po slučaju opterećenja) i tabele zatezanja. Dužine su u metrima, sile u daN; tekst se piše u Latin-1, pa znak van njega postaje `?`.

## Pročitaj studijsku datoteku

{{ui:Više}} › {{ui:Otvori studijsku datoteku (.DON)…}} čita stubove u novi vod. Provodnik, stubovi i traverze se upoređuju sa tvojom bibliotekom po imenu; što se ne nađe, ostaje da ga izabereš u Svojstvima.
