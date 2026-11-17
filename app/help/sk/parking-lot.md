---
title: Rozmiestnenie parkoviska
summary: Rozmiestnite parkovacie miesta, uličky, bezbariérové a dodávkové miesta a ostrovčeky vnútri obrysu, upravte terén so spádom k vtokom voči jestvujúcemu terénu, potom spevnite a osaďte plochu. Dostupné aj pre asistenta.
keywords: parkovisko, parkovacie miesto, ulička, bezbariérové, ada, dodávka, ostrovček, vtok, spád, sklon, výkop, násyp, dláždenie, dlažba, výsadba, stromy, terén, bodový mrak, mcp, asistent
from: 06c14da9
---

Umiestnite parkovisko do parcely, plošiny alebo uzavretej charakteristickej čiary a získajte počty, úpravu terénu a spevnenie v jednom kroku.

## Rozmiestnenie

1. Na pôdoryse vyberte parcelu, plošinu alebo uzavretú charakteristickú čiaru.
2. Otvorte **Povrch, Viac, Parkovisko...**
3. Zvoľte pravidlá, uhol parkovacieho miesta (90 °, 75 °, 60 °, 45 °, 30 ° alebo rovnobežne) a jednosmerné alebo obojsmerné uličky. Veľkosti parkovacích miest, uličiek a ostrovčekov sa začínajú z tabuľky a každú možno prepísať.
4. Zvoľte **Rozmiestniť**.

Rady idú pozdĺž hrany obrysu, ktorá dá najviac parkovacích miest (alebo pod uhlom, ktorý zadáte). Parkovacie miesto sa počíta, iba ak leží celé vnútri obrysu. Tam, kde je miesto len pre jeden rad a uličku, pridá sa jednostranný pás. Okno vypíše miesta, bezbariérové a dodávkové miesta, ostrovčeky, vtoky a plochu na miesto. Pôdorys zobrazuje parkovacie miesta, bezbariérové miesta s ich šrafovanými prístupovými uličkami, ostrovčeky, stredové čiary uličiek a vtoky na ich vlastných vrstvách (C-PARK-...), takže sa dostanú do PDF, DXF a DWG.

## Bezbariérové miesta

Pri pravidlách Spojených štátov počet nasleduje tabuľku 208.2 štandardov ADA 2010 pre poskytnuté miesta (jedno zo šiestich, zaokrúhlené nahor, je miesto pre dodávku), umiestnené najbližšie k prvému rohu obrysu (vstupu), každé s prístupovou uličkou; dve zdieľajú jednu. Parkovacie miesto užšie než bezbariérová šírka alebo spád strmší než 1:48 na bezbariérových miestach sa zobrazí ako problém. **Tieto čísla boli prepísané zo štandardu podľa pamäte a neboli overené voči vytlačenému štandardu.** Typické veľkosti parkovacích miest a uličiek pochádzajú z projektových príručiek pre parkoviská a tiež nie sú overené. Skontrolujte obe a vaše miestne predpisy, skôr než sa na ne spoľahnete. Zvoľte **Vlastné**, ak chcete zadať vlastný počet bezbariérových miest.

## Spády k vtokom, výkop a násyp

Ak to nevypnete, parkovisko sa stane plochou úpravy terénu v pracovnom priestore Krajina. Vtoky sa umiestnia na stredové čiary uličiek približne každých 100 feet (30 m); povrch stúpa od každého vtoku so spádom, ktorý zadáte (na začiatku 1.5 %), takže každý bod klesá k svojmu najbližšiemu vtoku. Úroveň sa zvolí tak, aby sa výkop a násyp parkoviska vyrovnali na jestvujúcom teréne. Jestvujúci terén je jestvujúci povrch projektu, ktorý môže pochádzať z bodov merania, z LandXML, z lidarového alebo skenovaného bodového mraku premeneného na povrch, alebo z vrstevníc. Okno ukazuje odhad výkopu a násypu; objemy projektu ukážu presnú hodnotu neskôr. Plocha úpravy si ponechá svoju hranu na jestvujúcom teréne, takže tam, kde sa nový povrch líši od terénu pri hrane, vznikne stupeň, a okno povie, aký je veľký.

## Spevnenie a výsadba

Celý obrys dostane spevnenie dlažbou (vzor kladenia, ktorý môžete zmeniť v Krajina, Tvrdé povrchy) a každý ostrovček dostane záhon kríkov a, ak je dosť široký, strom, vybrané zo zoznamu rastlín. Potom je všetko bežným objektom Krajiny: upravte ho, alebo zvoľte **Rozmiestniť znova**, aby nahradilo to, čo parkovisko vytvorilo. Odstránenie parkoviska odstráni to, čo vytvorilo.

## Od asistenta

Ten istý parkovací objekt sa dá vyžiadať cez MCP: `parking_layout` zobrazí náhľad, `parking_build` zapíše a `parking_remove` odstráni parkovisko. Vyžiadajte podľa názvu parcely alebo pošlite obrys.

## Čo nie je hotové

Či uličky dosahujú ulicu, sa nekontroluje. Spevnenie pokrýva celý obrys, takže jeho plocha zahŕňa aj ostrovčeky. Materiály spevnenia z knižnice a typ z knižnice pre parkovacie miesta nie sú hotové; vzor spevnenia je vzor Tvrdé povrchy. Pravidlá žiadnej inej krajiny nie sú hotové.
