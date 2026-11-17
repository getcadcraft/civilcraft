---
title: Vypočítať dažďové prietoky, veľkosti potrubí a čiaru hydraulického sklonu
summary: Nakreslite povodia, ktoré odvádzajú do každého objektu, sčítajte prietoky po sieti racionálnou metódou, dimenzujte potrubia podľa Manningovej rovnice a zistite, kde čiara hydraulického sklonu tečie plná alebo dosiahne povrch.
keywords: dažďové odvodnenie, povodie, plocha odvodnenia, racionálna metóda, súčiniteľ odtoku, doba sústredenia, intenzita zrážok, IDF, Manning, dimenzovanie potrubí, čiara hydraulického sklonu, HGL, čiara energie, EGL, prepätie, záplava, spätná hladina
from: e44872ec
---

Dažďové odvodnenie pracuje na [potrubnej sieti](topic:pipe-network): najprv nakreslite sieť, potom plochy, ktoré do nej odvádzajú. Všetko sa zobrazí pod **Dažďové odvodnenie** v pravom paneli, keď nie je nič vybrané.

## Nakreslite povodie

1. Kliknite na **Nakresliť povodie** pod **Dažďové odvodnenie**.
2. Kliknite na rohy plochy, ktorá odvádza do jedného objektu. {{key:Enter}} alebo dvojklik dokončí; {{key:Backspace}} vezme späť posledný roh, {{key:Esc}} zastaví.
3. Povodie odvádza do objektu vnútri neho, inak do najbližšieho. Otvoria sa jeho **Vlastnosti**: nastavte jeho názov, **Súčiniteľ odtoku C** (podiel dažďa, ktorý steká, od 0 do 1), **Dobu sústredenia** v minútach a objekt, do ktorého **Odvádza do**.

**Nakresliť ďalšie povodie** vo svojich Vlastnostiach spustí ďalšie. Kliknutím dovnútra povodia v pôdoryse ho vyberiete; {{key:Delete}} ho odstráni. Každá zmena je jeden krok: {{key:Mod+Z}} ju vráti späť.

## Nastavte návrhovú búrku

Intenzita dažďa je i = a ÷ (tc + b) na mocninu c, v palcoch za hodinu pre projekt v stopách a v milimetroch za hodinu pre projekt v metroch. Prispôsobte **Intenzitu a**, **b** a **c** vlastnej krivke intenzity a trvania pre návratovú periódu, na ktorú navrhujete.

:::warning
Počiatočná krivka intenzity, Manningovo n (0.013) a strata na spoji (0.5) sú zástupné hodnoty, nie norma. Nastavte ich podľa vlastných údajov o zrážkach a návrhových kritérií.
:::

- **Najkratšia doba sústredenia**: žiadne potrubie sa nepočíta pri kratšej dobe (na začiatku 10 minút).
- **Manningovo n**: drsnosť potrubí.
- **Strata na spoji**: strata výšky v každom objekte ako podiel rýchlostnej výšky V²/2g potrubia, ktoré z neho vychádza.
- **Hladina vody na výtoku**: spätná hladina, kde posledné potrubie vyúsťuje. Nechajte prázdne, keď výtok ústí voľne.

## Ako sa prietoky sčítavajú

Každé potrubie nesie všetky povodia nad ním. Q = C × i × A, kde C × A sa sčítava po sieti a i je intenzita pri najdlhšej dobe sústredenia prichádzajúcej vody: vlastná doba povodia, alebo doba z vyššieho povodia plus čas prietoku potrubiami (dĺžka ÷ rýchlosť pri plnom prietoku). Q je v kubických stopách za sekundu (A v akroch), alebo v kubických metroch za sekundu (A v hektároch).

## Dimenzovanie potrubí

Tabuľka pod **Prietoky a čiary sklonu** ukazuje pre každé potrubie prietok, čo unesie pri plnom prietoku pri svojom sklone, rýchlosť, hydraulický sklon na hornom a dolnom konci a aká je v ňom hĺbka prúdu.

**Dimenzovať potrubia pre tieto prietoky** dá každému potrubiu najmenšiu štandardnú veľkosť, ktorá unesie jeho prietok pri jeho vlastnom sklone (12 až 72 palcov, alebo 300 až 1800 mm). Je to jeden krok. Dná zostanú, kde sú: ak sa veľkosti zmenia, použite **Nastaviť všetky dná podľa pravidiel**, aby sa zachovalo krytie, a potom tabuľku znova skontrolujte.

## Čítanie čiar sklonu

Čiara hydraulického sklonu (HGL) sa počíta od výtoku smerom hore:

- Potrubie tečúce čiastočne plné má HGL na hladine vody: dno plus normálna hĺbka.
- Keď je voda pod ním vyššia ako jeho temeno, alebo prenáša viac, než unesie pri plnom prietoku, tečie plné (pod tlakom, prepäté) a jeho HGL stúpa o sklon trenia po svojej dĺžke.
- V každom objekte je HGL hornou HGL odchádzajúceho potrubia plus strata na spoji.
- Čiara energie (EGL) je HGL plus rýchlostná výška.

Potrubie, ktoré tečie plné, sa uvedie, a rovnako každý objekt, kde je HGL nad okrajom: voda tam dosiahne povrch a objekt je v pôdoryse obkreslený červeným. Vyberte potrubie alebo objekt, aby ste vo svojich Vlastnostiach videli jeho prietok, hĺbku, rýchlosť a obe čiary sklonu.

## Prevedenie búrky

Racionálna metóda dá jeden vrchol pre každé potrubie. {{ui:Previesť búrku}} (pod výsledkami, vo Vlastnostiach siete) namiesto toho prevedie celú búrku: odtok každého povodia v čase, prenesený potrubiami spolu s dobou prietoku a akumuláciou, a sčítaný tam, kde sa stretávajú.

1. Nechajte {{ui:Dážď trvá}} a {{ui:Intenzita dažďa}} prázdne, aby sa použila najdlhšia doba sústredenia a krivka zrážok vyššie, alebo napíšte vlastné.
2. Stlačte {{ui:Previesť búrku}}. Tabuľka pre každé potrubie uvedie najvyšší prietok dnu a von, o koľko je výsledný vonkajší vrchol nižší, koľko z plnej kapacity potrubia využíva a minútu, v ktorej dosiahne vrchol.
3. Každý výtok dostane malý graf prietoku v čase a {{ui:Stiahnuť hydrogram (CSV)}}.

Povodie odvádza dážď spriemerovaný za svoju dobu sústredenia, takže búrka kratšia ako táto doba dosiahne nižší vrchol než C × i × A. Každé potrubie sa prevádza metódou Muskingum–Cunge s hĺbkou prúdenia, ktorú už zistila racionálna metóda. Dve vetvy s rôznou dobou sústredenia nedosiahnu vrchol súčasne, takže ich súčet je nižší než súčet ich vrcholov.

Toto nemodeluje prepätie, spätné vzdutie, akumuláciu v objektoch ani záplavy. Potrubie, ktorého prevedený vrchol je nad jeho plnou kapacitou, sa uvedie a jeho voda sa odovzdá ďalej, akoby sa tam zmestila. Použite to na pozorovanie časovania a útlmu, nie na dimenzovanie potrubia. Je to pomôcka na výpočet: výsledok kontroluje inžinier.

## Uložené s projektom

Povodia a nastavenia búrky sa ukladajú do súboru projektu. Zatiaľ nie sú v PDF výkrese, DWG ani DXF, ani v LandXML: pozri [Ešte nie je hotové](topic:not-built-yet).
