---
title: Usporiadanie panelov a použitie druhého monitora
summary: Ukotvite bočné panely vľavo, vpravo alebo dole, naskladajte ich, zoskupte ich ako karty, pripnite alebo skryte ich, nechajte ich plávať nad výkresom, zhustite rozloženie, vyberte, koľko riadkov použije panel nástrojov, alebo ich presuňte do vlastného okna na inej obrazovke.
keywords: panely, ukotviť, plávať, presunúť panel, potiahnuť, rozloženie, karty, skupina kariet, naskladať, pripnúť, automatické skrytie, skryť panel, zavrieť panel, kompaktné, hustota rozloženia, husté, riadky panela nástrojov, zalomiť, 1 riadok, 2 riadky, druhý monitor, dve obrazovky, dva monitory, viac monitorov, okno, vyskakovacie okno, obnoviť rozloženie
from: 32a8dae2
---

Panely vedľa výkresu sa dajú presúvať. Dajte ich tam, kde Vám vyhovujú, alebo im dajte vlastné okno na druhom monitore, aby výkres dostal celý prvý.

:::note
Každý panel má záhlavie: úzky pruh s názvom panela, ponukou {{ui:⋯}}, špendlíkom a tlačidlom zatvorenia v hornej časti panela. Verzie pred 0.7 majú len názov a ponuku {{ui:⋯}}.
:::

## Presunutie panela v okne

1. Potiahnite panel za jeho názov navrchu.
2. Počas ťahania sa vľavo, vpravo a dole vo výkrese objavia obrysované oblasti. Pustite panel na jednu z nich a ukotvíte ho tam. Oblasť, nad ktorou ste, stmavne.
3. Ak ho pustíte kdekoľvek inde nad výkresom, bude plávať.

Panely môžu zdieľať jednu stranu: skladajú sa pod seba a každú čiaru medzi dvoma z nich môžete potiahnuť a rozdeliť miesto (s aktívnou čiarou ju presúvajú šípky a dvojité kliknutie rozdelí miesto rovnomerne). Potiahnutím vnútorného okraja ukotvenej strany ju zväčšíte alebo zmenšíte; dvojitým kliknutím na okraj ho vrátite.

Plávajúci panel zostáva nad výkresom. Presuniete ho za názov a veľkosť zmeníte potiahnutím pravého dolného rohu (alebo prejdite klávesom Tab na roh a použite šípky). Dvojitým kliknutím na jeho názov ho znova ukotvíte tam, kde bol.

:::touch
Ťahajte jedným prstom za názov panela. Potiahnutím pravého dolného rohu plávajúceho panela jedným prstom zmeníte veľkosť a rovnako aj okraje medzi ukotvenými panelmi. Ak chcete panel nechať plávať alebo ho ukotviť bez ťahania, použite ponuku {{ui:⋯}}.
:::

## Zoskupenie panelov ako kariet

Dva panely môžu zdieľať jeden rám a zobrazovať sa po jednom. Potiahnite panel za jeho názov na záhlavie iného panela (záhlavie je obrysované, kým ste nad ním) a pustite: rám má teraz kartu pre každý panel, v svojom záhlaví. Kliknutím na kartu zobrazíte tento panel. S aktívnou kartou prepínajú karty {{key:Left}} a {{key:Right}} a {{key:Home}} a {{key:End}} prejdú na prvú a poslednú.

Ak chcete panel zo skupiny vybrať, zvoľte {{ui:Vyňať zo skupiny kariet}} v jeho ponuke {{ui:⋯}} alebo ho potiahnite inam. Výberom {{ui:Karta spolu s}} a názvu panela ich zoskupíte bez ťahania.

## Pripnutie, skrytie a vrátenie

- Špendlík v záhlaví panela spôsobí jeho **automatické skrytie**: panel opustí svoje ukotvenie a stane sa malou kartou na tomto okraji. Ukážte na kartu, aktivujte ju alebo na ňu kliknite a panel sa vysunie nad výkres; odíďte (alebo stlačte {{key:Esc}}) a zasunie sa späť. Opätovným stlačením špendlíka alebo výberom {{ui:Odopnúť}} ho ukotvíte natrvalo.
- Tlačidlo zatvorenia alebo {{ui:Skryť tento panel}} v ponuke panel skryje a zavrie jeho ukotvenie. Prerušovaná karta na okraji ho vráti: kliknite na ňu alebo ju aktivujte a stlačte {{key:Enter}}.

## Zhustenie rozloženia

{{ui:Nastavenia}} › {{ui:Všeobecné}} › {{ui:Hustota rozloženia}} má dve možnosti. {{ui:Pohodlná}} je predvolená. {{ui:Kompaktná}} zmenší výšky riadkov, odsadenie panelov, tlačidlá panela nástrojov a text panelov v tejto aplikácii, aby sa na obrazovku zmestilo viac. Pamätá sa pre každú aplikáciu. Dotyková obrazovka si v oboch ponecháva veľké tlačidlá a telefón si ponecháva vlastné rozloženie. {{ui:Obnoviť rozloženie}} nechá hustotu tak, ako ste ju nastavili.

## Výber počtu riadkov panela nástrojov

{{ui:Nastavenia}} › {{ui:Všeobecné}} › {{ui:Riadky panela nástrojov}} má tri možnosti. {{ui:Zalomiť}} je predvolená: zobrazí sa každá skupina nástrojov, na toľkých riadkoch, koľko je potrebných. {{ui:2 riadky}} drží panel nástrojov na dvoch riadkoch a {{ui:1 riadok}} na jednom, takže výkres dostane výšku; skupiny, ktoré sa nezmestia, sa posúvajú do strany v paneli nástrojov (použite koliesko myši, švihnutie dvoma prstami alebo sa klávesom {{key:Tab}} presuňte na nástroj). Panel nástrojov, ktorý sa už zmestí na dva riadky, zostane pri {{ui:2 riadky}} taký, aký je, pretože mriežka by ho len zvýšila. Voľba sa pamätá pre každú aplikáciu. Dotyková obrazovka a telefón si ponechávajú vlastné rozloženie. CadCraft má pre svoj panel nástrojov vlastné nastavenie v časti {{ui:Nastavenia}} › {{ui:CadCraft}}.

## Používanie klávesnice

Tlačidlo {{ui:⋯}} každého panela otvorí ponuku: {{ui:Ukotviť vľavo}}, {{ui:Ukotviť vpravo}}, {{ui:Ukotviť dole}}, {{ui:Plávať nad výkresom}}, {{ui:Pripnúť k okraju}}, {{ui:Skryť tento panel}}, {{ui:Karta spolu s}} iným panelom, {{ui:Presunúť do nového okna}} a {{ui:Vrátiť späť}}. Klávesom Tab prejdite na tlačidlo, stlačte {{key:Enter}}, pohybujte sa šípkami a znova stlačte {{key:Enter}}. {{key:Esc}} ponuku zavrie.

## Panely na druhom monitore

1. Vyberte {{ui:⋯}} na paneli a potom {{ui:Presunúť všetky panely do nového okna}}. Môžete tiež vybrať {{ui:Presunúť panely do nového okna}} v {{ui:Nastavenia}}.
2. Otvorí sa malé okno s panelmi. Potiahnite ho na druhý monitor a zväčšite ho, ako chcete.
3. Pracujte ďalej: panely pôsobia na výkres ako predtým a výkres vyplní hlavné okno.

Skratky fungujú aj vtedy, keď je okno panelov navrchu: klávesy, ktoré tam stlačíte, okrem písania do poľa, idú do výkresu. Otázky a dialógové okná, ktoré aplikácia kladie, sa stále otvárajú v hlavnom okne, preto sa pozrite tam, keď sa objaví nejaké. Motív a veľkosť textu panelov sledujú hlavné okno.

:::chromium
Chrome a Edge vedia okno umiestniť na druhú obrazovku za Vás. S pripojenou druhou obrazovkou vyberte {{ui:Dať ho na moju druhú obrazovku}} v okne panelov (alebo {{ui:Dať panely na moju druhú obrazovku}} v ponuke {{ui:⋯}} panela). Prehliadač sa raz opýta, či táto stránka smie vidieť Vaše obrazovky; po povolení sa okno panelov otvára na tejto obrazovke zakaždým.
:::

:::firefox safari
Potiahnite okno panelov na druhý monitor sami. Nabudúce sa otvorí na rovnakom mieste a v rovnakej veľkosti.
:::

## Viac ako jedno okno panelov

Každý panel môže mať vlastné okno: až štyri okná panelov, napríklad jedno na monitor.

- V ponuke {{ui:⋯}} panela {{ui:Presunúť do nového okna}} otvorí ďalšie okno pre tento panel a {{ui:Presunúť do okna panelov 2}} (a tak ďalej) ho presunie do otvoreného okna. Druhé okno sa volá "panely 2".
- Potiahnite panel za jeho názov z jedného okna do druhého: pustením nad hlavným oknom ho tam ukotvíte (obrysované oblasti sa zobrazia, kým ste nad ním) alebo necháte plávať a pustením nad iným oknom panelov ho do neho presuniete. Ak ho pustíte kdekoľvek inde, zostane tam, kde bol.
- Okno panelov, v ktorom nezostal žiadny panel, sa zatvorí samo.

Po opätovnom načítaní Vám aplikácia ponúkne Vaše okná panelov znova. Prehliadače otvoria jedno okno na kliknutie, preto raz pre každé okno vyberte {{ui:Otvoriť ďalšie}}.

## Presunutie dialógového okna

Každé dialógové okno sa dá odsunúť z výkresu: stlačte a potiahnite jeho záhlavie. Dialógové okno si pamätá, kde ste ho nechali, každé samostatne, a pri ďalšom otvorení sa vráti na toto miesto. Dvojitým kliknutím na záhlavie ho znova vycentrujete.

Z klávesnice stlačte {{key:Alt}}+{{key:Shift}}+šípku s aktívnym prvkom vo vnútri dialógového okna a presuniete ho o 16 pixelov naraz; pridaním {{key:Ctrl}} o 64. Dialógové okno, ktoré skončí mimo obrazovky (po zmenšení okna alebo obrazovky), sa vráti.

Na telefóne zostávajú dialógové okná listami v plnej šírke a nepresúvajú sa.

V CadCraft Studio má dialógové okno {{ui:Vykresliť do PDF}} z CadCraftu, ktoré môžete mať otvorené počas práce, v záhlaví tlačidlo {{ui:Otvoriť vo vlastnom okne}}. Dialógové okno sa presunie do vlastného okna, ktoré môžete dať na iný monitor. Zatvorením dialógového okna sa zatvorí okno a zatvorením okna sa zatvorí dialógové okno.

## Vrátenie panelov

- Vyberte {{ui:Vrátiť panely späť}} v okne panelov alebo ho jednoducho zatvorte. Panely sa vrátia tam, kde boli.
- Zatvorením alebo opätovným načítaním hlavného okna sa zatvorí aj okno panelov. Keď sa aplikácia znova otvorí, oznámi, že Vaše panely boli vo vlastnom okne; vyberte {{ui:Otvoriť ho}}, aby ste okno vrátili, alebo {{ui:Nechať ich tu}}.
- {{ui:Nastavenia}} › {{ui:Všeobecné}} › {{ui:Obnoviť rozloženie}} vráti každý panel tam, kde začal.

:::tip
Ak sa po presunutí panelov do nového okna nič neotvorí, prehliadač zablokoval vyskakovacie okno. Aplikácia to oznámi a nechá panely tam, kde boli. Povoľte vyskakovacie okná pre getcadcraft.com a skúste to znova.
:::

Rozloženie sa pamätá pre každú aplikáciu v tomto prehliadači spolu s Vašimi ďalšími nastaveniami.
