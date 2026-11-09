---
title: Brskalniki in računalniki
summary: V katerih brskalnikih aplikacije delujejo, kaj se med njimi razlikuje in kaj vaš računalnik potrebuje.
keywords: chrome, edge, firefox, safari, brave, brskalnik, mac, windows, linux, ipad, tablica, webgl, zahteve, pomnilnik
from: a11b09b1
---

Aplikacije delujejo znotraj spletnega brskalnika. Delo opravijo na vašem računalniku: vaše datoteke se tam odprejo in nikoli ne gredo k nam (glejte [Kam gredo vaše datoteke](common:your-files)).

## Kateri brskalnik

Uporabite posodobljeno različico enega od teh:

| Brskalnik | Mehanizem | Opombe |
|---|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium | Najbolj popolni: izbira mape, shranjevanje za delo brez povezave, ravnanje z datotekami. |
| Firefox | Gecko | Deluje. Odpiranje cele mape uporablja preprostejši izbirnik. Shranjevanje za delo brez povezave morda ne deluje v zasebnih oknih. |
| Safari | WebKit | Deluje na Macu in iPadu. Odpiranje cele mape uporablja preprostejši izbirnik. Safari lahko izbriše kopijo za delo brez povezave, ki je nekaj tednov niste uporabili. |

Vsi trije mehanizmi so primerni za vsakdanje delo. Kjer aplikacija nekaj v enem od njih naredi drugače, njena pomoč pokaže korake za vaš brskalnik.

## Kaj se razlikuje med brskalniki

- **Odpiranje mape.** Brskalniki na Chromiumu prikažejo pravi izbirnik map in lahko mapo preberejo neposredno. Firefox in Safari vas prosijo, da izberete mapo, nato pa preberejo vsako datoteko v njej, kar pri velikih projektnih mapah traja dlje; mapo povlečete na aplikacijo, deluje pa pri vseh treh.
- **Shranjevanje.** Aplikacije shranjujejo tako, da prenesejo datoteko. Vaš brskalnik odloči, kam gredo prenosi in ali vpraša vnaprej.

:::chromium
V Chromu ali Edgeu vklopite „Vprašaj, kam shraniti vsako datoteko pred prenosom“ (v Nastavitvah pod Prenosi), da izberete mapo vsakič.
:::

:::firefox
V Firefoxu odprite Nastavitve, nato Splošno, nato Prenosi in izberite „Vedno vprašaj, kam shraniti datoteke“, da izberete mapo vsakič.
:::

:::safari
V Safariju odprite Nastavitve, nato Splošno, in nastavite „Lokacija prenosa datotek“ na „Vprašaj ob vsakem prenosu“, da izberete mapo vsakič.
:::

## Mac, Windows in Linux

Aplikacije so enake na vsakem računalniku. Razlikuje se tipkovnica: bližnjice so samodejno zapisane za vaš računalnik. Glejte [Tipke, miške in sledilne ploščice](common:keys).

## Tablični računalniki in zasloni na dotik

Nekatere aplikacije sprejmejo dotik (en prst riše ali izbira, dva prsta pa stisnete za povečavo in drsite za pomik). Pomoč vsake aplikacije pove, ali to omogoča. Na iPadu uporabite Safari ali Chrome. Tipkovnica pomaga pri aplikacijah, ki uporabljajo tipkane ukaze.

## Najstarejši brskalnik in sistem

Te različice preberemo iz kode različice 0.7 aplikacij, ne iz ugibanja: vsaka datoteka je bila razčlenjena in vsaka jezikovna lastnost, ki jo uporablja, je bila preverjena v objavljenih podatkih o združljivosti brskalnikov. Pod temi različicami se aplikacije sploh ne zaženejo, ker brskalnik ne razume kode.

| | Najstarejša različica, ki lahko zažene aplikacije |
|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium 94 |
| Firefox | 93 |
| Safari (Mac, iPad, iPhone) | 16.4 (macOS 13.3, iPadOS in iOS 16.4) |

CadCraft Studio ima na Windows svoj lastni spletni mehanizem, zato potrebuje Windows 10 ali 11; na Macu uporablja sistemovega, zato potrebuje macOS 13.3 ali novejši. Nastavitve › Posodobitve v Studiu pokažejo, na čem vaša kopija teče.

To je najstarejša različica, ki *zažene* aplikacije, prebrana iz kode. Ni seznam starih brskalnikov, v katerih smo aplikacije preizkusili, zato starejši, ki se zažene, lahko še vedno zgreši kakšno lastnost.

## Kaj potrebuje vaš računalnik

To so načrtovane najmanjše zahteve za aplikacije, ne izmerjene:

- 8 GB pomnilnika (za velike združene modele je priporočljivih 16 GB).
- Grafični čip z WebGL 2 za 3D aplikacije. Če 3D pogled ostane prazen, preverite, ali je strojni pospešek vklopljen v nastavitvah brskalnika.
- Zaslon, širok vsaj 1280 slikovnih pik, za polne orodne vrstice; manjši zasloni jih prelomijo.

Zelo velike datoteke (veliki nizi načrtov, veliki modeli) porabijo veliko pomnilnika v zavihku brskalnika. Če se aplikacija upočasni, zaprite druge zahtevne zavihke.
