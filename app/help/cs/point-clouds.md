---
title: Mračna bodů z dronu nebo skeneru
summary: S doplňkem Mračna bodů otevřete soubor LAS nebo LAZ s miliony bodů, prohlédnete si ho celý, vyčistíte, roztřídíte na terén, vegetaci a budovy a z něj sestavíte terén, vrstevnice a objemy.
keywords: mračno bodů, las, laz, dron, fotogrammetrie, recap, lidar, sken, terén, klasifikace, šum, hromada, objem, řez a násyp, vrstevnice, lomová hrana, eye-dome, ortofoto, ortho, promítnutí, vrstva mapy, export las, export laz, komprese
from: e4a4901f
---

Většina lidí tuto funkci nikdy nepotřebuje, proto je to doplněk. Zapněte {{ui:Mračna bodů}} v části Nastavení › Doplňky; na pravém panelu se pak objeví karta {{ui:Mračna bodů}}. Soubor se načte ve vašem prohlížeči a rozdělí se na dlaždice, které se uloží do úložiště prohlížeče (nebo do složky, kterou vyberete). **Nic se nenahrává.**

:::warning
Vše, co tato karta uvádí, je číslo z vašich dat, nikoli certifikát. Bylo otestováno na smyšleném staveništi, zatím ne na skutečném dronovém snímkování: první výsledky berte s rozvahou a dejte nám vědět, co zjistíte. O tom, jakou hodnotu mají terén, vrstevnice a objemy, rozhoduje autorizovaný inženýr.
:::

## Otevření mračna

V části {{ui:Otevřít mračno}} vyberte soubor LAS nebo LAZ. Karta uvede, kolik bodů soubor obsahuje, jeho souřadnicový systém a jednotky a kolik místa sestavení potřebuje; stiskněte {{ui:Sestavit mračno}}. Sestavení lze zastavit a pokračovat v něm tlačítkem {{ui:Pokračovat}} (vyberte znovu stejný soubor). Soubor se nikdy nemění. Soubor se 100 miliony bodů se na pracovní stanici sestaví během minut a potřebuje zhruba tolik místa, kolik má sám soubor.

V části {{ui:Mračna v tomto počítači}} mračno otevřete nebo odeberete. {{ui:Ukládat mračna do složky…}} (Chrome, Edge a aplikace Studio) ukládá dlaždice do složky, kterou vyberete, například do složky CadCraft pro mračna v Dokumentech, takže mračno o velikosti 10 GB se nemusí vejít do úložiště prohlížeče. Mračna sestavená dříve zůstanou tam, kde byla sestavena. Prohlížeč po restartu požádá o oprávnění znovu: stiskněte {{ui:Znovu použít složku …}}.

## Prohlížení

{{ui:Zobrazit v 3D}} vykreslí mračno z hrubých dlaždic a při přiblížení je zpřesní, nikdy však nevykreslí více než {{ui:Nejvíce vykreslených bodů}} najednou (2.5 milionu; 500 tisíc v telefonu). Barvu lze volit podle vlastní barvy souboru, výšky, třídy, intenzity nebo {{ui:Oprava}}. {{ui:Osvětlení hloubky}} stíní hrany podle hloubky, takže tvar je čitelný i bez normál (v telefonu vypnuto). {{ui:Body se zmenšují se vzdáleností}} zmenšuje vzdálené body a zvětšuje blízké; {{ui:Velikost bodu}} nastaví velikost. Půdorys zobrazuje mračno jako rastr pod vaším výkresem a **při přiblížení** se zpřesní na zvolenou část.

## Čištění

V části {{ui:Čištění}} nakreslete v půdorysu lasso, obdélník nebo mnohoúhelník (nebo ve 3D z pohledu shora: ve 3D se obrys promítá svisle dolů, takže je přesný jen shora). Karta ukáže, kolik bodů je uvnitř, **před** použitím: {{ui:Smazat tyto body}}, {{ui:Změnit jejich třídu}}, {{ui:Obnovit smazané body}} nebo {{ui:Oříznout na tuto hranici}}. {{ui:Zpět}} a {{ui:Znovu}} procházejí záznam úprav; soubor samotný se nikdy nemění. {{ui:Filtr šumu…}} označí bloudící body jako nízké body (třída 7) nebo vysoký šum (třída 18).

## Třídění

{{ui:Najít terén}} pracuje po dlaždicích a označí terén (třída 2) a nízké body; tolerance je 0.15 m, nebo 0.08 m při přepínači pro geodetickou přesnost. Hlásí nesouhlasící švy mezi dlaždicemi. {{ui:Klasifikovat vegetaci a budovy}} pak označí nízkou, střední a vysokou vegetaci a budovy podle výšky nad terénem a podle toho, jak rovné je okolí. Strojové učení se nepoužívá, takže zastřešená bouda pod stromy může být označena špatně: zkontrolujte to.

## Terén, vrstevnice, lomové hrany

{{ui:Sestavit terén}} vytvoří stávající terén z bodů terénu a přidá ho do projektu stejně jako import LAS (jeden krok zpět). Potom body s ním porovná: průměr, RMS, 95. percentil, podíl v toleranci a deset míst, která se nejvíce liší, každé s tlačítkem {{ui:Přejít tam}}. Barva podle {{ui:Oprava}} ukazuje, kde se terén a mračno neshodují.

**Lomovou hranu** (obrubník, příkop nebo horní hranu svahu) vybíráte na mračnu: {{ui:Vybrat lomovou hranu v mračnu}} ve 3D pohledu vezme při každém kliknutí nejbližší vykreslený bod a {{ui:Vybrat lomovou hranu v půdorysu}} vezme pod každým kliknutím nejbližší bod mračna (nejdříve terén). Dvojklikem nebo Enter čáru ukončíte. Další {{ui:Sestavit terén}} ji použije. {{ui:Zobrazit vrstevnice}} nakreslí vrstevnice nad mračnem v malém obrázku a nastaví interval projektu.

## Objemy

{{ui:Objem hromady…}} spočítá objem povrchu nad základnou uvnitř hranice, kterou nakreslíte. Hranici nakreslete na rovném terénu kolem hromady a zvolte základnu: nejnižší bod hranice, rovinu, hladkou zakřivenou základnu, povrch procházející hranicí, nebo úroveň, kterou napíšete. Na svažitém nebo zakřiveném terénu použijte rovinu nebo zakřivenou základnu, protože nejnižší bod by vyšel příliš vysoko. Body hranice, které stojí nad ostatními (strom na hranici), se ze základny vynechají. {{ui:Mezi nálety}} dá řez a násyp mezi dvěma mračny. Obojí lze uložit jako CSV.

## Ortofotomozaika

V části {{ui:Ortofotomozaika (snímek shora)}} vyberte ortofotomozaiku z dronu spolu se světovým souborem a `.prj`, pokud je máte: GeoTIFF, PNG nebo JPEG. Stane se **vrstvou mapy** projektu, takže ji půdorys zobrazí pod vaším výkresem, a 3D pohled (barva {{ui:Mapa}}) ji promítne na sestavený terén, proto nejdřív stiskněte {{ui:Sestavit terén}}. Karta uvede, jakou část mračna snímek pokrývá, a varuje, pokud nepokrývá žádnou část. Obvyklou příčinou je jiný souřadnicový systém, takže přidejte i soubor `.prj`. Bez souboru `.prj` se program zeptá, kde souřadnice jsou. Snímek se uloží uvnitř souboru projektu. GeoTIFF větší než 200 MB se odmítne a velmi velká mozaika se zmenší na 16 megapixelů, takže u velkého snímkování nejprve ořízněte mozaiku na staveniště.

## Export

{{ui:Export}} zapíše vyčištěné a klasifikované mračno jako nový soubor (všechny body, vybrané třídy, nebo jen terén). V části {{ui:Typ souboru}} vyberte:

- **LAS 1.4 (nekomprimovaný)**: formát bodů 6, nebo 7 s barvou.
- **LAZ (komprimovaný)**: tytéž body zkomprimované bez ztráty, takže se každý bod vrátí přesně. Zapisuje se jako formát bodů 0, nebo 2 s barvou, v souboru LAS 1.4. U smyšleného staveniště o délce 300 m byl LAZ zhruba pětinou velikosti souboru LAS 1.4. Formáty LAZ 0 a 2 pojmou jen třídy 0 až 31: bod s vyšší třídou se odmítne se zprávou, takže takové mračno exportujte jako LAS 1.4.

Soubor LAZ zapisuje vlastní kompresor CadCraft, postavený na zveřejněné specifikaci LAZ. Ověřili jsme, že náš vlastní čtecí program a dva nezávislé čtenáře LAZ (laz-perf, který aplikace používá k otevírání souborů LAZ, a laspy s lazrs) přečtou každý bod zpět přesně. Ověřili jsme také, že soubory LAZ vytvořené knihovnou laspy vyjdou při novém zápisu jejich bodů bajt po bajtu stejné. Jiné programy zatím zkoušené nebyly, takže pokud některý soubor neotevře, napište nám, který to je.

Tam, kde prohlížeč umí zapisovat soubor průběžně, nejprve vyberete soubor a velmi velké mračno se do něj zapíše po dlaždicích, místo aby se drželo v paměti. Jinak se soubor sestaví a stáhne, což je v pořádku až do několika set megabajtů.

## Co nedělá

Čte pouze LAS a LAZ (E57, PLY a PCD tato karta zatím nepodporuje a několik souborů z jednoho letu se nespojuje). Mračno nepřepočítává do jiného souřadnicového systému (předpokládá se systém projektu a metry). Nečte soubory RCP a RCS od firmy Autodesk, nevytváří povrch z fotografií a sama nenajde sloupy, obrubníky ani potrubí.
