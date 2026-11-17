---
title: Sebenza nethebula lezici lesingqimba
summary: Bona zonke izici zesingqimba se-GIS njengethebula, hlela futhi uhlunge, khetha imigqa nezici ndawonye, lungisa amanani, engeza izinsimu, bala amanani amasha bese ulondoloza ithebula njenge-CSV.
keywords: ithebula lezici, ithebula, izinsimu, amakholomu, imigqa, hlunga, khetha, hlela, isibali sensimu, bala, engeza insimu, qamba kabusha insimu, susa insimu, csv, thumela, gis, shapefile, geopackage, impawu
from: fd9d6c11
---

Vula ithebula lengqimba kumenyu yayo **yamachashaza amathathu** kuhlu lwezingqimba ze-GIS ({{ui:Ithebula lezici…}}), kusuka ku-Umphezulu › {{ui:Okuningi}} › {{ui:Ithebula lezici}}, noma ngokubhala `ATTRIBUTES`, `ATTTABLE` noma `TABLE`. Ithebula livula eduze kwephlani futhi lihlala livulekile ngenkathi usebenza. Imigqa ebonakalayo kuphela ndawonye idwetshwa, ngakho ingqimba enezici ezinkulungwane iyavula futhi iskrolle ngokushesha.

## Hlela, hlunga nokukhetha

- **Hlela:** chofoza isihloko sekholomu. Ukuchofoza kwesibili kuyiguqula, kwesithathu kubuyisela i-odolo yefayela. Amanani angenalutho ahlala phansi njalo. Ukuhlela kushintsha okubonayo kuphela, hhayi ingqimba.
- **Hlunga:** bhala kububanzi bokuhlunga. Isisho esinjenga `AREA > 500 and USE = 'Res'` sigcina imigqa lapho siyiqiniso khona (amagama afanayo nethebhu lokuKhetha se-[Hlaziya izingqimba ze-GIS](topic:gis-analysis): `=`, `<`, `like`, `contains`, `is null`, `in`, `between`, `and`, `or`, `not`, `$area`, `$length`). Noma yini engeyona isisho, njenge-`oak maple`, ifuna lawo magama kuyo yonke ikholomu.
- **Khetha imigqa:** chofoza umugqa. Ctrl+chofoza wengeza noma ususe owodwa, Shift+chofoza ukhetha uchungechunge, futhi {{ui:Khetha imigqa ekhonjisiwe}} ithatha yonke imigqa edlula kuhlungo. Izici ezikhethiwe zidwetshwa ephlanini, nokuchofoza isici ephlanini kukhetha umugqa wayo lapha.
- Lapho imigqa ikhethiwe ungayisondeza ngayo {{ui:Sondeza}}, wenze **ingqimba ekhethweni**, bese ufunda indawo noma ubude bayo bonke emugqeni wesimo.

## Lungisa amanani

Chofoza kabili iseli (noma uyiyise ngamakhiye o-arrow bese ucindezela Enter), bhala inani elisha bese ucindezela Enter. I-Escape ishiya njengoba lalinjalo. Inani kumele lifanele ikholomu: izinombolo njengezinombolo, izinsuku njenge-`YYYY-MM-DD`, yes/no njenge-yes, no, true noma false. Inani elingafanele limelelwa ngomusho futhi akukho okushintsha. Ibhokisi elingenalutho lenza inani libe yize. Ukuhlelwa ngakunye kuyisinyathelo esisodwa sokuhlehlisa: {{ui:Hlehlisa}} no {{ui:Phinda wenze}} sezansi kwethebula, futhi Ctrl+Z isebenza ephlanini.

## Izinsimu

Ngaphansi kwe-**Izinsimu** ungengeza insimu (umbhalo, inombolo, idethi noma yes/no), uqambe kabusha enye, noma ususe enye. Insimu entsha iqala ingenalutho. Ukuqamba kabusha kulandelwa: insimu yelebula kanye nesitayela esinesici se-[impawu ngokwesici](topic:gis-symbology) yengqimba kuya egameni elisha, futhi ukususa insimu kususa ilebula nesitayela esasiyisebenzisayo. Ngayinye iyisinyathelo esisodwa sokuhlehlisa esibuyisela konke.

## Isibali sensimu

Ibhala inani kuwo wonke imigqa (noma kuphela imigqa ekhethiwe) kusuka ezinsimu zayo ezinye, ijometri yayo nemisebenzi embalwa. Khetha insimu ekhona noma **Insimu entsha…** bese unikeza igama nohlobo. Akukho okusebenza njengekhodi: isisho sifundwa yi-parser encane enohlu oluqinile lwemisebenzi.

| Iqembu | Amagama |
|---|---|
| Izinombolo | `+ - * /`, izibambo, `abs round(x, digits) floor ceil sqrt pow min max` |
| Umbhalo | `upper lower trim len substr(text, from, count) left right replace concat` (umbhalo ufakwa phakathi kwamagwebu 'alodwa'; igama lensimu elinezikhala lifakwa phakathi kwamagwebu "amabili" noma kuzikwele [ezinsimbi]) |
| Ukukhetha | `if(test, then, else)`, `coalesce(a, b, …)`, `num(x)`, `str(x)` |
| Amadethi | `year month day` yenani le-`YYYY-MM-DD` |
| Ijometri | `$area $perimeter $length $x $y $vertices`, ngamayunithi ephrojekthi |

Umphumela ongagcinwa ngohlobo lwensimu (umbhalo ensimini yezinombolo) uyashiywa ungenalutho futhi ubalwe emyalezweni. Ukuhlukanisa ngo-zero kunika inani elingenalutho. Isibonelo, `round($area / 43560, 2)` ibhala ama-acres kusuka ku-square feet.

## Thumela

{{ui:Londoloza njenge-CSV}} ilondoloza imigqa ebonakalayo (emva kokuhlunga nokuhlela) njengefayela le-CSV ene-UTF-8 nemigqa yensimu emugqeni wokuqala. Umbhalo oqala nge-`=`, `+`, `-` noma `@` uthola u-apostrofi ophambili ukuze uhla lomsebenzi lungawusebenzisi njengefomula. Ukulondoloza isingqimba ngokwayo, sebenzisa [Thumela idatha ye-as-built ye-GIS](topic:gis-export).

## Imikhawulo

Ithebula libonisa ingqimba ngodaba lodwa lokuhlela nehlungo elilodwa ngesikhathi. Imigqa ayikwazi ukungezwa noma ukususwa lapha (yenza kunalokho ingqimba entsha ekhethweni), ijometri ayihleleki, futhi uhlobo lwensimu alushintshwa ngemva kokwenziwa.
