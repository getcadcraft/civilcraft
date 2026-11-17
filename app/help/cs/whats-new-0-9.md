---
title: Co je nového ve verzi 0.9
summary: Šablony koridorů a terénu, přichycení a tlačítka výběru bodů při kreslení, analýza GIS s tabulkou atributů, studie stínu, solární výnos, komfortu a větru pro lokalitu, 3D pohled Vykreslení a doplňky Mračna bodů a WaterCraft.
keywords: co je nového, 0.9, poznámky k vydání, šablony koridorů, šablony terénu, editor šablon, typický řez, více koridorů, přichycení, přichytit, výběr, přesun, kopírování, otočení, tečna, vykreslení, 3d vykreslení, analýza gis, pufr, překryv, prostorové spojení, tabulka atributů, stylovat podle atributu, studie stínu, solární výnos, utci, venkovní komfort, studie větru, openfoam, mračna bodů, las, laz, watercraft, požární průtok, hydrant, stáří vody, chlor, odběry, bublinové nápovědy, rozvržení, co je nového, poznámky k vydání, changelog, změny, 0.8, 0.8.1, verze, nové funkce, déšť, dešťová kanalizace, zaplavování, přelévání, zemní práce, bilance, výkop a násyp, odvoz, nejlepší trasa, nejmenší náklady, osa trasy, retenční nádrž, odtok, pokles hladiny, volná výška, postup, zaměření, dron, skládka, adresa na pozemek, parcela, půda, povodeň, stabilita svahu, bishop, sedání, křižovatka, značení, značky, rozhledová vzdálenost, vyrovnání, nejmenší čtverce, polygonový pořad, povrchový důl, blokový model, radiové spojení, fresnelova zóna, výhybka, křižovatka kolejí, jazyky, problémy, live, dwg
from: d7ac5b14
---

Tohle se změnilo v CivilCraft 0.9 oproti verzi 0.8.1. CivilCraft 0.9 je součástí CadCraft Studio 0.9 a jeho osmi aplikací. Velké části jsou šablony koridorů a terénu, přichycení při kreslení, analýza GIS, studie slunce, solárního výnosu, komfortu a větru pro lokalitu a dva doplňky: Mračna bodů a WaterCraft.

## Novinky

### Šablony koridorů a terénu

- **Šablony koridorů.** Otevřete {{ui:Povrch}} › {{ui:Více}} › {{ui:Šablony koridorů…}} (nebo napište {{cmd:TEMPLATES}}). Šablona je malý příčný řez se součástmi, odsazeními, sklony, materiály a kódy bodů. Uchovávejte je v projektu, v {{ui:Moje knihovna}}, nebo jako soubor `.cctemplates.json`. Editor šablon zobrazuje kresbu v pravém měřítku a výčet problémů, jakmile píšete.
- **Sestavení podle šablon podle staničení.** Vyberte osu trasy a v jejích Vlastnostech zapněte {{ui:Sestavit podle šablon podle staničení}}. Každá strana každého úseku má vlastní seznam vozovky a vlastní koncovou podmínku. {{ui:Přidat koridor}} pod {{ui:Koridory na této ose trasy}} umístí na jednu osu více koridorů.
- **Šablony terénu.** {{ui:Povrch}} › {{ui:Více}} › {{ui:Šablony terénu…}} (nebo napište {{cmd:TERRAINTEMPLATES}}) položí vrstvené materiály, například ornici nebo vozovku a podklad, na terén, s plochou a objemem pro každou vrstvu. Viz [Šablony koridorů a šablony terénu](topic:corridor-templates).

### Kreslení

- **Přichycení.** Nástroje Osa trasy, Plocha, Parcela, Hmota, Čára prvku, Měřit, Hranice a Povodí se přichytí ke bodům zaměření, PI, rohům, vrcholům a konstrukcím, s popiskem u značky. Podržte {{key:Alt}} pro volný bod.
- **Tlačítka výběru, tečna a přesun, kopírování, otočení.** Rohy plochy, parcely a čáry prvku mají pole pro zadání X a Y a tlačítko Vybrat bod s křížkem. Vlastnosti mají také {{ui:Tečna ze dvou bodů}} pro osy trasy a {{ui:Přesun, kopírování a otočení}} pro osy, plochy, parcely a čáry prvků. Viz [Kreslení s přichycením, vybranými rohy a přesunem, kopírováním a otočením](topic:draft-with-snaps).
- **Pohled Vykreslení ve 3D.** Tlačítko {{ui:Vykreslení}} na liště 3D kreslí terén v přirozených barvách, s oblohou, mlhou a měkkými stíny. Model nemění. Nabídka {{ui:Slunce}} má nyní tlačítka {{ui:Použít}} a {{ui:Zavřít}}. Viz [Zobrazení lokality ve 3D](topic:site-3d).
- **Panely otevírají jednu sekci najednou.** Levý panel a panel Vlastností otevírají jednu sekci a ostatní zavírají; dlaždice pásu Krajina, které obsahují více nástrojů, jsou rozdělená tlačítka.

### Analýza GIS

- **Analýza.** {{ui:Povrch}} › {{ui:Více}} › {{ui:Analýza}} nabízí pufr, překryv, prostorové spojení, výběr podle atributu nebo tvaru a měření. Každý nástroj vytvoří novou vrstvu jedním krokem zpět.
- **Tabulka atributů.** Nabídka se třemi tečkami u vrstvy obsahuje {{ui:Tabulka atributů…}} a {{ui:Stylovat podle atributu…}}. Viz [Analýza vrstev GIS](topic:gis-analysis) a [Práce s tabulkou atributů vrstvy](topic:gis-table).

### Lokalita: slunce, solární výnos, komfort a vítr

- **Sekce Prostředí.** Vyberte hmotu: sekce {{ui:Prostředí}} je v jejích Vlastnostech pod {{ui:Hodiny oslunění}}. Obsahuje studii stínu (mapa, tabulka, animace, CSV), solární výnos z meteorologického souboru typického roku (.epw) a venkovní komfort (UTCI).
- **Vítr, jen orientačně.** {{ui:Spustit studii větru}} obarví terén od sedění po nepříjemný pro každý směr větru v meteorologickém souboru. Není ověřeno a panel to říká.
- **Doplněk Pedestriánský vítr (OpenFOAM).** Vypnutý, dokud jej nezapnete v {{ui:Nastavení}} › {{ui:Doplňky}}. OpenFOAM je software, který nainstalujete sami. Viz [Stín, solární výnos a venkovní komfort](topic:environment).

### Mračna bodů (doplněk)

- Zapněte {{ui:Mračna bodů}} v {{ui:Nastavení}} › {{ui:Doplňky}}; objeví se karta Mračna bodů v pravém panelu. Otevřete soubor LAS nebo LAZ, vyčistěte jej, roztřiďte na zemi, vegetaci a budovy, vytvořte terén, vrstevnice a objemy a exportujte LAS nebo LAZ. Viz [Mračna bodů z dronu nebo skeneru](topic:point-clouds).

### WaterCraft (doplněk)

- Zapněte {{ui:WaterCraft (distribuce vody)}} v {{ui:Nastavení}} › {{ui:Doplňky}}; objeví se karta WaterCraft. Obsahuje odběry od zákazníků, požární průtok u každého hydrantu, který odstávka řadu nejvíce škodí, a stáří vody a chlor, každé uložitelné jako CSV. Viz [WaterCraft: odběry, požární průtok, odstávky a stáří vody](topic:watercraft).

### Spolupráce

- V relaci živé spolupráce vidíte kurzory a jména ostatních v plánu. Rostliny z knihovny: Krajina CivilCraft začíná s výchozí kolekcí Knihovny, {{ui:Krajina CivilCraft}}.

## Ve všech aplikacích

- Nápovědy se zobrazují jako bublinové nápovědy Bootstrap a úvodní tip lze zavřít.
- Pruh karet panelu, který se nevejde, se posouvá místo toho, aby byl oříznutý.
- Názvy karet prohlížeče mají tvar `<dokument> - CivilCraft | CadCraft`.
- {{ui:Nastavení}} má sekci Rozvržení, kde jsou rozvržení rozbalovací seznam dvouřádkových voleb.
- Jednotky hmotnosti a teploty jsou v {{ui:Nastavení}} › {{ui:Globální}} › {{ui:Jednotky}}.
- Seznam jazyků ukazuje jazyky, pro které má sestavení soubory. Jazyky jiné než angličtina jsou strojové koncepty.

## Opraveno

- Doplňky vyhledávání adres a kontroly EnergyPlus nešly zapnout; nyní jdou.
- Nápověda nyní uvádí, že doplněk Mračna bodů zapisuje vyčištěný mrak jako LAS 1.4 nebo LAZ.
- Kliknutí na vlastní úchyt vybraného objektu už nespustí tažení úchytu, které zastavilo čekající výběr bodu.

## Upřímně o omezeních

- Příkladové šablony koridorů jsou zástupné, nevycházejí z žádného standardu; inženýr je musí zkontrolovat. Šablony terénu nepřidávají povrch a nekreslí se ve 3D ani v pohledu řezu. Druhý koridor na ose není v exportu IFC. Mezi dvěma šablonami podle staničení není žádné zúžení.
- Mračna bodů byla testována na smyšlených souborech, ne na skutečném dronovém snímku. Čtou se jen LAS a LAZ.
- Analýza GIS byla testována na smyšlených vrstvách.
- Stín, solární výnos a komfort jsou odhady pro plánování; vítr je neověřená orientační studie. Nic z toho není návrhová hodnota.
- WaterCraft je výpočetní pomůcka ověřená na smyšlených sítích. Vodohospodářský inženýr rozhodne, co čísla stojí.
- Jazyky jiné než angličtina jsou strojové koncepty, dokud je neověří rodilý mluvčí.
- Instalátory pro Windows nejsou podepsané certifikátem kódu a disková aplikace pro macOS není notarizovaná.

## Dříve: 0.8 a 0.8.1

Tohle se změnilo v CivilCraft 0.8 (2026-11-01) a 0.8.1 (2026-11-02) oproti verzi 0.7. Velké nové části jsou nástroje, které testují vaše úpravy terénu a lokalitu (déšť, zemní práce, trasy, nádrže, postup), a šest výpočetních oken pro terén, silnice, zaměření, doly, spoje a železnici.

### Novinky

**Otestujte úpravy terénu**

- **Spustit déšť.** {{ui:Spustit déšť…}} (pod {{ui:Povrch}}) pustí bouři na upravený terén. Sledujete, jak voda odtéká z plošin, zadržuje se v nízkých rozích a přetéká přes nádrže, které jsou příliš malé. Výpočet je animovaný a dává objemy, nejvyšší odtok a CSV každé nádrže. Výchozí buňka je hrubá, takže první pohled je rychlý; jemnější buňka je pomalejší. Nádrže, které přetékají, se objeví také v panelu Problémy.
- **Vyrovnání zemních prací.** {{ui:Vyrovnání zemních prací…}} zvedne nebo sníží plošinu, dokud se výkop nerovná násypu, a ukáže tabulku odvozů mezi nimi.
- **Nejlepší trasa.** {{ui:Nejlepší trasa…}}: zvolte začátek a konec a CivilCraft najde nejlevnější cestu přes terén, která drží vaše limity sklonu a oblouku, a potom z ní vytvoří osu trasy.
- **Retenční nádrže.** {{ui:Retenční nádrže…}} spočítá stupeň a akumulaci z vašeho terénu, přijme odtokové prvky (otvor, přepad, V-výřez, přelivná hrana), provede bouří nádrž a zkontroluje zadržený špičkový průtok, dobu vyprázdnění a volnou výšku.
- **Postup podle zaměření.** {{ui:Postup podle zaměření…}} porovnává povrchy z dronu nebo skeneru z různých dat se terénem, jaký byl, a s návrhem: procento dokončení podle objemu, plochy přehloubené a přenasypané, skládky a kdy práce skončí tímto tempem (označeno jako odhad).

**Poznejte lokalitu**

- **Adresa na pozemek.** {{ui:Adresa na pozemek…}} spojí otevřená data o parcelách, budovách, územním plánu, půdě, povodních a terénu na jedné lokalitě. Lokalitu můžete uchovat v projektovém souboru: zadanou adresu, každý zdroj s dnem, kdy jej stáhl, a jeho licencí, a to, co se vrátilo. Znovu otevřete nebo sdílíte projekt a lokalita tam pořád je, bez nového stahování. Lokalitu můžete také uložit jako soubor lokality nebo poslat do BimCraft. Viz [Adresa na pozemek](topic:address-to-site).

**Terén, silnice, zaměření, doly, spoje a železnice**

- **Zeminy a svahy.** {{ui:Zeminy a svahy…}} nakreslí profil půdy mezi vrty, které napíšete. Bishopova metoda potom hledá kritickou kružnici na vašem terénu, s hladinou podzemní vody, přitížením a koeficientem zemětřesení; sednutí základu zahrnuje konsolidaci, okamžité sednutí a čas.
- **Křižovatky a značení.** {{ui:Křižovatky a značení…}} spojí ramena s oblouky u obrubníku (jeden poloměr na rameno, nebo tříbodové oblouky), rozhledovou vzdálenost pro návrhovou rychlost, kontrolu rozhledových trojúhelníků, přechody, stopy a značení a dopravní značky se seznamem značek. Jsou nakresleny na plánu a uloženy jako .dxf s pojmenovanými vrstvami.
- **Vyrovnání měření.** {{ui:Vyrovnání měření…}} spočítá vyrovnání polygonového pořadu nebo sítě metodou nejmenších čtverců: vyrovnané souřadnice, chybové elipsy, test chí-kvadrát a označení měření, které se nehodí. Volné sítě, uzavření pořadu kompasovým pravidlem a RW5, soubory terénních měření GSI, JobXML nebo CSV jsou zahrnuty a vyrovnané body se ukládají jako CSV.
- **Povrchové doly.** {{ui:Povrchové doly…}} přemění vrty na blokový model a konečný důl v rámci vašeho úhlu svahu, s poměrem odtěžení, tabulkou podle etáží a křivkou obsahu a tonáže. Vnořené doly podle koeficientu výnosu a harmonogram těžby s diskontovaným peněžním tokem jsou také k dispozici.
- **Radiová spojení.** {{ui:Radiová spojení…}} kontroluje přímou viditelnost nad vaším terénem s ohledem na zakřivení Země, první Fresnelovu zónu, rozpočet spoje, rezervu na únik signálu a výpadek vlivem vícecestného šíření a udá výšku stožáru, která trasu vyčistí. Dělá také rozpočty ztrát optických vláken, množství trasy a zatížení větrem na věži.
- **Železniční výhybky.** {{ui:Železniční výhybky…}} vytvoří výhybku z jejího čísla srdce, křižovatky mezi rovnoběžnými kolejemi a průjezdný profil, který se naklání převýšením a na oblouku se rozšiřuje. Výhybka může stát v staničení osy trasy.

Viz [Zeminy, křižovatky, vyrovnání měření, doly, radiová spojení a výhybky](topic:soils-roads-survey-mines-links).

### Ve všech aplikacích

- **Jazyky.** 54 jazyků, z toho deset nových. Jazyky jiné než angličtina jsou strojové koncepty, dokud je nepřečte rodilý mluvčí. Témata nápovědy jsou stále většinou v angličtině.
- **Řádky panelu nástrojů.** {{ui:Nastavení}} › {{ui:Obecné}} › {{ui:Řádky panelu nástrojů}}: Zalamovat (jako dříve), 2 řádky nebo 1 řádek. Pás CivilCraft ukazuje nejpoužívanější nástroj velký, další malé a zbytek za šipkou u názvu skupiny.
- **Vstupní zařízení.** Touchpad, pero, 3D myš, ovladač a MIDI mohou ovládat aplikace.
- **Problémy.** Panel Problémy, který varuje ve všech aplikacích, s kontrolami, které čtou balíčky předpisů.
- **Live.** Přehled toho, kdo je kde v relaci živé spolupráce.
- **Doplňky.** Seznam doplňků, s doplňky osvětlení.
- **Připojte svou AI.** Kterýkoli asistent, který připojíte, může ovládat nástroje CivilCraft. Přichází s poznámkou, že připojení jedním kliknutím v CadCraft Studio a hostovaný konektor zatím nejsou připraveny. Viz [Nechte AI asistenta pracovat s vaší lokalitou](topic:assistants).

### Opraveno v 0.8.1

- **Sekce tříd DWG.** Byla čtena jako špatný typ (GitHub cadcraft#5). Opraveno v CivilCraft spolu s CadCraft, BimCraft, ModelCraft a TakeoffCraft.
- **Přepnutí jazyka za běhu.** CadCraft Studio a balené verze mohou měnit jazyk za běhu. Dříve byly jen v angličtině. Zatím netestováno na všech platformách: řekněte nám, pokud se jazyk nezmění.

### Zatím není v této verzi

- **Jsou to výpočetní pomůcky.** Každý výsledek v nových oknech potřebuje kontrolu inženýra. Pevnosti půdy vycházejí z typických hodnot pro půdní skupinu a okno to uvádí.
- **Spustit déšť.** Běh na ukázkové lokalitě může v prohlížeči trvat přes dvě minuty při jemné buňce. Bylo ověřeno proti ručním případům a V-tvarovému povodí, zatím ne na skutečné upravené lokalitě.
- **Adresa na pozemek.** Čte otevřené datové soubory, které přinesete, a byla testována jen na našich vlastních souborech. Stromy nejsou zdrojem. Stahování zdrojů za vás čeká na znění o ochraně soukromí.
- **Postup podle zaměření.** Testováno jen na smyšlených zaměřeních. Postup na listech a poznámkách (MarkupCraft) a porovnání skenu s modelem (BimCraft) nejsou hotové.
- **Zeminy a svahy.** Jen kruhové plochy: žádné klínové ani blokové hledání a žádná tahová trhlina.
- **Křižovatky.** Jeden poloměr na rameno, žádné zametací dráhy nákladních vozidel a zatím nejdou do koridoru.
- **Terénní soubory.** Čtečky byly napsány podle veřejných popisů formátů a vyzkoušeny na souborech, které jsme vytvořili. Hledají se skutečné soubory z přístrojů.
- **Spoje a železnice.** Radiová spojení: jen ztráty ve volném prostoru a vícecestné šíření (bez útlumu deštěm a bez směrových diagramů antén) a žádný železniční standard: každý železniční limit je zástupný, s pracovními čísly, která žádný železniční inženýr nezkontroloval.
- **Windows a macOS.** 0.8 není podepsaná certifikátem kódu. Windows může varovat a macOS žádá pravé tlačítko a potom Otevřít.

Vše ostatní najdete v [Ještě není hotovo](topic:not-built-yet). Pro dřívější vydání viz [Co je nového ve verzi 0.7](topic:whats-new-0-7).
