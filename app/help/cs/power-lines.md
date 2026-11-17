---
title: Pracovní prostor Elektrická vedení
summary: Nadzemní vedení a podzemní kabely na vašem staveništi, s vlastními knihovnami, průvěsem a napětím podle vašich zatěžovacích stavů, kontrolou světlých výšek a pevnosti, montážními tabulkami, množstvími, listy a exportem do GIS.
keywords: elektrické vedení, nadzemní vedení, elektřina, distribuce, sloupy, podpěry, vodič, průvěs, napětí, napínání, světlá výška, podzemní kabel, výkop, pracovní prostor, provozovatel sítě
from: 638dd856
---

Pracovní prostor Elektrická vedení umisťuje nadzemní vedení a podzemní kabely na staveniště CivilCraft, které už máte: stejné body měření, stejný terén, stejný soubor projektu.

:::warning
Pomocný nástroj pro návrh. Pracovní prostor počítá průvěs, napětí, světlé výšky a zatížení z **vašich** zatěžovacích stavů a limitů; žádná státní norma v něm není zabudována. Inženýr před jakoukoli stavbou zkontroluje každý výsledek proti normě, která platí.
:::

## Otevření

Zvolte {{ui:Povrch}} › {{ui:Více}} › {{ui:Pracovní prostor Elektrická vedení}}, nebo **Elektrická vedení** v části Pracovní prostor. Panel nástrojů pak ukáže skupinu **Elektrická vedení**; skupiny Návrh a GIS ustoupí stranou. Zvolte **Civil** v části Pracovní prostor, abyste se vrátili. CivilCraft si na tomto počítači pamatuje, který pracovní prostor jste použili naposledy.

Levý panel získá nahoře dvě nové části:

- **Elektrická vedení**: vaše zatěžovací stavy a limity, vedení a kabely v projektu a **Kontroly**, které jsou vždy aktuální. Kliknutím na kontrolu vyberete, čeho se týká.
- **Knihovna**: vaše vlastní vodiče, kabely, podpěry, zařízení a typy výkopů. Viz [Vaše knihovna elektrických vedení](topic:power-line-library).

## Co je ve skupině Elektrická vedení

| Nástroj | Co dělá | Téma |
|---|---|---|
| **Vedení** | Nadzemní vedení: klikněte na každou podpěru | [Kreslení nadzemního vedení](topic:overhead-line) |
| **Podpěra** | Přidá podpěru na rozpětí | [Kreslení nadzemního vedení](topic:overhead-line) |
| **Kabel** | Trasa podzemního kabelu ve výkopu | [Podzemní kabely](topic:underground-cables) |
| **Zařízení** | Skříň, transformátor, spojka, nebo zdroj, ze kterého je síť napájena | [Podzemní kabely](topic:underground-cables) |
| **Překážka** | Něco, co vedení překračuje: silnice, budova, jiné vedení | [Kontroly](topic:power-line-checks) |
| **Profil** | Profil vedení: terén, podpěry a vodič při každém zatěžovacím stavu | [Kreslení nadzemního vedení](topic:overhead-line#the-line-profile) |
| **Více** | Zatěžovací stavy a limity, montážní tabulky, množství, listy a zpráva, GIS, soubory studie | [Průvěs a napětí](topic:sag-and-tension), [Výstupy](topic:power-line-outputs), [Soubory studie](topic:power-line-study-file) |

Vše, co přidáte, je jeden krok zpět, uloží se do souboru projektu a kreslí se v půdorysu na vrstvách pojmenovaných `C-POWR-…`, takže ho přenášejí i exporty DXF, DWG a PDF.
