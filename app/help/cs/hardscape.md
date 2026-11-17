---
title: Dlažba, zdi a schody
summary: Dlažba se spády k vpusti nebo s příčným spádem, vzor a její skladba; cesty, které sledují terén; opěrné a volně stojící zdi se schodovitými základy; obrubníky; rampy a schody kontrolované vůči jejich limitům; export do IFC.
keywords: zpevněné plochy, dlažba, dlaždice, terasa, spády, odvodnění, příčný spád, rybí kost, běžná vazba, cesta, chodník, opěrná zeď, zahradní zeď, základ, římsa, obrubník, lemování, rampa, přístupnost, schody, podstupnice, stupnice, podesta
from: 51475877
---

Zpevněné plochy se pokaždé znovu počítají z terénu, takže sledují terén a přegenerují se, když se terén nebo jeho čára posune. Přetáhněte jejich rohy v půdorysu jako jakoukoli čáru. Otevřete je z {{ui:Zpevněné plochy}} ve skupině Krajina.

## Dlažba

Klikněte na rohy a stiskněte {{key:Enter}}. Ve Vlastnostech:

- **Úroveň**: prázdné = střední terén pod ní.
- **Spády**: úroveň, **příčný spád** (% ve směru) nebo **ke vpusti**: CivilCraft vás vyzve, abyste klikli, kam vpusť patří, a pak každý roh stoupá od vpusti podle spádu. Šipky v půdorysu ukazují spády.
- **Vzor** (mřížka, běžná vazba, rybí kost) s velikostí jednotky, spárou a úhlem; **Lemování** šířka. Na listu se spáry užší než jeden milimetr vynechávají.
- Dlažba je součástí navrhovaného povrchu. Její vrstvy (dlaždice, lože, podklad) jdou do IFC a do množství.

## Cesty

Klikněte podél cesty a stiskněte {{key:Enter}}. Cesta sleduje terén, s **Příčným spádem** na pravé straně. Cesta strmější než **Nejstrmější povolený** je na půdorysu označena `!` v místě, kde je, a Vlastnosti říkají, jak strmá je.

## Zdi

Klikněte podél zdi a stiskněte {{key:Enter}}. Zeď je **opěrná**, nebo **volně stojící**. Bez **Horní** výšky stojí do výšky **Výška** nad terénem po celé délce; zadáte-li horní výšku, drží ji vodorovně. Její **základ** sedí v nastavené hloubce pod terénem a klesá po celých krocích, takže mezi nimi zůstává vodorovný. Vlastnosti udávají délku, výšky, plochu líce a kroky základu; půdorys označuje horní a spodní hranu zdi (TW / BW) na každém konci.

:::warning
Opěrná zeď vyšší než 1.2 m (4 ft) je označena: navrhuje ji inženýr.
:::

## Obrubníky

Klikněte podél obrubníku a stiskněte {{key:Enter}}; nastavte jeho šířku a výšku výstupku.

## Rampy

Klikněte od spodku k vrcholu a stiskněte {{key:Enter}}. Výšky se vezmou z terénu na každém konci, pokud je nezadáte. Rampa dostane podestu každých 750 mm (2.5 ft) stoupání a je kontrolována vůči **Nejstrmější povolený** (zpočátku 1:12) a minimální šířce; Vlastnosti říkají, jak dlouhá by musela být.

## Schody

Klikněte na přední hranu spodního stupně, pak tam, kde schody dosáhnou vrchu, a stiskněte {{key:Enter}}. Počet podstupnic vyplyne z výšky a **Největší podstupnice**; šířka stupně z pravidla pohodlí 2R + G ≈ 630 mm, nikdy pod **Nejmenší šířka stupně**; podesta po každých **Nejvíce podstupnic na rameno**. Vlastnosti říkají, zda se schody vejdou mezi oba body, nebo o kolik delší by musely být.

:::note
Limity pro rampy a schody jsou označeny jako výchozí hodnoty. Nastavte ty, které vyžaduje váš stavební předpis.
:::

## Mimo CivilCraft

- Více › {{ui:Exportovat IFC krajiny}}: dlažba a cesty jako `IfcPavement`, zdi jako `IfcWall` (opěrné zdi jako RETAININGWALL) s jejich vrstvami, obrubníky jako `IfcKerb`, rampy jako `IfcRamp`, schody jako `IfcStair` s podstupnicemi a stupnicemi.
- **Odeslat do TakeoffCraft** v soupisu rostlin přenese plochy dlažby a objemy vrstev, plochy líců zdí a jejich délky, délky obrubníků a počty schodů.
- Výkres detailů nakreslí řez každou zdí, skladbu každé dlažby a každé rameno schodů. Viz [Výkresy krajiny](topic:landscape-sheets).
