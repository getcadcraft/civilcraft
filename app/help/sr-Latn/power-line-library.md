---
title: Tvoja biblioteka dalekovoda
summary: Napravi sopstvene provodnike, podzemne kablove, stubove, opremu i tipove rovova, u kategorijama koje imenuješ, i deli ih kao datoteke.
keywords: biblioteka, provodnik, kabl, stub, nosač, traverza, izolator, spojnica, zatega, zatezna žica, transformator, ormarić, spoj, rov, kategorija, csv, uvoz, izvoz
from: 88733744
---

Odeljak **Biblioteka** radnog prostora Dalekovodi sadrži svaku stavku koju vod ili kabl može da koristi. Ništa u njoj nije vezano za zemlju ili proizvođača: pravi stavke koje koristiš.

## Tri vrste stavki

| Vrsta | Gde se nalazi | Možeš li je menjati? |
|---|---|---|
| **Primeri** | Isporučuju se uz CivilCraft, sa opštim vrednostima koje smo izračunali iz svojstava materijala | Ne: prvo {{ui:Kopiraj u moju biblioteku}} |
| **U projektu** | Došle su uz datoteku projekta koju si otvorio | Ne: prvo {{ui:Kopiraj u moju biblioteku}} |
| **Moje** | Tvoje stavke, čuvaju se u ovom pregledaču | Da, i izmene se odmah čuvaju |

Svaki projekat čuva kopiju svake stavke koju koristi, pa se projekat otvara na bilo kom računaru sa sopstvenim provodnicima i stubovima.

:::warning
Primeri su primeri: proveri svaki broj prema podacima svog dobavljača. Podzemni kablovi namerno nemaju nazivnu struju, jer ona zavisi od načina polaganja.
:::

## Napravi stavku

1. U **Biblioteka** izaberi **Vrstu** (nadzemni provodnici, podzemni kablovi, stubovi, oprema ili tipovi rovova).
2. Klikni {{ui:Nova stavka}}, ili izaberi primer i klikni {{ui:Kopiraj u moju biblioteku}} ili {{ui:Dupliraj}}.
3. Popuni njena polja. Polja označena sa `*` su ona koja provere traže; stavka kojoj nedostaje jedno obeležava se sa `!` i navodi se pod **Provere** kad je vod koristi.
4. Daj joj **Kategoriju**, sa `/` između nivoa: `Nadzemni/NN/Snopljeni`, `Stubovi/Beton/12 m`. Stablo prati tvoje kategorije.

Šta svaka vrsta treba:

| Vrsta | Potrebno za provere |
|---|---|
| Nadzemni provodnik | presek, prečnik, masa po metru, prekidna čvrstoća, modul elastičnosti, toplotno širenje |
| Podzemni kabl | žile, presek, napon, prečnik, otpornost, nazivna struja |
| Stub | ukupna dužina, nominalno opterećenje (uzeto u tački ispod vrha), dubina u tlu |
| Oprema | njen tip; nazivno opterećenje za traverze, spojnice i zatege; razmak faza i pad za traverze; dužina za izolatore; ugao za zatege |
| Tip rova | dubina, širina, pokrivanje kablova |

## Podeli je

- {{ui:Sačuvaj moju biblioteku}} čuva svaku tvoju stavku kao jednu datoteku `.cclines.json`; {{ui:Otvori biblioteku…}} je učitava nazad (stavke sa istim ključem se zamenjuju).
- {{ui:Sačuvaj kao CSV}} čuva vrstu koju gledaš kao tabelu; {{ui:Otvori biblioteku…}} čita CSV te vrste nazad. Kolone mogu biti u bilo kom redosledu; datoteka sa tačka-zarezom može koristiti decimalni zarez.
