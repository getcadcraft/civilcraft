---
title: Co je nového ve verzi 0.8 a 0.8.1
summary: CivilCraft 0.8 přidává Spustit déšť (běh bouře přes vaše úpravy terénu), vyrovnání zemních prací, hledání nejlepší trasy, retenční nádrže, postup podle zaměření, import adresy na pozemek, který drží pozemek v projektu, a okna pro zeminy a svahy, křižovatky a značení, vyrovnání měření, povrchové doly, radiové spoje a železniční výhybky. Verze 0.8.1 opravuje čtení souborů DWG.
keywords: co je nového, poznámky k vydání, seznam změn, změny, 0.8, 0.8.1, verze, nové funkce, déšť, bouře, zadržování vody, přelévání, zemní práce, bilance, výkop a násyp, odvoz, nejlepší trasa, nejmenší náklady, osa trasy, retenční nádrž, výpust, pokles hladiny, volný bok, postup, zaměření, dron, skladovací hromada, adresa na pozemek, parcela, zemina, povodeň, stabilita svahu, Bishop, sedání, křižovatka, značení, dopravní značky, rozhledová vzdálenost, vyrovnání, metoda nejmenších čtverců, polygonový pořad, povrchový důl, blokový model, radiový spoj, Fresnelova zóna, výhybka, křížení kolejí, jazyky, problémy, živě, DWG
from: b0932cf0
---

Toto se změnilo ve verzi CivilCraft 0.8 (2026-11-01) a 0.8.1 (2026-11-02) oproti verzi 0.7. Hlavní novinky jsou nástroje, které ověřují vaše úpravy terénu a lokalitu (déšť, zemní práce, trasy, nádrže, postup), a šest výpočetních oken pro terén, silnice, zaměření, doly, spoje a železnici.

## Novinky

### Vyzkoušejte své úpravy terénu

- **Spustit déšť.** Položka Spustit déšť… (v nabídce Povrch) spustí bouři nad upraveným terénem. Sledujete, jak voda stéká z plošin, hromadí se v nejnižších rozích a přetéká nádrže, které jsou příliš malé. Běh je animovaný a ukazuje objemy, maximální odtok a soubor CSV se všemi nádržemi. Výchozí buňka je hrubá, takže první pohled je rychlý; jemnější buňka je pomalejší. Nádrže, které přetékají, se zobrazí také v panelu Problémy.
- **Vyrovnání zemních prací.** Položka Vyrovnání zemních prací… zvedá nebo snižuje plošinu, dokud se výkop nerovná násypu, a zobrazuje tabulku odvozu mezi nimi.
- **Nejlepší trasa.** Položka Nejlepší trasa…: vyberete začátek a konec a CivilCraft najde nejlevnější cestu přes terén, která dodržuje vaše limity sklonu a oblouků, a podle ní vytvoří osu trasy.
- **Retenční nádrže.** Položka Retenční nádrže… určí hladinu a objem z vašeho terénu, přijímá výpustná zařízení (otvor, přeliv, trojúhelníkový přeliv, přelivová hrana), prožene bouři nádrží a ověří zadržený maximální odtok, dobu vyprázdnění a volný bok.
- **Spustit postup podle zaměření.** Položka Postup podle zaměření… porovná povrchy z dronu nebo skeneru z různých dat se stavem terénu tak, jak byl, i s projektem: procento dokončení podle objemu, oblasti vykopané navíc a přesypané, skladovací hromady a kdy práce skončí při tomto tempu (označeno jako odhad).

### Poznejte lokalitu

- **Adresa na pozemek.** Položka Adresa na pozemek… spojí údaje o otevřené parcele, budově, územním plánu, půdě, záplavách a terénu do jedné lokality. Lokalitu můžete uchovat v souboru projektu: zadanou adresu, každý zdroj s datem stažení a jeho licencí a to, co bylo vráceno. Po znovuotevření nebo sdílení projektu je lokalita stále na místě, aniž by se cokoli znovu stahovalo. Můžete ji také uložit jako soubor lokality nebo odeslat do aplikace BimCraft. Viz [Adresa na pozemek](topic:address-to-site).

### Terén, silnice, zaměření, doly, spoje a železnice

- **Zeminy a svahy.** Položka Zeminy a svahy… vykreslí profil zeminy mezi vrty, které zadáte. Bishopova metoda pak hledá kritickou kružnici na vašem terénu s hladinou podzemní vody, přitížením a koeficientem zemětřesení; sedání patky zahrnuje konsolidaci, okamžité sedání a čas.
- **Křižovatky a značení.** Položka Křižovatky a značení… spojí ramena s obrubníkovými zaobleními (jeden poloměr na rameno, nebo tříbodová zaoblení), rozhledovou vzdálenost pro navrhovanou rychlost, kontrolu rozhledových trojúhelníků, přechody pro chodce, stopčáry, značení a dopravní značky s rozpisem značek. Jsou vykresleny na půdorysu a uloženy jako soubor .dxf s pojmenovanými vrstvami.
- **Vyrovnání měření.** Položka Vyrovnání měření… provede vyrovnání polygonového pořadu nebo sítě metodou nejmenších čtverců: vyrovnané souřadnice, chybové elipsy, test chí-kvadrát a označení měření, které nesedí. Součástí jsou volné sítě, uzavření pořadu kompasovým pravidlem a terénní soubory RW5, GSI, JobXML nebo CSV; vyrovnané body se ukládají jako CSV.
- **Povrchové doly.** Položka Povrchové doly… převede vzorky z vrtů na blokový model a konečnou jámu v rámci vašeho úhlu svahu, s poměrem skrývky, tabulkou podle etáží a křivkou obsahu a tonáže. K dispozici jsou také vnořené jámy podle faktoru výnosu a výrobní plán s diskontovaným peněžním tokem.
- **Radiové spoje.** Položka Radiové spoje… kontroluje přímou viditelnost nad vaším terénem s ohledem na zakřivení Země, první Fresnelovu zónu, rozpočet spoje, rezervu na únik signálu a výpadky vícecestného šíření a udává výšku stožáru, která by trasu uvolnila. Zvládá také rozpočty útlumu optických vláken, množství tras a zatížení větrem na věži.
- **Železniční výhybky.** Položka Železniční výhybky… vytvoří výhybku podle čísla srdcovky, křižovatky mezi rovnoběžnými kolejemi a průjezdný profil naklopený převýšením a rozšířený v oblouku. Výhybka může ležet na staničení osy trasy.

Viz [Zeminy, křižovatky, vyrovnání měření, doly, radiové spoje a výhybky](topic:soils-roads-survey-mines-links).

## Ve všech aplikacích

- **Jazyky.** 54 jazyků, z toho deset nových. Jazyky jiné než angličtina jsou strojové koncepty, dokud je nepřečte rodilý mluvčí. Nápověda je zatím z velké části v angličtině.
- **Řádky panelu nástrojů.** Nastavení › Obecné › Řádky panelu nástrojů: Zalomit (jako dříve), 2 řádky nebo 1 řádek. Ribbon CivilCraftu zobrazuje nejpoužívanější nástroj velký, další malé a zbytek za šipkou u názvu skupiny.
- **Vstupní zařízení.** Touchpad, pero, 3D myš, ovladač a MIDI mohou ovládat aplikace.
- **Problémy.** Panel Problémy, který upozorňuje ve všech aplikacích, s kontrolami, jež čtou sady předpisů.
- **Živě.** Zobrazení, kdo je kde v relaci Živě.
- **Doplňky.** Seznam doplňků, včetně doplňků pro osvětlení.
- **Připojte svou AI.** Jakýkoli asistent, kterého připojíte, může ovládat nástroje CivilCraftu. Je dodáván s poznámkou, že připojení jedním kliknutím v CadCraft Studio a hostovaný konektor zatím nejsou hotové. Viz [Nechte AI asistenta pracovat s vaší lokalitou](topic:assistants).

## Opraveno ve verzi 0.8.1

- **Sekce tříd DWG.** Byla čtena jako špatný typ (GitHub cadcraft#5). Opraveno v CivilCraftu spolu s CadCraft, BimCraft, ModelCraft a TakeoffCraft.
- **Přepínání jazyka za běhu.** CadCraft Studio a zabalené edice mohou měnit jazyk za běhu. Dříve byla pouze angličtina. Zatím netestováno na všech platformách: dejte nám vědět, pokud se jazyk nezmění.

## Ještě není v této verzi

- **Jde o pomůcky pro výpočty.** Každý výsledek v nových oknech potřebuje kontrolu inženýra. Pevnosti zemin vycházejí z typických hodnot pro skupinu zemin a okno to uvádí.
- **Spustit déšť.** Běh na ukázkové lokalitě může v prohlížeči trvat přes dvě minuty při jemné buňce. Ověřeno na ručně počítaných případech a V-tvarovém povodí, zatím ne na skutečně upravené lokalitě.
- **Adresa na pozemek.** Čte otevřené datové soubory, které přinesete, a byla testována pouze na našich vlastních souborech. Stromy nejsou zdrojem. Stahování zdrojů za vás čeká na znění o ochraně osobních údajů.
- **Postup podle zaměření.** Testováno pouze na smyšlených zaměřeních. Postup na listech a poznámkách (MarkupCraft) a porovnání skenu s modelem (BimCraft) nejsou hotové.
- **Zeminy a svahy.** Pouze kruhové plochy: bez hledání klínů nebo bloků a bez trhliny v tahu.
- **Křižovatky.** Jeden poloměr na rameno, bez zametacích křivek nákladních vozidel, a zatím nejsou zapojeny do koridoru.
- **Terénní soubory.** Čtečky byly napsány podle veřejných popisů formátů a vyzkoušeny na souborech, které jsme vytvořili. Hledají se skutečné soubory z přístrojů.
- **Spoje a železnice.** Radiové spoje: pouze útlum volným prostorem a vícecestné šíření (bez útlumu deštěm a bez diagramů antén) a žádná železniční norma: každý limit je zástupný, s koncepčními čísly, která žádný železniční inženýr nekontroloval.
- **Windows a macOS.** Verze 0.8 nemá podpis kódu. Windows může zobrazit varování a macOS žádá pravé tlačítko, pak Otevřít.

Vše ostatní je v [Ještě není hotovo](topic:not-built-yet). Pro předchozí verzi viz [Co je nového ve verzi 0.7](topic:whats-new-0-7).
