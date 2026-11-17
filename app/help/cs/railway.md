---
title: Navrhnout železniční trať
summary: Změňte osu na železnici: přechodnice (klotoida, kubická parabola, Bloss, Helmert, sinusová půlvlna, sinusoida), převýšení u každého oblouku s rovnovážným převýšením, nedostatek a přebytek převýšení, limity převýšení a geometrie trati jako varování, výhybky a kolejové spojky podle staničení, obálka průjezdného profilu prošlá podél trasy a trať s kolejnicemi, pražci a štěrkovým ložem vytvořená jako koridor, v půdorysu, řezech, podélném profilu, 3D a výkazech množství.
keywords: železnice, kolejnice, železniční trať, kolej, vlak, metro, tramvaj, převýšení, převýšení v oblouku, nedostatek převýšení, přebytek převýšení, rovnovážné převýšení, přechodnice, přechodový oblouk, klotoida, kubická parabola, Bloss, Helmert, sinusová půlvlna, kosinus, rozchod, normální rozchod, širokorozchodná, metrový rozchod, úzkorozchodná, pražec, pražec, pražec, štěrkové lože, podsypová vrstva, pláň, krajnice, osové vzdálenosti kolejí, 60E1, 54E1, UIC60, 115RE, 136RE, sklon převýšení, rychlost změny převýšení, výhybka, jazyk výhybky, výhybka, kolejová spojka, srdcovka, číslo srdcovky, délka výhybky, uzavírací oblouk, rychlost v odbočce, průjezdný profil, obálka průjezdného profilu, průjezdný profil, nakládací profil, kinematická obálka, nástupiště, mezera u nástupiště, vzdálenost kolejí, podélný sklon, výškový oblouk, nejmenší poloměr, LandXML převýšení
from: 99de9745
---

Libovolná osa může být železniční kolejí. Její oblouky pak dostanou přechodnice a převýšení (převýšení kolejnic) a její koridor se vytvoří jako trať: kolejnice na pražcích na štěrkovém loži, zaústěné do terénu jako silnice. Výhybky a kolejové spojky se na ni umisťují podle staničení a obálku průjezdného profilu lze prohnat podél trati a zkontrolovat, co stojí vedle koleje.

Všechny číselné hodnoty níže jsou **zástupné**, nejsou to normy. Železnice si limity stanovují podle traťové rychlosti, typu trati a země; nastavte je podle vlastní železniční normy. CivilCraft žádnou národní tabulku neobsahuje.

## Nastavení osy jako železniční trati

1. Vyberte osu a v části **Vlastnosti** najděte **Železnice**.
2. Zaškrtněte **Tato osa je železniční trať**. Každá změna je jeden krok zpět.
3. Nastavte **Návrhovou rychlost** v horní části vlastností osy: je to traťová rychlost, proti které se kontroluje převýšení. **Nejpomalejší vlaky** (v bloku Železnice) je rychlost, proti které se kontroluje přebytek převýšení.

## Přechodnice

U každého oblouku zadejte délku přechodnice na obou koncích v tabulce PI (**Přechodnice vstup**, **Přechodnice výstup**) a poté zvolte jeho typ v tabulce oblouků bloku Železnice, nebo použijte **Přechodnice u každého oblouku**:

| Typ | Křivost podél přechodnice |
|---|---|
| Klotoida | roste rovnoměrně (silniční přechodnice) |
| Kubická parabola | y = x³ / (6·R·L), kde L se měří podél tečny; samotný oblouk je o něco delší |
| Bloss | 3u² − 2u³ z plné křivosti (u = podíl délky): začíná a končí jemně |
| Helmert | dvě paraboly, nejprve 2u², poté 1 − 2(1 − u)² |
| Sinusová půlvlna | (1 − cos πu) / 2 |
| Sinusoida | u − sin(2πu) / 2π |

Všechny kromě kubické paraboly se stáčejí o L / 2R, stejně jako klotoida. Staničení se počítá podle skutečné délky. LandXML zachovává typ (spiType clothoid, cubicParabola, bloss, biquadratic, cosine, sinusoid).

## Převýšení

Pro každý oblouk zadejte **Převýšení** v milimetrech. Tabulka pro každý oblouk zobrazuje:

- **Rovnovážné** převýšení = G·v² / (g·R), kde G je osová vzdálenost kolejnic (**Osová vzdálenost kolejnic**, tedy rozchod plus šířka hlavy kolejnice, pokud ji nezadáte ručně). Pro G = 1500 mm to je známý vzorec 11.8·V² / R (V v km/h, R v m).
- **Nedostatek** = rovnovážné převýšení při traťové rychlosti − použité převýšení.
- **Přebytek** = použité převýšení − rovnovážné převýšení při rychlosti nejpomalejších vlaků.
- **Náběh**: nejstrmější sklon převýšení podél jeho náběhů, v milimetrech na metr.

Převýšení narůstá přes každou přechodnici a tvarem odpovídá její křivosti: přímo u klotoidy nebo kubické paraboly, tvarem Bloss u přechodnice Bloss a podobně. Konec oblouku bez přechodnice se převýší na přímém úseku před ním, a to tak dlouho, jak to vyžaduje limit sklonu převýšení, a program to uvede: převýšení se pak mění tam, kde se nemění křivost.

**Převýšení se otáčí kolem** určuje, která kolejnice zůstává na návrhovém profilu: **nižší kolejnice** (obvyklé), **vnitřní kolejnice**, nebo **osa koleje** (každá kolejnice se posune o polovinu převýšení). Návrhový profil je zde horní hrana kolejnice.

**Diagram převýšení** kreslí výšku každé kolejnice nad profilem podél staničení; pohled na profil a listy s půdorysem a profilem zobrazují totéž jako pás pod profilem.

## Limity a varování převýšení

**Největší použité převýšení**, **Největší nedostatek převýšení**, **Největší přebytek převýšení**, **Nejstrmější sklon převýšení** a **Nejrychlejší změna převýšení** (sklon při traťové rychlosti, mm/s) se kontrolují u každého oblouku. Hodnota nad limitem je varování v bloku Železnice a na panelu Problémy, s uvedením limitu a zjištěné hodnoty. Bez návrhové rychlosti se nedostatek a rychlost změny nekontrolují (poznámka to uvádí).

## Kolej

Nastavte **Rozchod** (předvolby normální 1435 mm, široký, metrový nebo úzký, nebo vlastní hodnotu), **Profil kolejnice** (60E1, 54E1, 49E1, 115RE, 136RE: pouze jejich publikované rozměry), počet **Kolejí** a jejich **Osové vzdálenosti kolejí**, poté **Pražce a štěrkové lože**: materiál pražce, délku, šířku, výšku a rozteč; tloušťku štěrku pod pražcem (u nižší kolejnice), rameno, sklon a to, o kolik je jeho horní hrana níž než pražce; tloušťku podsypové vrstvy, krajnici za patou štěrku a příčný sklon pláně.

Stiskněte **Vytvořit kolej**. Zapne se koridor osy, vytvořený jako trať podél návrhového profilu: kolejnice a pražce se naklánějí s převýšením, pláň nikoli. Svahy napojení do terénu vedou od hrany krajnice v zářezových a násypových svazích koridoru a kolej se zaúsťuje do navrženého povrchu jako silnice.

- **Půdorys**: obě kolejnice každé koleje (vrstva C-RAIL-TRAK) a při více kolejích také osa každé koleje (C-RAIL-CNTR), na obrazovce, v DXF, DWG, PDF a v listech s půdorysem a profilem.
- **Řezy**: pražce, kolejnice, spodní hrany štěrkového lože a podsypové vrstvy v každém řezu.
- **3D**: kolejnice, každý pražec a štěrkové lože (Zobrazit › Kolej), také v GLB, OBJ a USD.
- **Výkazy množství**: délka trati, kolejnice (obě kolejnice každé koleje, podél vlastní osy každé koleje), pražce, štěrkové lože a štěrk bez pražců, a podsypová vrstva, metodou průměrných koncových ploch mezi řezy.

## Kontroly geometrie trati

Kromě převýšení kontroluje blok Železnice samotnou osu proti dalším šesti limitům (všechny zástupné, všechny nastavuje uživatel):

- **Nejstrmější sklon** návrhového profilu, v milimetrech na metr.
- **Nejmenší poloměr výškového oblouku**, jako činitel k v R ≥ k·V² (R v metrech, V v km/h). Parabolický výškový oblouk délky L mezi dvěma sklony má poloměr L děleno změnou sklonu.
- **Nejkratší výškový oblouk**.
- **Nejmenší poloměr oblouku** v půdorysu (0 kontrolu vypne).
- **Nejkratší oblouk nebo přímka**, jako doba jízdy v sekundách při traťové rychlosti: varuje se, pokud je kruhový oblouk nebo přímka mezi dvěma oblouky kratší než tato vzdálenost. 1.8 s odpovídá známému pravidlu „polovina rychlosti v km/h, v metrech“.
- **Rychlost změny nedostatku převýšení** přes každou přechodnici, v mm/s při traťové rychlosti.

**Geometrie trati** uvádí nalezený nejstrmější sklon a každý výškový oblouk s jeho poloměrem a poloměrem, který vyžaduje traťová rychlost. Výškový oblouk ležící na přechodnici nebo na náběhu převýšení dostane poznámku. Bez návrhového profilu nebo bez návrhové rychlosti se kontroly, které je potřebují, přeskočí a poznámka to uvede.

## Výhybky a kolejové spojky

V části **Výhybky a kolejové spojky** stiskněte **Přidat výhybku**. Výhybka se umístí na nejdelší přímý úsek; v tabulce nastavte:

- **Staničení hrotu jazyka**: kde výhybka na této ose začíná.
- **Srdcovka**: číslo srdcovky N (1:N). Úhel srdcovky je 2·atan(1 / 2N).
- **Strana**: vlevo nebo vpravo při pohledu proti směru staničení.
- **Rozteč spojky** v metrech: je-li větší než 0, výhybka se změní na spojku k rovnoběžné koleji v této vzdálenosti (dvě výhybky a přímka mezi nimi).

Tabulka zobrazuje **Délku výhybky** (hrot jazyka až srdcovka), **Poloměr** uzavíracího oblouku a **Rychlost v odbočce**, kterou tento poloměr připouští při vašem limitu nedostatku převýšení a bez převýšení. **Vytvořit její kolej** přemění odbočnou větev na vlastní osu (jazyk, uzavírací oblouk, poté přímo pod úhlem srdcovky) se stejným nastavením železnice, připravenou k prodloužení.

Půdorys kreslí dvě odbočné kolejnice každé výhybky, její osu, značku u hrotu jazyka a u srdcovky a „1:N“ (vrstva C-RAIL-TURN), na obrazovce i v DXF, DWG, PDF a listech. 3D zobrazení kreslí odbočné kolejnice na úrovni hlavní koleje.

Tvar je **zástupný**: přímá výhybka a jeden uzavírací oblouk podle čísla srdcovky. Skutečně postavená výhybka se řídí normou železnice a výkresem výrobce. Varování: výhybka, která vybíhá z osy, leží na oblouku, přechodnici, převýšení nebo výškovém oblouku, nebo se překrývá s jinou; a poznámka, je-li traťová rychlost vyšší než rychlost v odbočce.

## Obálka průjezdného profilu

Zaškrtněte **Prohnat obálku průjezdného profilu podél této trati**. Zvolte **Obrys** (dva zástupné tvary nebo **Vlastní obrys** zadaný jako bod na řádku: odsazení od osy koleje, poté výška nad horní hranou kolejnice, v metrech), **Délku vozidla** a **Osové vzdálenosti podvozků** a případně **Hranu nástupiště** (strana, vzdálenost od osy koleje, výška nad kolejnicí).

Na každé stanici se obrys naklání s převýšením kolem nižší kolejnice a rozšiřuje se v oblouku: střed vozidla se posune dovnitř o b² / 8R, jeho konce ven o (L² − b²) / 8R (b jsou osové vzdálenosti podvozků, L délka vozidla, R poloměr v daném místě, podle přechodnice). Blok kreslí řez na přímém úseku a tam, kde je nejširší, a uvádí:

- **nejširší obálku** a kde leží,
- **osové vzdálenosti kolejí** porovnané s vzdálenostmi, které vyžadují dvě sousední obálky,
- volný prostor u **hrany nástupiště**, nebo o kolik do něj zasahuje,
- každou hranovou čáru, konstrukci potrubí a jinou železniční osu nalezenou **uvnitř obálky**.

Hranová čára s výškovými kótami se posuzuje proti obrysu v její výšce nad kolejnicí; bez návrhového profilu nebo u bodu bez výškové kóty se posuzuje pouze v půdorysu a seznam to uvádí. Půdorys zobrazuje dvě hrany obálky (vrstva C-RAIL-CLRN) s křížkem u každé věci uvnitř.

Nabízené obrysy jsou **zástupné, nejde o žádný rozchod železnice**. Před použitím výsledku zadejte průjezdný profil své železnice.

## V jiných programech

- **LandXML**: železniční osa se zapíše s přechodnicemi (spiType) a blokem `Cant`: rozchod, bod otáčení, traťová rychlost a staničení, kde každý náběh převýšení začíná a končí, s použitým převýšením, rovnovážným převýšením a nedostatkem. Otevření souboru LandXML s blokem `Cant` z něj udělá železniční osu s těmito převýšeními.
- **IFC**: osa s úseky převýšení, kolejnice, pražce, štěrkové lože a podsypová vrstva.

## Ještě není hotovo

Výhybky v exportu IFC, typy výhybek kromě jednoho uzavíracího oblouku (zakřivené jazyky, srdcovky s pohyblivým hrotem, skluzy, diamanty), pravidla kinematického profilu (obálka je pevný obrys s vychýlením v oblouku), trolejové vedení a zabezpečovací zařízení.

**Která norma.** V bloku Železnice volba „Citovaná norma“ nabízí Žádná nebo Evropská (UIC a EN). Volba Evropská uvede dokumenty, které evropské projekty citují (EN 13803 pro parametry osy, EN 13232 pro výhybky a křižovatky, EN 15273 pro profily, EN 13848 pro kvalitu geometrie trati), a u každého limitu přidá pole pro článek, ze kterého pochází. Žádné číslo z žádné normy není vestavěné: limity převýšení, nedostatku, přebytku, sklonu a rychlosti změny, geometrie výhybek i průjezdný profil jsou stále zástupné a okno to uvádí. Železniční inženýr ověří každou hodnotu podle textu normy a vedle ní zapíše článek, dříve než se cokoli postaví. Jihoafrické a tabulky AREMA nejsou v této verzi obsaženy.
