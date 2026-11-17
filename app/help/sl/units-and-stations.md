---
title: Enote, postaje in zapis številk
summary: Projekti v US ft in metrih, kako se postaje, nakloni, bočni nakloni, smeri, površine, prostornine in premeri cevi zapisujejo in vpisujejo ter kaj naredi sprememba enot.
keywords: vpis dolžine, računanje, kalkulator, vsota, ulomek, čevlji in palci, 4+7/16, enote, US ft, metri, metrični, imperialni, zapis postaj, postaje, nakloni, odstotek, bočni nakloni, h:v, smer, kubični yardi, premer
from: 0b9b5b6b
---

## Enote projekta

Projekt je v **US ft** ali **metrih** (**Enote** v levem podoknu). Vsaka koordinata, kota, dolžina in postaja v projektu je v tej enoti.

:::warning
Sprememba **Enot** spremeni oznake, zapis postaj, privzete vrednosti in zapis datotek. **Ne** pretvori nobenega števila. Mesto, izmerjeno v čevljih, ki preklopi na metre, ohrani iste številke, zdaj brane kot metri. Vrstica stanja pravi „Enote so zdaj metri. Koordinate niso bile pretvorjene.“ Pred projektiranjem nastavite enote tako, da ustrezajo vašim podatkom.
:::

Odvisno od enot je:

| | US ft | Metri |
|---|---|---|
| Zapis postaj | `12+34.56` (postaje po 100 ft) | `1+234.567` (postaje po 1000 m) |
| Ponujeni intervali plastnic | 0.25 do 20 ft | 0.1 do 10 m |
| Površina | sq ft | sq m |
| Prostornina | cu yd | cu m |
| Premer cevi in konstrukcij | in | mm |
| Privzeti polmer krivine | 100 ft | 30 m |
| Oznake postaj na načrtu | na vsakih 50 ft, oznake na vsakih 100 ft | na vsakih 20 m, oznake na vsakih 100 m |
| Merila izrisa | 1" = 5' do 1" = 1000' | 1:50 do 1:10000 |
| Linearna enota LandXML | USSurveyFoot | meter |

Nov projekt se začne v čevljih ali v metrih, če je dolžinska enota, označena z zvezdico v {{ui:Nastavitve}} › {{ui:Splošno}} › {{ui:Enote}}, metrična. Seznam **Enote** prikaže enote, vklopljene tam, in vedno enote projekta. Če je tam označena zvezdica pri enoti površine ali prostornine (aker, hektar, aker-ft …), se površine in prostornine poročajo v njej namesto v zgornjem stolpcu. Glejte [Enote, vpisane vrednosti in seznami enot](common:unit-lists).

Ko odprete LandXML, projekt prevzame enote datoteke. Datoteka v mednarodnih čevljih se odpre kot projekt v čevljih; številke se ne spremenijo.

## Vpisovanje dolžin in vsot

Vsako polje, ki sprejme dolžino ali koto, prebere več kot golo število: pritisnite {{key:Enter}} in polje prikaže rezultat v enotah projekta.

| Vpišete | V projektu v US ft | V projektu v metrih |
|---|---|---|
| `12.5` | 12.5 ft | 12.5 m |
| `12'6"`, `12' 6 1/2"`, `6"`, `3 ft 6 in` | 12.5 ft, 12.54 ft, 0.5 ft, 3.5 ft | enake dolžine v metrih |
| `4 7/16`, `4-7/16` | 4.4375 ft | 4.4375 m |
| `450 mm`, `1.2 m`, `90 cm` | v ft | 0.45 m, 1.2 m, 0.9 m |
| `10 US ft`, `3 ch`, `2 rd`, `0.5 mi`, `1 km` | 10 ft, ostali v US survey ft | enake dolžine v metrih |
| `4+7/16`, `12'6" + 3/4"`, `(24'-0")/3`, `2*450mm` | vsota, v ft | vsota, v metrih |

Deluje vsaka oznaka dolžine iz skupne tabele enot, z natančno velikostjo: čevlji projekta so US survey ft, zato je `10 US ft` enako 10, `3 ch` (veriga iz mednarodnih čevljev) pa 197.9996. Uporabite `+ - * /` in oklepaje ter `abs`, `round`, `ceil` in `floor`. Vezaj, zapisan v dolžino, je del nje (`24'-6"`, `6-1/2`); če je obdan s presledki, odšteva (`24' - 6"` = 23.5 ft). Golo število množi ali deli dolžino, pri seštevanju z dolžino pa postane dolžina v enotah projekta. Če CivilCraft ne more prebrati vpisa, je polje označeno, vrstica stanja pa pove, kje je težava.

Postaje niso vsote: `10+00` v polju za postajo je postaja 10+00. Nakloni v odstotkih, številke točk in opisi se preberejo, kakršni so.

## Postaje

Postaja je razdalja vzdolž trase, zapisana s plusom:

- Ft: del pred plusom so stotine čevljev. `12+34.56` je 1,234.56 ft.
- Metri: del pred plusom so tisočice metrov. `1+234.567` je 1,234.567 m.
- Negativne postaje ohranijo predznak pred njimi: `-0+50.00`.

Kjer vpišete postajo (**Začetna postaja**, **Postaja** PVI), jo lahko vpišete s plusom (`12+34.56`) ali kot golo število (`1234.56`). Presledki se prezrejo.

## Nakloni in bočni nakloni

- **Nakloni** (profili, cevi, nakloni voznih pasov in bankin) so v odstotkih: `+1.25%` se dvigne v smeri naraščajoče postaje, `-0.50%` pada.
- **Bočni nakloni** (izkop in nasip ploščadi, izkop in nasip koridorja) so vodoravno proti navpično: `3` pomeni 3 : 1, tri enote vodoravno za eno navzgor ali navzdol.
- **K** za vertikalno krivuljo je njena dolžina, deljena s spremembo naklona v odstotkih.

## Smeri in koti

Smeri so kvadrantne smeri v stopinjah, minutah in sekundah: `N 63°12'05" E`. Odkloni krivulj (Δ) uporabljajo enake stopinje, minute in sekunde, z „levo“ ali „desno“.

## Zamiki

Zamiki od trase so pravokotne razdalje do nje, označene **L** (levo) ali **R** (desno), gledano v smeri naraščajoče postaje.

## Prikaz številk

- Koordinate in kote prikazujejo 2 decimalki v podoknih in vrstici stanja (3 za izbrano točko izmere).
- Površine in prostornine so združene po tisočih: `128,250 sq ft`, `454.9 cu yd`.
- Koordinate se nikoli ne združujejo, zato jih lahko kopirate, kakršne so.

## Koordinate

CivilCraft dela v ravnini: vzhodna koordinata desno, severna navzgor. Projektiranje poteka vedno v projiciranih koordinatah (državna ravnina, UTM ali lokalna mreža). CivilCraftu lahko poveste, v katerem koordinatnem sistemu so, in ali so mrežne, terenske ali lokalne koordinate; nato prikaže zemljepisno širino in dolžino ter postavi datoteke GIS in kartne sloje, vendar nikoli sam ne spremeni enot in ne premakne vaših koordinat. Glejte [Nastavite koordinatni sistem projekta](topic:coordinate-systems) in [Terenske in lokalne koordinate](topic:ground-and-local-coordinates). Velike vrednosti državne ravnine (milijoni čevljev) so v redu; CivilCraft notranje dela relativno na mesto, da ohrani natančnost.
