---
title: Vaša biblioteka dalekovoda
summary: Napravite vlastite vodiče, podzemne kablove, stubove, opremu i tipove rovova, u kategorijama koje sami imenujete, i dijelite ih kao datoteke.
keywords: biblioteka, vodič, kabl, stub, stup, poprečna traverza, izolator, pribor, zatega, transformator, ormar, spojnica, rov, kategorija, csv, uvoz, izvoz
from: 88733744
---

Odjeljak **Biblioteka** u radnom prostoru Dalekovodi sadrži svaku stavku koju vod ili kabl može koristiti. Ništa u njoj nije vezano za državu ili proizvođača: pravite stavke s kojima radite.

## Tri vrste stavki

| Vrsta | Gdje se čuva | Možete li je mijenjati? |
|---|---|---|
| **Primjeri** | Isporučeni uz CivilCraft, s općim vrijednostima koje smo izveli iz svojstava materijala | Ne: prvo {{ui:Kopiraj u moju biblioteku}} |
| **U projektu** | Došle su s datotekom projekta koju ste otvorili | Ne: prvo {{ui:Kopiraj u moju biblioteku}} |
| **Moje** | Vaše vlastite stavke, čuvane u ovom pregledaču | Da, a promjene se odmah čuvaju |

Svaki projekat čuva kopiju svake stavke koju koristi, tako da se projekat otvara na bilo kojem računaru sa svojim vodičima i stubovima.

:::warning
Primjeri su samo primjeri: provjerite svaku vrijednost prema podacima vašeg dobavljača. Podzemni kablovi namjerno nemaju nazivnu struju, jer ona zavisi od toga kako je kabl položen.
:::

## Pravljenje stavke

1. U **Biblioteci** odaberite **Vrstu** (nadzemni vodiči, podzemni kablovi, stubovi, oprema ili tipovi rova).
2. Kliknite {{ui:Nova stavka}}, ili odaberite primjer i kliknite {{ui:Kopiraj u moju biblioteku}} ili {{ui:Dupliciraj}}.
3. Popunite njena polja. Polja označena sa `*` su ona koja provjere trebaju; stavka kojoj nedostaje jedno od njih označena je sa `!` i navedena je pod **Provjere** kad je vod koristi.
4. Dodijelite joj **Kategoriju**, s `/` između nivoa: `Nadzemni/NN/Snop`, `Stubovi/Beton/12 m`. Stablo prati vaše kategorije.

Šta svaka vrsta treba:

| Vrsta | Potrebno za provjere |
|---|---|
| Nadzemni vodič | presjek, prečnik, masa po metru, prekidna čvrstoća, modul elastičnosti, toplotno širenje |
| Podzemni kabl | žile, presjek, napon, prečnik, otpor, nazivna struja |
| Stub | ukupna dužina, nazivno opterećenje (uzeto u tački ispod vrha), dubina u zemlji |
| Oprema | njen tip; nazivno opterećenje za poprečne traverze, pribor i zatege; razmak faza i spuštanje za poprečne traverze; dužina za izolatore; ugao za zatege |
| Tip rova | dubina, širina, zaštitni sloj iznad kablova |

## Dijeljenje

- {{ui:Spasi moju biblioteku}} čuva svaku vašu stavku kao jednu datoteku `.cclines.json`; {{ui:Otvori biblioteku…}} je ponovo učitava (stavke s istim ključem se zamjenjuju).
- {{ui:Spasi kao CSV}} čuva vrstu koju gledate kao tabelu; {{ui:Otvori biblioteku…}} učitava CSV te vrste nazad. Kolone mogu biti bilo kojim redoslijedom; datoteka s tačka-zarezom može koristiti decimalni zarez.
