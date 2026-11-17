---
title: Rozvržení parkoviště
summary: Rozmístěte stání, jízdní pruhy, místa pro invalidy a dodávky a ostrůvky uvnitř obrysu, zprofilujte terén se spády k vpustím oproti stávajícímu terénu a poté zpevněte a osázejte. Také dostupné asistentovi.
keywords: parkoviště, stání, jízdní pruh, bezbariérové, ada, dodávka, ostrůvek, vpusť, spád, sklon, výkop, násyp, zpevnění, dlažba, výsadba, stromy, terén, mračno bodů, mcp, asistent
from: 06c14da9
---

Vejděte parkoviště do parcely, stavební plochy nebo uzavřené hranové čáry a získejte počty, úpravu terénu a zpevnění v jednom kroku.

## Rozvržení

1. Vyberte na půdorysu parcelu, stavební plochu nebo uzavřenou hranovou čáru.
2. Otevřete **Povrch, Více, Parkoviště...**
3. Zvolte pravidla, úhel stání (90, 75, 60, 45, 30 stupňů nebo rovnoběžně) a jednosměrné nebo obousměrné jízdní pruhy. Velikosti stání, pruhů a ostrůvků vycházejí z tabulky a každou lze přepsat.
4. Zvolte **Rozmístit**.

Řady vedou podél hrany obrysu, která dá nejvíce stání (nebo pod úhlem, který zadáte). Stání se počítá jen tehdy, leží-li celé uvnitř obrysu. Kde je místo jen pro jednu řadu a pruh, přidá se jednostranný pás. Okno vypisuje prostory, místa pro invalidy a dodávky, ostrůvky, vpusti a plochu na prostor. Půdorys zobrazuje stání, místa pro invalidy se šrafovanými přístupovými pruhy, ostrůvky, osy jízdních pruhů a vpusti na vlastních vrstvách (C-PARK-...), takže se dostanou do PDF, DXF a DWG.

## Místa pro invalidy

Podle pravidel USA počet vychází z tabulky 208.2 normy ADA 2010 pro zadané prostory (jeden z šesti, zaokrouhleno nahoru, je místo pro dodávku), umístěné nejblíže prvnímu rohu obrysu (vjezdu), každé s přístupovým pruhem; dvě sdílejí jeden. Stání užší než přístupová šířka nebo spád strmější než 1:48 u míst pro invalidy se zobrazí jako problém. **Tato čísla byla přepsána z normy podle paměti a nebyla ověřena proti vytištěné normě.** Typické velikosti stání a pruhů pocházejí z příruček pro navrhování parkovišť a také nejsou ověřeny. Před použitím je zkontrolujte, stejně jako místní předpisy. Zvolte **Vlastní**, chcete-li zadat vlastní počet míst pro invalidy.

## Spády k vpustím, výkop a násyp

Pokud to nevypnete, parkoviště se stane plochou úpravy terénu v pracovním prostoru Krajina. Vpusti se umístí na osy jízdních pruhů přibližně každých 100 stop (30 m); povrch stoupá od každé vpusti se spádem, který zadáte (zpočátku 1.5 procenta), takže každý bod klesá k nejbližší vpusti. Úroveň se zvolí tak, aby se výkop a násyp parkoviště vyrovnaly se stávajícím terénem. Stávající terén je stávající povrch projektu, který může pocházet z bodů zaměření, LandXML, mračna bodů z lidaru nebo skenu převedeného na povrch, nebo z vrstevnic. Okno ukazuje odhad výkopu a násypu; přesnou hodnotu ukážou později objemy projektu. Plocha úpravy terénu si ponechá svou hranu na stávajícím terénu, takže tam, kde se nový povrch u hrany liší od terénu, vznikne schod, a okno říká, jak velký.

## Zpevnění a výsadba

Celý obrys dostane zpevnění dlažbou (vzor kladení na běh, který lze změnit v Krajina, Zpevněné plochy) a každý ostrůvek dostane záhon keřů a, je-li dost široký, strom ze seznamu rostlin. Vše je potom běžný objekt Krajiny: upravte jej, nebo zvolte **Rozmístit znovu**, aby nahradil to, co parkoviště vytvořilo. Odstranění parkoviště odstraní, co vytvořilo.

## Z asistenta

Stejné parkoviště lze vyžádat přes MCP: `parking_layout` ukáže náhled, `parking_build` zapíše a `parking_remove` parkoviště odstraní. Zadejte jménem parcely, nebo pošlete obrys.

## Co ještě není hotové

Zda jízdní pruhy vedou do ulice, se nekontroluje. Zpevnění pokrývá celý obrys, takže jeho plocha zahrnuje ostrůvky. Volby materiálu zpevnění z knihovny a typ stání z knihovny ještě nejsou hotové; vzor zpevnění je ten ze Zpevněných ploch. Pravidla pro jiné země nejsou zpracována.
