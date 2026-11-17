---
title: Vaša knjižnica dalekovoda
summary: Izradite vlastite vodiče, podzemne kabele, stupove, opremu i vrste rovova u kategorijama koje sami imenujete te ih dijelite kao datoteke.
keywords: knjižnica, vodič, kabel, stup, traverza, izolator, pribor, zatega, transformator, ormarić, spoj, rov, kategorija, csv, uvoz, izvoz
from: 88733744
---

Odjeljak **Knjižnica** radnog prostora Dalekovodi sadrži svaku stavku koju vod ili kabel može koristiti. Ništa u njoj nije vezano uz državu ni proizvođača: izrađujete stavke s kojima radite.

## Tri vrste stavki

| Vrsta | Gdje se nalazi | Možete li je mijenjati? |
|---|---|---|
| **Primjeri** | Isporučuju se uz CivilCraft, s općenitim brojevima koje smo izveli iz svojstava materijala | Ne: prvo {{ui:Kopiraj u moju knjižnicu}} |
| **U projektu** | Došle su s datotekom projekta koju ste otvorili | Ne: prvo {{ui:Kopiraj u moju knjižnicu}} |
| **Moje** | Vaše vlastite stavke, spremljene u ovom pregledniku | Da, a promjene se spremaju odmah |

Svaki projekt zadržava kopiju svake stavke koju koristi, pa se projekt otvara na bilo kojem računalu sa svojim vodičima i stupovima.

:::warning
Stavke primjera su samo primjeri: provjerite svaki broj prema podacima vašeg dobavljača. Podzemni kabeli namjerno nemaju nazivnu struju jer ona ovisi o načinu polaganja.
:::

## Izrada stavke

1. U **Knjižnica** odaberite **Vrstu** (nadzemni vodiči, podzemni kabeli, stupovi, oprema ili vrste rovova).
2. Kliknite {{ui:Nova stavka}} ili odaberite primjer pa kliknite {{ui:Kopiraj u moju knjižnicu}} ili {{ui:Dupliciraj}}.
3. Ispunite njezina polja. Polja označena s `*` su ona koja provjere trebaju; stavka kojoj nedostaje jedno označena je s `!` i navedena pod **Provjere** kad je vod koristi.
4. Dodijelite joj **Kategoriju**, s `/` između razina: `Nadzemni/NN/Snopljeni`, `Stupovi/Beton/12 m`. Stablo slijedi vaše kategorije.

Što svaka vrsta treba:

| Vrsta | Potrebno za provjere |
|---|---|
| Nadzemni vodič | presjek, promjer, masa po metru, prekidna čvrstoća, modul elastičnosti, toplinsko širenje |
| Podzemni kabel | žile, presjek, napon, promjer, otpor, nazivna struja |
| Stup | ukupna duljina, nazivno opterećenje (uzeto u točki ispod vrha), dubina u tlu |
| Oprema | njezina vrsta; nazivno opterećenje za traverze, pribor i zatege; razmak faza i pad za traverze; duljina za izolatore; kut za zatege |
| Vrsta rova | dubina, širina, nadsloj iznad kabela |

## Dijeljenje

- {{ui:Spremi moju knjižnicu}} sprema svaku vašu stavku kao jednu datoteku `.cclines.json`; {{ui:Otvori knjižnicu…}} je čita natrag (stavke s istim ključem se zamjenjuju).
- {{ui:Spremi kao CSV}} sprema vrstu koju gledate kao proračunsku tablicu; {{ui:Otvori knjižnicu…}} čita CSV te vrste natrag. Stupci mogu biti u bilo kojem redoslijedu; datoteka odvojena točka-zarezom može koristiti decimalni zarez.
