---
title: Protáhnout silniční koridor
summary: Zapněte koridor pro osu trasy, nastavte hodnoty jízdních pruhů, krajnic a sklonů svahů a přečtěte si řezy, průsečnice se terénem a zemní práce, které vzniknou.
keywords: křižovatka, průsečík, silnice se stýká se silnicí, vedlejší silnice, T křižovatka, přejezd, úroveň plošiny, připojení, navázání, převýšení v oblouku, převýšení, náklon, přechodový úsek, náběh, tabulka sklonů, příčný sklon, otočení, koridor, sestava, dílčí sestava, typický příčný řez, silnice, jízdní pruh, krajnice, příčný sklon, sklon svahu, průsečnice, výkop, násyp, řezy, cíl, cíle, cíl šířky, cíl výšky, cíl odsazení, rozšíření, okraj vozovky, navázat na jiný koridor
from: 6dcb92b3
---

Koridor protáhne jeden jednoduchý typický příčný řez (sestavu) podél osy trasy a jejího návrhového profilu, upraví ho podle stávajícího terénu a výsledek přidá k navrhovanému povrchu. Na jedné ose trasy může být několik koridorů na různých úsecích staničení a koridor lze postavit ze znovupoužitelných šablon podle staničení ([Šablony koridorů](topic:corridor-templates)). Jednoduchá sestava níže je na obou stranách stejná; chcete-li každé straně dát vlastní prvky, viz [Sestavení každé strany z prvků](topic:corridor#build-each-side-from-parts).

## Sestava

Od osy směrem ven, na každé straně:

1. **jízdní pruh** dané šířky, klesající od hřbetu vozovky se **sklonem jízdního pruhu**
2. **krajnice** dané šířky se **sklonem krajnice**
3. **svah** od okraje krajnice až k místu, kde narazí na terén: **sklon svahu výkopu** tam, kde je terén výš, **sklon svahu násypu** tam, kde je níž

Výchozí hodnoty jsou jen zástupné, nejde o projekční normu:

| Hodnota | US stopy | Metry |
|---|---|---|
| Šířka jízdního pruhu | 12 ft | 3.6 m |
| Sklon jízdního pruhu | 2% | 2% |
| Šířka krajnice | 4 ft | 1.2 m |
| Sklon krajnice | 4% | 4% |
| Sklon svahu výkopu | 2 : 1 | 2 : 1 |
| Sklon svahu násypu | 3 : 1 | 3 : 1 |
| Řez každých | 10 ft | 5 m |

Sklony svahů jsou udány jako vodorovně ku svisle (H:V): 3 : 1 znamená 3 vodorovně na 1 svisle.

## Sestavení koridoru

Potřebujete osu trasy bez chyb a návrhový profil alespoň se dvěma PVI a bez chyb.

1. Vyberte osu trasy.
2. V pravém panelu v části **Koridor** zaškrtněte **Protáhnout sestavu podél návrhového profilu**.
   Zobrazí se pole a koridor se ihned postaví. Půdorys ukáže okraje jízdního pruhu a krajnice a průsečnice se terénem; když v části **Zobrazení** zvolíte {{ui:Navrhovaný (urovnaný)}}, vrstevnice zobrazí nový terén.
3. Změňte kteroukoli hodnotu: **Šířka jízdního pruhu**, **Sklon jízdního pruhu**, **Šířka krajnice**, **Sklon krajnice**, **Sklon svahu výkopu**, **Sklon svahu násypu**, **Řez každých**. Po každé stiskněte {{key:Enter}}. Výkop, násyp a rozestup řezů musí být větší než 0.
4. Přečtěte si řádek pod poli, například "39 řezů od 0+00.00 do 3+86.36; výkop 240.2 cu yd, násyp 556.0 cu yd."

Řezy se vedou v každém kroku **Řez každých**, na koncích a na začátku a konci každé horizontální i vertikální křivky. Každý řez a čáry, které jím procházejí (osa, okraje jízdního pruhu a krajnice, průsečnice se terénem), se stanou lomovými hranami navrhovaného povrchu.

Koridor vypnete odškrtnutím políčka. Jeho hodnoty se uchovají pro příště.

## Když se koridor nepostaví

Červený rámeček pod poli vysvětlí důvod:

| Zpráva | Co dělat |
|---|---|
| "The corridor needs a design profile without errors." › "Koridor potřebuje návrhový profil bez chyb." | Přidejte PVI nebo opravte překrývající se vertikální oblouky (viz [Návrh vertikálního profilu](topic:profile)). |
| "The design profile does not overlap the alignment." › "Návrhový profil se nepřekrývá s osou trasy." | Přesuňte PVI do rozsahu staničení osy trasy. |
| "The corridor needs at least two sections on the surface." › "Koridor potřebuje na povrchu alespoň dva řezy." | Větší část koridoru leží mimo stávající terén. |
| "4 side slopes run off the surface before meeting the ground." › "4 svahy opouštějí povrch dříve, než narazí na terén." | Blízko okraje povrchu sklon nedosáhne na terén. Držte silnici dál od okraje, nebo tam snižte výšku násypu či výkopu. |
| "The corridor’s daylight lines cross (sections overlap, for example on the inside of a tight curve). Use a larger radius or narrower assembly." › "Průsečnice koridoru se terénem se kříží (řezy se překrývají, například na vnitřní straně úzkého oblouku). Použijte větší poloměr nebo užší sestavu." | Řezy na vnitřní straně ostrého oblouku se překrývají. Zvětšete poloměr nebo zúžte sestavu. |

Koridor s problémem se do terénu nezapracuje a nepočítá se do zemních prací.

## Koridory a plošiny dohromady

Navrhovaný povrch se staví postupně: nejdřív všechny koridory, potom všechny plošiny. Kde se úprava terénu plošiny překrývá s koridorem, má přednost plošina. Kde pozdější prvek překrývá silnici, nahradí se jen ta část silnice, která leží uvnitř průsečnice se terénem pozdějšího prvku; zbytek silnice i každá lomová hrana terénu, kterou silnice přetíná, si zachová svůj tvar. Objemy se počítají uvnitř všech průsečnic se terénem dohromady; viz [Objemy zemních prací](topic:volumes).

## Převýšení v oblouku

V oblouku může být silnice nakloněna k vnitřku, takže doprava je méně tlačena ven. Zaškrtněte **Převýšit oblouky** v části **Převýšení v oblouku** ve **Vlastnostech** osy trasy:

- Každý kruhový oblouk převezme hodnotu **e** z tabulky sklonů: první řádek, jehož poloměru oblouk dosáhne (řádek s prázdnou hodnotou ponechá normální příčný sklon). Tabulka i **Největší relativní spád** (zpočátku 0.5 %) jsou zástupné hodnoty, nikoli norma: nastavte je podle vlastních návrhových kritérií. Řádky přidávejte nebo odebírejte podle potřeby.
- Jízdní pruhy se otáčejí kolem osy. Před obloukem se vnější pruh vyrovnává přes **náběh** (normální příčný sklon ÷ e × přechodový úsek), potom přes **přechodový úsek** (šířka pruhu × e ÷ spád) se vnější pruh dál natáčí, dokud celá silnice neklesá sklonem e směrem dovnitř; dvě třetiny přechodu leží před obloukem a jedna třetina na něm. Za obloukem se děje totéž v opačném pořadí.
- Krajnice na nízké straně nikdy není plošší než její jízdní pruh; na vysoké straně si zachová vlastní sklon (přetáčí se).
- Tabulka pod ní uvádí poloměr, hodnotu e, přechodový úsek a náběh každého oblouku a kde plné převýšení začíná a končí. **Diagram převýšení** kreslí příčné sklony obou pruhů podél staničení (levý pruh plnou čarou, pravý čárkovaně).
- Oblouk příliš krátký na dosažení plného převýšení, nebo dva oblouky, jejichž přechody se překrývají, se oznámí v rámečku nad tabulkou.

Řezy, objemy, 3D pohled i listy všechny ukazují nakloněnou silnici. Každá změna je jeden krok: {{key:Mod+Z}} ji vrátí zpět.

## Cíle

Cíl přesune jeden bod jedné strany silnice na čáru: **okraj vozovky** nebo **okraj krajnice**, na **levé** nebo **pravé** straně. Každý řez protíná čáru kolmo k ose a jde ven jen na té straně, takže cíl vpravo nikdy nepřesune levou stranu.

| Nastaví | Co se stane tam, kde řez narazí na čáru |
|---|---|
| **Šířka** | Bod leží na čáře: jízdní pruh (nebo krajnice) se k ní rozšíří nebo zúží a zachová si svůj příčný sklon. |
| **Výška** | Bod tam převezme výšku čáry ve svém vlastním odsazení: sleduje se příčný sklon jízdního pruhu (nebo krajnice). |

Čára může být konstrukční čára (ať je její **Použití** jakékoli), nebo čára jiného koridoru: jeho osa, okraje vozovky, okraje krajnic nebo průsečnice se terénem. Čára koridoru sleduje tento koridor: změníte-li druhou silnici, tato ji bude následovat. CivilCraft postaví druhý koridor první; dva koridory, které by se na sebe navzájem odkazovaly v cyklu, se na jedné straně odmítnou a tabulka uvede, která.

1. Vyberte osu trasy a zapněte její koridor.
2. V části **Cíle** klikněte na {{ui:Přidat cíl}}.
3. Zvolte **Stranu**, **Bod**, co **Nastaví** a **K čáře**. Každá změna je jeden krok zpět.

**Výsledek** uvádí, u kolika řezů čára byla dosažena. Řezy, které ji nedosáhnou (za jejími konci nebo tam, kde je za osou), si zachovají hodnoty sestavy. Smazaná čára ponechá koridor v podobě, jakou měl před cílem, a tabulka to uvádí. Jedna strana může mít pro každý bod jeden cíl šířky a jeden cíl výšky.

## Sestavení každé strany z prvků

Zapněte **Sestavit každou stranu z prvků** v nastavení koridoru. Každá strana pak má vlastní seznam od osy směrem ven: jízdní pruhy, krajnici, žlab, obrubník, zelený pás, chodník a nakonec svah k terénu (se svými vlastními poměry výkopu a násypu). Začněte z {{ui:Venkovská silnice}} nebo {{ui:Městská ulice}}, prvky přidávejte a odebírejte, přesouvejte je šipkami a jednu stranu {{ui:Kopírovat}} na druhou. Každá změna je jeden krok zpět.

Příčný sklon je spád od silnice, takže chodník, který odvodňuje ke silnici, má záporný sklon. Obrubník je plocha o výšce, kterou zadáte, horní hrana o šířce, kterou zadáte, a volitelný spád na zadní straně. Převýšení natočí každý pruh v prvním řádku; žlab, obrubník, pás a chodník navazují na okraj jízdních pruhů podle jejich provedení. Cíle stále posouvají konec pruhů a poslední prvek. Příčné řezy zaznačují dno žlabu, horní a zadní hranu obrubníku a další. Na oblouku s přechodnicemi je přechodový úsek tvořen přechodnicí: vodorovný příčný sklon v TS, plné převýšení v SC.

## Vrstvy vozovky

Jízdní pruh, krajnice, žlab, zelený pás nebo chodník může nést svou skladbu: pod daným prvkem {{ui:Přidat vrstvu}} přidá vrstvu s názvem, materiálem, tloušťkou a druhem (obrusná, ložní, podkladní, podkladní spodní, pláň nebo jiná), shora dolů. Vrstvy neposouvají povrch silnice (jeho horní hrana je návrhový povrch); každá leží pod svým prvkem a její hloubka se měří svisle dolů. Příčné řezy kreslí dno každé vrstvy čárkovaně a {{ui:Vrstvy vozovky: množství}} uvádí půdorysnou plochu a objem každé vrstvy (plocha podél koridoru z jeho řezů, objem = plocha × tloušťka). Export IFC zapíše každou vrstvu jako vlastní prvek s tloušťkou a materiálem (viz [Export a import IFC](topic:ifc)). Tloušťku, kterou zadáte, určujete vy: CivilCraft vozovky nedimenzuje.

## Kde se silnice setkávají se silnicemi, plošinami a stezkami

Když je zapnuto {{ui:Připojit silnice a plochy, které se s ní stýkají}} (je zapnuto u každého koridoru), CivilCraft připojí koridor k tomu, s čím se v půdorysu stýká:

- **Silnice, která končí na jiné silnici** (konec její osy leží na druhé silnici, nebo zhruba do poloviny šířky její vozovky od okraje té silnice) je vedlejší silnicí křižovatky. Silnice, na kterou narazí, otevře svůj okraj pro vozovku vedlejší silnice: přes ústí se krajnice, obrubník, pás a chodník položí na příčný sklon jízdního pruhu a vykreslí se jako vozovka. Vedlejší silnice se položí na povrch hlavní silnice tam, kde se obě překrývají, a na příjezdu se k němu zvedne nebo sníží.
- **Dvě silnice, které se kříží**, se spojí stejně na obou stranách. Silnice uvedená v seznamu os jako první je průjezdní; druhá sleduje její povrch přes křížení.
- **Silnice, která končí na plošině** (uvnitř ní nebo zhruba do poloviny šířky vozovky od jejího okraje), dorazí na úroveň plošiny a na příjezdu se k ní zmírní.
- **Stezka** (Krajina › Zpevněné plochy) končí na vnějším okraji silnice, na úrovni chodníku nebo krajnice v tom místě, místo aby ležela přes silnici. Stezka, která silnici kříží, se rozdělí na dva díly. Konec nakreslený kousek před silnicí (do dvojnásobku šířky stezky) se prodlouží až k jejímu okraji.

**Vlastnosti** uvádějí, co každý koridor připojil, o kolik byl v tom místě zvednut nebo snížen a na jaké délce. Tato délka je větší z hodnot 10 m (30 ft) a dvacetinásobku změny a nikdy nepřesáhne 45 % koridoru. **Návrhový profil se nemění**: pohled na profil dál ukazuje spádovou čáru, kterou jste nakreslili, zatímco řezy, navrhovaný povrch, objemy a 3D pohled ukazují silnici tak, jak je připojena. Chcete-li připojení navrhnout přesně, přesuňte poslední PVI na úroveň, kterou Vlastnosti uvádějí.

Přepínač u koridoru vypnete, aby zůstal přesně takový, jaký ho určuje jeho profil a sestava; pak se nezúčastní žádné křižovatky, ani jako vedlejší, ani jako průjezdní silnice. Silnice, které se stýkají téměř v jedné přímce (méně než asi 20°), se nechávají být, stejně jako polní cesty.

Co křižovatka zatím nedělá: nejsou zde obrubníkové oblouky (rohy jsou pravoúhlé), žádné odbočovací pruhy ani ostrůvky, konec vedlejší silnice je seříznut kolmo k její vlastní ose, a koridor postavený ze šablon otevře svůj okraj stejně prostým způsobem (příkop nebo zeď v koncovém stavu se přes ústí vyrovná bez propustku). Pro obrubníkové oblouky v půdorysu, rozhledové trojúhelníky a značení viz [Zeminy, silnice, zaměřování, doly a spoje](topic:soils-roads-survey-mines-links).

## Co ještě není hotovo

Cíle pro svah průsečnice se terénem zatím nejsou k dispozici. Pro koridor, který se mění podél silnice a má oddělenou levou a pravou stranu, použijte [Šablony koridorů](topic:corridor-templates). Viz [Ještě není hotovo](topic:not-built-yet).
