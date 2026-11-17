---
title: Čítanie vrstevníc, výšok a sklonov
summary: Nastavte interval vrstevníc a hlavné vrstevnice, zobrazte pásma výšok, šípky sklonu a trojuholníky a čítajte výšky terénu pod kurzorom.
keywords: vrstevnice, interval vrstevníc, hlavné vrstevnice, popisky, pásma výšok, šípky sklonu, trojuholníky, kóta bodu, analýza povrchu, analýza výšok, analýza sklonov
from: 585e500a
---

Povrch sa zobrazuje s vrstevnicami hneď, ako existuje. Všetko v tejto téme sa nastavuje pod **Zobrazenie** na ľavom paneli. Nastavenia zobrazenia menia iba to, čo vidíte (a čo exportujete); nie sú krokmi späť.

## Nastavenie intervalu vrstevníc

1. Pod **Zobrazenie** vyberte hodnotu v **Vrstevnice po**.
   - V stopách: 0.25, 0.5, 1, 2, 5, 10 alebo 20 ft.
   - V metroch: 0.1, 0.25, 0.5, 1, 2, 5 alebo 10 m.
2. Vyberte **Hlavná po**: každú 2., 4., 5. alebo 10. vrstevnicu.
   Hlavné vrstevnice sa kreslia hrubšie a popisujú sa svojou výškou. Ležia na celých násobkoch rozstupu hlavných vrstevníc (pri vrstevniciach po 1 ft a každej 5. hlavnej: 245, 250, 255 …).
3. Vypnite {{ui:Popisky vrstevníc}}, ak popisky preplnia malý výkres.

Nový projekt začína s intervalom 1 jednotka a každá 5. vrstevnica je hlavná. Vrstevnice sa lámu pri hranách zlomu; ak pretínajú priamo čiaru odtoku alebo hrebeň, táto čiara ešte nie je hranou zlomu (pozri [Vytvorenie a spresnenie povrchu](topic:build-surface)).

:::note
Vrstevnice sa kreslia, iba ak je medzi najnižším a najvyšším bodom najviac 2,000 úrovní. Na lokalite s veľkým reliéfom a veľmi malým intervalom sa v pôdoryse nezobrazí žiadna vrstevnica: zvoľte väčší interval.
:::

## Vyhladenie vrstevníc

Vrstevnice sa vedú ako priame úseky, jeden cez každý trojuholník povrchu, takže na každej hrane trojuholníka urobia malý zlom. **Vyhladenie vrstevníc** pod **Zobrazenie** tieto rohy zaoblí:

- **Žiadne (priame úseky)**: vedené čiary tak, ako sú. Takto sa zobrazuje nový alebo starší výkres.
- **Slabé**: rohy mierne zaoblené. Čiara sa nikdy nepresunie viac ako o 10 % cesty k ďalšej vrstevnici a nikdy ďalej od svojho priameho úseku ako o jednu šestinu jeho dĺžky.
- **Silné**: plynulá krivka. Čiara sa nikdy nepresunie viac ako o 25 % cesty k ďalšej vrstevnici a nikdy ďalej od svojho priameho úseku ako o jednu tretinu jeho dĺžky.

Pri ktorejkoľvek možnosti vyhladená vrstevnica stále pretína každú hranu trojuholníka v tom istom bode ako vedená čiara, zostáva vnútri trojuholníka, ktorý jej úsek pretína, a preto nemôže pretnúť ani sa dotknúť inej vrstevnice. Tam, kde vrstevnica pretína hranu zlomu alebo hranicu, si zachová ostrý zlom. Vyhladené čiary sa vykresľujú a exportujú (DXF, DWG, PDF, GIS a 3D) a majú viac vrcholov než vedené čiary.

Vyhladzovanie mení iba kreslené čiary. Výšky, objemy, pozdĺžne profily a rezy sa stále čítajú priamo z povrchu. Vrstevnica, ktorá prechádza presne cez merané body (bod s výškou 250.00 na vrstevnici 250), si pri každom takom bode zachová malý zlom.

## Ako sa vytvára povrch za vrstevnicami

Vrstevnice sledujú povrch a povrch sleduje **Metódu vrstevníc** pod **Povrch** na ľavom paneli. Predvolená **Triangulácia s lineárnou interpoláciou** spája vaše body do trojuholníkov a zachováva presne každý bod a každú hranu zlomu. Ostatné metódy najprv prispôsobia body pravidelnej mriežke (kriging, minimálne zakrivenie, prirodzený sused, inverzná vzdialenosť a ďalšie), čo medzi bodmi dáva zaoblenejšie vrstevnice, ale nepretínajú presne každý bod; správa o povrchu pod **Povrch** uvádza, o koľko sa výsledok odchyľuje vo vašich bodoch.

**ABOS (aproximácia založená na vyhladzovaní)** je jednou z metód s mriežkou. Má dve vlastné nastavenia: **Hladkosť** (na začiatku 0.5; nižšia hodnota je hladšia) a **Presnosť** (na začiatku 1: povrch sa priblíži k vašim bodom v rámci 1 % výškového rozsahu lokality; zadajte menšie číslo pre presnejšie prispôsobenie). Ak nedosiahne presnosť na danej mriežke, správa o povrchu to uvedie: zadajte menší **Rozstup mriežky**.

## Čítanie výšky na ľubovoľnom mieste

Presuňte kurzor nad pôdorys. Stavový riadok zobrazuje:

- **X** a **Y** pod kurzorom
- **Terén** a výšku jestvujúceho terénu v tom mieste, interpolovanú na trojuholníku pod kurzorom
- **Upravený** a navrhovanú výšku tam, kde plošina alebo koridor zmenili terén
- "Mimo povrchu" mimo povrchu

Ak chcete presne prečítať merací bod, vyberte {{ui:Výber}} a kliknite na bod: pravý panel zobrazí jeho číslo, súradnicu X, súradnicu Y, výšku, popis a skupinu.

## Zobrazenie pásiem výšok

1. Zaškrtnite {{ui:Pásma výšok}}.
   Povrch sa vyplní farbami od nízkych (modrozelená) po vysoké (okrová hnedá). Legenda pod začiarkavacími políčkami uvádza rozsah výšok každého pásma.
2. Vyberte počet pásiem v **Pásma**: 5, 8, 10 alebo 12. Pásma rozdelia rozsah od najnižšej po najvyššiu výšku na rovnaké kroky.

Pásma slúžia iba na pozeranie. Nie sú exportované do DXF ani vykreslené do PDF.

## Zobrazenie šípok sklonu

Zaškrtnite {{ui:Šípky sklonu}}. Na každom dostatočne veľkom trojuholníku, kde sa šípka zmestí, ukazuje krátka šípka smerom nadol. Na rovinatých trojuholníkoch šípka nie je. Šípky slúžia na rýchlu kontrolu smeru odvodnenia; samotná hodnota sklonu zatiaľ nie je popísaná.

## Zobrazenie trojuholníkov, bodov a hrán

- {{ui:Trojuholníky}} kreslí hrany TIN. Zapnite ho, ak chcete skontrolovať, ako povrch spája body, najmä pozdĺž hrán zlomu a na okraji.
- {{ui:Body}} kreslí každý merací bod; {{ui:Popisky bodov}} pridá jeho číslo, výšku a popis (alebo menej: pozri **Popisky bodov** v [nastaveniach CivilCraft](topic:settings)).
- {{ui:Hrany zlomu}} kreslí hrany zlomu (a hranicu) oranžovou farbou.
- {{ui:Okraj povrchu}} kreslí obrys povrchu.

## Jestvujúci alebo navrhovaný

Keď plošina alebo koridor vyrovnajú terén bez problémov, **Povrch** pod **Zobrazenie** ponúka {{ui:Navrhovaný (upravený)}}. Vrstevnice, pásma a šípky potom zobrazujú upravený povrch, takže vidíte nový terén a napojenie na okolitý terén. Ak sa chcete vrátiť k zameraniu, prepnite na {{ui:Jestvujúci terén}}.

## Čo sa exportuje

Výstup do DXF a PDF sa riadi týmito nastaveniami: to, čo ste vypli, sa nezapisuje a vrstevnice sú tie, ktoré zodpovedajú zobrazenému povrchu. Pásma výšok sa nikdy neexportujú.
