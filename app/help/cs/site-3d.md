---
title: Prohlížení staveniště ve 3D
summary: Otevřete 3D pohled, oběhněte, posouvejte a přibližujte, nastavte svislé zvětšení a barvení, vyberte, co se zobrazí, a klikněte na osy trasy, plošiny, čáry prvků, lomové hrany, potrubí, objekty a body pro jejich výběr.
keywords: popisky, 3D popisky, popisky natočené ke kameře, popisky staničení, popisky vrstevnic, popisky bodů, přetažení, letecký snímek, mapové vrstvy na povrchu, 3D, tři D, 3D pohled, kostka pohledu, kompas, oběh, perspektiva, rovnoběžné promítání, izometrie, iso, svislé zvětšení, terén, model, model staveniště, prolétnutí, vizualizace, vykreslení, potrubí v 3D, objekty, šachty, koridor v 3D, silnice v 3D, povrch vozovky, jízdní pruhy, obrubníky, chodníky, rostliny v 3D, stromy v 3D, keře, živé ploty, krajina 3D, rampy v 3D, schody, zdi, dlažba, zpevněné plochy 3D
from: a16bafe1
---

3D pohled ukazuje staveniště jako jeden model: stávající terén a upravený povrch, vrstevnice na nich položené, lomové hrany a okraj povrchu, každou osu trasy na jejím návrhovém profilu se značkami staničení, charakteristické čáry koridoru a samotnou silnici (jízdní pruhy, krajnice, žlaby, obrubníky, pásy a chodníky ve vlastních barvách), plošiny s jejich napojením na terén, síť potrubí s potrubím a objekty ve skutečných výškách, a z pracovního prostoru Krajina také rostliny, dlažbu, cesty, zdi, obrubníky, rampy a schody. Čte stejný projekt jako půdorys, takže každá úprava se ukáže v obou.

## Otevření 3D pohledu

1. Otevřete zaměřené body (nebo soubor LandXML či projekt), aby existoval povrch. Samotné rostliny, dlažba nebo rampy stačí, aby se otevřel také.
2. Stiskněte {{key:D}}, nebo klikněte na {{ui:3D}} ve skupině {{ui:Pohled}} na panelu nástrojů. 3D pohled se otevře nad půdorysem a dívá se na celé staveniště od jihovýchodu. Poprvé se načítá chvíli.
3. Stiskněte {{key:D}} znovu, nebo klikněte znovu na {{ui:3D}}, abyste se vrátili k půdorysu. Výběr kreslicího nástroje, například {{ui:Osa trasy}} nebo {{ui:Plošina}}, také přepne na půdorys, protože kreslení se odehrává tam.

## Pohyb kolem

| Chci | Udělat toto |
|---|---|
| Oběhnout | Táhnout levým nebo prostředním tlačítkem |
| Posunout | Táhnout pravým tlačítkem, nebo {{key:Shift}} a táhnout |
| Přiblížit | Otočit kolečkem; přibližuje k ukazateli |
| Oběhnout na touchpadu | Přejet dvěma prsty ({{key:Shift}} a přejetí posouvá) |
| Přiblížit na touchpadu | Stisk dvou prstů |
| Dotyk | Jeden prst obíhá; dva prsty stiskem přibližují a posunem posouvají |
| Klávesy (pohled má zaměření) | {{key:Left}} {{key:Right}} {{key:Up}} {{key:Down}} oběhnou, s {{key:Shift}} posouvají; {{key:Plus}} a {{key:Minus}} přibližují |

Lišta nad pohledem má zbytek:

- Seznam pohledů: **Iso**, **Shora**, **Zdola**, **Zepředu** (pohled na sever), **Zezadu**, **Zleva**, **Zprava**.
- {{ui:Perspektiva}}: stisknuto je perspektivní pohled; klikněte pro rovnoběžné promítání (bez zkrácení).
- {{ui:Rozsah}}: ukáže vše znovu. {{key:F}} dělá totéž, dokud je 3D pohled otevřen.

## Kostka pohledu

Kostka pohledu v pravém horním rohu se otáčí s pohledem. Klikněte na stranu, hranu nebo roh, abyste se dívali na staveniště odtud (kamera se otočí plynule, pokud váš systém nežádá omezený pohyb). Táhnutím kostky oběhnete. Kruh kompasu pod ní ukazuje sever (mřížkový sever, +Y): táhněte kruhem pro otočení staveniště kolem svislé osy, nebo klikněte na N, E, S nebo W, abyste se dívali z té strany. {{ui:Domů}}, malý domeček v jejím levém horním rohu, se vrátí k izometrickému pohledu na celé staveniště. Klávesnicí: {{key:Tab}} na kostku, šipky vyberou stranu, hranu nebo roh, {{key:Enter}} se podívá odtud.

Na půdorysu ukazuje stejná kostka horní stranu. Klikněte na jinou stranu, hranu nebo roh (nebo ji táhněte), abyste otevřeli 3D pohled odtud: to je nejrychlejší cesta do 3D z daného směru. Chcete-li kostku nahradit malou ikonou os nebo ji skrýt, viz **Indikátor rohu** v [Nastavení CivilCraft](topic:settings).

## Svislé zvětšení výšek

Staveniště bývají mnohem širší než vysoká, takže výšky se na začátku natahují **2×**. Zvolte **1×**, **2×**, **3×**, **5×** nebo **10×** v seznamu na liště, nebo v **Svislé zvětšení 3D** v [Nastavení CivilCraft](topic:settings) (obojí je jedno nastavení). Mění se jen pohled: objemy, profily a exporty zůstávají ve skutečném měřítku.

## Barvení povrchů

- **Pásy výšek**: stejné pásy a barvy jako pásy výšek půdorysu (počet pásů se nastavuje v **Zobrazení** v levém panelu). Každá hrana pásu je přesně oříznuta v jeho výšce.
- **Jedna barva**: stávající terén a upravený povrch, každý v jednotné barvě.
- **Mapové vrstvy**: mapové vrstvy zobrazené pod půdorysem (georeferencovaný obrázek, mapové dlaždice nebo mapová služba; viz [Mapové vrstvy](topic:map-layers)) položené na povrchy jako list, takže letecký snímek se ukáže na kopcích. Obrázky, které ještě přicházejí, se doplňují, jakmile dorazí. Když žádná mapová vrstva není zobrazena, povrchy si ponechají pásy výšek a pohled to říká. Obrázek je pro obrazovku: exporty GLB a OBJ jej nenesou.

Jsou-li zobrazeny oba povrchy, je stávající terén průhledný nad upraveným povrchem, takže vidíte výkop (terén nad návrhem) a násyp.

## Výběr, co se zobrazí

Klikněte na {{ui:Zobrazit}} na liště a zaškrtněte nebo odškrtněte:

| Položka | Co to je |
|---|---|
| Stávající terén | Povrch vytvořený ze zaměřených bodů (nebo načtený z LandXML) |
| Upravený povrch | Stávající terén s koridory a plošinami zarovnanými dovnitř (jen když nějaké jsou) |
| Hrany trojúhelníků | Každá hrana TIN jako čáry |
| Vrstevnice | Hlavní a vedlejší vrstevnice každého zobrazeného povrchu, v intervalu půdorysu |
| Okraj povrchu | Vnější okraj každého zobrazeného povrchu v jeho výškách |
| Lomové hrany | Každá lomová hrana v jejích výškách |
| Osy trasy a staničení | Každá osa trasy na svém návrhovém profilu (na terénu, kde žádný profil není), se značkami každých 50 ft nebo 20 m |
| Charakteristické čáry koridoru | Hrana vozovky, krajnice a napojení na terén na obou stranách |
| Povrchy silnic | Silnice, kterou každý koridor vytváří ze svého příčného řezu: jízdní pruhy, krajnice, žlaby, obrubníky, pásy a chodníky, každý ve vlastní barvě, na upraveném povrchu |
| Rostliny | Každá rostlina, a rostliny v záhonech a živých plotech, jako jednoduché tvary velikosti podle seznamu rostlin: strom je kmen a kulatá koruna (kužel u jehličnanu, trs na vysokém kmeni u palmy), keře, rostliny živých plotů, trvalky a půdopokryvné rostliny jsou kopule, trávy trsy, popínavé rostliny tenké sloupce. Stojí na upraveném povrchu (nebo na stávajícím terénu) ve velikosti, kterou ukazuje půdorys: dospělé, nebo při výsadbě |
| Zpevněné plochy | Dlažba a cesty se spády, zdi, obrubníky, schody a rampy, které stoupají v úsecích s rovnými podestami mezi nimi |
| Plošiny a napojení na terén | Obrys každé plošiny v její výšce a její čára napojení na terén |
| Potrubí a objekty | Potrubí jako kulatá potrubí mezi jejich dny, objekty od rámu po kalový prostor |
| Zaměřené body | Tečka u každého bodu s výškou (zpočátku vypnuto) |
| Vrstvy GIS | Vrstvy GIS zobrazené na půdorysu, v jejich barvách: čáry a obrysy ve vlastních výškách, ostatní položené na stávajícím terénu (přesně ho sledují); body jako malé kříže. Tvary bez výšek mimo povrch jsou vynechány a pohled říká, kolik jich je |
| Popisky | Názvy a hodnoty, které vždy čelí k vám: název každé osy trasy na jejím začátku a staničení každých 100 ft (nebo 100 m), výška každé hlavní vrstevnice, plošiny, charakteristické čáry a objekty podle názvu, a když je zaškrtnuto **Zaměřené body**, číslo a výška každého bodu |

Popisky zůstávají stejně velké a svisle, ať se otáčíte nebo přibližujete, a kopec před popiskem jej skryje. Tam, kde by se tísnily, se ukážou nejdůležitější a zbytek čeká, až přiblížíte: nejdřív osy tras, pak objekty, plošiny, čáry prvků, staničení, vrstevnice a body, bližší nejdřív. Jsou jen na obrazovce; exporty a tisky je vynechají.

Vaše volby, svislé zvětšení a barvy se pamatují v tomto prohlížeči.

Silnice se staví na stávajícím terénu. S osou trasy a koridorem, ale bez zaměřených bodů nebo povrchu, se silnice kreslí na plochém záložním terénu: v průměrné výšce svého návrhového profilu, nebo vodorovně ve výšce 0, když ani profil není. Varování dole ve 3D pohledu a ve vlastnostech koridoru to říká. Je to jen obrázek: neplynou z něj žádné objemy ani řezy. Otevřete zaměřené body nebo povrch a silnice se sama přesune na skutečný terén.

Svislé zvětšení natahuje terén, ne rostliny: stojí na zvětšeném terénu ve své skutečné výšce a šíři, takže strom vypadá jako strom při jakémkoli nastavení. Rostliny jsou jednoduché tvary, ne podrobné modely: tisíce z nich zůstávají rychlé na otáčení a přibližování.

## Potrubí a objekty

- Potrubí se kreslí se spodní vnitřní hranou na dnech, která nastavíte, a horní hranou (temenem) o jeden vnitřní průměr výš. Průměry jsou v palcích v projektu v stopách a v milimetrech v metrickém projektu, jak je v pravém panelu.
- Objekt jde od svého rámu (napsaného, nebo z povrchu) dolů ke svému kalovému prostoru (nejnižší dno minus hloubka kalového prostoru). Bez jakéhokoli dna se kreslí hluboký 5 ft (1.5 m).
- Potrubí a objekty s problémem (viz kontrola sítě v pravém panelu) jsou kresleny červeně.
- Potrubí bez den se nekreslí; poznámka dole v pohledu říká, kolik jich je.

## Výběr z 3D pohledu

Klikněte na osu trasy (nebo její silnici), plošinu, čáru prvku, potrubí, objekt, zaměřený bod, rostlinu, rampu nebo jiný zpevněný prvek. Vybere se stejně, jako byste klikli v půdorysu: jeho vlastnosti se otevřou v pravém panelu, kde je můžete upravit, a je vykreslen ve výběrové barvě nad vším ve 3D. Cokoli vyberete v půdorysu, je zvýrazněno i ve 3D. Tip vedle ukazatele pojmenuje, na co jste klikli, s jeho X, Y a výškou. Potrubí a objekty lze kliknout i tam, kde jsou pod zemí; čára skrytá za kopcem přes něj proklikat nejde.

Klikněte na lomovou hranu a zjistíte, která to je: je zvýrazněna a stavový řádek ji pojmenuje (lomové hrany nemají vlastní vlastnosti).

Klikněte na terén a přečtěte v tipu X, Y a výšku na tomto místě.

## Jízda podél osy trasy

Klikněte na **Jízda** na liště 3D a vyberte osu trasy. Pohled se přesune na místo řidiče: 3,5 ft (1.07 m) nad silnicí, na jejím návrhovém profilu (na stávajícím terénu podél osy, když ještě žádný nemá), s pohledem vpřed podél ní.

- **Přehrát** nebo {{key:Space}} jede rychlostí, kterou vyberete (10 až 65 mph, nebo 15 až 100 km/h); {{key:Space}} znovu pozastaví. Na konci se zastaví; **Přehrát** pak začne znovu od začátku.
- Posuvník skočí na libovolné staničení; {{key:Left}} a {{key:Right}} posunou o 10 ft (5 m) zpět a vpřed.
- Tažení v pohledu pozastaví a dovolí se rozhlédnout.
- **Zastavit** nebo {{key:Esc}} vrátí pohled tam, kde byl.

Převýšení platí i při jízdě: nastavte 1×, abyste viděli silnici tak, jak bude.

## Světlo ze slunce

Otevřete **Slunce** na liště 3D a zaškrtněte **Světlo ze slunce**. Zadejte datum, čas na hodinách a jeho časové pásmo (odchylku od UTC: v létě letní čas), a zeměpisnou šířku a délku staveniště. Když má projekt souřadnicový systém, vyplní se z něj.

Staveniště je pak osvětleno odtud, kde je slunce, se **Stíny** přes terén, koridor a plošiny; nabídka říká azimut slunce a jak je vysoko, nebo že je pod obzorem. Polohy pocházejí ze slunečních rovnic NOAA. Stíny padají správně při jakémkoli zvětšení, ale končí na okraji staveniště: kopce a budovy za ním žádné nevrhají.

## Export 3D pohledu

Klikněte na {{ui:GLB}} nebo {{ui:OBJ}} na liště. Co pohled ukazuje, se uloží ve skutečném měřítku (bez zvětšení), v metrech, s osou Y nahoru. Podrobnosti: [Export staveniště do 3D](topic:export-3d).
