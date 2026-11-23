---
title: Co je nového ve verzi 0.9 (dříve)
summary: Šablony koridorů a terénu, přichycení a tlačítka Pick při kreslení, analýza GIS s tabulkou atributů, stínění, výtěžek solární energie, komfort a studie větru pro lokalitu, 3D pohled Vykreslení a doplňky Mračna bodů a WaterCraft.
keywords: co je nového 0.9, dřívější vydání, co je nového, 0.9, poznámky k vydání, šablony koridorů, šablony terénu, editor šablon, typický příčný řez, více koridorů, přichycení, přichytit, pick, přesun, kopie, otočení, tečna, vykreslení, 3d vykreslení, analýza gis, buffer, překryv, prostorové spojení, tabulka atributů, stylování podle atributu, studie stínu, výtěžek solární energie, utci, venkovní komfort, studie větru, openfoam, mračna bodů, las, laz, watercraft, požární průtok, hydrant, stáří vody, chlor, odběry, popisky, rozvržení, co je nového, poznámky k vydání, changelog, změny, 0.8, 0.8.1, verze, nové funkce, déšť, dešťová kanalizace, zadržování vody, zemní práce, bilance, výkop a násyp, přeprava, nejlepší trasa, nejmenší náklady, osa trasy, retenční nádrž, výpust, pokles hladiny, volná výška, postup, zaměření, dron, zásobník, adresa na pozemek, parcela, půda, povodeň, stabilita svahu, bishop, sedání, křižovatka, značení, značky, rozhled, vyrovnání, nejmenší čtverce, polygonový pořad, povrchový důl, radiové spoje, fresnel, výhybka, jazyky, problémy, živě, dwg
from: 4664522c
---

Toto se změnilo v CivilCraft 0.9 oproti 0.8.1. CivilCraft 0.9 je součástí CadCraft Studio 0.9 a jeho osmi aplikací. Hlavní části jsou šablony koridorů a terénu, přichycení při kreslení, analýza GIS, studie slunce, solárního výtěžku, komfortu a větru pro lokalitu a dva doplňky: Mračna bodů a WaterCraft.

## Nové

### Šablony koridorů a terénu

- **Šablony koridorů.** Otevřete {{ui:Povrch}} › {{ui:Více}} › {{ui:Šablony koridorů…}} (nebo zadejte {{cmd:TEMPLATES}}). Šablona je malý příčný řez se součástmi, odsazeními, sklony, materiály a kódy bodů. Uchovejte je v projektu, v {{ui:Moje knihovna}}, nebo jako soubor `.cctemplates.json`. Editor šablon ukazuje kresbu ve skutečném měřítku a při psaní vypisuje problémy.
- **Sestavení ze šablon podle staničení.** Vyberte osu trasy a zapněte {{ui:Sestavit podle šablon podle staničení}} v jejích Vlastnostech. Každá strana každého úseku má vlastní seznam vrstev vozovky a vlastní koncovou podmínku. {{ui:Přidat koridor}} pod {{ui:Koridory na této ose trasy}} umístí na jednu osu trasy několik koridorů.
- **Šablony terénu.** {{ui:Povrch}} › {{ui:Více}} › {{ui:Šablony terénu…}} (nebo zadejte {{cmd:TERRAINTEMPLATES}}) přikládá vrstvené materiály, jako ornici nebo vozovku a podklad, na terén, s plochou a objemem každé vrstvy. Viz [Šablony koridorů a šablony terénu](topic:corridor-templates).

### Kreslení

- **Přichycení.** Nástroje Osa trasy, Plošina, Parcela, Hmota, Konstrukční čára, Měřit, Hranice a Povodí se přichytávají k bodům zaměření, PI, rohům, vrcholům a objektům, s popiskem u značky. Podržte {{key:Alt}} pro volný bod.
- **Tlačítka Pick, tečna a přesun, kopírování, otočení.** Rohy plošin, parcel a konstrukčních čar mají pole pro Easting a Northing a tlačítko Pick s křížkem. Vlastnosti mají také {{ui:Tečna ze dvou bodů}} pro osy trasy a {{ui:Přesun, kopírování a otočení}} pro osy trasy, plošiny, parcely a konstrukční čáry. Viz [Kreslení s přichycením, vybranými rohy a přesunem, kopírováním, otočením](topic:draft-with-snaps).
- **Pohled Vykreslení ve 3D.** Tlačítko {{ui:Vykreslení}} na liště 3D vykreslí terén přirozenými barvami, oblohou, mlhou a měkkými stíny. Model nemění. Nabídka {{ui:Slunce}} má nyní tlačítka {{ui:Použít}} a {{ui:Zavřít}}. Viz [Zobrazit lokalitu ve 3D](topic:site-3d).
- **Panely se otevírají po jednom oddílu.** Levý panel a panel Vlastnosti otevřou jeden oddíl a ostatní zavřou; dlaždice pásu Krajina, které drží více nástrojů, jsou dělená tlačítka.

### Analýza GIS

- **Analýza.** {{ui:Povrch}} › {{ui:Více}} › {{ui:Analýza}} nabízí buffer, překryv, prostorové spojení, výběr podle atributu nebo tvaru a měření. Každý nástroj vytvoří novou vrstvu v jednom kroku zpět.
- **Tabulka atributů.** Nabídka tří teček u vrstvy má {{ui:Tabulka atributů…}} a {{ui:Stylovat podle atributu…}}. Viz [Analýza vrstev GIS](topic:gis-analysis) a [Práce s tabulkou atributů vrstvy](topic:gis-table).

### Lokalita: slunce, solární výtěžek, komfort a vítr

- **Oddíl Prostředí.** Vyberte hmotu: oddíl {{ui:Prostředí}} je ve Vlastnostech pod {{ui:Hodiny oslunění}}. Má studii stínu (mapa, tabulka, animace, CSV), výtěžek solární energie z souboru typického roku s počasím (.epw) a venkovní komfort (UTCI).
- **Vítr, jen orientačně.** {{ui:Spustit studii větru}} obarví terén od sedění po nepříjemné pro každý směr větru v souboru počasí. Není ověřeno a panel to říká.
- **Doplněk Vítr pro chodce (OpenFOAM).** Vypnutý, dokud ho nezapnete v {{ui:Nastavení}} › {{ui:Doplňky}}. OpenFOAM je software, který si nainstalujete sami. Viz [Stín, solární výtěžek a venkovní komfort](topic:environment).

### Mračna bodů (doplněk)

- Zapněte {{ui:Mračna bodů}} v {{ui:Nastavení}} › {{ui:Doplňky}}; na pravém panelu se objeví karta Mračna bodů. Otevřete soubor LAS nebo LAZ, vyčistěte ho, roztřiďte na terén, vegetaci a budovy, vytvořte terén, vrstevnice a objemy a exportujte LAS nebo LAZ. Viz [Mračna bodů z dronu nebo skeneru](topic:point-clouds).

### WaterCraft (doplněk)

- Zapněte {{ui:WaterCraft (rozvod vody)}} v {{ui:Nastavení}} › {{ui:Doplňky}}; objeví se karta WaterCraft. Obsahuje odběry od zákazníků, požární průtok u každého hydrantu, který výpadek řadu je nejdůležitější, a stáří vody a chlor, každé uložitelné jako CSV. Viz [WaterCraft: odběry, požární průtok, výpadky a stáří vody](topic:watercraft).

### Společná práce

- V živé relaci vidíte kurzory a jména ostatních v půdorysu. Knihovna rostlin: CivilCraft Krajina začíná z výchozí sbírky Knihovny, {{ui:Krajina CivilCraft}}.

## Ve všech aplikacích

- Nápovědy se zobrazují jako tooltipy Bootstrap a úvodní tip lze zavřít.
- Pruh karet panelu, který se nevejde, se posouvá místo toho, aby byl oříznut.
- Názvy karet prohlížeče mají tvar `<document> - CivilCraft | CadCraft`.
- {{ui:Nastavení}} má oddíl Rozvržení, kde jsou rozvržení rozbalovací seznam dvouřádkových voleb.
- Jednotky hmotnosti a teploty jsou v {{ui:Nastavení}} › {{ui:Globální}} › {{ui:Jednotky}}.
- Seznam jazyků ukazuje jazyky, pro které má sestava soubory. Jazyky jiné než angličtina jsou strojové koncepty.

## Opraveno

- Doplňky vyhledání adresy a kontroly EnergyPlus nešly zapnout; nyní jdou.
- Nápověda nyní uvádí, že doplněk Mračna bodů zapisuje vyčištěný mrak jako LAS 1.4 nebo LAZ.
- Kliknutí na vlastní úchyt vybraného objektu už nespustí tažení úchytu, které zastavilo čekající Pick.

## Upřímná omezení

- Příkladové šablony koridorů jsou zástupné, nevycházejí z žádné normy; musí je zkontrolovat inženýr. Šablony terénu nepřidávají povrch a nekreslí se ve 3D ani v pohledu na řez. Druhý koridor na ose trasy není v exportu IFC. Mezi dvěma šablonami podle staničení není žádné zúžení.
- Mračna bodů byla testována na smyšlených souborech, ne na skutečném dronovém měření. Čtou se jen LAS a LAZ.
- Analýza GIS byla testována na smyšlených vrstvách.
- Stín, solár a komfort jsou plánovací odhady; vítr je neověřený orientační výpočet. Nic z toho není návrhová hodnota.
- WaterCraft je pomůcka pro výpočty ověřená na smyšlených sítích. Vodohospodářský inženýr rozhodne, co čísla stojí.
- Jazyky jiné než angličtina jsou strojové koncepty.
- Instalátory pro Windows nejsou podepsané kódem a obraz disku pro macOS nemá notářské ověření.

## Dříve: 0.8 a 0.8.1

Toto se změnilo v CivilCraft 0.8 (2026-11-01) a 0.8.1 (2026-11-02) oproti 0.7. Hlavní nové části jsou nástroje, které testují úpravy terénu a lokalitu (déšť, zemní práce, trasy, nádrže, postup), a šest výpočtových oken pro terén, silnice, zaměřování, doly, spoje a železnici.

### Nové

**Otestujte své úpravy terénu**

- **Spustit déšť.** {{ui:Spustit déšť…}} (v části {{ui:Povrch}}) pustí bouři na upravený terén. Sledujete, jak voda stéká z plošin, hromadí se v nízkých rozích a přetéká nádrže, které jsou příliš malé. Běh je animovaný a dává objemy, špičkový odtok a CSV každé nádrže. Výchozí buňka je hrubá, aby byl první pohled rychlý; jemnější buňka je pomalejší. Nádrže, které přetékají, se objeví i v panelu Problémy.
- **Vyrovnání zemních prací.** {{ui:Vyrovnání zemních prací…}} zvedá nebo snižuje plošinu, dokud se výkop nerovná násypu, a ukáže mezi nimi tabulku přeprav.
- **Nejlepší trasa.** {{ui:Nejlepší trasa…}}: vyberte začátek a konec; CivilCraft najde nejlevnější cestu terénem, která dodrží vaše limity spádu a oblouků, a potom z ní vytvoří osu trasy.
- **Retenční nádrže.** {{ui:Retenční nádrže…}} spočítá hladiny a akumulaci z vašeho terénu, přijme výpustná zařízení (otvor, přeliv, V-přeliv, přepad), provede bouři nádrží a zkontroluje zadržený špičkový průtok, dobu poklesu hladiny a volnou výšku.
- **Postup podle zaměření.** {{ui:Postup podle zaměření…}} porovnává povrchy z dronu nebo skenování z různých dat s terénem, jaký byl, a s návrhem: procento dokončení podle objemu, převykopané a přenasypané plochy, zásobníky a kdy práce skončí při tomto tempu (označeno jako odhad).

**Znejte lokalitu**

- **Adresa na pozemek.** {{ui:Adresa na pozemek…}} srovná otevřená data o parcele, budově, územním plánu, půdě, záplavách a terénu pro jednu lokalitu. Lokalitu můžete uchovat v souboru projektu: zadanou adresu, každý zdroj s dnem stažení a jeho licencí a to, co se vrátilo. Znovu otevřete nebo sdílíte projekt a lokalita tam pořád je, bez nového stahování. Můžete ji také uložit jako soubor lokality nebo poslat do BimCraft. Viz [Adresa na pozemek](topic:address-to-site).

**Terén, silnice, zaměřování, doly, spoje a železnice**

- **Zeminy a svahy.** {{ui:Zeminy a svahy…}} kreslí profil zeminy mezi vrty, které zadáte. Bishopova metoda pak hledá kritickou kružnici na vašem terénu s hladinou podzemní vody, přitížením a seismickým součinitelem; sedání základu dostane konsolidaci, okamžité sedání a čas.
- **Křižovatky a značení.** {{ui:Křižovatky a značení…}} spojuje ramena s obrubníkovými oblouky (jeden poloměr na rameno, nebo tříbodové oblouky), rozhledovou vzdálenost pro návrhovou rychlost, kontrolu rozhledových trojúhelníků, přechody pro chodce, zastavovací čáry, značení a dopravní značky s rozpisem značek. Kreslí se v půdorysu a ukládají se jako .dxf s pojmenovanými vrstvami.
- **Vyrovnání měření.** {{ui:Vyrovnání měření…}} provádí vyrovnání metodou nejmenších čtverců polygonového pořadu nebo sítě: vyrovnané souřadnice, chybové elipsy, test chí-kvadrát a označení měření, které nesedí. Volné sítě, uzavření polygonového pořadu kompasovým pravidlem a RW5, terénní soubory GSI, JobXML nebo CSV jsou zahrnuty a vyrovnané body se ukládají jako CSV.
- **Povrchové doly.** {{ui:Povrchové doly…}} převádí vrtná jádra na blokový model a konečnou jámu v rámci vašeho úhlu svahu, s poměrem odkryvu, tabulkou podle etáže a křivkou obsahu a tonáže. Jsou tu i vnořené jámy podle faktoru výnosu a harmonogram výroby s diskontovaným peněžním tokem.
- **Radiové spoje.** {{ui:Radiové spoje…}} kontroluje přímou viditelnost nad vaším terénem s vyklenutím Země, první Fresnelovou zónou, rozpočtem spoje, rezervou na útlum a výpadkem vícecestného šíření a dá výšku stožáru, která by trasu uvolnila. Dělá také rozpočty útlumu optických vláken, množství tras a vítr na věži.
- **Železniční výhybky.** {{ui:Železniční výhybky…}} vytvoří výhybku z jejího čísla srdcovky, přejezdy mezi rovnoběžnými kolejemi a průjezdný profil, který se naklání převýšením a v oblouku se rozšiřuje. Výhybka může ležet na staničení osy trasy.

Viz [Zeminy, křižovatky, vyrovnání měření, doly, radiové spoje a výhybky](topic:soils-roads-survey-mines-links).

### Ve všech aplikacích

- **Jazyky.** 54 jazyků, z toho deset nových. Jazyky jiné než angličtina jsou strojové koncepty, dokud je nepřečte rodilý mluvčí. Témata nápovědy jsou zatím většinou v angličtině.
- **Řádky panelu nástrojů.** {{ui:Nastavení}} › {{ui:Obecné}} › {{ui:Řádky panelu nástrojů}}: Zalamovat (jako dřív), 2 řádky, nebo 1 řádek. Pás CivilCraft ukazuje nejpoužívanější nástroj velký, další malé a zbytek za šipkou u názvu skupiny.
- **Vstupní zařízení.** Touchpad, pero, 3D myš, ovladač a MIDI mohou aplikace ovládat.
- **Problémy.** Panel Problémy, který varuje ve všech aplikacích, s kontrolami, které čtou balíčky předpisů.
- **Živě.** Pohled na to, kdo je kde v živé relaci.
- **Doplňky.** Seznam doplňků, včetně doplňků osvětlení.
- **Připojte svou AI.** Kterýkoli asistent, kterého připojíte, může ovládat nástroje CivilCraft. Součástí je poznámka, že připojení jedním kliknutím v CadCraft Studio a hostovaný konektor zatím nejsou připraveny. Viz [Nechte AI asistenta pracovat s vaší lokalitou](topic:assistants).

### Opraveno ve verzi 0.8.1

- **Oddíl tříd DWG.** Byl čten jako špatný typ (GitHub cadcraft#5). Opraveno v CivilCraft spolu s CadCraft, BimCraft, ModelCraft a TakeoffCraft.
- **Přepínání jazyka za běhu.** CadCraft Studio a balené edice mohou měnit jazyk za běhu. Dříve byly jen v angličtině. Zatím netestováno na každé platformě: dejte nám vědět, pokud se jazyk nezmění.

### Zatím není v této verzi

- **Jsou to pomůcky pro výpočty.** Každý výsledek v nových oknech potřebuje kontrolu inženýra. Pevnosti zemin vycházejí z typických hodnot pro skupinu zeminy a okno to říká.
- **Spustit déšť.** Běh na vzorové lokalitě může v prohlížeči trvat přes dvě minuty při jemné buňce. Ověřeno na ručních případech a na V-tvaru povodí, zatím ne na skutečně upraveném terénu.
- **Adresa na pozemek.** Čte otevřené datové soubory, které přinesete, a byla testována jen na našich vlastních souborech. Stromy nejsou zdroj. Stahování zdrojů za vás čeká na znění o ochraně osobních údajů.
- **Postup podle zaměření.** Testováno jen na smyšlených zaměřeních. Postup na listech a poznámkách (MarkupCraft) a porovnání skenu s modelem (BimCraft) nejsou hotové.
- **Zeminy a svahy.** Jen kruhové plochy: bez klínového nebo blokového hledání a bez trhliny v tahu.
- **Křižovatky.** Jeden poloměr na rameno, bez zametacích křivek nákladních vozidel, a zatím nejdou do koridoru.
- **Terénní soubory.** Čtečky byly napsány z veřejných popisů formátů a vyzkoušeny na našich souborech. Hledají se skutečné soubory z přístrojů.
- **Spoje a železnice.** Radiové spoje: jen útlum volného prostoru a vícecestné šíření (bez útlumu deštěm a bez směrových charakteristik antén); a žádná železniční norma: každý limit pro železnici je zástupný, s koncepčními čísly, která žádný železniční inženýr nekontroloval.
- **Windows a macOS.** 0.8 není podepsáno kódem. Windows může varovat a macOS žádá pravé tlačítko a potom Otevřít.

Vše ostatní je v [Ještě není hotovo](topic:not-built-yet). Pro dřívější vydání viz [Co je nového ve verzi 0.7](topic:whats-new-0-7).
