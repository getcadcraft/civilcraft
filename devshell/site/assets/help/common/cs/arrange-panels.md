---
title: Uspořádání panelů a použití druhého monitoru
summary: Ukotvěte boční panely vlevo, vpravo nebo dole, skládejte je, seskupte je jako karty, připněte je nebo skryjte, nechte je plovoucí nad výkresem, zhustěte rozložení, zvolte počet řádků panelu nástrojů nebo je přesuňte do vlastního okna na jiné obrazovce.
keywords: panely, ukotvit, plovoucí, přesunout panel, tažení, rozložení, karty, skupina karet, skládat, připnout, automatické skrytí, skrýt panel, zavřít panel, kompaktní, hustota rozložení, husté, řádky panelu nástrojů, zalomit, 1 řádek, 2 řádky, řádky nástrojů, druhý monitor, dvě obrazovky, dvojitý monitor, více monitorů, okno, vyskakovací okno, obnovit rozložení
from: 32a8dae2
---

Panely vedle výkresu lze přesouvat. Umístěte je tam, kde vám vyhovují, nebo jim dejte vlastní okno na druhém monitoru, aby výkres zabral celou plochu prvního monitoru.

:::note
Každý panel má záhlaví: úzký pruh s názvem panelu, nabídkou {{ui:⋯}}, připínáčkem a tlačítkem pro zavření v horní části panelu. Verze před 0.7 mají pouze název a nabídku {{ui:⋯}}.
:::

## Přesun panelu v okně

1. Přetáhněte panel za jeho název nahoře.
2. Během tažení se na levé, pravé a spodní straně výkresu objeví zvýrazněné oblasti. Pusťte panel na některou z nich, čímž se ukotví. Oblast, nad kterou se nacházíte, ztmavne.
3. Pusťte ho kdekoli jinde nad výkresem, aby se stal plovoucím.

Panely mohou sdílet jednu stranu: skládají se a každá čára mezi dvěma z nich se přetažením rozdělí o místo (když je čára zaměřena, šipkové klávesy ji posouvají a dvojklik na ni rozdělí místo rovným dílem). Přetažením vnitřního okraje ukotvené strany ji rozšíříte nebo zúžíte; dvojklikem na okraj ji vrátíte zpět.

Plovoucí panel zůstává nad výkresem. Přesunete ho za název a změníte jeho velikost přetažením pravého dolního rohu (nebo se na roh dostanete klávesou Tab a použijete šipkové klávesy). Dvojklikem na název jej znovu ukotvíte na místo, kde byl.

:::touch
Přetáhněte jedním prstem za název panelu. Stejně jedním prstem přetáhněte pravý dolní roh plovoucího panelu, čímž změníte jeho velikost, a stejně i okraje mezi ukotvenými panely. Bez přetahování panel učiníte plovoucím nebo ukotvíte pomocí nabídky {{ui:⋯}}.
:::

## Seskupení panelů do karet

Dva panely mohou sdílet jeden rámec a zobrazovat se vždy jen jeden. Přetáhněte panel za název na záhlaví jiného panelu (záhlaví je při najetí zvýrazněno obrysem) a pusťte: rámec pak má v záhlaví kartu pro každý panel. Kliknutím na kartu zobrazíte daný panel. Když je karta zaměřena, přepínáte karty klávesami {{key:Left}} a {{key:Right}}, klávesami {{key:Home}} a {{key:End}} přejdete na první a poslední.

Chcete-li panel ze skupiny vyjmout, zvolte v jeho nabídce {{ui:⋯}} položku {{ui:Vyjmout ze skupiny karet}}, nebo ho přetáhněte jinam. Volbou {{ui:Seskupit s}} a názvem panelu je seskupíte bez přetahování.

## Připnutí, skrytí a návrat

- Připínáček v záhlaví panelu ho nastaví na **automatické skrytí**: panel opustí své ukotvení a na tomto okraji zůstane jako malá karta. Najeďte na kartu kurzorem, zaměřte ji nebo na ni klikněte a panel vyjede nad výkres; odjedete-li pryč (nebo stisknete {{key:Esc}}), zase zajede zpět. Dalším stisknutím připínáčku nebo volbou {{ui:Odepnout}} jej ukotvíte natrvalo.
- Tlačítko pro zavření nebo volba {{ui:Skrýt tento panel}} v nabídce panel skryje a jeho ukotvení se zavře. Čárkovaná karta na okraji jej vrátí: klikněte na ni, nebo ji zaměřte a stiskněte {{key:Enter}}.

## Zhuštění rozložení

{{ui:Nastavení}} › {{ui:Obecné}} › {{ui:Hustota rozložení}} nabízí dvě možnosti. Výchozí je {{ui:Pohodlná}}. {{ui:Kompaktní}} zmenší výšku řádků, vnitřní odsazení panelů, tlačítka panelu nástrojů a text panelů dané aplikace, takže se na obrazovku vejde více. Nastavení se ukládá pro každou aplikaci zvlášť. Dotyková obrazovka si v obou režimech zachová velká tlačítka a telefon vlastní rozložení. {{ui:Obnovit rozložení}} ponechá hustotu tak, jak jste ji nastavili.

## Volba počtu řádků panelu nástrojů

{{ui:Nastavení}} › {{ui:Obecné}} › {{ui:Řádky panelu nástrojů}} nabízí tři možnosti. Výchozí je {{ui:Zalomit}}: zobrazí se každá skupina nástrojů, na tolik řádků, kolik je potřeba. {{ui:2 řádky}} udrží panel nástrojů na dvou řádcích a {{ui:1 řádek}} na jednom, aby výkres získal výšku; skupiny, které se nevejdou, se posouvají do strany uvnitř panelu nástrojů (použijte kolečko myši, gesto dvěma prsty nebo klávesu {{key:Tab}} na nástroj). Panel nástrojů, který se už na dva řádky vejde, zůstane při volbě {{ui:2 řádky}} beze změny, protože mřížka by jej jen prodloužila. Volba se ukládá pro každou aplikaci zvlášť. Dotyková obrazovka a telefon si ponechají vlastní rozložení. CadCraft má vlastní nastavení panelu nástrojů v {{ui:Nastavení}} › {{ui:CadCraft}}.

## Ovládání klávesnicí

Tlačítko {{ui:⋯}} každého panelu otevírá nabídku: {{ui:Ukotvit vlevo}}, {{ui:Ukotvit vpravo}}, {{ui:Ukotvit dole}}, {{ui:Plovoucí nad výkresem}}, {{ui:Připnout k okraji}}, {{ui:Skrýt tento panel}}, {{ui:Seskupit s}} jiným panelem, {{ui:Přesunout do nového okna}} a {{ui:Vrátit ho}}. Klávesou {{key:Tab}} přejděte na tlačítko, stiskněte {{key:Enter}}, pohybujte se šipkovými klávesami a stiskněte znovu {{key:Enter}}. Nabídku zavřete klávesou {{key:Esc}}.

## Umístění panelů na druhý monitor

1. Zvolte {{ui:⋯}} u panelu a poté {{ui:Přesunout všechny panely do nového okna}}. Můžete také zvolit {{ui:Přesunout panely do nového okna}} v {{ui:Nastavení}}.
2. Otevře se malé okno s panely. Přetáhněte je na druhý monitor a zvětšete podle potřeby.
3. Pracujte dál: panely působí na výkres jako dříve a výkres vyplní hlavní okno.

Zkratky fungují i tehdy, když je okno panelů v popředí: klávesy, které tam stisknete (mimo psaní do pole), patří výkresu. Dotazy a dialogy, které aplikace položí, se otevírají v hlavním okně, takže se tam podívejte, když se některý objeví. Motiv a velikost textu panelů se řídí hlavním oknem.

:::chromium
Chrome a Edge mohou okno umístit na jinou obrazovku za vás. Když je připojena druhá obrazovka, zvolte v okně panelů {{ui:Přesunout ho na mou druhou obrazovku}} (nebo {{ui:Přesunout panely na mou druhou obrazovku}} v nabídce {{ui:⋯}} panelu). Prohlížeč se jednou zeptá, zda tento web smí vidět vaše obrazovky; jakmile to povolíte, okno panelů se pokaždé otevře na této obrazovce.
:::

:::firefox safari
Okno panelů přetáhněte na druhý monitor sami. Příště se otevře na stejném místě a ve stejné velikosti.
:::

## Více oken panelů

Každý panel může mít vlastní okno: až čtyři okna panelů, například jedno na každý monitor.

- V nabídce {{ui:⋯}} panelu otevře volba {{ui:Přesunout do nového okna}} další okno pro daný panel a volba {{ui:Přesunout do okna panelů 2}} (a tak dále) jej přesune do některého již otevřeného okna. Druhé okno se nazývá "panely 2".
- Přetáhněte panel za název z jednoho okna do druhého: pusťte ho nad hlavním oknem, aby se tam ukotvil (při najetí se zobrazí zvýrazněné oblasti), nebo aby se stal plovoucím, anebo nad jiným oknem panelů, aby se tam přesunul. Pustíte-li ho kdekoli jinde, zůstane tam, kde byl.
- Okno panelů, ve kterém už nezůstal žádný panel, se zavře samo.

Po znovunačtení aplikace vám nabídne znovu vaše okna panelů. Prohlížeče otevírají jedno okno na jedno kliknutí, proto zvolte {{ui:Otevřít další}} jednou pro každé okno.

## Přesun dialogu

Každý dialog lze odsunout z cesty výkresu: stiskněte a přetáhněte jeho záhlaví. Dialog si pamatuje, kde jste ho nechali, každý dialog zvlášť, a při příštím otevření se vrátí na stejné místo. Dvojklikem na záhlaví jej znovu vycentrujete.

Z klávesnice stiskněte {{key:Alt}}+{{key:Shift}}+šipku, když je zaměřením uvnitř dialogu, a dialog se posune po 16 pixelech; přidáte-li {{key:Ctrl}}, posune se po 64 pixelech. Dialog, který se po zmenšení okna nebo obrazovky ocitne mimo ni, se vrátí zpět.

Na telefonu zůstávají dialogy celoobrazovkové a nepřesouvají se.

V CadCraft Studiu má dialog {{ui:Vykreslit do PDF}} aplikace CadCraft, který můžete nechat během práce otevřený, v záhlaví tlačítko {{ui:Otevřít ve vlastním okně}}. Dialog se přesune do vlastního okna, které můžete umístit na jiný monitor. Zavření dialogu zavře okno a zavření okna zavře dialog.

## Vrácení panelů zpět

- Zvolte {{ui:Vrátit panely zpět}} v okně panelů, nebo je prostě zavřete. Panely se vrátí tam, kde byly.
- Zavření nebo znovunačtení hlavního okna zavře i okno panelů. Když se aplikace znovu otevře, oznámí, že vaše panely byly v samostatném okně; zvolte {{ui:Otevřít}}, aby se okno vrátilo, nebo {{ui:Ponechat je zde}}.
- {{ui:Nastavení}} › {{ui:Obecné}} › {{ui:Obnovit rozložení}} vrátí každý panel na místo, kde začínal.

:::tip
Pokud se po přesunu panelů do nového okna nic neotevře, prohlížeč zablokoval vyskakovací okno. Aplikace na to upozorní a panely ponechá na místě. Povolte vyskakovací okna pro getcadcraft.com a zkuste to znovu.
:::

Rozložení se v tomto prohlížeči uchovává pro každou aplikaci zvlášť spolu s dalším nastavením.
