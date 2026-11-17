---
title: Podzemní kabely
summary: Trasy kabelů v rýhách mezi podpěrami a zařízeními, krytí a křížení, spojky podle délky bubnu a množství rýh a kabelů.
keywords: podzemní kabel, trasa kabelu, rýha, chránička, krytí, křížení, křížení potrubí, spojka, buben, rozvaděč, transformátor, zdroj, úbytek napětí
from: adfd2717
---

## Nakreslete trasu kabelu

1. Nejprve umístěte zařízení, pokud kabel končí u rozvaděče, transformátoru nebo spojky: {{ui:Zařízení}}, pak klikněte.
2. Klikněte na {{ui:Kabel}} a klikněte na trasu; začátek a konec na podpěře nebo na zařízení se k nim připojí. {{key:Enter}} dokončí.

Ve Vlastnostech vyberte **Kabel**, **Typ rýhy**, kolik **kabelů vedle sebe** a **rezervu** (%). Trasa ukazuje svou délku, kde začíná a končí a jaký proud nese.

## Co se kontroluje

- **Krytí**: horní hrana kabelu musí být pod terénem podél celé trasy, proti krytí typu rýhy (nebo nejmenšímu krytí z pravidel).
- **Křížení**: kde trasa kříží potrubí CivilCraftu nebo jiný kabel, mezera mezi nimi se porovnává s pravidlem vůle: vlastní **Vůle při křížení** trasy (ve Vlastnostech), pokud ji zvolíte, jinak pravidlo **Křížení pod zemí** v sadě pravidel (ukázkové sady používají *Křížení pod zemí*, 0,3 m), jinak mezera ke službám podle typu rýhy. Dva křížící se kabely si ponechají větší z obou hodnot. Překřížené nadzemní vedení je uvedeno pro informaci a kabel se zobrazí v profilu tohoto vedení.
- **Spojky**: jedna na každou délku bubnu kabelu (s rezervou), pokud položka kabelu udává délku bubnu.

## Zařízení

Zařízení má položku knihovny, **zatížení** (kW) s jeho **účiníkem**, a může být **zdrojem**: síť je odtud napájena. Napětí zdroje pochází z jeho položky knihovny, nebo z vedení či kabelu, který napájí.

## Množství

{{ui:Více}} › {{ui:Množství…}} počítá kabel (délka trasy × (1 + rezerva) × kabelů vedle sebe + převýšení na každém konci), rýhy podle typu, objemy výkopu, lože a zásypu, chráničky a spojky, včetně vodičů, podpěr a zařízení nadzemních vedení.
