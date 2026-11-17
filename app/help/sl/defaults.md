---
title: Začetne vrednosti in začasni zamenjevalniki
summary: Vse vrednosti, s katerimi CivilCraft začne, za nove projekte, prikaz, trase, ploščadi, koridorje, cevna omrežja, prostornine in izris, ter katere od njih so začasni zamenjevalniki, ki jih je treba zamenjati.
keywords: privzete vrednosti, nastavitve, začetne vrednosti, začasni zamenjevalniki, projektna merila, standardi, pravila, predpostavke
from: fbfc7432
---

CivilCraft nima pogovornega okna z nastavitvami ali predloge. To so vrednosti, s katerimi stvari začnejo. Vrednosti, označene z **začasni zamenjevalnik**, niso vzete iz nobenega standarda: zamenjajte jih z merili svojega projekta, preden se zanesete na preverjanje ali količino.

## Nov projekt

| Nastavitev | Vrednost |
|---|---|
| Ime | Brez naslova (ime prve datoteke točk jo nadomesti) |
| Enote | Ameriški čevlji |
| Ime površja | Obstoječi teren |
| Skupine točk | Vsaka skupina se začne kot {{ui:Točke}} |
| Najdaljši zunanji rob | 0 (ohrani vse trikotnike) |
| Ohranjeni koraki razveljavitve | 200 |

## Prikaz

| Nastavitev | Vrednost |
|---|---|
| Površje | {{ui:Obstoječi teren}} |
| Plastnice vsakih | 1 (ft ali m) |
| Glavne vsakih | 5. plastnica |
| Pasovi | 8 |
| Vklopljeno | Plastnice, oznake plastnic, točke, prelomnice, rob površja, cevi |
| Izklopljeno | Trikotniki, višinski pasovi, puščice naklona, oznake točk |

## Trase in profili

| Nastavitev | Vrednost |
|---|---|
| Ime | Trasa 1, Trasa 2 … |
| Začetna stacionaža | 0+00 |
| Polmer loka pri vsakem notranjem PI | 100 ft ali 30 m, manjši, če se ne prilega polovici vsake tangente |
| Projektni profil | Brez, dokler ga ne začnete; {{ui:Začni s terena}} postavi PVI na teren na vsakem koncu |
| Dolžina vertikalnega loka | 0 (brez loka), dokler ga ne vpišete |

## Ploščadi

| Nastavitev | Vrednost |
|---|---|
| Ime | Ploščad 1, Ploščad 2 … |
| Višina | Teren na sredini ploščadi, zaokrožen na 0.1 (0, če je sredina zunaj površja) |
| Nagib useka | 2 : 1 (začasni zamenjevalnik) |
| Nagib nasipa | 3 : 1 (začasni zamenjevalnik) |

## Sestav koridorja (začasni zamenjevalniki)

| Nastavitev | Ameriški čevlji | Metri |
|---|---|---|
| Širina voznega pasu | 12 ft | 3.6 m |
| Naklon voznega pasu | 2% | 2% |
| Širina bankine | 4 ft | 1.2 m |
| Naklon bankine | 4% | 4% |
| Nagib useka | 2 : 1 | 2 : 1 |
| Nagib nasipa | 3 : 1 | 3 : 1 |
| Prerez vsakih | 10 ft | 5 m |

## Cevno omrežje

| Nastavitev | Ameriški čevlji | Metri |
|---|---|---|
| Ime in vrsta | Meteorna, meteorna | Meteorna, meteorna |
| Najmanjši naklon (začasni zamenjevalnik) | 0.50% | 0.50% |
| Najmanjša zasutost (začasni zamenjevalnik) | 2 ft | 0.6 m |
| Padec v objektih (začasni zamenjevalnik) | 0.10 ft | 0.03 m |
| Premer novega objekta | 48 in | 1200 mm |
| Premer nove cevi | 12 in | 300 mm |
| Globina lovilnika | 0 | 0 |
| Rob pokrova | Od površja | Od površja |

Cevno omrežje, odprto iz LandXML, prav tako uporablja ta pravila, ker jih LandXML ne vsebuje.

## Prostornine

| Nastavitev | Vrednost |
|---|---|
| Metoda | Mreža, vzorčena v središčih celic znotraj dnevnih črt |
| Velikost celice | Izbrana tako, da omejujoči pravokotnik izravnane površine vsebuje približno 250,000 celic (1-, 2- ali 5-kratnik potence števila 10) |
| Nabreklost in krčenje | Brez |

## Izris

| Nastavitev | Vrednost |
|---|---|
| Območje | {{ui:Vse}} |
| Papir | Tabloid 11 × 17 in (projekti v čevljih), ISO A3 (projekti v metrih); vedno ležeče |
| Merilo | Največje navedeno merilo, ki ustreza |
| Barve | {{ui:Barve slojev}} |

Oznake DXF so določene glede na merilo, pri katerem vse ustreza na formatu Tabloid (čevlji) ali A3 (metri).
