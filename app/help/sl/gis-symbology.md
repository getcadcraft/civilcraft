---
title: Obarvanje sloja glede na atribut
summary: Pobarvajte značilnice sloja GIS glede na vrednosti polja (ena barva za vrednost ali po številskih razponih), velikost točk po številu, obarvajte notranjost poligonov in pokažite legendo na načrtu.
keywords: simbologija, slog, barva, kategorizirano, stopnjevano, edinstvene vrednosti, enaki intervali, kvantil, naravni prelomi, jenks, barvna lestvica, barvna slepota, legenda, velikost, točke, kartogram, razredi, gis
from: a3a69add
---

Odprite meni **tri pike** sloja v seznamu GIS-slojev in izberite {{ui:Slog po atributu…}}.

## Trije slogi

- **Enostaven simbol:** barva sloja, kot prej.
- **Kategorizirano:** ena barva za vsako različno vrednost katerega koli polja. Do osem vrednosti dobi osem barv Okabe-Ito (izbrane, da ostanejo ločljive pri pogostih oblikah barvne slepote); pri več vrednostih dobi barvo sedem najpogostejših, ostale pa si delijo sivi razred **Drugo**. Značilnice brez vrednosti so sive.
- **Stopnjevano:** številsko polje se razreže na 2 do 9 razponov, vsak z barvo iz barvne lestvice. Vrednost na meji gre v nižji razpon.

## Kako se razponi režejo

| Način | Prelomi |
|---|---|
| Enaki intervali | Razpon od najmanjše do največje vrednosti razdeljen na enake širine. Vrednosti 0 do 30 v treh razponih: 0, 10, 20, 30. |
| Kvantil | Približno enako število značilnic v vsakem razponu. Prelomi so prebrani iz urejenih vrednosti z običajno linearno interpolacijo: za 1 do 10 v dveh razponih je prelom 5.5. |
| Naravni prelomi (Jenks) | Rezi, ki pustijo najmanjšo razpršenost znotraj vsakega razpona, tako da skupine podobnih vrednosti ostanejo skupaj. Pri več kot 1,500 vrednostih deluje na 1,500 enakomerno razporejenih in to pove. |

## Barve

Viridis in Cividis tečeta od temne do svetle z enakomerno spremembo svetlosti, zato se vrstni red razponov bere tudi v sivini ali pri barvni slepoti. Blues je od svetle do temne. Rdeče do modre je dvosmerna lestvica za vrednosti okoli sredine. **Obrni barve** obrne katero koli od njih. Pogovorno okno pred uporabo našteje razpone in število značilnic v vsakem.

## Velikost, polnilo in legenda

- **Velikost točke glede na** številsko polje naredi kvadrat vsake točke večji, višja kot je vrednost, med dvema velikostma, ki ju določite (polovica stranice, v milimetrih na papirju).
- **Obarvaj notranjost poligonov** napolni vsak poligon z barvo njegovega razreda (luknje ostanejo prazne). Barvanje je na zaslonu; izrisi in DXF/DWG prikažejo obarvane obrise.
- **Pokaži legendo na načrtu** nariše razrede, njihova števila in razpon velikosti v spodnjem levem kotu načrta. Legenda je na zaslonu; ni v izrisu.
- Za označevanje značilnic s poljem uporabite **Označi z** v istem meniju.

Slog se shrani v datoteko projekta. Različica, ki slogov ne pozna, odpre datoteko z barvo sloja. Izrisi, DXF in DWG prenesejo razrede kot ločene sloje, poimenovane po sloju in razredu, v najbližji od devetih osnovnih barv CAD. Sloj z več kot 200,000 značilnicami je narisan v eni barvi.
