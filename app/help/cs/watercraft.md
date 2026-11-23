---
title: WaterCraft: odběry, požární průtok, výpadky a stáří vody
summary: S doplňkem WaterCraft proměňte zákazníky v odběry na vašich vodovodních řadech, zkontrolujte průtok dostupný u každého hydrantu, zjistěte, který výpadek řadu je nejhorší, a sledujte stáří vody a chlor během dne.
keywords: watercraft, rozvod vody, odběry, zákazníci, součinitel špičky, vzorec odběru, požární průtok, hydrant, zbytkový tlak, kritičnost, výpadek, úsek s armaturou, stáří vody, chlor, zbytkový, sledování zdroje, slepý konec, csv, doplněk
from: 066fb17a
---

WaterCraft je doplněk, který pracuje se sítí vody, kterou jste už nakreslili nástroji Vodovodní řady. Přidá na pravý panel kartu se čtyřmi částmi.

:::warning
Jen pomůcka pro výpočty. Ověřena byla proti ručním výpočtům na smyšlených sítích, ne na skutečném modelu provozovatele. Každý výsledek musí zkontrolovat vodohospodářský inženýr. Scénáře, pravidla řízení, armatury a terénní měření mají vlastní témata, "Scénáře" a "Studie", v nápovědě doplňku WaterCraft.
:::

## Co budete dělat

- Zařaďte zákazníky do sítě jako odběry.
- Najděte hydranty, které nedosahují požadovaného průtoku.
- Najděte řady, jejichž výpadek má největší dopad.
- Najděte starou vodu a nízký obsah chloru.

## Postup

1. Otevřete {{ui:Nastavení}} › {{ui:Doplňky}} a zapněte {{ui:WaterCraft (rozvod vody)}}. Na pravém panelu se objeví karta {{ui:WaterCraft}}.
2. Nejdřív nakreslete nádrž, uzly a potrubí nástroji Vodovodní řady (viz [Vodovodní řady](topic:water-mains)). Bez sítě karta vám to řekne.
3. V části {{ui:Odběry}} vložte jednoho zákazníka na řádek: id, x, y, druh, množství. Zvolte {{ui:Součinitel špičky}} a {{ui:Hodinový vzorec}} (obytný den, obchodní den, rovnoměrný, nebo ponechat vzorec beze změny). Stiskněte {{ui:Zkontrolovat}}, abyste viděli, kde každý zákazník leží (nejbližší uzel), potom {{ui:Vložit do sítě}}. Zpět odebere odběry.
4. V části {{ui:Požární průtok}} nastavte potřebný průtok a zbytkový tlak, zvolte, zda se zbytkový tlak drží {{ui:Pouze u hydrantu}}, nebo {{ui:V celém systému (přísnější)}}, a stiskněte {{ui:Délka}}. Každý hydrant je uveden od nejhoršího, jako vyhovující, nebo nedostatečný.
5. V části {{ui:Které potrubí je nejdůležitější}} zvolte {{ui:jedno potrubí najednou}}, nebo {{ui:jeden úsek s armaturou najednou}}, a stiskněte {{ui:Délka}}. Každý výpadek ukáže odříznutý odběr, odříznuté uzly, uzly nově pod minimálním tlakem a nejnižší zbylý tlak.
6. V části {{ui:Stáří vody a chlor}} zvolte, co sledovat (stáří vody, chlor, nebo sledování zdroje), nastavte hodiny běhu a požadované limity a stiskněte {{ui:Délka}}. Uzly mimo vaše limity jsou uvedeny v seznamu.
7. Pod každou tabulkou stiskněte {{ui:Uložit jako CSV}}, abyste ji uchovali.

## Poznámky

- Potřebný požární průtok a spotřeba na domácnost nebo na akr jsou výchozí hodnoty, ne normy. Použijte vlastní údaje vašeho provozovatele.
- Potrubí částečně přerušené armaturou se uzavře celé, takže zobrazený výpadek je mírně horší než skutečný.
- Nechte část kvality vody běžet dost dlouho, aby se denní vzorec zopakoval, dříve než čtete poslední den.
- {{ui:Zastavit}} ukončí dlouhý běh předčasně; seznam pak ukáže jen to, co bylo provedeno.
- Vaše síť zůstává v tomto projektu a na tomto počítači. Nic se nikam neodesílá.
