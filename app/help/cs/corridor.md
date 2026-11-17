---
title: Protažení silničního koridoru
summary: Zapněte koridor pro osu trasy, nastavte hodnoty pruhu, krajnice a bočního sklonu a čtěte průřezy, čáry napojení na terén a zemní práce, které vznikají.
keywords: převýšení, super, náklon, přechod, náběh, tabulka sklonů, příčný sklon, rotace, koridor, sestava, dílčí sestava, typický příčný řez, silnice, pruh, krajnice, příčný sklon, boční sklon, napojení na terén, výkop, násyp, průřezy, cíl, cíle, cíl šířky, cíl výšky, cíl odsazení, rozšíření, okraj vozovky, následovat jiný koridor
from: 91303189
---

Koridor protáhne jeden jednoduchý typický příčný řez (sestavu) podél osy trasy a jejího návrhového profilu, upraví ho podle stávajícího terénu a přidá výsledek do navrhovaného povrchu. Osa trasy může nést několik koridorů na různých rozsazích staničení a koridor lze sestavit z opakovaně použitelných šablon podle staničení ([Šablony koridorů](topic:corridor-templates)). Jednoduchá sestava níže je stejná na obou stranách; chcete-li, aby každá strana měla vlastní části, viz [Sestavení každé strany z částí](topic:corridor#build-each-side-from-parts).

## Sestava

Od osy trasy směrem ven, na každé straně:

1. **pruh** dané šířky, klesající od hřbetu sklonem **sklon pruhu**
2. **krajnice** dané šířky se **sklonem krajnice**
3. **boční sklon** od hrany krajnice tam, kde se setká s terénem: **sklon výkopu**, kde je terén nad, a **sklon násypu**, kde je pod ním

Počáteční hodnoty jsou zástupné, nejsou to návrhová norma:

| Hodnota | US feet | Metry |
|---|---|---|
| Šířka pruhu | 12 ft | 3.6 m |
| Sklon pruhu | 2 % | 2 % |
| Šířka krajnice | 4 ft | 1.2 m |
| Sklon krajnice | 4 % | 4 % |
| Sklon výkopu | 2 : 1 | 2 : 1 |
| Sklon násypu | 3 : 1 | 3 : 1 |
| Průřez každých | 10 ft | 5 m |

Sklony bočních svahů jsou vodorovně k svisle (H:V): 3 : 1 znamená 3 vodorovně na 1 svisle.

## Sestavte koridor

Potřebujete osu trasy bez chyb a návrhový profil s nejméně dvěma PVI a bez chyb.

1. Vyberte osu trasy.
2. V pravém panelu, pod **Koridor**, zaškrtněte **Protáhnout sestavu podél návrhového profilu**.
   Pole se objeví a koridor se hned sestaví. Plán ukazuje hrany pruhu a krajnice a čáry napojení; pokud je v **Zobrazení** zvolen {{ui:Proposed (graded)}}, vrstevnice ukazují nový terén.
3. Změňte libovolnou hodnotu: **Šířka pruhu**, **Sklon pruhu**, **Šířka krajnice**, **Sklon krajnice**, **Sklon výkopu**, **Sklon násypu**, **Průřez každých**. Po každé stiskněte {{key:Enter}}. Výkop, násyp a rozestup průřezů musí být větší než 0.
4. Přečtěte řádek pod poli, například „39 průřezů od 0+00.00 do 3+86.36; výkop 240.2 cu yd, násyp 556.0 cu yd.“

Průřezy se řežou v každém kroku **Průřez každých**, na koncích a na začátku a konci každého vodorovného a svislého oblouku. Každý průřez a čáry jím procházející (osa trasy, hrany pruhu a krajnice, napojení) se stanou lomovými hranami navrhovaného povrchu.

Koridor vypnete odškrtnutím políčka. Jeho hodnoty se uchovají pro příště.

## Když se nesestaví

Červené pole pod poli říká proč:

| Zpráva | Co dělat |
|---|---|
| „Koridor potřebuje návrhový profil bez chyb.“ | Přidejte PVI nebo opravte překrývající se svislé oblouky (viz [Navrhnutí svislého profilu](topic:profile)). |
| „Návrhový profil se nepřekrývá s osou trasy.“ | Přesuňte PVI do rozsahu staničení osy trasy. |
| „Koridor potřebuje alespoň dva průřezy na povrchu.“ | Většina koridoru je mimo stávající terén. |
| „4 boční sklony vybíhají z povrchu dříve, než se setkají s terénem.“ | Poblíž okraje povrchu sklon k terénu nedosáhne. Držte silnici dál od okraje nebo tam snižte výšku násypu či výkopu. |
| „Čáry napojení koridoru se kříží (průřezy se překrývají, například na vnitřní straně těsné zatáčky). Použijte větší poloměr nebo užší sestavu.“ | Průřezy na vnitřní straně ostré zatáčky se překrývají. Zvětšete poloměr nebo zúžte sestavu. |

Koridor s problémem se nezarovnává do terénu a nepočítá se do zemních prací.

## Koridory a plošiny dohromady

Navrhovaný povrch se sestavuje v pořadí: nejprve každý koridor, potom každá plošina. Tam, kde zarovnání plošiny přesahuje koridor, vyhrává plošina. Objemy se počítají uvnitř všech čar napojení dohromady; viz [Objemy zemních prací](topic:volumes).

## Převýšení v oblouku

Ve zatáčce může silnice naklánět směrem dovnitř, takže doprava je vytlačována méně směrem ven. Zaškrtněte **Převýšit oblouky** pod **Převýšení** ve **Vlastnostech** osy trasy:

- Každý kruhový oblouk dostane sklon **e** z tabulky sklonů: první řádek, jehož poloměr oblouk dosáhne (řádek s prázdným sklonem si ponechá normální hřbet). Tabulka a **Maximální relativní sklon** (zpočátku 0.5 %) jsou zástupné, nejsou to norma: nastavte je podle svých návrhových kritérií. Řádky přidávejte nebo odebírejte podle potřeby.
- Pruhy se otáčejí kolem osy trasy. Před obloukem se vnější pruh vyrovná přes **náběh** (normální hřbet ÷ e × přechod), pak přes **přechodový úsek** (šířka pruhu × e ÷ sklon) se vnější pruh dál otáčí, dokud celá silnice neklesá sklonem e směrem dovnitř; dvě třetiny přechodu leží před obloukem a jedna třetina na něm. Za obloukem se děje totéž v opačném pořadí.
- Krajnice na nízké straně není nikdy plošší než její pruh; na vysoké straně si ponechá vlastní sklon (přelévá se).
- Tabulka pod tím uvádí poloměr, sklon, přechod a náběh každého oblouku a kde plné převýšení začíná a končí. **Schéma převýšení** kreslí příčné sklony obou pruhů podél staničení (levý pruh plnou čarou, pravý čárkovaně).
- Oblouk příliš krátký na dosažení plného převýšení nebo dva oblouky, jejichž přechody se překrývají, je uveden v okně nad tabulkou.

Průřezy, objemy, 3D pohled a výkresy všechny ukazují nakloněnou silnici. Každá změna je jeden krok: {{key:Mod+Z}} ji vrátí zpět.

## Cíle

Cíl posune jeden bod jedné strany silnice na čáru: **Hrana vozovky** nebo **Hrana krajnice**, na **Levé** nebo **Pravé**. Každý průřez narazí na čáru kolmo k ose trasy, vychází ven jen na té straně, takže cíl napravo nikdy nepohne levou stranou.

| Nastavuje | Co se stane tam, kde průřez narazí na čáru |
|---|---|
| **Šířku** | Bod leží na čáře: pruh (nebo krajnice) se k ní rozšíří nebo zúží a zachová svůj příčný sklon. |
| **Výšku** | Bod tam převezme výšku čáry ve svém vlastním odsazení: sleduje příčný sklon pruhu (nebo krajnice). |

Čára může být konstrukční čára (jakékoli její **Použití**) nebo čára jiného koridoru: jeho osa trasy, hrany vozovky, hrany krajnice nebo čáry napojení. Čára koridoru sleduje ten koridor: změníte-li druhou silnici, tato ji bude následovat. CivilCraft sestaví druhý koridor první; dva koridory, které by se na sebe navzájem cílily v kruhu, se na jedné straně odmítnou a tabulka řekne, která.

1. Vyberte osu trasy a zapněte její koridor.
2. Pod **Cíle** klikněte na {{ui:Add a target}}.
3. Vyberte **Stranu**, **Bod**, co **Nastavuje**, a **Na čáru**. Každá změna je jeden krok zpět.

**Výsledek** říká, u kolika průřezů čáry dosáhl. Průřezy, které ji nedosáhnou (za jejími konci nebo tam, kde je za osou trasy), si ponechají hodnoty sestavy. Smazaná čára nechá koridor takový, jaký byl před cílem, a tabulka to uvede. Jedna strana může mít jeden cíl šířky a jeden cíl výšky pro každý bod.

## Sestavení každé strany z částí

Zapněte **Sestavit každou stranu z částí** pod nastavením koridoru. Každá strana pak má vlastní seznam od osy trasy směrem ven: pruhy, krajnici, žlab, obrubník, pás zeleně, chodník a naposledy boční sklon k terénu (s vlastními poměry výkopu a násypu). Začněte s {{ui:Rural road}} nebo {{ui:Urban street}}, přidávejte a odebírejte části, přesouvejte je šipkami a {{ui:Copy}} zkopíruje jednu stranu na druhou. Každá změna je jeden krok zpět.

Příčný sklon je spád od silnice, takže chodník, který odvádí vodu k silnici, má záporný sklon. Obrubník je stěna dané výšky, hrana dané šířky a volitelný pokles na zadní straně. Převýšení natočí každý pruh v prvním řádku; žlab, obrubník, pás a chodník visí z hrany postavených pruhů. Cíle stále posouvají konec pruhů a poslední část. Příčné řezy označují spádovou čáru žlabu, horní a zadní hranu obrubníku a zbytek. Na oblouku se spirálami je přechodový úsek spirála: vodorovný hřbet v TS, plné převýšení v SC.

## Vrstvy vozovky

Pruh, krajnice, žlab, pás zeleně nebo chodník mohou mít svou skladbu: pod částí přidá {{ui:Add a course}} vrstvu s názvem, materiálem, tloušťkou a druhem (povrch, pojivo, podklad, podsyp, ochranná vrstva nebo jiná), shora dolů. Vrstvy neposouvají povrch silnice (její horní hrana je návrhový povrch); každá leží pod svou částí a její hloubka se měří přímo dolů. Příčné řezy kreslí spodní hranu každé vrstvy čárkovaně a {{ui:Pavement courses: quantities}} uvádí plochu v půdorysu a objem každé vrstvy (plocha podél koridoru z jeho průřezů, objem = plocha × tloušťka). Export IFC zapíše každou vrstvu jako vlastní prvek s tloušťkou a materiálem (viz [Export a import IFC](topic:ifc)). Tloušťka, kterou zadáte, je vaše: CivilCraft vozovky nedimenzuje.

## Co zatím není sestaveno

Cíle pro sklon napojení zatím nejsou k dispozici. Pro koridor, který se podél silnice mění, s oddělenou levou a pravou stranou, použijte [Šablony koridorů](topic:corridor-templates). Viz [Zatím není hotovo](topic:not-built-yet).
