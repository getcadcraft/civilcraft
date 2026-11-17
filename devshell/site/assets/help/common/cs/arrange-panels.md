---
title: Uspořádejte panely a použijte druhý monitor
summary: Ukotvěte boční panely vlevo, vpravo nebo dole, skládejte je, seskupujte je jako karty, připínejte nebo skrývejte, nechte je plovoucí nad výkresem, zhustěte rozložení, zvolte počet řádků panelu nástrojů nebo je přesuňte do vlastního okna na jiné obrazovce.
keywords: panely, ukotvit, plovoucí, přesunout panel, přetáhnout, rozložení, karty, skupina karet, skládat, připnout, automaticky skrýt, skrýt panel, zavřít panel, kompaktní, hustota rozložení, husté, řádky panelu nástrojů, zalomit, 1 řádek, 2 řádky, řádky nástrojů, druhý monitor, dvě obrazovky, dvojitý monitor, více monitorů, okno, vyskakovací okno, obnovit rozložení
from: 49530239
---

Panely vedle výkresu lze přesouvat. Umístěte je tam, kde vám vyhovují, nebo jim dejte vlastní okno na druhém monitoru, aby výkres zabral celý první monitor.

:::note
Každý panel má záhlaví: úzký pruh s názvem panelu, nabídkou {{ui:⋯}}, připínáčkem a tlačítkem pro zavření nahoře na panelu. Verze starší než 0.7 mají pouze název a nabídku {{ui:⋯}}.
:::

## Přesun panelu v okně

1. Přetáhněte panel za jeho název nahoře.
2. Během tažení se vlevo, vpravo a dole u výkresu objeví obrysy oblastí. Panel pusťte na některou z nich a ukotví se tam. Oblast, nad kterou jste, ztmavne.
3. Pusťte ho kdekoli jinde nad výkresem a bude plovoucí.

Panely mohou sdílet jednu stranu: skládají se a čára mezi dvěma z nich se táhne, aby si rozdělily prostor (když je čára zaměřená, posouvají ji šipky a dvojklik ji rozdělí rovnoměrně). Přetažením vnitřního okraje ukotvené strany ji zúžíte nebo rozšíříte; dvojklikem na okraj ji vrátíte zpět.

Plovoucí panel zůstává nad výkresem. Přesunete ho za název a změníte jeho velikost tažením pravého dolního rohu (nebo se na roh dostanete klávesou {{key:Tab}} a použijete šipky). Dvojklikem na název ho znovu ukotvíte na původní místo.

:::touch
Táhněte jedním prstem za název panelu. Pravý dolní roh plovoucího panelu změníte jedním prstem, stejně jako okraje mezi ukotvenými panely. Chcete-li panel nechat plovoucí nebo ukotvit bez tažení, použijte nabídku {{ui:⋯}}.
:::

## Seskupení panelů na karty

Dva panely mohou sdílet jeden rámec a zobrazovat se jeden po druhém. Přetáhněte panel za jeho název na záhlaví jiného panelu (záhlaví je při najetí zvýrazněno obrysem) a pusťte: rámec pak má v záhlaví kartu pro každý panel. Kliknutím na kartu zobrazíte daný panel. Když je karta zaměřena, přepínají karty klávesy {{key:Left}} a {{key:Right}}; klávesy {{key:Home}} a {{key:End}} přejdou na první a poslední.

Chcete-li panel ze skupiny vyjmout, zvolte v jeho nabídce {{ui:⋯}} položku {{ui:Vyjmout ze skupiny karet}}, nebo ho přetáhněte jinam. Chcete-li je seskupit bez tažení, zvolte {{ui:Seskupit s}} a název panelu.

## Připnutí, skrytí a návrat

- Připínáček v záhlaví panelu jej nastaví na **automatické skrývání**: panel opustí své ukotvení a na tomto okraji se změní na malou kartu. Ukažte na kartu, zaměřte ji nebo na ni klikněte a panel vyjede nad výkres; když odjedete (nebo stisknete {{key:Esc}}), zase zajede zpět. Chcete-li ho ukotvit natrvalo, stiskněte připínáček znovu nebo zvolte {{ui:Odepnout}}.
- Tlačítko pro zavření nebo položka {{ui:Skrýt tento panel}} v nabídce panel skryje a jeho ukotvení se zavře. Čárkovaná karta na okraji jej vrátí: klikněte na ni, nebo ji zaměřte a stiskněte {{key:Enter}}.

## Zhuštění rozložení

{{ui:Nastavení}} › {{ui:Obecné}} › {{ui:Hustota rozložení}} nabízí dvě možnosti. Výchozí je {{ui:Pohodlná}}. {{ui:Kompaktní}} zmenší výšky řádků, vnitřní odsazení panelů, tlačítka panelu nástrojů a text panelů v dané aplikaci, aby se na obrazovku vešlo více. Nastavení se ukládá pro každou aplikaci zvlášť. Dotyková obrazovka si v obou případech ponechá velká tlačítka a telefon si zachová vlastní rozložení. {{ui:Obnovit rozložení}} ponechá hustotu tak, jak jste ji nastavili.

## Volba počtu řádků panelu nástrojů

{{ui:Nastavení}} › {{ui:Obecné}} › {{ui:Řádky panelu nástrojů}} nabízí tři možnosti. Výchozí je {{ui:Zalomit}}: zobrazí se všechny skupiny nástrojů a zabírají tolik řádků, kolik potřebují. {{ui:2 řádky}} drží panel nástrojů na dvou řádcích a {{ui:1 řádek}} na jednom, takže výkres získá výšku; skupiny, které se nevejdou, se posouvají do strany uvnitř panelu nástrojů (použijte kolečko myši, gesto dvěma prsty nebo klávesu {{key:Tab}} a přejděte na nástroj). Panel nástrojů, který se už vejde do dvou řádků, zůstane pod volbou {{ui:2 řádky}} beze změny, protože mřížka by ho jen prodloužila. Volba se ukládá pro každou aplikaci zvlášť. Dotyková obrazovka a telefon si zachovají vlastní rozložení. CadCraft má vlastní nastavení panelu nástrojů v {{ui:Nastavení}} › {{ui:CadCraft}}.

## Ovládání klávesnicí

Tlačítko {{ui:⋯}} každého panelu otevře nabídku: {{ui:Ukotvit vlevo}}, {{ui:Ukotvit vpravo}}, {{ui:Ukotvit dole}}, {{ui:Plovoucí nad výkresem}}, {{ui:Připnout k okraji}}, {{ui:Skrýt tento panel}}, {{ui:Seskupit s}} jiným panelem, {{ui:Přesunout do nového okna}} a {{ui:Vrátit ho}}. Klávesou {{key:Tab}} přejděte na tlačítko, stiskněte {{key:Enter}}, pohybujte šipkami a znovu stiskněte {{key:Enter}}. {{key:Esc}} nabídku zavře.

## Panely na druhém monitoru

1. Na panelu zvolte {{ui:⋯}} a poté {{ui:Přesunout všechny panely do nového okna}}. Totéž můžete zvolit v {{ui:Nastavení}} jako {{ui:Přesunout panely do nového okna}}.
2. Otevře se malé okno s panely. Přetáhněte ho na druhý monitor a zvětšete ho podle potřeby.
3. Pokračujte v práci: panely působí na výkres jako dříve a výkres vyplní hlavní okno.

Zkratky fungují i tehdy, když je okno panelů navrchu: klávesy stisknuté tam, kromě psaní do pole, směřují na výkres. Dotazy a dialogy, které aplikace položí, se stále otevírají v hlavním okně, proto se tam dívejte, když se nějaký objeví. Motiv a velikost textu panelů se řídí hlavním oknem.

:::chromium
Chrome a Edge mohou okno umístit na druhou obrazovku za vás. Když je připojena druhá obrazovka, zvolte v okně panelů {{ui:Přesunout ho na mou druhou obrazovku}} (nebo {{ui:Přesunout panely na mou druhou obrazovku}} v nabídce {{ui:⋯}} panelu). Prohlížeč se jednou zeptá, zda tento web smí vidět vaše obrazovky; jakmile to povolíte, okno panelů se na této obrazovce otevře vždy.
:::

:::firefox safari
Přetáhněte okno panelů na druhý monitor sami. Příště se otevře na stejném místě a ve stejné velikosti.
:::

## Více oken panelů

Každý panel může mít vlastní okno: až čtyři okna panelů, například jedno na každý monitor.

- V nabídce {{ui:⋯}} panelu otevře {{ui:Přesunout do nového okna}} další okno pro daný panel a {{ui:Přesunout do okna panelů 2}} (a tak dál) ho přesune do některého otevřeného okna. Druhé okno se jmenuje "panely 2".
- Přetáhněte panel za jeho název z jednoho okna do druhého: pusťte nad hlavním oknem, aby se tam ukotvil (při najetí se ukážou obrysy oblastí), nebo aby plaval, a nad jiným oknem panelů, aby se do něj přesunul. Pustíte-li jinde, zůstane tam, kde byl.
- Okno panelů, které už nemá žádné panely, se zavře samo.

Po znovunačtení aplikace vám okna panelů nabídne znovu. Prohlížeče otevírají jedno okno na každé kliknutí, proto zvolte {{ui:Otevřít další}} jednou pro každé okno.

## Stejně pro každou část rozložení

Pás karet, sada nástrojů, řádky nástrojů a stavový řádek odcházejí do vlastního okna stejně jako panel: otevřete nabídku {{ui:⋯}} dané části a zvolte {{ui:Přesunout do nového okna}}; {{ui:Vrátit ho}} (nebo zavření okna) je přivede zpět. Klávesy stisknuté v tom okně se dostanou do aplikace, jako když je stisknete v okně panelů. Každá část má jednu takovou nabídku.

## Přesun dialogu

Každý dialog lze odsunout z cesty výkresu: stiskněte a táhněte jeho záhlaví. Dialog si pamatuje, kde jste ho nechali, každý dialog zvlášť, a při dalším otevření se vrátí na to místo. Dvojklikem na záhlaví ho znovu vycentrujete.

Z klávesnice stiskněte {{key:Alt}}+{{key:Shift}}+šipku, když je zaměření uvnitř dialogu, a posunete ho po 16 pixelech; přidáte-li {{key:Ctrl}}, posune se o 64. Dialog, který skončí mimo obrazovku (po zmenšení okna nebo obrazovky), se vrátí zpět.

V telefonu zůstávají dialogy na celou šířku a nepřesouvají se.

V aplikaci CadCraft Studio má dialog {{ui:Vykreslit do PDF}}, který můžete nechat otevřený během práce, v záhlaví tlačítko {{ui:Otevřít ve vlastním okně}}. Dialog se přesune do vlastního okna, které můžete umístit na jiný monitor. Zavřením dialogu se zavře okno a zavřením okna se zavře dialog.

## Vrácení panelů zpět

- V okně panelů zvolte {{ui:Vrátit panely zpět}}, nebo je jednoduše zavřete. Panely se vrátí tam, kde byly.
- Zavřením nebo znovunačtením hlavního okna se zavře i okno panelů. Když se aplikace znovu otevře, řekne, že vaše panely byly v samostatném okně; zvolte {{ui:Otevřít}}, chcete-li okno vrátit, nebo {{ui:Ponechat je zde}}.
- {{ui:Nastavení}} › {{ui:Obecné}} › {{ui:Obnovit rozložení}} vrátí každý panel na místo, kde začínal.

:::tip
Pokud se po přesunu panelů do nového okna nic neotevře, prohlížeč zablokoval vyskakovací okno. Aplikace to oznámí a panely ponechá tam, kde byly. Povolte vyskakovací okna pro getcadcraft.com a zkuste to znovu.
:::

Rozložení se v tomto prohlížeči ukládá pro každou aplikaci zvlášť spolu s ostatním nastavením.
