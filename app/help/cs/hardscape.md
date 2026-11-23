---
title: Dlažba, zdi a schody
summary: Dlažba se spádem k odvodnění nebo příčným sklonem, vzorem a skladbou; stezky, které kopírují terén; opěrné a volně stojící zdi s odstupňovanými základy; obrubníky; rampy a schody kontrolované vůči jejich limitům; export IFC.
keywords: zpevněné plochy, dlažba, dlaždice, patio, terasa, spády, odvodnění, příčný sklon, rybí kost, běhounová vazba, stezka, chodník, opěrná zeď, zahradní zeď, základ, římsa, obrubník, lemování, rampa, bezbariérovost, schody, stupně, výšky stupňů, šlapky, podesta
from: d34b4466
---

Zpevněné plochy se znovu počítají z terénu pokaždé, takže sledují terén a přepočítají se, když se pohne terén nebo jeho čára. Táhněte jejich rohy v půdorysu jako libovolnou čáru. Otevřete je z {{ui:Zpevněné plochy}} ve skupině Krajina.

## Dlažba

Klikněte na rohy a stiskněte {{key:Enter}}. V Vlastnostech:

- **Úroveň**: prázdné = průměrná výška terénu pod ní.
- **Spády**: vodorovně, **příčný sklon** (% směrem daným stranou), nebo **k odvodnění**: CivilCraft vás požádá, abyste klikli, kam odvodnění vede, a pak každý roh stoupá od odvodnění se spádem. Šipky v půdorysu ukazují spády.
- **Vzor** (mřížka, běhounová vazba, rybí kost) s velikostí jednotky, spárou a úhlem; šířka **Lemování**. Na listu se spáry užší než milimetr vynechají.
- Dlažba je součástí navrhovaného povrchu. Její vrstvy (dlaždice, lože, podklad) jdou do IFC a do množství.

## Stezky

Klikněte podél stezky a stiskněte {{key:Enter}}. Stezka kopíruje terén se svým **Příčným sklonem** na pravou stranu. Stezka strmější než **Nejstrmější povolený sklon** je v půdorysu označena `!` v místě, kde je, a Vlastnosti uvádějí, jak strmá je.

Tam, kde se stezka stýká se silnicí postavenou koridorem, končí na vnějším okraji silnice, ve výšce chodníku nebo krajnice v tom místě, v navrhovaném povrchu i ve 3D pohledu. Stezka, která silnici kříží, se upraví a zobrazí jako dva díly; konec nakreslený až do dvojnásobku šířky stezky před silnicí se prodlouží až k jejímu okraji. Půdorys dál ukazuje stezku tak, jak jste ji nakreslili, a její délka a plocha počítají celou čáru. Viz [Protáhnout silniční koridor](topic:corridor).

## Zdi

Klikněte podél zdi a stiskněte {{key:Enter}}. Zeď je **opěrná** nebo **volně stojící**. Bez **Horní hrany** se po celé délce postaví do své **Výšky** nad terén; zadáním horní hrany ji udržíte ve vodorovné úrovni. Její **základ** leží v nastavené hloubce pod terénem a schodovitě klesá po celých krocích, takže mezi kroky zůstává vodorovný. Vlastnosti uvádějí její délku, výšky, plochu líce a kroky základu; půdorys označuje na každém konci horní a dolní hranu zdi (TW / BW).

:::warning
Opěrná zeď vyšší než 1.2 m (4 ft) je označena: navrhuje ji statik.
:::

## Obrubníky

Klikněte podél obrubníku a stiskněte {{key:Enter}}; nastavte jeho šířku a výšku nad terén.

## Rampy

Klikněte od spodu nahoru a stiskněte {{key:Enter}}. Výšky se vezmou z terénu na každém konci, pokud je nezadáte. Rampa dostane podestu každých 750 mm (2.5 ft) převýšení a je kontrolována vůči **Nejstrmějšímu povolenému** (zpočátku 1:12) a minimální šířce; Vlastnosti uvádějí, jak dlouhá by musela být.

## Schody

Klikněte na přední hranu spodního stupně, potom tam, kde schody dosáhnou nahoru, a stiskněte {{key:Enter}}. Počet výšek stupňů vyplyne z výšky a **Největší výšky stupně**; šlapka z komfortního pravidla 2R + G ≈ 630 mm, nikdy pod **Nejmenší šlapkou**; podesta každých nejvýše **Nejvíce stupňů v rameni**. Vlastnosti uvádějí, zda se schody vejdou mezi oba body, nebo o kolik delší musí být.

:::note
Limity pro rampy a schody jsou označené výchozí hodnoty. Nastavte ty, které vyžaduje váš stavební předpis.
:::

## Mimo CivilCraft

- Více › {{ui:Exportovat IFC krajiny}}: dlažba a stezky jako `IfcPavement`, zdi jako `IfcWall` (opěrné zdi jako RETAININGWALL) s jejich vrstvami, obrubníky jako `IfcKerb`, rampy jako `IfcRamp`, schody jako `IfcStair` s jejich stupni a šlapkami.
- **Odeslat do TakeoffCraft** v rozpisu rostlin přenáší plochy dlažby a objemy vrstev, plochy líců a délky zdí, délky obrubníků a počty schodů.
- List detailů kreslí řez každé zdi, skladbu každé dlažby a každé rameno schodů. Viz [Listy krajiny](topic:landscape-sheets).
