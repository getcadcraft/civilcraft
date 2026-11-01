---
title: Práce v rozvržení s pásem karet a průzkumníkem projektu
summary: Přepněte aplikaci na pás karet nad výkresem, s Vlastnostmi a průzkumníkem projektu vlevo a kartou pro každý otevřený pohled, a kdykoli se vraťte ke klasickému rozvržení.
keywords: rozvržení, pracovní prostor, pás karet, karty pásu, průzkumník projektu, prohlížeč, palety, paleta vlastností, karty pohledů, stavový řádek, panel rychlého přístupu, sbalit pás karet, minimalizovat pás karet, okno pásu karet, klasické rozvržení, změnit rozvržení, přepnout rozvržení, ukotvené
from: c1a6eccc
---

**Pás karet a průzkumník projektu** je jedno ze tří pracovních rozvržení aplikace. Nahoře vede pás karet, Vlastnosti a průzkumník projektu sdílejí levý panel, každý otevřený pohled dostane kartu nad výkresem a dole je stavový řádek. Nástroje jsou vlastní nástroje aplikace: vše, co jde v klasickém rozvržení, jde i zde, a váš výkres, styl nabídek a klávesy zůstávají, jak jsou.

## Zvolení

1. Otevřete {{ui:Nastavení}} (ozubené kolo, nebo {{key:Mod+,}}).
2. Zvolte kartu {{ui:Globální}} a přejděte na {{ui:Rozložení}} › {{ui:Pracovní prostor}}.
3. Zvolte {{ui:Pás karet a průzkumník projektu}}.

Rozvržení se změní okamžitě. Volba platí pro všechny aplikace v tomto prohlížeči: každá se od té chvíle otevírá v něm a je na místě dřív, než se stránka vykreslí, takže klasické rozvržení nikdy neuvidíte jako první.

## Co kde je

- **Záhlaví:** název aplikace, tlačítka rychlého přístupu (otevřít, uložit, zpět, znovu), název otevřeného souboru, {{ui:Co který nástroj zde dělá}} (seznam všech nástrojů s vyhledávacím polem, který říká, které jsou teď připravené a proč ostatní nejsou), celá obrazovka, {{ui:Nápověda}} a {{ui:Nastavení}}. V tomto rozvržení záhlaví nahrazuje pruh aplikace.
- **Pás karet:** nástroje aplikace na kartách, každá karta ve skupinách. {{ui:Soubor}} vlevo otevírá, ukládá a podobně. Některé aplikace přidají vlastní kartu, když pracujete v určitém režimu nebo pracovním prostoru; svítí, dokud platí, a potom zmizí.
- **Pruh voleb:** pod pásem karet, co od vás běžící nástroj potřebuje, nebo co je vybráno.
- **Levý panel:** nahoře {{ui:Vlastnosti}} a pod nimi palety (průzkumník projektu a vlastní obsah panelu) jako karty. Přetažením čáry mezi nimi rozdělíte místo.
- **Karty pohledů:** jedna karta na každý otevřený pohled (list, půdorys, scénu…). Zavřete ji jejím tlačítkem zavřít; soubor zůstane otevřený.
- **Pruh pohledu a stavový řádek:** pod výkresem vlastní ovládací prvky pohledu (měřítko, zoom); dole zprávy aplikace.

Nástroj, který teď nelze spustit, je zašedlý a jeho nápověda říká proč (například „Nejdřív otevřete soubor“, nebo že aplikace tento nástroj zatím nemá). Kliknutím na něj nebo stisknutím {{key:Enter}} si důvod přečtete v okně.

## Pás karet z klávesnice

Je-li karta pásu zvolená, přecházejí mezi kartami {{key:Left}} a {{key:Right}} a {{key:Home}} a {{key:End}} jdou na první a poslední. {{key:Esc}} nejdřív ukončí běžící nástroj, jako v klasickém rozvržení, a všechny zkratky i {{key:Ctrl+Shift+F}} (režimy obrazovky) fungují jako dřív.

## Sbalení pásu karet nebo vlastní okno

- Dvojitým kliknutím na kartu pásu ho sbalíte na samotné karty; kliknutí na kartu pak ukáže její nástroje, dokud nepřejdete jinam. Dalším dvojitým kliknutím ho necháte otevřený. Tlačítko {{ui:Přesunout pás karet}} na pravém konci pásu má také {{ui:Sbalit pás karet}} a {{ui:Ponechat pás karet otevřený}}. Každá aplikace si to pamatuje.
- {{ui:Přesunout pás karet}} › {{ui:Přesunout do nového okna}} dá pás karet do vlastního okna, například na druhý monitor. Klávesy stisknuté tam se dostanou do aplikace. {{ui:Vrátit pás karet zpět}} nebo zavření toho okna ho vrátí domů.

Nastavení panelu nástrojů platí i pro pás karet: {{ui:Nastavení}} › {{ui:Globální}} › {{ui:Panel nástrojů}} › {{ui:Ikony a popisky}}, {{ui:Jen ikony}} (pás pak ukazuje dvě řady malých ikon na skupinu) nebo {{ui:Jen popisky}} a {{ui:Zobrazit názvy skupin (Soubor, Kreslení, …)}}.

## Vaše panely zůstávají vaše

Levý a pravý panel zachovávají vše, co je popsáno v části [Uspořádání panelů](common:arrange-panels): ukotvení, plovoucí panely, připnutí, skrytí, karty, {{ui:Přesunout do nového okna}} a {{ui:Obnovit rozložení}}.

## Návrat ke klasickému rozvržení

Otevřete {{ui:Nastavení}} › {{ui:Globální}} › {{ui:Rozložení}} › {{ui:Pracovní prostor}} a zvolte {{ui:Klasický CadCraft}}. Každý panel nástrojů, karta i panel se vrátí, kde byly.

:::note
Na telefonu nebo v okně širokém 760 pixelů či méně aplikace použije rozvržení pro telefon, ať jste zvolili cokoli. Širší okno vaše rozvržení vrátí.
:::

Chcete-li vyzkoušet jiné uspořádání, viz [rozvržení se sadou nástrojů a informačním panelem](common:layout-toolbox).
