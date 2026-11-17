---
title: Vytvořit protokol vytyčení
summary: Vypište kolíky podél osy trasy na staničení a odsazení, nebo zaměřené body poblíž ní, s staničením, odsazením, Y a X, návrhovou a skutečnou výškou terénu a výkopem nebo násypem, a protokol uložte jako CSV nebo PDF.
keywords: vytyčení, vytyčovací kolíky, protokol kolíků, výkopový list, spádový list, staničení, odsazení, výkop, násyp, vytyčení stavby, vytyčení při výstavbě, skutečné provedení
from: d8a4e9f1
---

Vyberte osu trasy a klikněte na **Protokol vytyčení** ve svých **Vlastnostech**.

## Kolíky na staničení a odsazení

1. **Od** a **do**: staničení, kde se mají vytyčit kolíky (1+50 nebo 150).
2. **Každých**: interval. Kolíky jsou na každém jeho násobku, na obou koncích a (je-li zaškrtnuto políčko) tam, kde začínají a končí oblouky osy.
3. **Odsazení**: vlevo a vpravo od osy při pohledu po staničení: `12 L, 0, 12 R`, `L12 CL R12` nebo `-12, 0, 12` (vlevo je minus). Osa s koridorem začíná svými okraji vozovky a krajnic.
4. **Číslovat od** a **s předponou** pojmenují kolíky: 1, 2, 3, nebo S101, S102.

## Zaměřené body poblíž osy

Zvolte **zaměřené body poblíž osy** a určete, jak blízko. Každý bod v této vzdálenosti dostane své staničení a odsazení, návrh na tom místě a vlastní výšku jako terén: kontrolu bodů vytyčených nebo změřených jako skutečné provedení.

## Co protokol uvádí

| Sloupec | Co to je |
|---|---|
| Bod | Název kolíku, nebo číslo zaměřeného bodu |
| Staničení, Odsazení | Kde je podél osy: L vlevo, R vpravo |
| Y, X | Jeho souřadnice |
| Návrhová výška | Povrch upraveného koridoru na tomto místě (od čáry hranice výkopu k čáře hranice výkopu), jinak návrhový podélný profil na ose |
| Výška terénu | Stávající povrch na tomto místě, nebo vlastní výška zaměřeného bodu |
| Výkop/násyp | C, když je terén nad návrhem (odtěžit), F, když je pod ním (dosypat), na setiny |

Kolík bez návrhové výšky (mimo koridor, nebo na ose bez návrhu mimo střed) nemá výkop ani násyp; dialog uvede, kolik jich je.

## Uložení

- **CSV**: řádek s názvem, pak výše uvedené sloupce, plus výkop nebo násyp jako znaménkové číslo (terén minus návrh) pro tabulkové procesory a sběrače dat.
- **PDF**: tabulkové stránky na formátu papíru, který vyberete, jeden kolík na řádek, výkopy oranžově a násypy zeleně, s titulním pruhem jako u ostatních listů.

:::note
Kolíky jsou spočítány z návrhu v projektu. Před jakoukoli stavbou je zkontrolujte proti schváleným plánům.
:::
