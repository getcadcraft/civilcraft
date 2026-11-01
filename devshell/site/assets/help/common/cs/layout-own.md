---
title: Uspořádání vlastního rozvržení a ukládání nastavení
summary: Zvolte, který panel ukazuje průzkumník projektu, Vlastnosti nebo vlastní obsah panelu, kam patří sada nástrojů a co obsahují pruhy, uložte to jako vlastní rozvržení a ukládejte celá nastavení pod názvem, mezi nimiž můžete přepínat.
keywords: rozvržení, pracovní prostor, uspořádat, přizpůsobit, moje rozvržení, vlastní rozvržení, panely, editory, průzkumník projektu, vlastnosti, sada nástrojů, rychlý pruh, informační panel, pracovní prostředí, nastavení, profil, uložit nastavení, přepnout nastavení, exportovat nastavení, importovat nastavení, ccenv
from: 2a71af43
---

Kromě tří vestavěných rozvržení si můžete uspořádat vlastní a uložit celé své nastavení pod názvem, abyste se k němu mohli vrátit jedním krokem.

## Uspořádání vlastního rozvržení

1. Otevřete {{ui:Nastavení}} (ozubené kolo, nebo {{key:Mod+,}}), zvolte {{ui:Globální}} a potom {{ui:Rozložení}}.
2. Zvolte {{ui:Uspořádat vlastní rozvržení…}}. Dialog vychází z rozvržení, které právě používáte.
3. Dejte mu název a potom zvolte:
   - **Nad výkresem:** panel nástrojů aplikace, pás karet nebo nic; záhlaví; informační panel a ovládací prvky, které obsahuje.
   - **Vedle výkresu:** sadu nástrojů vlevo, vpravo nebo vůbec, s {{ui:Moje nástroje}} nebo bez nich; který panel obsahuje palety, který je nahoře (například průzkumník projektu nebo Vlastnosti) a které jsou pod ním jako karty.
   - **Oblast výkresu:** karty pohledů, rychlý pruh a pruh pohledu s ovládacími prvky, které zaškrtnete, paleta úprav, stavový řádek.
   - **Vzhled:** velikost, obrysy tlačítek a styl karet.
4. Zvolte {{ui:Použít toto rozvržení}}. Aplikace se na něj okamžitě přepne a použije ho i každá další aplikace, která rozvržení má.

Nabízí se jen to, co daná aplikace má. Vaše rozvržení je uvedeno v části {{ui:Z doplňků a souborů}}; {{ui:Exportovat toto rozvržení}} ho uloží jako soubor, který můžete předat kolegovi, a tlačítko odebrat ho odstraní. Panely, které vyplňuje, lze stále ukotvit, nechat plovoucí a přesunout do vlastních oken, jako v části [Uspořádání panelů](common:arrange-panels).

## Uložení nastavení jako pracovního prostředí

Pracovní prostředí je celé vaše nastavení pro každou aplikaci v tomto prohlížeči: rozvržení, styl nabídek a vaše klávesy, styl panelu nástrojů, panely a jejich velikosti a {{ui:Moje nástroje}}. Motiv a jazyk jeho součástí nejsou.

- **Uložit:** napište název pod {{ui:Pracovní prostředí}} a zvolte {{ui:Uložit moje nastavení}}. Uložením pod existujícím názvem se dané nastavení nahradí.
- **Přepnout:** vyberte nastavení v seznamu a zvolte {{ui:Přepnout na něj}}. Aplikace se znovu načte s tímto nastavením; máte-li neuloženou práci, aplikace se nejdřív zeptá, stejně jako při každém opětovném načtení.
- **Sdílet:** {{ui:Export}} uloží vybrané nastavení jako soubor `.ccenv.json`; {{ui:Importovat nastavení…}} přidá nastavení ze souboru. Soubor vždy nastavuje jen tyto volby, nic jiného.
- **Odebrat:** vyberte nastavení a zvolte {{ui:Odebrat}}.

Můžete mít až dvanáct nastavení.

Chcete-li nejdřív vyzkoušet vestavěná uspořádání, viz [rozvržení se sadou nástrojů a informačním panelem](common:layout-toolbox) a [rozvržení s pásem karet a průzkumníkem projektu](common:layout-ribbon).
