---
title: WaterCraft: odběry, požární průtok, odstávky a stáří vody
summary: S doplňkem WaterCraft převeďte zákazníky na odběry na svých vodovodních řadech, zkontrolujte průtok dostupný u každého hydrantu, zjistěte, která odstávka řadu nejvíce škodí, a sledujte stáří vody a chlor během dne.
keywords: watercraft, distribuce vody, odběry, zákazníci, součinitel špičky, profil odběru, požární průtok, hydrant, zbytkový tlak, kritičnost, odstávka, úsek s uzávěrem, stáří vody, chlor, zbytek, sledování zdroje, slepý konec, csv, doplněk
from: 76809f01
---

WaterCraft je doplněk, který pracuje se sítí vodovodních řadů, kterou už jste nakreslili nástroji Vodovodní řady. Přidá kartu do pravého panelu se čtyřmi sekcemi.

:::warning
Jen pomocná výpočetní pomůcka. Byla ověřena proti výsledkům počítaným ručně na smyšlených sítích, ne na skutečném modelu vodárenské společnosti. Každý výsledek musí zkontrolovat vodohospodářský inženýr. Zatím nejsou k dispozici posilovací stanice, rozpad druhého řádu ani scénáře.
:::

## Co provedete

- Umístíte zákazníky do sítě jako odběry.
- Najdete hydranty, které nedosahují potřebného průtoku.
- Najdete řady, jejichž výpadek má největší dopad.
- Najdete stáří vody a nízký obsah chloru.

## Postup

1. Otevřete {{ui:Nastavení}} › {{ui:Doplňky}} a zapněte {{ui:WaterCraft (distribuce vody)}}. V pravém panelu se objeví karta {{ui:WaterCraft}}.
2. Nejprve nakreslete nádrž, uzly a potrubí nástroji Vodovodní řady (viz [Vodovodní řady](topic:water-mains)). Bez sítě karta na to upozorní.
3. V části {{ui:Odběry}} vložte jednoho zákazníka na řádek: id, x, y, druh, množství. Zvolte {{ui:Součinitel špičky}} a {{ui:Hodinový profil}} (obytný denní profil, komerční denní profil, rovnoměrný, nebo ponechte profil beze změny). Stiskněte {{ui:Zkontrolovat}}, abyste viděli, kam každý zákazník připadne (nejbližší uzel), a potom {{ui:Vložit do sítě}}. Zpět odběry odebere.
4. V části {{ui:Požární průtok}} nastavte potřebný průtok a zbytkový tlak, zvolte, zda se zbytkový tlak drží {{ui:Pouze u hydrantu}}, nebo {{ui:V celém systému (přísnější)}}, a stiskněte {{ui:Délka}}. Každý hydrant je uveden od nejhoršího, jako vyhovující, nebo nedostatečný.
5. V části {{ui:Které potrubí je nejdůležitější}} zvolte {{ui:jedno potrubí najednou}}, nebo {{ui:jeden úsek s uzávěrem najednou}}, a stiskněte {{ui:Délka}}. Každá odstávka ukazuje odpojený odběr, odpojené uzly, uzly, které nově klesly pod minimální tlak, a nejnižší zbývající tlak.
6. V části {{ui:Stáří vody a chlor}} zvolte, co sledovat (stáří vody, chlor, nebo sledování zdroje), nastavte počet hodin výpočtu a limity, které chcete, a stiskněte {{ui:Délka}}. Uzly mimo vaše limity se vypíšou.
7. Pod kteroukoli tabulkou stiskněte {{ui:Uložit jako CSV}}, abyste ji uložili.

## Poznámky

- Potřebný požární průtok a spotřeba na domácnost nebo na akr jsou výchozí hodnoty, ne normy. Použijte vlastní údaje své vodárenské společnosti.
- Potrubí, které je částečně zakryto uzávěrem, se počítá celé jako uzavřené, takže zobrazená odstávka je o něco horší než skutečná.
- Část o kvalitě vody nechte běžet dost dlouho, aby se denní profil zopakoval, než přečtete poslední den.
- {{ui:Zastavit}} ukončí dlouhý výpočet předčasně; seznam pak ukáže jen to, co bylo provedeno.
- Vaše síť zůstane v tomto projektu a na tomto počítači. Nic se nikam neodesílá.
