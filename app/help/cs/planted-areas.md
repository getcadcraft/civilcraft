---
title: Osázené plochy: trávníky, záhony, louky, půdopokryv
summary: Osázené plochy jako objekty se skladbou vrstev (ornice, mulč, textilie, lemování), směsí rostlin a volitelnou konečnou úrovní; samy se ořezávají kolem dlažby, zdí a schodů a udávají čistou plochu, objemy, délku lemování a počty rostlin.
keywords: osázená plocha, trávník, drn, záhon, lem, louka, půdopokryv, ornice, mulč, textilie, textilie proti plevelu, lemování, konečná úroveň, výměry, čistá plocha, oříznutí
from: 2617ec0e
---

{{ui:Plochy}} ve skupině Krajina kreslí **trávník**, **osázený záhon**, **louku** nebo **půdopokryv**: klikněte na rohy a stiskněte {{key:Enter}}. Záhon nebo půdopokryv se na začátku vyplní rostlinou vybranou v sekci Rostliny; trávník nemá rostliny.

## Co obsahuje

- **Skladba vrstev**: hloubka ornice, hloubka mulče, textilie proti plevelu a lemování (ocel, dřevo, cihla, beton, plast nebo žádné). Typické hloubky jsou předvyplněny; nastavte vlastní.
- **Směs**: druhy (s kultivarem a velikostí) a podíly, vyplněné jako záhon podle rozestupu nebo hustoty.
- **Konečná úroveň**: pokud ji necháte prázdnou, plocha sleduje terén; zadáte-li úroveň, plocha se stane modifikátorem terénu (viz [Modifikátory terénu a úrovně](topic:ground-modifiers)).
- **Oříznout kolem dlažby, zdí a schodů** (ve výchozím nastavení zapnuto): kde dlažba, cesta, zeď, obrubník, rampa nebo schody zasahují do plochy, je tato část vynechána. Pod nimi ani blíže než půl rozestupu od jejich hrany se žádná rostlina nesází.

## Výměry

**Vlastnosti** zobrazují **čistou plochu** (po oříznutí, přesně změřenou), obvod, **délku lemování** (jen podél vlastního okraje plochy, ne tam, kde ji přeruší tvrdé povrchy), objemy ornice a mulče, plochu textilie a počty rostlin u každého řádku směsi. Rozpis rostlin počítá rostliny plochy; soubor výměr pro TakeoffCraft obsahuje plochu, ornici, mulč, textilii a lemování; krajinné IFC zapíše IfcGeographicElement se sadou množství.
