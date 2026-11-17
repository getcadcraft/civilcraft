---
title: Usporiadajte panely a použite druhý monitor
summary: Ukotvite bočné panely vľavo, vpravo alebo dole, zoraďte ich nad seba, zoskupte ich ako karty, pripnite alebo skryte, nechajte ich plávať nad výkresom, zhustite rozloženie, zvoľte počet riadkov panela nástrojov alebo ich presuňte do vlastného okna na inej obrazovke.
keywords: panely, ukotviť, plávať, presunúť panel, potiahnuť, rozloženie, karty, skupina kariet, zoradiť, pripnúť, automatické skrytie, skryť panel, zatvoriť panel, kompaktné, hustota rozloženia, husté, riadky panela nástrojov, zalomiť, 1 riadok, 2 riadky, riadky panela, druhý monitor, dve obrazovky, dvojitý monitor, viac monitorov, okno, vyskakovacie okno, obnoviť rozloženie
from: 49530239
---

Panely vedľa výkresu sa dajú presúvať. Umiestnite ich tam, kde Vám vyhovujú, alebo im dajte vlastné okno na druhom monitore, aby výkres získal celý prvý monitor.

:::note
Každý panel má lištu s názvom: úzky pruh s názvom panela, ponuku {{ui:⋯}}, pripínačku a tlačidlo zatvorenia v hornej časti panela. Verzie pred 0.7 majú iba názov a ponuku {{ui:⋯}}.
:::

## Presun panela v okne

1. Potiahnite panel za jeho názov v hornej časti.
2. Počas ťahania sa vľavo, vpravo a dole pri výkrese zobrazia orámované oblasti. Pustite panel na jednu z nich, aby sa tam ukotvil. Oblasť, nad ktorou ste, stmavne.
3. Pustite ho inde nad výkresom, aby plával.

Panely môžu zdieľať jednu stranu: sú zoradené nad sebou a každá čiara medzi dvoma z nich sa ťahaním rozdeľuje o miesto (keď je čiara zameraná, šípkové klávesy ju posúvajú a dvojklik na ňu rozdelí miesto rovnomerne). Potiahnite vnútorný okraj ukotvenej strany, aby bola širšia alebo užššia; dvojklikom na okraj ho vrátite do pôvodného stavu.

Plávajúci panel zostáva nad výkresom. Presuňte ho za názov a zmeňte jeho veľkosť potiahnutím pravého dolného rohu (alebo sa klávesom Tab presuňte na roh a použite šípkové klávesy). Dvojklikom na jeho názov ho znova ukotvite na pôvodné miesto.

:::touch
Potiahnite jedným prstom za názov panela. Pravý dolný roh plávajúceho panela potiahnite jedným prstom, aby ste zmenili jeho veľkosť, a rovnako okraje medzi ukotvenými panelmi. Ak chcete panel nechať plávať alebo ukotviť bez ťahania, použite ponuku {{ui:⋯}}.
:::

## Zoskupenie panelov do kariet

Dva panely môžu zdieľať jeden rámec a zobrazovať sa po jednom. Potiahnite panel za jeho názov na lištu s názvom iného panela (lišta sa, keď ste nad ňou, orámuje) a pustite: rámec potom má kartu pre každý panel vo svojej lište. Kliknutím na kartu zobrazíte daný panel. Keď je karta zameraná, {{key:Left}} a {{key:Right}} prepínajú karty a {{key:Home}} a {{key:End}} prejdú na prvú a poslednú.

Ak chcete panel vyňať zo skupiny, vyberte v jeho ponuke {{ui:⋯}} položku {{ui:Vyňať zo skupiny kariet}}, alebo ho presuňte inam. Ak chcete panely zoskupiť bez ťahania, vyberte {{ui:Karta s}} a názov panela.

## Pripnutie, skrytie a obnovenie

- Pripínačka v lište s názvom panela ho nastaví na **automatické skrytie**: panel opustí svoje ukotvenie a na tomto okraji sa zmení na malú kartu. Ukážte na kartu, zamerajte ju alebo na ňu kliknite a panel sa vysunie nad výkres; keď odídete (alebo stlačíte {{key:Esc}}), zasunie sa späť. Stlačte pripínačku znova alebo vyberte {{ui:Odopnúť}}, aby sa panel natrvalo ukotvil.
- Tlačidlo zatvorenia alebo {{ui:Skryť tento panel}} v ponuke panel skryje a uzavrie jeho ukotvenie. Prerušovaná karta na okraji ho vráti: kliknite na ňu alebo ju zamerajte a stlačte {{key:Enter}}.

## Zhustenie rozloženia

{{ui:Nastavenia}} › {{ui:Všeobecné}} › {{ui:Hustota rozloženia}} ponúka dve možnosti. {{ui:Pohodlná}} je predvolená. {{ui:Kompaktná}} zmenší výšku riadkov, vnútorné odsadenie panelov, tlačidlá panela nástrojov a text panelov danej aplikácie, aby sa na obrazovke zmestilo viac. Nastavenie sa uchováva pre každú aplikáciu. Dotyková obrazovka si v oboch prípadoch ponecháva veľké tlačidlá a telefón si ponecháva vlastné rozloženie. {{ui:Obnoviť rozloženie}} nemení hustotu, ktorú ste nastavili.

## Počet riadkov panela nástrojov

{{ui:Nastavenia}} › {{ui:Všeobecné}} › {{ui:Riadky panela nástrojov}} ponúka tri možnosti. {{ui:Zalomiť}} je predvolená: každá skupina nástrojov sa zobrazí na toľkých riadkoch, koľko treba. {{ui:2 riadky}} udržia panel nástrojov na dvoch riadkoch a {{ui:1 riadok}} na jednom, aby výkres dostal výšku; skupiny, ktoré sa nezmestia, sa posúvajú do strany v rámci panela nástrojov (použite koliesko myši, potiahnutie dvoma prstami alebo kláves {{key:Tab}} na nástroj). Panel nástrojov, ktorý sa už zmestí na dva riadky, zostane pri možnosti {{ui:2 riadky}} taký, aký je, pretože mriežka by ho len predĺžila. Voľba sa uchováva pre každú aplikáciu. Dotyková obrazovka a telefón si ponechávajú vlastné rozloženie. CadCraft má vlastné nastavenie svojho panela nástrojov v ponuke {{ui:Nastavenia}} › {{ui:CadCraft}}.

## Použitie klávesnice

Tlačidlo {{ui:⋯}} každého panela otvorí ponuku: {{ui:Ukotviť vľavo}}, {{ui:Ukotviť vpravo}}, {{ui:Ukotviť dole}}, {{ui:Plávať nad výkresom}}, {{ui:Pripnúť k okraju}}, {{ui:Skryť tento panel}}, {{ui:Karta s}} iným panelom, {{ui:Presunúť do nového okna}} a {{ui:Vrátiť späť}}. Klávesom {{key:Tab}} sa dostaňte na tlačidlo, stlačte {{key:Enter}}, pohybujte sa šípkovými klávesmi a znova stlačte {{key:Enter}}. {{key:Esc}} ponuku zatvorí.

## Panely na druhom monitore

1. Na niektorom paneli vyberte {{ui:⋯}} a potom {{ui:Presunúť všetky panely do nového okna}}. Môžete tiež vybrať {{ui:Presunúť panely do nového okna}} v {{ui:Nastavenia}}.
2. Otvorí sa malé okno s panelmi. Potiahnite ho na druhý monitor a zväčšite ho podľa potreby.
3. Pokračujte v práci: panely ovplyvňujú výkres ako predtým a výkres vyplní hlavné okno.

Klávesové skratky fungujú aj vtedy, keď je okno panelov na popredí: klávesy, ktoré tam stlačíte, okrem písania v poli, idú do výkresu. Otázky a dialógy, ktoré aplikácia kladie, sa stále otvárajú v hlavnom okne, preto sa tam pozrite, keď sa niektorý objaví. Motív a veľkosť textu panelov sa riadia hlavným oknom.

:::chromium
Chrome a Edge môžu okno umiestniť na druhú obrazovku namiesto Vás. Keď je pripojená druhá obrazovka, vyberte v okne panelov {{ui:Dať ho na moju druhú obrazovku}} (alebo {{ui:Dať panely na moju druhú obrazovku}} v ponuke {{ui:⋯}} panela). Prehliadač sa raz opýta, či môže táto stránka vidieť Vaše obrazovky; po povolení sa okno panelov na tejto obrazovke otvorí vždy.
:::

:::firefox safari
Okno panelov presuňte na druhý monitor sami. Pri ďalšom otvorení sa otvorí na rovnakom mieste a v rovnakej veľkosti.
:::

## Viac okien panelov

Každý panel môže mať vlastné okno: až štyri okná panelov, napríklad jedno na každý monitor.

- V ponuke {{ui:⋯}} panela otvorí {{ui:Presunúť do nového okna}} ďalšie okno pre tento panel a {{ui:Presunúť do okna panelov 2}} (a tak ďalej) ho presunie do už otvoreného okna. Druhé okno sa volá "panely 2".
- Potiahnite panel za názov z jedného okna do druhého: pustením nad hlavným oknom ho tam ukotvíte (orámované oblasti sa zobrazia, keď ste nad ním) alebo ho necháte plávať, a pustením nad iným oknom panelov ho do neho presuniete. Pustením kdekoľvek inde zostane, kde bol.
- Okno panelov, v ktorom už nie sú žiadne panely, sa zatvorí samo.

Po znovunačítaní aplikácia znova ponúkne Vaše okná panelov. Prehliadače otvoria jedno okno na kliknutie, preto vyberte {{ui:Otvoriť ďalšie}} raz pre každé okno.

## Rovnako pre každú časť rozloženia

Pás kariet, súprava nástrojov, riadky nástrojov a stavový riadok sa do vlastného okna presúvajú rovnako ako panel: otvorte ponuku {{ui:⋯}} pri danej časti a vyberte {{ui:Presunúť do nového okna}}; {{ui:Vrátiť späť}} (alebo zatvorenie okna) ich vráti domov. Klávesy, ktoré v tom okne stlačíte, idú do aplikácie, rovnako ako z okna panelov. Každá časť má jednu takú ponuku.

## Presun dialógového okna

Každé dialógové okno sa dá presunúť mimo výkresu: stlačte a potiahnite jeho lištu s názvom. Dialógové okno si pamätá, kde ste ho nechali, každé samostatne, a pri ďalšom otvorení sa vráti na to miesto. Dvojklikom na lištu ho znova vycentrujete.

Z klávesnice stlačte {{key:Alt}}+{{key:Shift}}+šípku, keď je zameranie vnútri dialógového okna, a posúvate ho po 16 pixeloch; pridajte {{key:Ctrl}} pre 64 pixelov. Dialógové okno, ktoré sa ocitne mimo obrazovky (po zmenšení okna alebo obrazovky), sa vráti späť.

V telefóne dialógové okná zostávajú na celú šírku a nepresúvajú sa.

V CadCraft Studio má dialógové okno {{ui:Vykresliť do PDF}} CadCraftu, ktoré môžete nechať otvorené počas práce, v lište s názvom tlačidlo {{ui:Otvoriť vo vlastnom okne}}. Dialógové okno sa presunie do vlastného okna, ktoré môžete dať na iný monitor. Zatvorenie dialógu zatvorí okno a zatvorenie okna zatvorí dialóg.

## Vrátenie panelov späť

- V okne panelov vyberte {{ui:Vrátiť panely späť}}, alebo ho jednoducho zatvorte. Panely sa vrátia tam, kde boli.
- Zatvorenie alebo znovunačítanie hlavného okna zatvorí aj okno panelov. Keď sa aplikácia znova otvorí, oznámi, že Vaše panely boli v samostatnom okne; vyberte {{ui:Otvoriť ho}}, aby sa okno vrátilo, alebo {{ui:Nechať ich tu}}.
- {{ui:Nastavenia}} › {{ui:Všeobecné}} › {{ui:Obnoviť rozloženie}} vráti každý panel tam, kde začínal.

:::tip
Ak sa po presunutí panelov do nového okna nič neotvorí, prehliadač zablokoval vyskakovacie okno. Aplikácia to oznámi a panely ponechá tam, kde boli. Povoľte vyskakovacie okná pre getcadcraft.com a potom to skúste znova.
:::

Rozloženie sa v tomto prehliadači uchováva pre každú aplikáciu spolu s Vašimi ostatnými nastaveniami.
