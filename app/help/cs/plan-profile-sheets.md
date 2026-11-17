---
title: Listy půdorysu a podélného profilu
summary: Vykreslete osu trasy jako sadu listů půdorysu a podélného profilu v jednom PDF se spojovacími čarami mezi nimi.
keywords: půdorys a profil, listy, vykreslení, pdf, spojovací čára, zpracování půdorysů, silniční výkresy, vykreslení profilu, svislé zveličení, sada listů
from: 34b4ec78
---

Listy půdorysu a podélného profilu se obvykle používají pro silniční výkresy: každý list zobrazuje jeden úsek silnice dvakrát, půdorys nahoře a profil dole, ve stejném vodorovném měřítku, takže staničení je na obou na stejném místě.

## Vytvoření listů

1. Vyberte osu trasy. Ve **Vlastnostech** klikněte na {{ui:Listy půdorysu a podélného profilu}}.
2. Vyberte **Papír**, **Měřítko půdorysu** a **Zveličení profilu** (kolikrát je profil vykreslen vyšší, než je dlouhý; zpočátku 10×). Dialog uvádí, kolik listů to vytvoří a kolik osy trasy každý z nich ukáže.
3. Chcete-li vykreslit jen část osy trasy, změňte **Od staničení** a **Do staničení**.
4. Klikněte na {{ui:Stáhnout PDF}}. PDF má jednu stránku na list.

## Co je na listu

| Část | Co zobrazuje |
|---|---|
| Půdorys | Vše z půdorysu (vrstevnice, geodetické body, osa trasy a její staničení, koridory, plošky, hranové čáry, potrubí, vzorkovací čáry) natočené tak, aby tento úsek procházel přes list, se šipkou severu natočenou podle toho |
| Spojovací čáry | Čerchovaná čára kolmá k ose trasy na každém konci, který pokračuje na jiném listu, s popiskem "Spojovací čára sta 5+50.00, viz list 2" |
| Profil | Stávající terén (čárkovaně), návrhový profil (červeně), sklon každé tečny a PVI, kóta, L a K každého vertikálního oblouku; staničení podél spodního okraje, kóty na obou stranách |
| Razítko | Název projektu, osa trasy a její rozsah staničení, "List 1 z 3", vodorovné a svislé měřítko a zveličení |

Délka úseku na list je taková, jakou okno půdorysu při daném měřítku dovolí, zaokrouhlená dolů na celých 50 ft (20 m) u dlouhých úseků nebo na celých 10 ft (5 m) u krátkých.

:::note
Pokud se kóty profilu při zvoleném zveličení nevejdou, CivilCraft vykreslí všechny listy v největším z 10×, 5×, 4×, 2× a 1×, které se vejde, a stavový řádek to oznámí. Zakřivená osa trasy se natočí podle směru od začátku ke konci každého úseku, takže silnice může na listu mírně stoupat nebo klesat.
:::
