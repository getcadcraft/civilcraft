---
title: Vaša knjižnica daljnovodov
summary: Izdelajte lastne vodnike, podzemne kable, podpore, opremo in tipe jarkov v kategorijah, ki jih poimenujete, in jih delite kot datoteke.
keywords: knjižnica, vodnik, kabel, drog, podpora, prečka, izolator, okov, zatega, vlečna vrv, transformator, omara, spoj, jarek, kategorija, csv, uvoz, izvoz
from: 88733744
---

Razdelek **Knjižnica** delovnega okolja Daljnovodi hrani vse elemente, ki jih lahko uporabi linija ali kabel. Nič v njej ni vezano na državo ali proizvajalca: elemente, s katerimi delate, izdelate sami.

## Tri vrste elementov

| Vrsta | Kje je | Ali jo lahko spremenite? |
|---|---|---|
| **Primeri** | Priloženi CivilCraft, s splošnimi številkami, ki smo jih izračunali iz lastnosti materialov | Ne: najprej {{ui:Kopiraj v mojo knjižnico}} |
| **V projektu** | Prišli so z datoteko projekta, ki ste jo odprli | Ne: najprej {{ui:Kopiraj v mojo knjižnico}} |
| **Moji** | Vaši lastni elementi, shranjeni v tem brskalniku | Da, in spremembe se takoj shranijo |

Vsak projekt hrani kopijo vsakega elementa, ki ga uporablja, zato se projekt odpre na vsakem računalniku s svojimi vodniki in drogovi.

:::warning
Primerni elementi so zgolj primeri: vsako številko preverite glede na podatke vašega dobavitelja. Podzemni kabli namenoma nimajo nazivnega toka, ker je odvisen od tega, kako je kabel položen.
:::

## Izdelava elementa

1. V **Knjižnica** izberite **Vrsto** (nadzemni vodniki, podzemni kabli, podpore, oprema ali tipi jarkov).
2. Kliknite {{ui:Nov element}} ali izberite primer in kliknite {{ui:Kopiraj v mojo knjižnico}} ali {{ui:Podvoji}}.
3. Izpolnite njegova polja. Polja, označena z `*`, so tista, ki jih preverjanja potrebujejo; element, kateremu manjka eno od njih, je označen z `!` in se ob uporabi v liniji navede pod **Preverjanja**.
4. Določite **Kategorijo**, z `/` med ravnmi: `Nadzemni/NN/V snopu`, `Podpore/Beton/12 m`. Drevo sledi vašim kategorijam.

Kaj potrebuje vsaka vrsta:

| Vrsta | Potrebno za preverjanja |
|---|---|
| Nadzemni vodnik | presek, premer, masa na meter, natezna trdnost, modul elastičnosti, toplotni raztezek |
| Podzemni kabel | žile, presek, napetost, premer, upornost, nazivni tok |
| Podpora | skupna dolžina, nazivna obremenitev (vzeta na točki pod vrhom), globina v tleh |
| Oprema | njena vrsta; nazivna obremenitev za prečke, okove in zatege; razmik faz in padec za prečke; dolžina za izolatorje; kot za zatege |
| Tip jarka | globina, širina, zaščitna plast nad kabli |

## Deljenje

- {{ui:Shrani mojo knjižnico}} shrani vse vaše elemente v eno datoteko `.cclines.json`; {{ui:Odpri knjižnico …}} jo prebere nazaj (elementi z istim ključem se zamenjajo).
- {{ui:Shrani kot CSV}} shrani vrsto, ki jo gledate, kot preglednico; {{ui:Odpri knjižnico …}} prebere CSV te vrste nazaj. Stolpci so lahko v poljubnem vrstnem redu; datoteka, ločena s podpičji, sme uporabljati decimalno vejico.
